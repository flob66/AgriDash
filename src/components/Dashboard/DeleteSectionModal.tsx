import './DeleteSectionModal.css';

interface DeleteSectionModalProps {
  isOpen: boolean;
  sectionName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteSectionModal({ isOpen, sectionName, onConfirm, onCancel }: DeleteSectionModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="delete-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-modal">
        <div className="delete-modal-header">
          <h3>Confirmer la suppression</h3>
        </div>
        <div className="delete-modal-body">
          <p>Voulez-vous vraiment supprimer la section <strong>"{sectionName}"</strong> ?</p>
          <p className="warning-text">Cette action est irréversible.</p>
        </div>
        <div className="delete-modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Annuler</button>
          <button className="btn-confirm" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}