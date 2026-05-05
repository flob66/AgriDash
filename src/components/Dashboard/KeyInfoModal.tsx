import { useState } from 'react';
import './KeyInfoModal.css';

interface KeyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: string[]) => void;
  initialConfig: { rendus: boolean; rappels: boolean; statistiques: boolean };
}

export function KeyInfoModal({ isOpen, onClose, onSave, initialConfig }: KeyInfoModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    const fields: string[] = [];
    if (initialConfig.rendus) fields.push('rendus');
    if (initialConfig.rappels) fields.push('rappels');
    if (initialConfig.statistiques) fields.push('statistiques');
    return fields;
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, field]);
    } else {
      setSelectedFields(selectedFields.filter(f => f !== field));
    }
  };

  const handleSave = () => {
    onSave(selectedFields);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Configuration des informations clés</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedFields.includes('rendus')}
              onChange={(e) => handleCheckboxChange('rendus', e.target.checked)}
            />
            <span>Rendus (tâches à venir)</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedFields.includes('rappels')}
              onChange={(e) => handleCheckboxChange('rappels', e.target.checked)}
            />
            <span>Rappels actifs</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedFields.includes('statistiques')}
              onChange={(e) => handleCheckboxChange('statistiques', e.target.checked)}
            />
            <span>Statistiques (animaux & tâches)</span>
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={handleSave}>Valider</button>
        </div>
      </div>
    </div>
  );
}