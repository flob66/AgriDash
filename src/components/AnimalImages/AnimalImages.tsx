import { useState, useEffect } from 'react';
import { getAnimalPhotos, type AnimalPhoto } from '../../services/animalPhotosService';
import './AnimalImages.css';

interface AnimalImagesProps {
  animalId: string;
  refreshTrigger?: number;
}

const AnimalImages = ({ animalId, refreshTrigger = 0 }: AnimalImagesProps) => {
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnimalPhotos(animalId);
        setPhotos(data);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Impossible de charger les photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [animalId, refreshTrigger]);

  if (loading) {
    return (
      <div className="animal-images">
        <div className="images-header">
          <h3>Photos</h3>
        </div>
        <div className="images-loading">
          <div className="spinner"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animal-images">
        <div className="images-header">
          <h3>Photos</h3>
        </div>
        <div className="images-error">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animal-images">
      <div className="images-header">
        <h3>Photos</h3>
        <span className="photo-count">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
      </div>

      {photos.length === 0 ? (
        <div className="no-photos">
          <div className="no-photos-icon">📷</div>
          <p>Aucune photo</p>
        </div>
      ) : (
        <div className="images-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="image-card">
              <img
                src={photo.file_url}
                alt="Animal"
                className="animal-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimalImages;