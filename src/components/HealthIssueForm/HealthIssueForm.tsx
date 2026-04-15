import React, { useState, useEffect } from 'react';
import type { HealthIssue } from '../../services/healthIssueService';
import './HealthIssueForm.css';

interface HealthIssueFormProps {
  healthIssue: HealthIssue | null;
  animalId: string;
  onSubmit: (data: Omit<HealthIssue, 'id' | 'created_at' | 'animal_id'>) => Promise<void>;
  onClose: () => void;
}

export const HealthIssueForm: React.FC<HealthIssueFormProps> = ({
  healthIssue,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    symptoms: '',
    date: '',
    duration: '',
    treatment: ''
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (healthIssue) {
      setFormData({
        name: healthIssue.name,
        symptoms: healthIssue.symptoms || '',
        date: healthIssue.date || '',
        duration: healthIssue.duration || '',
        treatment: healthIssue.treatment || ''
      });
    }
  }, [healthIssue]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du problème de santé est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await onSubmit({
        name: formData.name.trim(),
        symptoms: formData.symptoms || null,
        date: formData.date || null,
        duration: formData.duration || null,
        treatment: formData.treatment || null,
        user_id: null
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="health-issue-form-overlay" onClick={handleOverlayClick}>
      <div className="health-issue-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h4>{healthIssue ? 'Modifier le problème de santé' : 'Ajouter un problème de santé'}</h4>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Nom du problème *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'error' : ''}
              placeholder="Ex: Infection respiratoire"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="symptoms">
              Symptômes
            </label>
            <textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Ex: toux, fatigue, perte d'appétit"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                Date d'apparition
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Durée estimée
              </label>
              <input
                id="duration"
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Ex: 10 jours"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="treatment">
              Traitement associé
            </label>
            <input
              id="treatment"
              type="text"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Ex: Antibiotique Boviflox"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Valider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};