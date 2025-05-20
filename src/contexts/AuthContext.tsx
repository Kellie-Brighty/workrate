import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  loginWithEmailAndPassword,
  loginWithGoogle,
  registerWithEmailAndPassword,
  logoutUser,
  getUserData,
} from "../services/firebase";

// User data interface
interface UserData {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  userType: "employer" | "employee" | "manager";
  employerId?: string; // Added to track which employer a manager works for
  createdAt: Date;
}

// Define the shape of our context
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  register: (
    email: string,
    password: string,
    userData: {
      companyName?: string;
      fullName: string;
      userType: "employer" | "employee" | "manager";
      employerId?: string;
    }
  ) => Promise<User>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create a default value for the context to avoid the undefined check
const defaultContextValue: AuthContextType = {
  currentUser: null,
  userData: null,
  loading: true,
  login: async () => {
    throw new Error("Not implemented");
  },
  signInWithGoogle: async () => {
    throw new Error("Not implemented");
  },
  register: async () => {
    throw new Error("Not implemented");
  },
  logout: async () => {
    throw new Error("Not implemented");
  },
  error: null,
  setError: () => {},
};

// Create the context with default value
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from Firestore
  const fetchUserData = async (user: User) => {
    try {
      const data = await getUserData(user.uid);
      if (data) {
        setUserData(data as UserData);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Set up auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const result = await loginWithEmailAndPassword(email, password);
      await fetchUserData(result.user);
      return result.user;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to login";
      setError(errorMessage);
      throw err;
    }
  };

  // Google sign-in function
  const signInWithGoogle = async (): Promise<User> => {
    try {
      const result = await loginWithGoogle();
      await fetchUserData(result.user);
      return result.user;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to login with Google";
      setError(errorMessage);
      throw err;
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    userData: {
      companyName?: string;
      fullName: string;
      userType: "employer" | "employee" | "manager";
      employerId?: string;
    }
  ): Promise<User> => {
    try {
      const result = await registerWithEmailAndPassword(
        email,
        password,
        userData
      );
      await fetchUserData(result.user);
      return result.user;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to register";
      setError(errorMessage);
      throw err;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      setUserData(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to logout";
      setError(errorMessage);
      throw err;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signInWithGoogle,
    register,
    logout,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context;
};
