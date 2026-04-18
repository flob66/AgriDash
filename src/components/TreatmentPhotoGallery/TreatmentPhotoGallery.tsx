import { useState, useEffect } from 'react';
import { treatmentService, type Treatment } from '../../services/treatmentService';
import './TreatmentPhotoGallery.css';

interface TreatmentPhotoGalleryProps {
  animalId: string;
  onPhotoChange?: () => void;
}

export function TreatmentPhotoGallery({ animalId, onPhotoChange }: TreatmentPhotoGalleryProps) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<Treatment | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const data = await treatmentService.getTreatmentsByAnimal(animalId);
      const treatmentsWithPhotos = data.filter(t => t.photo_url);
      setTreatments(treatmentsWithPhotos);
      setError(null);
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animalId) {
      loadTreatments();
    }
  }, [animalId]);

  const handleFileSelect = (treatment: Treatment, file: File) => {
    setSelectedTreatment(treatment);
    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!selectedTreatment || !uploadFile) return;

    try {
      await treatmentService.updateTreatmentPhoto(selectedTreatment.id, uploadFile);
      await loadTreatments();
      setSelectedTreatment(null);
      setUploadFile(null);
      setShowUpload(false);
      if (onPhotoChange) onPhotoChange();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erreur lors de l\'upload de la photo');
    }
  };

  const handleDelete = async (treatment: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      return;
    }

    try {
      setDeletingId(treatment.id);
      await treatmentService.deleteTreatmentPhoto(treatment.id);
      await loadTreatments();
      if (onPhotoChange) onPhotoChange();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (treatment: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const link = document.createElement('a');
      link.href = treatment.photo_url!;
      const extension = 'jpg';
      const filename = `treatment_${treatment.id}_photo.${extension}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading photo:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  const openLightbox = (treatment: Treatment) => {
    setLightboxImage(treatment);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = '';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  };

  useEffect(() => {
    if (lightboxImage) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImage]);

  const treatmentsWithPhotos = treatments.filter(t => t.photo_url);

  return (
    <>
      <div className="treatment-photo-gallery">
        <div className="gallery-header">
          <h3>Photos des traitements</h3>
          <div className="gallery-header-buttons">
            {!showUpload && (
              <button
                type="button"
                className="add-photo-btn"
                onClick={() => setShowUpload(true)}
              >
                📸 Ajouter une photo
              </button>
            )}
          </div>
        </div>

        {showUpload && (
          <div className="upload-section">
            <div className="upload-form">
              <select
                className="treatment-select"
                value={selectedTreatment?.id || ''}
                onChange={(e) => {
                  const treatment = treatments.find(t => t.id === Number(e.target.value));
                  setSelectedTreatment(treatment || null);
                }}
              >
                <option value="">Sélectionner un traitement</option>
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.treatment_name}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                  }
                }}
              />
              <button
                type="button"
                className="upload-submit-btn"
                onClick={handleUpload}
                disabled={!selectedTreatment || !uploadFile}
              >
                Uploader
              </button>
              <button
                type="button"
                className="cancel-upload-btn"
                onClick={() => {
                  setShowUpload(false);
                  setSelectedTreatment(null);
                  setUploadFile(null);
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="gallery-error">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="gallery-loading">
            <div className="loading-spinner"></div>
            <p>Chargement des photos...</p>
          </div>
        ) : treatmentsWithPhotos.length === 0 ? (
          <div className="gallery-empty">
            <div className="empty-icon">🖼️</div>
            <p>Aucune photo de traitement</p>
            <button
              type="button"
              className="empty-add-btn"
              onClick={() => setShowUpload(true)}
            >
              Ajouter votre première photo
            </button>
          </div>
        ) : (
          <div className="gallery-grid">
            {treatmentsWithPhotos.map((treatment) => (
              <div key={treatment.id} className="gallery-item">
                <div 
                  className="photo-container"
                  onClick={() => openLightbox(treatment)}
                >
                  <img
                    src={treatment.photo_url!}
                    alt={`Traitement ${treatment.treatment_name}`}
                    className="photo-image"
                  />
                  <div className="photo-overlay">
                    <button
                      type="button"
                      className="photo-action-btn download-btn"
                      onClick={(e) => handleDownload(treatment, e)}
                      title="Télécharger"
                    >
                      💾
                    </button>
                    <button
                      type="button"
                      className="photo-action-btn delete-btn"
                      onClick={(e) => handleDelete(treatment, e)}
                      disabled={deletingId === treatment.id}
                      title="Supprimer"
                    >
                      {deletingId === treatment.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
                <div className="photo-info">
                  <div className="photo-treatment-name">{treatment.treatment_name}</div>
                  <div className="photo-date">
                    {new Date(treatment.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>
            <img
              src={lightboxImage.photo_url!}
              alt="Photo en plein écran"
              className="lightbox-image"
            />
            <div className="lightbox-footer">
              <div className="lightbox-info">
                <span>Traitement: {lightboxImage.treatment_name}</span>
                <span>Ajoutée le {new Date(lightboxImage.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="lightbox-actions">
                <button
                  className="lightbox-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(lightboxImage, e);
                  }}
                >
                  💾 Télécharger
                </button>
                <button
                  className="lightbox-action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(lightboxImage, e);
                    closeLightbox();
                  }}
                  disabled={deletingId === lightboxImage.id}
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}