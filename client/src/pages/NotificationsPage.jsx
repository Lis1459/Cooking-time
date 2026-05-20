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
  NEW_COMMENT: "💬 Новый комментарий",
  NEW_FOLLOWER: "👤 Новый подписчик",
  NEW_RECIPE_FROM_SUBSCRIPTION: "📖 Новый рецепт",
  RECIPE_APPROVED: "✅ Рецепт одобрен",
  RECIPE_REJECTED: "❌ Рецепт отклонен",
  REPORT_RESULT: "⚠️ Результат жалобы",
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
      <div className="notifications-page__loading">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <h1>Уведомления</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Отметить все как прочитанное
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
                        Отметить как прочитанное
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
            <div className="notifications-page__empty-state">
              <p>🔔 Уведомлений пока нет</p>
              <p>Вы Уведомлений пока нет</p>
              <p>Вы в курсе всех событий</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getNotificationMessage = (type) => {
  const messages = {
    NEW_COMMENT: "оставил комментарий к вашему рецепту",
    NEW_FOLLOWER: "оформил подписку на вас",
    NEW_RECIPE_FROM_SUBSCRIPTION: "опубликовал новый рецепт",
    RECIPE_APPROVED: "Ваш рецепт был одобрен",
    RECIPE_REJECTED: "Ваш рецепт был отклонен",
    REPORT_RESULT: "Жалоба, которую вы отправили, была рассмотрена",
  };
  return messages[type] || "sent you a notification";
};

export default NotificationsPage;
