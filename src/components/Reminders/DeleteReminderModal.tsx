import './DeleteReminderModal.css';

interface DeleteReminderModalProps {
  isOpen: boolean;
  reminderName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteReminderModal({ isOpen, reminderName, onConfirm, onCancel, isDeleting = false }: DeleteReminderModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="delete-reminder-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-reminder-modal">
        <div className="modal-header">
          <h3>Confirmer la suppression</h3>
        </div>
        <div className="modal-body">
          <p>Voulez-vous vraiment supprimer le rappel <strong>"{reminderName}"</strong> ?</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel} disabled={isDeleting}>Annuler</button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Suppression...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}