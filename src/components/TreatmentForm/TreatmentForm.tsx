import React, { useState, useEffect } from 'react';
import { type Treatment } from '../../services/treatmentService';
import './TreatmentForm.css';

interface TreatmentFormProps {
  treatment: Treatment | null;
  animalId: string;
  onSubmit: (data: {
    treatment_name: string;
    frequency: string | null;
    end_date: string | null;
    document_url: string | null;
  }, file?: File) => Promise<void>;
  onClose: () => void;
}

export const TreatmentForm: React.FC<TreatmentFormProps> = ({
  treatment,
  animalId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    treatment_name: '',
    frequency: '',
    end_date: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ treatment_name?: string; file?: string }>({});
  const [loading, setLoading] = useState(false);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);

  useEffect(() => {
    if (treatment) {
      setFormData({
        treatment_name: treatment.treatment_name,
        frequency: treatment.frequency || '',
        end_date: treatment.end_date || ''
      });
      setExistingDocument(treatment.document_url);
    }
  }, [treatment]);

  const validateForm = (): boolean => {
    const newErrors: { treatment_name?: string; file?: string } = {};

    if (!formData.treatment_name.trim()) {
      newErrors.treatment_name = 'Le nom du traitement est obligatoire';
    }

    if (selectedFile && selectedFile.type !== 'application/pdf') {
      newErrors.file = 'Seuls les fichiers PDF sont autorisés';
    }

    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      newErrors.file = 'Le fichier ne doit pas dépasser 5 Mo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && file.type !== 'application/pdf') {
      setErrors({ ...errors, file: 'Seuls les fichiers PDF sont autorisés' });
    } else if (file && file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, file: 'Le fichier ne doit pas dépasser 5 Mo' });
    } else {
      setErrors({ ...errors, file: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await onSubmit(
        {
          treatment_name: formData.treatment_name.trim(),
          frequency: formData.frequency || null,
          end_date: formData.end_date || null,
          document_url: existingDocument
        },
        selectedFile || undefined
      );
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

  const handleRemoveDocument = () => {
    setExistingDocument(null);
    setSelectedFile(null);
  };

  return (
    <div className="treatment-form-overlay" onClick={handleOverlayClick}>
      <div className="treatment-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h4>{treatment ? 'Modifier le traitement' : 'Ajouter un traitement'}</h4>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="treatment_name">
              Nom du traitement *
            </label>
            <input
              id="treatment_name"
              type="text"
              value={formData.treatment_name}
              onChange={(e) => setFormData({ ...formData, treatment_name: e.target.value })}
              className={errors.treatment_name ? 'error' : ''}
              placeholder="Ex: Antibiotique Boviflox"
            />
            {errors.treatment_name && <span className="error-message">{errors.treatment_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="frequency">
              Fréquence
            </label>
            <input
              id="frequency"
              type="text"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              placeholder="Ex: 2 fois par jour pendant 7 jours"
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">
              Date de fin
            </label>
            <input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">
              Document PDF
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {existingDocument && !selectedFile && (
              <div className="existing-file">
                <button 
                  type="button"
                  className="btn-remove-file"
                  onClick={handleRemoveDocument}
                >
                  Supprimer le document
                </button>
              </div>
            )}
            {selectedFile && (
              <div className="selected-file">
                📄 {selectedFile.name}
                <button 
                  type="button"
                  className="btn-remove-file"
                  onClick={() => setSelectedFile(null)}
                >
                  Annuler
                </button>
              </div>
            )}
            {errors.file && <span className="error-message">{errors.file}</span>}
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