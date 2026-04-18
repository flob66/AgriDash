import { useState, useEffect } from 'react';
import { healthIssueService, type HealthIssue } from '../../services/healthIssueService';
import './HealthIssuePhotoGallery.css';

interface HealthIssuePhotoGalleryProps {
  animalId: string;
  onPhotoChange?: () => void;
}

export function HealthIssuePhotoGallery({ animalId, onPhotoChange }: HealthIssuePhotoGalleryProps) {
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<HealthIssue | null>(null);
  const [selectedHealthIssue, setSelectedHealthIssue] = useState<HealthIssue | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const loadHealthIssues = async () => {
    try {
      setLoading(true);
      const data = await healthIssueService.getHealthIssuesByAnimal(animalId);
      const issuesWithPhotos = data.filter(issue => issue.photo_url);
      setHealthIssues(issuesWithPhotos);
      setError(null);
    } catch (err) {
      console.error('Error loading health issues:', err);
      setError('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animalId) {
      loadHealthIssues();
    }
  }, [animalId]);

  const handleUpload = async () => {
    if (!selectedHealthIssue || !uploadFile) return;

    try {
      await healthIssueService.updateHealthIssuePhoto(selectedHealthIssue.id, uploadFile);
      await loadHealthIssues();
      setSelectedHealthIssue(null);
      setUploadFile(null);
      setShowUpload(false);
      if (onPhotoChange) onPhotoChange();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erreur lors de l\'upload de la photo');
    }
  };

  const handleDelete = async (healthIssue: HealthIssue, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      return;
    }

    try {
      setDeletingId(healthIssue.id);
      await healthIssueService.deleteHealthIssuePhoto(healthIssue.id);
      await loadHealthIssues();
      if (onPhotoChange) onPhotoChange();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (healthIssue: HealthIssue, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const link = document.createElement('a');
      link.href = healthIssue.photo_url!;
      const extension = 'jpg';
      const filename = `health_issue_${healthIssue.id}_photo.${extension}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading photo:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  const openLightbox = (healthIssue: HealthIssue) => {
    setLightboxImage(healthIssue);
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

  const issuesWithPhotos = healthIssues.filter(issue => issue.photo_url);

  return (
    <>
      <div className="health-issue-photo-gallery">
        <div className="gallery-header">
          <h3>Photos des problèmes de santé</h3>
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
                className="health-issue-select"
                value={selectedHealthIssue?.id || ''}
                onChange={(e) => {
                  const issue = healthIssues.find(i => i.id === Number(e.target.value));
                  setSelectedHealthIssue(issue || null);
                }}
              >
                <option value="">Sélectionner un problème</option>
                {healthIssues.map(issue => (
                  <option key={issue.id} value={issue.id}>
                    {issue.name}
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
                disabled={!selectedHealthIssue || !uploadFile}
              >
                Uploader
              </button>
              <button
                type="button"
                className="cancel-upload-btn"
                onClick={() => {
                  setShowUpload(false);
                  setSelectedHealthIssue(null);
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
        ) : issuesWithPhotos.length === 0 ? (
          <div className="gallery-empty">
            <div className="empty-icon">🖼️</div>
            <p>Aucune photo de problème de santé</p>
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
            {issuesWithPhotos.map((issue) => (
              <div key={issue.id} className="gallery-item">
                <div 
                  className="photo-container"
                  onClick={() => openLightbox(issue)}
                >
                  <img
                    src={issue.photo_url!}
                    alt={`Problème ${issue.name}`}
                    className="photo-image"
                  />
                  <div className="photo-overlay">
                    <button
                      type="button"
                      className="photo-action-btn download-btn"
                      onClick={(e) => handleDownload(issue, e)}
                      title="Télécharger"
                    >
                      💾
                    </button>
                    <button
                      type="button"
                      className="photo-action-btn delete-btn"
                      onClick={(e) => handleDelete(issue, e)}
                      disabled={deletingId === issue.id}
                      title="Supprimer"
                    >
                      {deletingId === issue.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
                <div className="photo-info">
                  <div className="photo-issue-name">{issue.name}</div>
                  <div className="photo-date">
                    {issue.date ? new Date(issue.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'}
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
                <span>Problème: {lightboxImage.name}</span>
                <span>Date: {lightboxImage.date ? new Date(lightboxImage.date).toLocaleDateString('fr-FR') : 'Non spécifiée'}</span>
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