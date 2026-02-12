import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../services/apiService";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Loader,
  Badge,
  Separator,
} from "../components/ui";
import "./Notifications.css";

const notificationTypeLabels = {
  NEW_COMMENT: "💬 New Comment",
  NEW_FOLLOWER: "👤 New Follower",
  NEW_RECIPE_FROM_SUBSCRIPTION: "📖 New Recipe",
  RECIPE_APPROVED: "✅ Recipe Approved",
  RECIPE_REJECTED: "❌ Recipe Rejected",
  REPORT_RESULT: "⚠️ Report Result",
};

export const NotificationsPage = () => {
  const { data: notifications = [], isLoading } = useNotificationsQuery();
  const { data: unreadCountData } = useUnreadCountQuery();
  const unreadCount = unreadCountData?.count || 0;
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllReadMutation = useMarkAllAsReadMutation();

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <Card>
          <CardContent>
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                  >
                    <div className="notification-content">
                      <div className="notification-type">
                        <Badge variant="primary">
                          {notificationTypeLabels[notification.type] ||
                            notification.type}
                        </Badge>
                      </div>
                      <div className="notification-text">
                        <p className="notification-message">
                          {notification.initiator?.name}{" "}
                          {getNotificationMessage(notification.type)}
                        </p>
                        <span className="notification-time">
                          {new Date(
                            notification.created_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="empty-state">
              <p>🔔 No notifications yet</p>
              <p>You're all caught up!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getNotificationMessage = (type) => {
  const messages = {
    NEW_COMMENT: "commented on your recipe",
    NEW_FOLLOWER: "started following you",
    NEW_RECIPE_FROM_SUBSCRIPTION: "published a new recipe",
    RECIPE_APPROVED: "Your recipe has been approved",
    RECIPE_REJECTED: "Your recipe was not approved",
    REPORT_RESULT: "A report you submitted was reviewed",
  };
  return messages[type] || "sent you a notification";
};

export default NotificationsPage;
