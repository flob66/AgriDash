import { useState, useEffect } from 'react';
import './KeyInfoModal.css';

interface KeyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: string[]) => void;
  initialConfig: { rendus: boolean; rappels: boolean; statistiques: boolean; showWelcome: boolean; showStatsCards: boolean; showShortcuts: boolean };
}

export function KeyInfoModal({ isOpen, onClose, onSave, initialConfig }: KeyInfoModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  useEffect(() => {
    const fields: string[] = [];
    if (initialConfig.rendus) fields.push('rendus');
    if (initialConfig.rappels) fields.push('rappels');
    if (initialConfig.statistiques) fields.push('statistiques');
    if (initialConfig.showWelcome) fields.push('showWelcome');
    if (initialConfig.showStatsCards) fields.push('showStatsCards');
    if (initialConfig.showShortcuts) fields.push('showShortcuts');
    setSelectedFields(fields);
  }, [initialConfig]);

  if (!isOpen) return null;

  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (checked) setSelectedFields([...selectedFields, field]);
    else setSelectedFields(selectedFields.filter(f => f !== field));
  };

  const handleSave = () => {
    onSave(selectedFields);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Configuration des informations clés</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <h4>Informations clés</h4>
          <h4>Éléments généraux du tableau de bord</h4>
          <label className="checkbox-label">
            <input type="checkbox" checked={selectedFields.includes('showWelcome')} onChange={(e) => handleCheckboxChange('showWelcome', e.target.checked)} />
            <span>Afficher le bandeau de bienvenue</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={selectedFields.includes('showStatsCards')} onChange={(e) => handleCheckboxChange('showStatsCards', e.target.checked)} />
            <span>Afficher les cartes de statistiques (Animaux, Santé, Tâches, Rappels)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={selectedFields.includes('showShortcuts')} onChange={(e) => handleCheckboxChange('showShortcuts', e.target.checked)} />
            <span>Afficher les raccourcis (Animaux, Santé, Tâches, Calendrier, Rapports)</span>
          </label>
          <hr />
          <label className="checkbox-label">
            <input type="checkbox" checked={selectedFields.includes('rendus')} onChange={(e) => handleCheckboxChange('rendus', e.target.checked)} />
            <span>Rendus (tâches à venir)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={selectedFields.includes('rappels')} onChange={(e) => handleCheckboxChange('rappels', e.target.checked)} />
            <span>Rappels actifs</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={selectedFields.includes('statistiques')} onChange={(e) => handleCheckboxChange('statistiques', e.target.checked)} />
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