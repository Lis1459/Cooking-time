import React from "react";
import { Button } from "../ui";
import Modal from "../ui/Modal";

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Да",
  cancelLabel = "Отмена",
  loading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
