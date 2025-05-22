// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Create a secondary auth instance for employee account creation
// This ensures that creating employee accounts won't affect the main auth state
const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

// Authentication functions
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  userData: {
    companyName?: string;
    fullName: string;
    userType: "employer" | "employee" | "manager";
    employerId?: string;
  },
  disableAutoSignIn = false
): Promise<UserCredential> => {
  // Use the secondary auth instance for employee account creation (prevents logging out current user)
  const authInstance = disableAutoSignIn ? secondaryAuth : auth;

  // Create the new user account
  const userCredential = await createUserWithEmailAndPassword(
    authInstance,
    email,
    password
  );

  // Store additional user data in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    ...userData,
    createdAt: new Date(),
  });

  // If using secondary auth, we need to sign out the secondary instance
  // This prevents any auth state issues or memory leaks
  if (disableAutoSignIn) {
    await signOut(secondaryAuth);
  }

  return userCredential;
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  const result = await signInWithPopup(auth, googleProvider);

  // Check if user document exists
  const userDoc = await getDoc(doc(db, "users", result.user.uid));

  // If this is first login, create a user document
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", result.user.uid), {
      email: result.user.email,
      fullName: result.user.displayName,
      userType: "employer" as "employer" | "employee" | "manager", // Default role for Google sign-ins
      createdAt: new Date(),
    });
  }

  return result;
};

export const logoutUser = async (): Promise<void> => {
  return signOut(auth);
};

// Firestore functions for users
export const getUserData = async (userId: string) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  return null;
};

// Project functions
export interface ProjectData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  priority: string;
  category: string;
  team: string[]; // Array of user IDs
  createdBy: string; // User ID
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
  tasksCount?: number; // Count of tasks associated with this project
  taskGeneration?: {
    autoAssign: boolean;
    setDeadlines: boolean;
    createDependencies: boolean;
  };
}

export const createProject = async (projectData: ProjectData) => {
  try {
    // Add tasksCount to project data
    const projectWithTasksCount = {
      ...projectData,
      tasksCount: 0, // Initial count, will be updated after task generation
    };

    const projectRef = await addDoc(collection(db, "projects"), {
      ...projectWithTasksCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newProject = { id: projectRef.id, ...projectWithTasksCount };

    // If task generation is enabled, generate tasks for this project
    if (projectData.taskGeneration?.autoAssign) {
      // Fetch employees for this employer
      const employeesData = await getEmployees(projectData.createdBy);

      // Generate and assign tasks
      await generateTasksForProject(newProject, employeesData);
    }

    return newProject;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (
  projectId: string,
  projectData: Partial<ProjectData>
) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp(),
    });

    return { id: projectId, ...projectData };
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const getProject = async (
  projectId: string
): Promise<ProjectData & { id: string }> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      return { id: projectSnap.id, ...projectSnap.data() } as ProjectData & {
        id: string;
      };
    } else {
      throw new Error("Project not found");
    }
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

// Add a function to get employer ID for a user (either their own ID if employer, or their employerId if manager)
const getRelevantEmployerId = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return null;

  const userData = userDoc.data();
  return userData.userType === "manager" ? userData.employerId : userId;
};

// Modify getProjects to handle manager access
export const getProjects = async (userId?: string) => {
  try {
    if (!userId) {
      const projectsRef = collection(db, "projects");
      const projectsSnap = await getDocs(projectsRef);
      return projectsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Get the relevant employer ID
    const employerId = await getRelevantEmployerId(userId);
    if (!employerId) return [];

    // Get projects for this employer
    const projectsQuery = query(
      collection(db, "projects"),
      where("createdBy", "==", employerId)
    );
    const projectsSnap = await getDocs(projectsQuery);

    return projectsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Task functions
export interface TaskData {
  title: string;
  description: string;
  projectId: string;
  assignedTo?: string; // User ID
  status: "Not Started" | "In Progress" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Critical";
  dueDate: string;
  createdBy: string; // User ID
  checklist?: { id: number; text: string; completed: boolean }[];
  attachments?: { id: number; name: string; size: string; date: string }[];
  timeEstimate?: string;
  timeSpent?: string;
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}

export const createTask = async (taskData: TaskData) => {
  try {
    const taskRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // After creating the task, recalculate the project's progress and status
    if (taskData.projectId) {
      // Recalculate project progress to reflect the new task
      await recalculateProjectProgress(taskData.projectId);
    }

    return { id: taskRef.id, ...taskData };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Function to recalculate project progress and status
export const recalculateProjectProgress = async (projectId: string) => {
  try {
    // Get all tasks for this project
    const tasksQuery = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Count total and completed tasks
    const totalTasks = tasks.length;
    if (totalTasks === 0) return; // No tasks, nothing to update

    const completedTasks = tasks.filter(
      (task: any) => task.status === "Completed"
    ).length;
    const inProgressTasks = tasks.filter(
      (task: any) => task.status === "In Progress" || task.status === "Started"
    ).length;
    const notStartedTasks = totalTasks - completedTasks - inProgressTasks;

    // Calculate progress percentage
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    // Determine status based on task completion
    let status;
    if (completedTasks === totalTasks) {
      status = "Completed";
    } else if (completedTasks > 0 || inProgressTasks > 0) {
      status = "In progress";
    } else {
      status = "Not started";
    }

    // Log the recalculation for debugging
    console.log(`Project ${projectId} recalculation:`, {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      progressPercentage,
      newStatus: status,
    });

    // Update the project with new progress and status
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      progress: progressPercentage,
      status: status,
      updatedAt: serverTimestamp(),
    });

    console.log(
      `Updated project ${projectId}: progress=${progressPercentage}%, status=${status}`
    );
  } catch (error) {
    console.error("Error recalculating project progress:", error);
  }
};

export const updateTask = async (
  taskId: string,
  taskData: Partial<TaskData>
) => {
  try {
    const taskRef = doc(db, "tasks", taskId);

    // Get the original task data to check if assignee changed
    const originalTask = await getDoc(taskRef);
    const originalAssignee = originalTask.exists()
      ? originalTask.data().assignedTo
      : null;

    // Get the project ID before updating the task
    const projectId = originalTask.exists()
      ? originalTask.data().projectId
      : null;

    // Update the task
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp(),
    });

    // If we have a project ID, update project progress and status
    if (projectId) {
      try {
        // First check if project status is "Not started" and update to "In progress" immediately
        // This keeps the quick response behavior for the first update
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();

          // If project status is "Not started", change it to "In progress"
          if (projectData.status === "Not started") {
            await updateDoc(projectRef, {
              status: "In progress",
              updatedAt: serverTimestamp(),
            });
            console.log(`Updated project ${projectId} status to "In progress"`);
          }
        }

        // Then do a full recalculation of project progress and status
        await recalculateProjectProgress(projectId);
      } catch (projectError) {
        console.error("Error updating project status:", projectError);
        // Don't throw here to allow the task update to complete
      }
    }

    // Trigger performance recalculation for the current assignee
    if (taskData.assignedTo) {
      // Recalculate performance metrics for the current assignee
      await calculateEmployeePerformance(taskData.assignedTo);
    }

    // If assignee changed and there was a previous assignee, recalculate for them too
    if (
      taskData.assignedTo &&
      originalAssignee &&
      originalAssignee !== taskData.assignedTo
    ) {
      // Recalculate performance metrics for the previous assignee
      await calculateEmployeePerformance(originalAssignee);
    }

    // Special handling for task completion to update metrics immediately
    if (taskData.status === "Completed" && originalAssignee) {
      // If the task is marked as complete, immediately update metrics for the assignee
      await calculateEmployeePerformance(originalAssignee);
    }

    // Log activity for status changes and completions
    if (taskData.status === "Completed") {
      // Add activity logging when available
      // To be implemented by defining addEmployeeActivity function
      // or using existing activity logging mechanisms
    }

    // For employers viewing dashboards, this ensures they see real-time updates    if (taskData.assignedTo) {      try {        const performanceRef = doc(          db,          "employeePerformance",          taskData.assignedTo        );        await updateDoc(performanceRef, {          lastUpdated: serverTimestamp(),        } as any);      } catch (error) {        console.error("Error updating last updated timestamp:", error);      }    }

    return { id: taskId, ...taskData };
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const getTask = async (
  taskId: string
): Promise<TaskData & { id: string }> => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
      return { id: taskSnap.id, ...taskSnap.data() } as TaskData & {
        id: string;
      };
    } else {
      throw new Error("Task not found");
    }
  } catch (error) {
    console.error("Error getting task:", error);
    throw error;
  }
};

