import { useState, useEffect } from 'react';
import { getAnimalPhotos, deleteAnimalPhoto, type AnimalPhoto } from '../../services/animalPhotosService';
import AnimalImageUpload from '../AnimalImageUpload/AnimalImageUpload';
import './AnimalPhotoGallery.css';

interface AnimalPhotoGalleryProps {
  animalId: string;
  onPhotoChange?: () => void;
}

const AnimalPhotoGallery = ({ animalId, onPhotoChange }: AnimalPhotoGalleryProps) => {
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<AnimalPhoto | null>(null);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getAnimalPhotos(animalId);
      setPhotos(data);
      setError(null);
    } catch (err) {
      console.error('Error loading photos:', err);
      setError('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animalId) {
      loadPhotos();
    }
  }, [animalId]);

  const handleDelete = async (photoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); 

    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      return;
    }

    try {
      setDeletingId(photoId);
      await deleteAnimalPhoto(photoId);
      await loadPhotos();
      if (onPhotoChange) onPhotoChange();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (photo: AnimalPhoto, e: React.MouseEvent) => {
    e.stopPropagation(); 

    try {

      const link = document.createElement('a');
      link.href = photo.file_url;

      const extension = photo.file_url.split(';')[0].split('/')[1] || 'jpg';
      const filename = `animal_${animalId}_photo_${photo.id}.${extension}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading photo:', err);
      setError('Erreur lors du téléchargement');
    }
  };

  const openLightbox = (photo: AnimalPhoto) => {
    setLightboxImage(photo);
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

  const handleUploadSuccess = () => {
    setShowUpload(false);
    loadPhotos();
    if (onPhotoChange) onPhotoChange();
  };

  return (
    <>
      <div className="animal-photo-gallery">
        <div className="gallery-header">
          <h3>Galerie photos</h3>
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
            <AnimalImageUpload
              animalId={animalId}
              onUploadSuccess={handleUploadSuccess}
            />
            <button
              type="button"
              className="cancel-upload-btn"
              onClick={() => setShowUpload(false)}
            >
              Annuler
            </button>
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
        ) : photos.length === 0 ? (
          <div className="gallery-empty">
            <div className="empty-icon">🖼️</div>
            <p>Aucune photo pour cet animal</p>
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
            {photos.map((photo) => (
              <div key={photo.id} className="gallery-item">
                <div 
                  className="photo-container"
                  onClick={() => openLightbox(photo)}
                >
                  <img
                    src={photo.file_url}
                    alt={`Photo animal ${photo.id}`}
                    className="photo-image"
                  />
                  <div className="photo-overlay">
                    <button
                      type="button"
                      className="photo-action-btn download-btn"
                      onClick={(e) => handleDownload(photo, e)}
                      title="Télécharger"
                    >
                      💾
                    </button>
                    <button
                      type="button"
                      className="photo-action-btn delete-btn"
                      onClick={(e) => handleDelete(photo.id, e)}
                      disabled={deletingId === photo.id}
                      title="Supprimer"
                    >
                      {deletingId === photo.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
                <div className="photo-date">
                  {new Date(photo.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
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
              src={lightboxImage.file_url}
              alt="Photo en plein écran"
              className="lightbox-image"
            />
            <div className="lightbox-footer">
              <div className="lightbox-info">
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
                    handleDelete(lightboxImage.id, e);
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
};

export default AnimalPhotoGallery;