import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardHeader, CardContent, Textarea, Badge } from "../ui";
import "./ReportModal.css";

export const ReportModal = ({ isOpen, onClose, report, onSubmit }) => {
  const [resolutionComment, setResolutionComment] = useState("");
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setResolutionComment("");
      setActionType(null);
    }
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const handleAction = (status) => {
    if (!resolutionComment.trim()) {
      return;
    }
    onSubmit({
      id: report.id,
      status,
      resolution_comment: resolutionComment.trim(),
    });
  };

  const targetLink = report.target?.id
    ? report.target_type === "RECIPE"
      ? `/recipes/${report.target.id}`
      : report.target_type === "USER"
        ? `/users/${report.target.id}`
        : null
    : null;

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <Card className="report-modal-card" onClick={(e) => e.stopPropagation()}>
        <CardHeader>Детали жалобы</CardHeader>
        <CardContent>
          <div className="report-detail-grid">
            <div>
              <strong>Сообщил</strong>
              <p>{report.user?.name || report.user?.email || "Неизвестно"}</p>
            </div>
            <div>
              <strong>Объект</strong>
              <p>
                {report.target_type === "RECIPE"
                  ? "Рецепт"
                  : report.target_type === "USER"
                    ? "Пользователь"
                    : report.target_type === "COMMENT"
                      ? "Комментарий"
                      : report.target_type}
              </p>
            </div>
            <div>
              <strong>Статус</strong>
              <Badge
                variant={
                  report.status === "PENDING"
                    ? "warning"
                    : report.status === "APPROVED"
                      ? "success"
                      : "danger"
                }
              >
                {report.status === "PENDING"
                  ? "Ожидает"
                  : report.status === "APPROVED"
                    ? "Одобрено"
                    : report.status === "REJECTED"
                      ? "Отклонено"
                      : report.status}
              </Badge>
            </div>
            <div>
              <strong>Created</strong>
              <p>{new Date(report.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="report-section">
            <strong>Причина</strong>
            <p>{report.reason}</p>
          </div>

          {report.target_type === "RECIPE" && targetLink && (
            <div className="report-section">
              <strong>Рецепт</strong>
              <Link to={targetLink}>
                {report.target.title || `Рецепт #${report.target.id}`}
              </Link>
            </div>
          )}

          {report.target_type === "USER" && targetLink && (
            <div className="report-section">
              <strong>Пользователь</strong>
              <Link to={targetLink}>
                {report.target.email || `Пользователь #${report.target.id}`}
              </Link>
            </div>
          )}

          {report.target_type === "COMMENT" && (
            <div className="report-section">
              <strong>Комментарий</strong>
              <div className="reported-comment">
                <p>
                  {report.target?.text || "Содержимое комментария недоступно"}
                </p>
                <span>Рецепт #{report.target?.recipe_id}</span>
              </div>
            </div>
          )}

          <div className="report-section">
            <strong>Комментарий к решению</strong>
            <Textarea
              value={resolutionComment}
              onChange={(e) => setResolutionComment(e.target.value)}
              placeholder="Введите комментарий к проверке"
              rows={4}
            />
          </div>

          <div className="report-modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Закрыть
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setActionType("REJECTED");
                handleAction("REJECTED");
              }}
              disabled={!resolutionComment.trim()}
            >
              Отклонить
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setActionType("APPROVED");
                handleAction("APPROVED");
              }}
              disabled={!resolutionComment.trim()}
            >
              Одобрить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
