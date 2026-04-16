import React, { useState, useEffect } from 'react';
import { animalPhotosService, type AnimalPhoto } from '../../services/animalPhotosService';
import './AnimalImageGallery.css';

interface AnimalImageGalleryProps {
  animalId: string;
}

export const AnimalImageGallery: React.FC<AnimalImageGalleryProps> = ({ animalId }) => {
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [animalId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await animalPhotosService.getAnimalPhotos(animalId);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="animal-image-gallery">
        <h3>Photos</h3>
        <div className="gallery-loading">Chargement des photos...</div>
      </div>
    );
  }

  return (
    <div className="animal-image-gallery">
      <div className="gallery-header">
        <h3>Photos</h3>
        <span className="photo-count">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
      </div>

      {photos.length === 0 ? (
        <div className="gallery-empty">
          <span className="empty-icon">📷</span>
          <p>Aucune image</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="gallery-item"
              onClick={() => handlePhotoClick(photo.file_url)}
            >
              <img src={photo.file_url} alt={`Photo ${photo.id}`} loading="lazy" />
              <div className="gallery-overlay">
                <span>🔍</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="gallery-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <img src={selectedPhoto} alt="Agrandissement" />
          </div>
        </div>
      )}
    </div>
  );
};