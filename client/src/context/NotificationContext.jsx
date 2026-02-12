import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const id = Date.now();
      const newNotification = { ...notification, id };
      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-remove after 5 seconds if type is 'toast'
      if (notification.type === "toast") {
        setTimeout(() => {
          removeNotification(id);
        }, 5000);
      }

      return id;
    },
    [removeNotification], // added
  );

  const setUnread = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    setUnread,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
