import React, { useState, useEffect } from 'react';
import { type Vaccination } from '../../services/vaccinationService';
import './VaccinationForm.css';

interface VaccinationFormProps {
  vaccination: Vaccination | null;
  animalId: string;
  onSubmit: (data: {
    vaccine_name: string;
    last_vaccine_date: string | null;
    next_vaccine_date: string | null;
    document_url: string | null;
  }, file?: File) => Promise<void>;
  onClose: () => void;
}

export const VaccinationForm: React.FC<VaccinationFormProps> = ({
  vaccination,
  animalId,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    vaccine_name: '',
    last_vaccine_date: '',
    next_vaccine_date: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ vaccine_name?: string; file?: string }>({});
  const [loading, setLoading] = useState(false);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);

  useEffect(() => {
    if (vaccination) {
      setFormData({
        vaccine_name: vaccination.vaccine_name,
        last_vaccine_date: vaccination.last_vaccine_date || '',
        next_vaccine_date: vaccination.next_vaccine_date || ''
      });
      setExistingDocument(vaccination.document_url);
    }
  }, [vaccination]);

  const validateForm = (): boolean => {
    const newErrors: { vaccine_name?: string; file?: string } = {};

    if (!formData.vaccine_name.trim()) {
      newErrors.vaccine_name = 'Le nom du vaccin est obligatoire';
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
          vaccine_name: formData.vaccine_name.trim(),
          last_vaccine_date: formData.last_vaccine_date || null,
          next_vaccine_date: formData.next_vaccine_date || null,
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
    <div className="vaccination-form-overlay" onClick={handleOverlayClick}>
      <div className="vaccination-form" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h4>{vaccination ? 'Modifier la vaccination' : 'Ajouter une vaccination'}</h4>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vaccine_name">
              Nom du vaccin *
            </label>
            <input
              id="vaccine_name"
              type="text"
              value={formData.vaccine_name}
              onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })}
              className={errors.vaccine_name ? 'error' : ''}
              placeholder="Ex: Bovilis BVD"
            />
            {errors.vaccine_name && <span className="error-message">{errors.vaccine_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="last_vaccine_date">
              Date du dernier vaccin
            </label>
            <input
              id="last_vaccine_date"
              type="date"
              value={formData.last_vaccine_date}
              onChange={(e) => setFormData({ ...formData, last_vaccine_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="next_vaccine_date">
              Date du prochain vaccin
            </label>
            <input
              id="next_vaccine_date"
              type="date"
              value={formData.next_vaccine_date}
              onChange={(e) => setFormData({ ...formData, next_vaccine_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">
              Certificat PDF
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {existingDocument && !selectedFile && (
              <div className="existing-file">
                <a 
                  href={existingDocument} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  📄 Voir le certificat existant
                </a>
                <button 
                  type="button"
                  className="btn-remove-file"
                  onClick={handleRemoveDocument}
                >
                  Supprimer
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