import './DeleteTaskModal.css';

interface DeleteTaskModalProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteTaskModal({ isOpen, taskTitle, onConfirm, onCancel, isDeleting = false }: DeleteTaskModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="delete-task-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-task-modal">
        <div className="delete-task-modal-header">
          <h3>Confirmer la suppression</h3>
        </div>
        <div className="delete-task-modal-body">
          <p>Voulez-vous vraiment supprimer la tâche <strong>"{taskTitle}"</strong> ?</p>
          <p className="warning-text">Cette action est irréversible.</p>
        </div>
        <div className="delete-task-modal-footer">
          <button className="btn-cancel" onClick={onCancel} disabled={isDeleting}>Annuler</button>
          <button className="btn-confirm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Suppression...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}