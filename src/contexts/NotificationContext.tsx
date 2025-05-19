import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import Notification, {
  type NotificationProps,
} from "../components/ui/Notification";

interface NotificationContextType {
  showNotification: (
    props: Omit<NotificationProps, "isVisible" | "onClose">
  ) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  );

  const showNotification = (
    props: Omit<NotificationProps, "isVisible" | "onClose">
  ) => {
    setNotification({
      ...props,
      isVisible: true,
      onClose: () => setNotification(null),
    });
  };

  const hideNotification = () => {
    if (notification) {
      setNotification({
        ...notification,
        isVisible: false,
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}
      {notification && <Notification {...notification} />}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Helper functions for common notifications
export const useSuccessNotification = () => {
  const { showNotification } = useNotification();

  return (title: string, message: string, duration?: number) => {
    showNotification({
      type: "success",
      title,
      message,
      duration,
    });
  };
};

export const useErrorNotification = () => {
  const { showNotification } = useNotification();

  return (title: string, message: string, duration?: number) => {
    showNotification({
      type: "error",
      title,
      message,
      duration,
    });
  };
};

export const useInfoNotification = () => {
  const { showNotification } = useNotification();

  return (title: string, message: string, duration?: number) => {
    showNotification({
      type: "info",
      title,
      message,
      duration,
    });
  };
};

export const useWarningNotification = () => {
  const { showNotification } = useNotification();

  return (title: string, message: string, duration?: number) => {
    showNotification({
      type: "warning",
      title,
      message,
      duration,
    });
  };
};
