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
    userType: "employer" | "employee";
  }
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Store additional user data in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    ...userData,
    createdAt: new Date(),
  });

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
      userType: "employer", // Default role for Google sign-ins
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
  taskGeneration?: {
    autoAssign: boolean;
    setDeadlines: boolean;
    createDependencies: boolean;
  };
}

export const createProject = async (projectData: ProjectData) => {
  try {
    const projectRef = await addDoc(collection(db, "projects"), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: projectRef.id, ...projectData };
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

export const getProject = async (projectId: string) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      return { id: projectSnap.id, ...projectSnap.data() };
    } else {
      throw new Error("Project not found");
    }
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const projectsRef = collection(db, "projects");
    const projectsSnap = await getDocs(projectsRef);

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

    return { id: taskRef.id, ...taskData };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (
  taskId: string,
  taskData: Partial<TaskData>
) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp(),
    });

    return { id: taskId, ...taskData };
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const getTask = async (taskId: string) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);

    if (taskSnap.exists()) {
      return { id: taskSnap.id, ...taskSnap.data() };
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
    await deleteDoc(doc(db, "tasks", taskId));
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
}) => {
  try {
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

    return { id: employeeRef.id, ...employeeData };
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
      createdEmployees.push({ id: employeeRef.id, ...employeeData });
    }

    // Commit the batch
    await batch.commit();

    return createdEmployees;
  } catch (error) {
    console.error("Error bulk creating employees:", error);
    throw error;
  }
};

export const getEmployee = async (employeeId: string) => {
  try {
    const employeeRef = doc(db, "employees", employeeId);
    const employeeSnap = await getDoc(employeeRef);

    if (employeeSnap.exists()) {
      return { id: employeeSnap.id, ...employeeSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting employee:", error);
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
  projectId?: string
) => {
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

  // Set up the listener
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
      console.error("Error in tasks listener:", error);
    }
  );

  // Return the unsubscribe function
  return unsubscribe;
};

export { auth, db };
export default app;
