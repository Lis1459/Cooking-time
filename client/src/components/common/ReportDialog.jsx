import { useState } from "react";
import { useCreateReportMutation } from "../../services/apiService";
import { Button, Textarea, Card, CardHeader, CardContent } from "../ui";
import "./ReportDialog.css";
import { toast } from "sonner";

export const ReportDialog = ({ isOpen, onClose, targetType, targetId }) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createReportMutation = useCreateReportMutation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Пожалуйста, укажите причину жалобы");
      return;
    }

    setIsLoading(true);
    try {
      await createReportMutation.mutateAsync({
        target_type: targetType,
        target_id: targetId.toString(),
        reason: reason.trim(),
      });

      toast.success("Жалоба успешно отправлена");
      setReason("");
      onClose();
    } catch (error) {
      toast.error("Не удалось отправить жалобу");
      console.error("Report error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="report-dialog-overlay" onClick={onClose}>
      <Card className="report-dialog-card" onClick={(e) => e.stopPropagation()}>
        <CardHeader>Пожаловаться на {targetType}</CardHeader>
        <CardContent>
          <p className="report-dialog-description">
            Пожалуйста, опишите, почему вы жалуетесь на{" "}
            {targetType.toLowerCase()}. Ваша жалоба помогает нам поддерживать
            безопасное сообщество.
          </p>

          <Textarea
            placeholder="Опишите проблему..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="report-dialog-textarea"
          />

          <div className="report-dialog-actions">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Отправка..." : "Отправить жалобу"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