export const getTasks = async (projectId?: string) => {
  try {
    let tasksQuery;

    if (projectId) {
      // Get tasks for a specific project
      tasksQuery = query(
        collection(db, "tasks"),
        where("projectId", "==", projectId)
      );
    } else {
      // Get all tasks
      tasksQuery = collection(db, "tasks");
    }

    const tasksSnap = await getDocs(tasksQuery);

    return tasksSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    // Get the task data to retrieve the projectId before deletion
    const taskRef = doc(db, "tasks", taskId);
    const taskSnapshot = await getDoc(taskRef);
    const projectId = taskSnapshot.exists()
      ? taskSnapshot.data().projectId
      : null;

    // Delete the task
    await deleteDoc(taskRef);

    // If we have a projectId, recalculate the project progress
    if (projectId) {
      await recalculateProjectProgress(projectId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Employee functions
export const createEmployee = async (employeeData: {
  name: string;
  email: string;
  position: string;
  department: string;
  status?: string;
  joinDate?: string;
  avatar?: string;
  employerId?: string;
  whatsappNumber?: string;
}): Promise<{
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status?: string;
  joinDate?: string;
  avatar?: string;
  employerId?: string;
  whatsappNumber?: string;
  tempPassword: string;
  accountCreated: boolean;
}> => {
  try {
    // Create the employee record in Firestore
    const employeeRef = await addDoc(collection(db, "employees"), {
      ...employeeData,
      status: employeeData.status || "active",
      joinDate: employeeData.joinDate || new Date().toISOString().split("T")[0],
      avatar:
        employeeData.avatar ||
        `https://randomuser.me/api/portraits/${
          Math.random() > 0.5 ? "men" : "women"
        }/${Math.floor(Math.random() * 70) + 1}.jpg`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create a user account for the employee if one doesn't exist
    let tempPassword = "";
    let accountCreated = false;

    try {
      // Generate a temporary password (in production, use a more secure method)
      tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}`;

      // Check if user already exists with this email
      const existingUser = await getUserByEmail(employeeData.email);

      if (!existingUser) {
        // Create new user account with disableAutoSignIn set to true
        await registerWithEmailAndPassword(
          employeeData.email,
          tempPassword,
          {
            fullName: employeeData.name,
            userType: "employee",
          },
          true // Prevent auto sign-in
        );

        accountCreated = true;
        console.log(`Created account for employee: ${employeeData.email}`);
        // In a real app, you might want to send an email with temporary password
      } else {
        console.log(`User account already exists for: ${employeeData.email}`);
      }
    } catch (authError) {
      // Don't fail the employee creation if account creation fails
      console.error("Error creating user account:", authError);
    }

    return {
      id: employeeRef.id,
      ...employeeData,
      tempPassword: accountCreated ? tempPassword : "",
      accountCreated,
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const updateEmployee = async (
  employeeId: string,
  employeeData: Partial<{
    name: string;
    email: string;
    position: string;
    department: string;
    status: string;
    joinDate: string;
    avatar: string;
    employerId: string;
    whatsappNumber: string;
  }>
) => {
  try {
    const employeeRef = doc(db, "employees", employeeId);
    await updateDoc(employeeRef, {
      ...employeeData,
      updatedAt: serverTimestamp(),
    });

    return { id: employeeId, ...employeeData };
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

// Modify getEmployees to handle manager access
export const getEmployees = async (employerId?: string) => {
  try {
    let employeesQuery;

    if (employerId) {
      // Get only employees for this employer
      employeesQuery = query(
        collection(db, "employees"),
        where("employerId", "==", employerId)
      );
    } else {
      // Get all employees
      employeesQuery = collection(db, "employees");
    }

    const employeesSnapshot = await getDocs(employeesQuery);

    return employeesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employees:", error);
    throw error;
  }
};

export const bulkCreateEmployees = async (
  employeesData: Array<{
    name: string;
    email: string;
    position: string;
    department: string;
    status?: string;
    joinDate?: string;
    avatar?: string;
    employerId?: string;
    whatsappNumber?: string;
  }>,
  employerId: string
) => {
  try {
    // Use a batch to add multiple employees at once
    const batch = writeBatch(db);
    const createdEmployees = [];
    const accountCredentials: Array<{
      employee: {
        id: string;
        name: string;
        email: string;
        position: string;
        department: string;
        status?: string;
        joinDate?: string;
        avatar?: string;
        employerId?: string;
        whatsappNumber?: string;
        tempPassword?: string;
        accountCreated?: boolean;
      };
      email: string;
    }> = [];

    // Process all employees first, collecting their data and credentials
    for (const employeeData of employeesData) {
      const employeeRef = doc(collection(db, "employees"));

      const newEmployee = {
        ...employeeData,
        employerId,
        status: employeeData.status || "active",
        joinDate:
          employeeData.joinDate || new Date().toISOString().split("T")[0],
        avatar:
          employeeData.avatar ||
          `https://randomuser.me/api/portraits/${
            Math.random() > 0.5 ? "men" : "women"
          }/${Math.floor(Math.random() * 70) + 1}.jpg`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(employeeRef, newEmployee);

      // Store reference to new employee data
      const employeeWithId = {
        id: employeeRef.id,
        ...employeeData,
      };
      createdEmployees.push(employeeWithId);

      // Store credentials info for later processing
      accountCredentials.push({
        employee: employeeWithId,
        email: employeeData.email,
      });
    }

    // Commit the batch first
    await batch.commit();

    // Then create user accounts after batch is committed
    // We do this sequentially to avoid Firebase Auth quota issues
    for (const credential of accountCredentials) {
      try {
        // Generate a temporary password
        const tempPassword = `Temp${Math.random()
          .toString(36)
          .substring(2, 10)}`;

        // Check if user already exists with this email
        const existingUser = await getUserByEmail(credential.email);

        if (!existingUser) {
          // Create new user account
          await registerWithEmailAndPassword(
            credential.email,
            tempPassword,
            {
              fullName: credential.employee.name,
              userType: "employee",
            },
            true // Prevent auto sign-in
          );

          // Add password and account creation status to employee object
          credential.employee.tempPassword = tempPassword;
          credential.employee.accountCreated = true;

          console.log(`Created account for bulk employee: ${credential.email}`);
        } else {
          console.log(`User account already exists for: ${credential.email}`);
          credential.employee.accountCreated = false;
        }
      } catch (authError) {
        console.error("Error creating user account:", authError);
        credential.employee.accountCreated = false;
      }
    }

    return createdEmployees;
  } catch (error) {
    console.error("Error bulk creating employees:", error);
    throw error;
  }
};

export const getEmployee = async (
  employeeId: string
): Promise<{ id: string; name: string } | null> => {
  try {
    const employeeRef = doc(db, "employees", employeeId);
    const employeeSnap = await getDoc(employeeRef);

    if (employeeSnap.exists()) {
      return { id: employeeSnap.id, ...employeeSnap.data() } as {
        id: string;
        name: string;
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting employee:", error);
    throw error;
  }
};

// Add a function to get employee by email
export const getEmployeeByEmail = async (email: string) => {
  try {
    const employeesRef = collection(db, "employees");
    const q = query(employeesRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the first matching employee
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting employee by email:", error);
    throw error;
  }
};

// Activity functions
export interface ActivityData {
  projectId: string;
  user: string;
  userName: string;
  userAvatar?: string | null;
  action: string;
  timestamp?: any; // Timestamp
}

export const createActivity = async (activityData: ActivityData) => {
  try {
    const activityRef = await addDoc(collection(db, "activities"), {
      ...activityData,
      timestamp: serverTimestamp(),
    });

    return { id: activityRef.id, ...activityData };
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const getProjectActivities = async (projectId: string) => {
  try {
    // Query activities for a specific project, ordered by timestamp (newest first)
    const activitiesQuery = query(
      collection(db, "activities"),
      where("projectId", "==", projectId),
      orderBy("timestamp", "desc")
    );

    const activitiesSnap = await getDocs(activitiesQuery);

    return activitiesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting project activities:", error);
    throw error;
  }
};

// Real-time task functions
export const onTasksUpdate = (
  callback: (tasks: any[]) => void,
  projectIdOrIds?: string | string[]
) => {
  let unsubscribes: (() => void)[] = [];
  let allTasks: any[] = [];

  // Helper to call callback with merged tasks
  const updateCallback = () => {
    // Remove duplicates by task id
    const uniqueTasks = Array.from(
      new Map(allTasks.map((task) => [task.id, task])).values()
    );
    callback(uniqueTasks);
  };

  if (Array.isArray(projectIdOrIds)) {
    const projectIds = projectIdOrIds;
    // Firestore 'in' query supports up to 10 items
    for (let i = 0; i < projectIds.length; i += 10) {
      const batch = projectIds.slice(i, i + 10);
      const tasksQuery = query(
        collection(db, "tasks"),
        where("projectId", "in", batch)
      );
      const unsubscribe = onSnapshot(
        tasksQuery,
        (snapshot) => {
          // Remove old tasks for this batch
          allTasks = allTasks.filter((task) => !batch.includes(task.projectId));
          // Add new tasks for this batch
          allTasks = allTasks.concat(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          updateCallback();
        },
        (error) => {
          console.error("Error in tasks listener (batch):", error);
        }
      );
      unsubscribes.push(unsubscribe);
    }
  } else if (typeof projectIdOrIds === "string") {
    // Single projectId
    const tasksQuery = query(
      collection(db, "tasks"),
      where("projectId", "==", projectIdOrIds)
    );
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        allTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        updateCallback();
      },
      (error) => {
        console.error("Error in tasks listener (single project):", error);
      }
    );
    unsubscribes.push(unsubscribe);
  } else {
    // All tasks
    const tasksQuery = collection(db, "tasks");
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        allTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        updateCallback();
      },
      (error) => {
        console.error("Error in tasks listener (all):", error);
      }
    );
    unsubscribes.push(unsubscribe);
  }

  // Return a function to unsubscribe all listeners
  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
};

// Get tasks assigned to a specific employee
export const getEmployeeTasks = async (employeeId: string) => {
  try {
    const tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "==", employeeId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);

    return tasksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee tasks:", error);
    throw error;
  }
};

// Real-time listener for tasks assigned to an employee
export const onEmployeeTasksUpdate = (
  callback: (tasks: any[]) => void,
  employeeId: string
) => {
  const tasksQuery = query(
    collection(db, "tasks"),
    where("assignedTo", "==", employeeId)
  );

  const unsubscribe = onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(tasks);
    },
    (error) => {
      console.error("Error in employee tasks listener:", error);
    }
  );

  return unsubscribe;
};

// Get projects that an employee is a team member of
export const getEmployeeProjects = async (employeeId: string) => {
  try {
    const projectsQuery = query(
      collection(db, "projects"),
      where("team", "array-contains", employeeId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);

    return projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee projects:", error);
    throw error;
  }
};

// Real-time listener for projects that an employee is a team member of
export const onEmployeeProjectsUpdate = (
  callback: (projects: any[]) => void,
  employeeId: string
) => {
  const projectsQuery = query(
    collection(db, "projects"),
    where("team", "array-contains", employeeId)
  );

  const unsubscribe = onSnapshot(
    projectsQuery,
    (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(projects);
    },
    (error) => {
      console.error("Error in employee projects listener:", error);
    }
  );

  return unsubscribe;
};

// Get recent activities for an employee (activities they created or are related to them)
export const getEmployeeActivities = async (employeeId: string) => {
  try {
    const activitiesQuery = query(
      collection(db, "activities"),
      where("user", "==", employeeId),
      orderBy("timestamp", "desc"),
      // Limit to recent activities
      limit(10)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);

    return activitiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee activities:", error);
    throw error;
  }
};

// Real-time listener for recent activities for an employee
export const onEmployeeActivitiesUpdate = (
  callback: (activities: any[]) => void,
  employeeId: string
) => {
  const activitiesQuery = query(
    collection(db, "activities"),
    where("user", "==", employeeId),
    orderBy("timestamp", "desc"),
    // Limit to recent activities
    limit(10)
  );

  const unsubscribe = onSnapshot(
    activitiesQuery,
    (snapshot) => {
      const activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(activities);
    },
    (error) => {
      console.error("Error in employee activities listener:", error);
    }
  );

  return unsubscribe;
};

// Performance Metrics functions
export interface PerformanceMetricsData {
  employeeId: string;
  metrics: {
    taskCompletionRate: number; // Percentage of tasks completed
    onTimeCompletionRate: number; // Percentage of tasks completed on time
    averageCompletionTime: number; // Average time in days to complete tasks
    checklistItemCompletionRate: number; // Percentage of checklist items completed
    progressScore: number; // Overall weighted score 0-100
  };
  lastUpdated: any; // Timestamp
}

// Calculate performance metrics for an employee
export const calculateEmployeePerformance = async (employeeId: string) => {
  try {
    // Get all tasks assigned to this employee
    const employeeTasks = await getEmployeeTasks(employeeId);

    if (!employeeTasks.length) {
      return {
        employeeId,
        metrics: {
          taskCompletionRate: 0,
          onTimeCompletionRate: 0,
          averageCompletionTime: 0,
          checklistItemCompletionRate: 0,
          progressScore: 0,
          completedTasksCount: 0,
          totalTasksCount: 0,
        },
        lastUpdated: serverTimestamp(),
      };
    }

    // Task completion metrics
    const completedTasks = employeeTasks.filter(
      (task: any) => task.status === "Completed"
    );
    const taskCompletionRate =
      (completedTasks.length / employeeTasks.length) * 100;

    // On-time completion metrics
    const onTimeCompletedTasks = completedTasks.filter((task: any) => {
      const dueDate = new Date(task.dueDate);
      const completedAt = task.updatedAt?.toDate() || new Date();
      return completedAt <= dueDate;
    });
    const onTimeCompletionRate = completedTasks.length
      ? (onTimeCompletedTasks.length / completedTasks.length) * 100
      : 0;

    // Average completion time
    let totalCompletionTime = 0;
    completedTasks.forEach((task: any) => {
      if (task.createdAt && task.updatedAt) {
        const createdDate = task.createdAt.toDate();
        const completedDate = task.updatedAt.toDate();
        const daysDiff = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
        totalCompletionTime += daysDiff;
      }
    });
    const averageCompletionTime = completedTasks.length
      ? totalCompletionTime / completedTasks.length
      : 0;

    // Checklist completion rate
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;

    employeeTasks.forEach((task: any) => {
      if (Array.isArray(task.checklist) && task.checklist.length) {
        totalChecklistItems += task.checklist.length;
        completedChecklistItems += task.checklist.filter(
          (item: { completed: boolean }) => item.completed
        ).length;
      }
    });

    const checklistItemCompletionRate = totalChecklistItems
      ? (completedChecklistItems / totalChecklistItems) * 100
      : 0;

    // Calculate overall progress score (weighted average)
    const progressScore =
      taskCompletionRate * 0.4 +
      onTimeCompletionRate * 0.3 +
      checklistItemCompletionRate * 0.3;

    const performanceData = {
      employeeId,
      metrics: {
        taskCompletionRate,
        onTimeCompletionRate,
        averageCompletionTime,
        checklistItemCompletionRate,
        progressScore,
        completedTasksCount: completedTasks.length,
        totalTasksCount: employeeTasks.length,
      },
      lastUpdated: serverTimestamp(),
    };

    // Store or update the performance metrics
    await updateEmployeePerformance(employeeId, performanceData);

    return performanceData;
  } catch (error) {
    console.error("Error calculating employee performance:", error);
    throw error;
  }
};

// Update employee performance data in Firebase
export const updateEmployeePerformance = async (
  employeeId: string,
  performanceData: PerformanceMetricsData
) => {
  try {
    // Check if performance document exists
    const performanceRef = doc(db, "employeePerformance", employeeId);
    const performanceDoc = await getDoc(performanceRef);

    if (performanceDoc.exists()) {
      // Update existing document
      await updateDoc(performanceRef, performanceData as any);
    } else {
      // Create new document
      await setDoc(performanceRef, performanceData as any);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating employee performance:", error);
    throw error;
  }
};

// Get employee performance metrics
export const getEmployeePerformance = async (employeeId: string) => {
  try {
    const performanceRef = doc(db, "employeePerformance", employeeId);
    const performanceDoc = await getDoc(performanceRef);

    if (performanceDoc.exists()) {
      return { id: performanceDoc.id, ...performanceDoc.data() };
    } else {
      // If no existing metrics, calculate them now
      return calculateEmployeePerformance(employeeId);
    }
  } catch (error) {
    console.error("Error getting employee performance:", error);
    throw error;
  }
};

// Get performance metrics for all employees under an employer
export const getEmployeesPerformance = async (userId: string) => {
  try {
    // Get the relevant employer ID
    const employerId = await getRelevantEmployerId(userId);
    if (!employerId) return [];

    // First, get all employees for this employer
    const employees = await getEmployees(employerId);

    // Then get performance data for each employee
    const performancePromises = employees.map(async (employee: any) => {
      const performance = await getEmployeePerformance(employee.id);
      return {
        ...performance,
        employeeName: employee.name,
        employeeEmail: employee.email,
        employeeAvatar: employee.avatar,
        employeePosition: employee.position,
        employeeDepartment: employee.department,
      };
    });

    return Promise.all(performancePromises);
  } catch (error) {
    console.error("Error getting employees performance:", error);
    throw error;
  }
};

// Real-time listener for employee performance metrics
export const onEmployeePerformanceUpdate = (
  callback: (performanceData: any) => void,
  employeeId: string
) => {
  const performanceRef = doc(db, "employeePerformance", employeeId);

  const unsubscribe = onSnapshot(
    performanceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        // If no performance data exists, calculate it
        calculateEmployeePerformance(employeeId).then(callback);
      }
    },
    (error) => {
      console.error("Error in employee performance listener:", error);
    }
  );

  return unsubscribe;
};

// Recalculate performance after task updates
export const recalculatePerformanceAfterTaskUpdate = async (
  taskData: Partial<TaskData>
) => {
  // Only recalculate if we have an assignee
  if (taskData.assignedTo) {
    try {
      await calculateEmployeePerformance(taskData.assignedTo);

      // Also notify any listeners of the performance update
      await getEmployeePerformance(taskData.assignedTo);

      // Log activity for status changes and completions
      if (taskData.status === "Completed") {
        // Add activity logging when available
        // To be implemented by defining addEmployeeActivity function
        // or using existing activity logging mechanisms
      }

      // For employers viewing dashboards, this ensures they see real-time updates      if (taskData.assignedTo) {        try {          const performanceRef = doc(            db,            "employeePerformance",            taskData.assignedTo          );          await updateDoc(performanceRef, {            lastUpdated: serverTimestamp(),          } as any);        } catch (error) {          console.error("Error updating last updated timestamp:", error);        }      }
    } catch (error) {
      console.error("Error recalculating performance:", error);
    }
  }
};

// AI-powered task generation
export const generateTasksForProject = async (
  project: ProjectData & { id: string },
  employees: any[]
) => {
  try {
    // Only proceed if auto-assign is enabled
    if (!project.taskGeneration?.autoAssign) {
      console.log("Auto task generation is disabled for this project");
      return [];
    }

    // Get team members from the project
    const teamMembers = employees.filter((employee) =>
      project.team.includes(employee.id)
    );

    if (teamMembers.length === 0) {
      console.log("No team members found for task assignment");
      return [];
    }

    console.log(
      `Generating tasks for project "${project.name}" with ${teamMembers.length} team members`
    );

    // Project timeline calculations
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const projectDurationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Template-based task generation based on project category and description
    const tasks: Partial<TaskData>[] = [];

    // Map of task templates based on project category
    const taskTemplates: Record<
      string,
      { title: string; description: string; role: string; dependsOn?: string }[]
    > = {
      Development: [
        {
          title: "Project Setup",
          description: "Initialize project structure and dependencies",
          role: "Engineering",
        },
        {
          title: "Database Schema Design",
          description: "Design database schema and relationships",
          role: "Engineering",
        },
        {
          title: "Backend Development",
          description: "Implement server-side functionality",
          role: "Engineering",
          dependsOn: "Project Setup",
        },
        {
          title: "Frontend Development",
          description: "Implement client-side functionality",
          role: "Engineering",
          dependsOn: "Project Setup",
        },
        {
          title: "API Integration",
          description: "Connect frontend and backend components",
          role: "Engineering",
          dependsOn: "Backend Development",
        },
        {
          title: "Testing",
          description: "Perform unit and integration testing",
          role: "Quality Assurance",
          dependsOn: "API Integration",
        },
        {
          title: "Deployment",
          description: "Deploy application to production environment",
          role: "Engineering",
          dependsOn: "Testing",
        },
      ],
      Marketing: [
        {
          title: "Market Research",
          description: "Research target market and competitors",
          role: "Marketing",
        },
        {
          title: "Marketing Strategy",
          description: "Develop comprehensive marketing strategy",
          role: "Marketing",
          dependsOn: "Market Research",
        },
        {
          title: "Content Creation",
          description: "Create marketing content and materials",
          role: "Marketing",
          dependsOn: "Marketing Strategy",
        },
        {
          title: "Social Media Campaign",
          description: "Plan and execute social media campaign",
          role: "Marketing",
          dependsOn: "Content Creation",
        },
        {
          title: "Performance Analysis",
          description: "Analyze marketing campaign performance",
          role: "Marketing",
          dependsOn: "Social Media Campaign",
        },
      ],
      Design: [
        {
          title: "User Research",
          description: "Research user needs and requirements",
          role: "Design",
        },
        {
          title: "Wireframing",
          description: "Create wireframes for key interfaces",
          role: "Design",
          dependsOn: "User Research",
        },
        {
          title: "UI Design",
          description: "Design user interface components",
          role: "Design",
          dependsOn: "Wireframing",
        },
        {
          title: "Prototyping",
          description: "Create interactive prototypes",
          role: "Design",
          dependsOn: "UI Design",
        },
        {
          title: "User Testing",
          description: "Conduct user testing sessions",
          role: "Design",
          dependsOn: "Prototyping",
        },
        {
          title: "Design Refinement",
          description: "Refine designs based on feedback",
          role: "Design",
          dependsOn: "User Testing",
        },
      ],
    };

    // Default tasks for any project
    const defaultTasks = [
      {
        title: "Project Planning",
        description: "Define project scope, goals, and timeline",
        role: "Management",
      },
      {
        title: "Resource Allocation",
        description: "Allocate resources and budget",
        role: "Management",
      },
      {
        title: "Progress Review",
        description: "Review project progress and address issues",
        role: "Management",
      },
      {
        title: "Final Review",
        description: "Conduct final project review and sign-off",
        role: "Management",
      },
    ];

    // Select task template based on project category, fallback to default
    let selectedTemplate = [...defaultTasks];

    // Check if a specific template exists for the project category
    const normalizedCategory = project.category.toLowerCase().trim();
    Object.keys(taskTemplates).forEach((category) => {
      if (normalizedCategory.includes(category.toLowerCase())) {
        selectedTemplate = [...selectedTemplate, ...taskTemplates[category]];
      }
    });

    // Generate tasks based on templates
    let taskDependencies: Record<string, string> = {};

    selectedTemplate.forEach((template, index) => {
      // Create task ID for dependency tracking
      const taskId = `task_${index}`;

      // Calculate task duration based on project duration (simplified)
      const taskDuration = Math.max(
        1,
        Math.ceil(projectDurationDays / selectedTemplate.length)
      );

      // Type assertion to fix the dependsOn property type issue
      const typedTemplate = template as {
        title: string;
        description: string;
        role: string;
        dependsOn?: string;
      };

      // Calculate task due date
      let taskStartDate = new Date(startDate);
      if (
        typedTemplate.dependsOn &&
        taskDependencies[typedTemplate.dependsOn]
      ) {
        // If this task depends on another, set start date after the dependency
        const dependencyIndex = parseInt(
          taskDependencies[typedTemplate.dependsOn].split("_")[1]
        );
        const daysOffset = dependencyIndex * taskDuration;
        taskStartDate = new Date(
          startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000
        );
      } else {
        // For tasks without dependencies, distribute them evenly throughout the project
        const daysOffset = index * taskDuration;
        taskStartDate = new Date(
          startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000
        );
      }

      // Ensure due date doesn't exceed project end date
      let taskDueDate = new Date(
        taskStartDate.getTime() + taskDuration * 24 * 60 * 60 * 1000
      );
      if (taskDueDate > endDate) {
        taskDueDate = endDate;
      }

      // Find an appropriate team member for this task based on role/department
      let assignedTo = undefined;
      if (project.taskGeneration?.autoAssign) {
        // Find employees matching the role/department
        const matchingEmployees = teamMembers.filter(
          (emp) =>
            (emp.department &&
              emp.department
                .toLowerCase()
                .includes(typedTemplate.role.toLowerCase())) ||
            (emp.position &&
              emp.position
                .toLowerCase()
                .includes(typedTemplate.role.toLowerCase()))
        );

        if (matchingEmployees.length > 0) {
          // Assign to matching employee (could be enhanced with workload balancing)
          assignedTo =
            matchingEmployees[
              Math.floor(Math.random() * matchingEmployees.length)
            ].id;
        } else {
          // If no match, randomly assign to any team member
          assignedTo =
            teamMembers[Math.floor(Math.random() * teamMembers.length)].id;
        }
      }

      // Create the task
      const task: Partial<TaskData> = {
        title: typedTemplate.title,
        description: typedTemplate.description,
        projectId: project.id,
        assignedTo: assignedTo,
        status: "Not Started",
        priority:
          project.priority === "high"
            ? "High"
            : project.priority === "medium"
            ? "Medium"
            : "Low",
        dueDate: taskDueDate.toISOString().split("T")[0],
        createdBy: project.createdBy,
        checklist: [
          { id: 1, text: "Define requirements", completed: false },
          { id: 2, text: "Implement core functionality", completed: false },
          { id: 3, text: "Review and finalize", completed: false },
        ],
      };

      tasks.push(task);

      // Store task ID for dependency tracking
      taskDependencies[typedTemplate.title] = taskId;
    });

    // Create tasks in Firebase
    const createdTasks = [];
    for (const task of tasks) {
      const newTask = await createTask(task as TaskData);
      createdTasks.push(newTask);
    }

    // Update project with task count
    await updateProject(project.id, {
      tasksCount: createdTasks.length,
    });

    // Recalculate project progress after all tasks are created
    await recalculateProjectProgress(project.id);

    console.log(
      `Created ${createdTasks.length} tasks for project "${project.name}"`
    );
    return createdTasks;
  } catch (error) {
    console.error("Error generating tasks for project:", error);
    return [];
  }
};

// Function to recalculate progress for all projects
export const recalculateAllProjectsProgress = async (employerId?: string) => {
  try {
    // Get all projects, optionally filtering by employer
    let projectsQuery;
    if (employerId) {
      projectsQuery = query(
        collection(db, "projects"),
        where("createdBy", "==", employerId)
      );
    } else {
      projectsQuery = collection(db, "projects");
    }

    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Recalculating progress for ${projects.length} projects`);

    // Process each project
    for (const project of projects) {
      await recalculateProjectProgress(project.id);
    }

    return { success: true, count: projects.length };
  } catch (error) {
    console.error("Error recalculating all projects progress:", error);
    throw error;
  }
};

// Define the interface for due date renegotiation requests
export interface DueDateRenegotiationRequest {
  taskId: string;
  employeeId: string;
  employeeName?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  currentDueDate: string;
  requestedDueDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
  responseNote?: string; // Employer's note when approving/rejecting
}

// Create a new due date renegotiation request
export const createDueDateRenegotiationRequest = async (
  requestData: DueDateRenegotiationRequest
) => {
  try {
    // Add task and project information to the request
    let enhancedRequest = { ...requestData };

    // Get task details if not provided
    if (!enhancedRequest.taskTitle || !enhancedRequest.projectId) {
      const taskData = await getTask(requestData.taskId);
      enhancedRequest.taskTitle = taskData.title;
      enhancedRequest.projectId = taskData.projectId;

      // Get project name if project ID is available
      if (taskData.projectId && !enhancedRequest.projectName) {
        const projectData = await getProject(taskData.projectId);
        enhancedRequest.projectName = projectData.name;
      }
    }

    // Get employee name if not provided
    if (!enhancedRequest.employeeName) {
      const employeeData = await getEmployee(requestData.employeeId);
      if (employeeData) {
        enhancedRequest.employeeName = employeeData.name;
      }
    }

    // Save the request to Firestore
    const requestRef = await addDoc(collection(db, "dueDateRenegotiations"), {
      ...enhancedRequest,
      status: enhancedRequest.status || "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update the task to mark it as having a pending renegotiation
    await updateDoc(doc(db, "tasks", requestData.taskId), {
      dueDateRenegotiationStatus: "pending",
      updatedAt: serverTimestamp(),
    });

    return { id: requestRef.id, ...enhancedRequest };
  } catch (error) {
    console.error("Error creating due date renegotiation request:", error);
    throw error;
  }
};

// Get all renegotiation requests for an employer
export const getEmployerRenegotiationRequests = async (userId: string) => {
  try {
    // Get the relevant employer ID
    const employerId = await getRelevantEmployerId(userId);
    if (!employerId) return [];

    // Get all projects created by this employer
    const projectsData = await getProjects(employerId);
    const projectIds = projectsData.map((project: any) => project.id);

    // Then get all renegotiation requests for these projects
    const requestsQuery = query(
      collection(db, "dueDateRenegotiations"),
      where("projectId", "in", projectIds),
      orderBy("createdAt", "desc")
    );

    const requestsSnapshot = await getDocs(requestsQuery);
    return requestsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employer renegotiation requests:", error);
    throw error;
  }
};

// Get renegotiation requests for a specific employee
export const getEmployeeRenegotiationRequests = async (employeeId: string) => {
  try {
    const requestsQuery = query(
      collection(db, "dueDateRenegotiations"),
      where("employeeId", "==", employeeId),
      orderBy("createdAt", "desc")
    );

    const requestsSnapshot = await getDocs(requestsQuery);
    return requestsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee renegotiation requests:", error);
    throw error;
  }
};

// Update a renegotiation request (approve or reject)
export const updateRenegotiationRequest = async (
  requestId: string,
  status: "approved" | "rejected",
  responseNote?: string
) => {
  try {
    // Get the request data first
    const requestRef = doc(db, "dueDateRenegotiations", requestId);
    const requestSnapshot = await getDoc(requestRef);

    if (!requestSnapshot.exists()) {
      throw new Error("Renegotiation request not found");
    }

    const requestData = requestSnapshot.data() as DueDateRenegotiationRequest;

    // Update the request status
    await updateDoc(requestRef, {
      status,
      responseNote: responseNote || "",
      updatedAt: serverTimestamp(),
    });

    // If approved, update the task due date
    if (status === "approved") {
      await updateDoc(doc(db, "tasks", requestData.taskId), {
        dueDate: requestData.requestedDueDate,
        dueDateRenegotiationStatus: "approved",
        updatedAt: serverTimestamp(),
      });
    } else {
      // If rejected, just update the renegotiation status
      await updateDoc(doc(db, "tasks", requestData.taskId), {
        dueDateRenegotiationStatus: "rejected",
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, status };
  } catch (error) {
    console.error("Error updating renegotiation request:", error);
    throw error;
  }
};

// Manager functions
export const createManager = async (managerData: {
  name: string;
  email: string;
  position: string;
  employerId: string;
  whatsappNumber?: string;
}) => {
  try {
    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}`;

    // Create user account
    const userCredential = await registerWithEmailAndPassword(
      managerData.email,
      tempPassword,
      {
        fullName: managerData.name,
        userType: "manager",
        employerId: managerData.employerId,
      },
      true // Prevent auto sign-in
    );

    // Create manager record
    const managerRef = await addDoc(collection(db, "managers"), {
      ...managerData,
      userId: userCredential.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: managerRef.id,
      ...managerData,
      tempPassword,
      accountCreated: true,
    };
  } catch (error) {
    console.error("Error creating manager:", error);
    throw error;
  }
};

// Modify getManagers to handle manager access
export const getManagers = async (employerId: string) => {
  try {
    const managersQuery = query(
      collection(db, "managers"),
      where("employerId", "==", employerId)
    );
    const managersSnapshot = await getDocs(managersQuery);

    return managersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting managers:", error);
    throw error;
  }
};

export const updateManager = async (
  managerId: string,
  managerData: Partial<{
    name: string;
    email: string;
    position: string;
  }>
) => {
  try {
    const managerRef = doc(db, "managers", managerId);
    await updateDoc(managerRef, {
      ...managerData,
      updatedAt: serverTimestamp(),
    });

    return { id: managerId, ...managerData };
  } catch (error) {
    console.error("Error updating manager:", error);
    throw error;
  }
};

export const deleteManager = async (managerId: string) => {
  try {
    await deleteDoc(doc(db, "managers", managerId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting manager:", error);
    throw error;
  }
};

// Rewards interfaces
export interface Reward {
  id?: string;
  name: string;
  description: string;
  type: "monetary" | "time-off" | "development" | "team" | "other";
  value: string;
  pointsCost: number;
  criteria: string;
  status: "active" | "inactive";
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}

export interface EmployeeReward {
  id?: string;
  employeeId: string;
  rewardId: string;
  rewardName: string;
  rewardType: string;
  rewardValue: string;
  dateAwarded: any; // Timestamp
  status: "pending" | "approved" | "claimed";
  claimedDate?: any; // Timestamp
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}

export interface Achievement {
  id?: string;
  employeeId: string;
  name: string;
  description: string;
  pointsAwarded: number;
  date: any; // Timestamp
  createdAt?: any; // Timestamp
}

export interface EmployeePoints {
  id?: string;
  employeeId: string;
  points: number;
  lastUpdated: any; // Timestamp
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}

// Rewards functions
export const createReward = async (rewardData: Reward) => {
  try {
    const rewardRef = await addDoc(collection(db, "rewards"), {
      ...rewardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: rewardRef.id, ...rewardData };
  } catch (error) {
    console.error("Error creating reward:", error);
    throw error;
  }
};

export const updateReward = async (
  rewardId: string,
  rewardData: Partial<Reward>
) => {
  try {
    const rewardRef = doc(db, "rewards", rewardId);
    await updateDoc(rewardRef, {
      ...rewardData,
      updatedAt: serverTimestamp(),
    });
    return { id: rewardId, ...rewardData };
  } catch (error) {
    console.error("Error updating reward:", error);
    throw error;
  }
};

export const getRewards = async (status?: "active" | "inactive") => {
  try {
    let rewardsQuery;
    if (status) {
      rewardsQuery = query(
        collection(db, "rewards"),
        where("status", "==", status)
      );
    } else {
      rewardsQuery = collection(db, "rewards");
    }
    const querySnapshot = await getDocs(rewardsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting rewards:", error);
    throw error;
  }
};

export const assignReward = async (employeeId: string, rewardId: string) => {
  try {
    // Get reward details
    const rewardDoc = await getDoc(doc(db, "rewards", rewardId));
    if (!rewardDoc.exists()) {
      throw new Error("Reward not found");
    }
    const reward = rewardDoc.data() as Reward;

    // Create employee reward assignment
    const employeeRewardRef = await addDoc(collection(db, "employeeRewards"), {
      employeeId,
      rewardId,
      rewardName: reward.name,
      rewardType: reward.type,
      rewardValue: reward.value,
      dateAwarded: serverTimestamp(),
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: employeeRewardRef.id, ...reward };
  } catch (error) {
    console.error("Error assigning reward:", error);
    throw error;
  }
};

export const getEmployeeRewards = async (employeeId: string) => {
  try {
    const q = query(
      collection(db, "employeeRewards"),
      where("employeeId", "==", employeeId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee rewards:", error);
    throw error;
  }
};

export const updateEmployeeRewardStatus = async (
  employeeRewardId: string,
  status: "approved" | "claimed",
  claimedDate?: Date
) => {
  try {
    const employeeRewardRef = doc(db, "employeeRewards", employeeRewardId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "claimed" && claimedDate) {
      updateData.claimedDate = claimedDate;
    }

    await updateDoc(employeeRewardRef, updateData);
    return { id: employeeRewardId, status };
  } catch (error) {
    console.error("Error updating employee reward status:", error);
    throw error;
  }
};

export const createAchievement = async (achievementData: Achievement) => {
  try {
    const achievementRef = await addDoc(collection(db, "achievements"), {
      ...achievementData,
      createdAt: serverTimestamp(),
    });

    // Update employee points
    await updateEmployeePoints(
      achievementData.employeeId,
      achievementData.pointsAwarded
    );

    return { id: achievementRef.id, ...achievementData };
  } catch (error) {
    console.error("Error creating achievement:", error);
    throw error;
  }
};

export const getEmployeeAchievements = async (employeeId: string) => {
  try {
    const q = query(
      collection(db, "achievements"),
      where("employeeId", "==", employeeId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting employee achievements:", error);
    throw error;
  }
};

export const getEmployeePoints = async (employeeId: string) => {
  try {
    const pointsDoc = await getDoc(doc(db, "employeePoints", employeeId));
    if (pointsDoc.exists()) {
      return { id: pointsDoc.id, ...pointsDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting employee points:", error);
    throw error;
  }
};

export const updateEmployeePoints = async (
  employeeId: string,
  pointsToAdd: number
) => {
  try {
    const pointsRef = doc(db, "employeePoints", employeeId);
    const pointsDoc = await getDoc(pointsRef);

    if (pointsDoc.exists()) {
      const currentPoints = pointsDoc.data().points;
      await updateDoc(pointsRef, {
        points: currentPoints + pointsToAdd,
        lastUpdated: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(pointsRef, {
        employeeId,
        points: pointsToAdd,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating employee points:", error);
    throw error;
  }
};

export const onEmployeeRewardsUpdate = (
  callback: (rewards: any[]) => void,
  employeeId: string
) => {
  const q = query(
    collection(db, "employeeRewards"),
    where("employeeId", "==", employeeId)
  );
  return onSnapshot(q, (snapshot) => {
    const rewards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(rewards);
  });
};

export const onEmployeePointsUpdate = (
  callback: (points: any) => void,
  employeeId: string
) => {
  const pointsRef = doc(db, "employeePoints", employeeId);
  return onSnapshot(pointsRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export { auth, db };
export default app;
