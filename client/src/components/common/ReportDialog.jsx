import { useState } from "react";
import { useCreateReportMutation } from "../../services/apiService";
import { Button, Textarea } from "../ui";
import Modal from "../ui/Modal";
import "./ReportDialog.css";
import { toast } from "sonner";

const TartgetTypeList = {
  USER: "пользователя",
  RECIPE: "рецепт",
  COMMENT: "комментарий",
};

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Пожаловаться на ${TartgetTypeList[targetType]}`}
      footer={
        <div className="report-dialog-actions">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Отправка..." : "Отправить жалобу"}
          </Button>
        </div>
      }
    >
      <p className="report-dialog-description">
        Пожалуйста, опишите, почему вы жалуетесь на{" "}
        {TartgetTypeList[targetType]}. Ваша жалоба помогает нам поддерживать
        безопасное сообщество.
      </p>

      <Textarea
        placeholder="Опишите проблему..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        className="report-dialog-textarea"
      />
    </Modal>
  );
};
