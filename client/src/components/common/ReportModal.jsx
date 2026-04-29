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
        <CardHeader>Report Details</CardHeader>
        <CardContent>
          <div className="report-detail-grid">
            <div>
              <strong>Reported by</strong>
              <p>{report.user?.name || report.user?.email || "Unknown"}</p>
            </div>
            <div>
              <strong>Target</strong>
              <p>{report.target_type}</p>
            </div>
            <div>
              <strong>Status</strong>
              <Badge
                variant={
                  report.status === "PENDING"
                    ? "warning"
                    : report.status === "APPROVED"
                      ? "success"
                      : "danger"
                }
              >
                {report.status}
              </Badge>
            </div>
            <div>
              <strong>Created</strong>
              <p>{new Date(report.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="report-section">
            <strong>Reason</strong>
            <p>{report.reason}</p>
          </div>

          {report.target_type === "RECIPE" && targetLink && (
            <div className="report-section">
              <strong>Recipe</strong>
              <Link to={targetLink}>
                {report.target.title || `Recipe #${report.target.id}`}
              </Link>
            </div>
          )}

          {report.target_type === "USER" && targetLink && (
            <div className="report-section">
              <strong>User</strong>
              <Link to={targetLink}>
                {report.target.email || `User #${report.target.id}`}
              </Link>
            </div>
          )}

          {report.target_type === "COMMENT" && (
            <div className="report-section">
              <strong>Comment</strong>
              <div className="reported-comment">
                <p>{report.target?.text || "Comment content unavailable"}</p>
                <span>Recipe #{report.target?.recipe_id}</span>
              </div>
            </div>
          )}

          <div className="report-section">
            <strong>Resolution Comment</strong>
            <Textarea
              value={resolutionComment}
              onChange={(e) => setResolutionComment(e.target.value)}
              placeholder="Enter your review note"
              rows={4}
            />
          </div>

          <div className="report-modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setActionType("REJECTED");
                handleAction("REJECTED");
              }}
              disabled={!resolutionComment.trim()}
            >
              Reject
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setActionType("APPROVED");
                handleAction("APPROVED");
              }}
              disabled={!resolutionComment.trim()}
            >
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
