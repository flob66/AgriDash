import { useState } from 'react';
import './AddSectionModal.css';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, fields: { key: string; value: string }[]) => Promise<void>;
}

export function AddSectionModal({ isOpen, onClose, onSave }: AddSectionModalProps) {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [errors, setErrors] = useState<{ title?: string; fields?: string }>({});
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { title?: string; fields?: string } = {};
    if (!title.trim()) newErrors.title = 'Le titre est obligatoire';
    const hasValidField = fields.some(f => f.key.trim() !== '' && f.value.trim() !== '');
    if (!hasValidField) newErrors.fields = 'Au moins un champ clé/valeur est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...fields];
    newFields[index][field] = value;
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const validFields = fields.filter(f => f.key.trim() !== '' && f.value.trim() !== '');
      await onSave(title.trim(), validFields);
      setTitle('');
      setFields([{ key: '', value: '' }]);
      onClose();
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="add-section-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-section-modal">
        <div className="modal-header">
          <h3>Ajouter une section personnalisée</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="section-title">Titre de la section *</label>
            <input
              id="section-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Ex: Alertes météo"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="fields-section">
            <label>Champs clé/valeur *</label>
            {fields.map((field, index) => (
              <div key={index} className="field-row">
                <input
                  type="text"
                  placeholder="Clé (ex: Température)"
                  value={field.key}
                  onChange={(e) => updateField(index, 'key', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Valeur (ex: 22°C)"
                  value={field.value}
                  onChange={(e) => updateField(index, 'value', e.target.value)}
                />
                <button
                  type="button"
                  className="remove-field-btn"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="add-field-btn" onClick={addField}>
              + Ajouter un champ
            </button>
            {errors.fields && <span className="error-message">{errors.fields}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}