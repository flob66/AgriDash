import React, { useState, useEffect } from 'react';
import type { HealthIssue } from '../../services/healthIssueService';
import './HealthIssueForm.css';

interface HealthIssueFormProps {
  healthIssue: HealthIssue | null;
  animalId: string;
  onSubmit: (data: {
    name: string;
    symptoms: string | null;
    date: string | null;
    duration: string | null;
    treatment: string | null;
    photo_url: string | null;
    document_url: string | null;
  }, file?: File, photoFile?: File) => Promise<void>;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; file?: string; photo?: string }>({});
  const [loading, setLoading] = useState(false);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (healthIssue) {
      setFormData({
        name: healthIssue.name,
        symptoms: healthIssue.symptoms || '',
        date: healthIssue.date || '',
        duration: healthIssue.duration || '',
        treatment: healthIssue.treatment || ''
      });
      setExistingDocument(healthIssue.document_url);
      setExistingPhoto(healthIssue.photo_url);
    }
  }, [healthIssue]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; file?: string; photo?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du problème de santé est obligatoire';
    }

    if (selectedFile && selectedFile.type !== 'application/pdf') {
      newErrors.file = 'Seuls les fichiers PDF sont autorisés';
    }

    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      newErrors.file = 'Le fichier ne doit pas dépasser 5 Mo';
    }

    if (selectedPhoto && !selectedPhoto.type.startsWith('image/')) {
      newErrors.photo = 'Seuls les fichiers image sont autorisés';
    }

    if (selectedPhoto && selectedPhoto.size > 5 * 1024 * 1024) {
      newErrors.photo = 'La photo ne doit pas dépasser 5 Mo';
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedPhoto(file);
    if (file && !file.type.startsWith('image/')) {
      setErrors({ ...errors, photo: 'Seuls les fichiers image sont autorisés' });
    } else if (file && file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, photo: 'La photo ne doit pas dépasser 5 Mo' });
    } else {
      setErrors({ ...errors, photo: undefined });
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
          name: formData.name.trim(),
          symptoms: formData.symptoms || null,
          date: formData.date || null,
          duration: formData.duration || null,
          treatment: formData.treatment || null,
          photo_url: existingPhoto,
          document_url: existingDocument
        },
        selectedFile || undefined,
        selectedPhoto || undefined
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

  const handleRemovePhoto = () => {
    setExistingPhoto(null);
    setSelectedPhoto(null);
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

          <div className="form-group">
            <label htmlFor="photo">
              Photo
            </label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handlePhotoChange}
            />
            {existingPhoto && !selectedPhoto && (
              <div className="existing-file">
                <button 
                  type="button"
                  className="btn-remove-file"
                  onClick={handleRemovePhoto}
                >
                  Supprimer la photo
                </button>
              </div>
            )}
            {selectedPhoto && (
              <div className="selected-file">
                🖼️ {selectedPhoto.name}
                <button 
                  type="button"
                  className="btn-remove-file"
                  onClick={() => setSelectedPhoto(null)}
                >
                  Annuler
                </button>
              </div>
            )}
            {errors.photo && <span className="error-message">{errors.photo}</span>}
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