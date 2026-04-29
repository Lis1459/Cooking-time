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
      toast.error("Please provide a reason for reporting");
      return;
    }

    setIsLoading(true);
    try {
      await createReportMutation.mutateAsync({
        target_type: targetType,
        target_id: targetId.toString(),
        reason: reason.trim(),
      });

      toast.success("Report submitted successfully");
      setReason("");
      onClose();
    } catch (error) {
      toast.error("Failed to submit report");
      console.error("Report error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="report-dialog-overlay" onClick={onClose}>
      <Card className="report-dialog-card" onClick={(e) => e.stopPropagation()}>
        <CardHeader>Report This {targetType}</CardHeader>
        <CardContent>
          <p className="report-dialog-description">
            Please describe why you're reporting this {targetType.toLowerCase()}
            . Your report helps us maintain a safe community.
          </p>

          <Textarea
            placeholder="Describe the issue..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="report-dialog-textarea"
          />

          <div className="report-dialog-actions">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
