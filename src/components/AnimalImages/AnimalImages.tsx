import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AnimalImages.css';

interface AnimalPhoto {
  id: string;
  url: string;
  created_at: string;
}

interface AnimalImagesProps {
  animalId: string;
  photos: AnimalPhoto[];
  onPhotoAdded: () => void;
}

export function AnimalImages({ animalId, photos, onPhotoAdded }: AnimalImagesProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<AnimalPhoto | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${animalId}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('animal-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('animal-images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('animal_photos')
        .insert([{ animal_id: animalId, url: publicUrl }]);

      if (dbError) throw dbError;

      onPhotoAdded();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      const { error } = await supabase
        .from('animal_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      onPhotoAdded();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="animal-images-card">
      <div className="animal-images-header">
        <div className="animal-images-title">
          <span className="title-icon">🖼️</span>
          <h2>Photos</h2>
        </div>
        <label className="upload-button">
          {uploading ? 'Upload en cours...' : '+ Ajouter une photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="no-images">
          <div className="no-images-icon">📸</div>
          <p>Aucune image disponible</p>
          <span>Ajoutez la première photo de votre animal</span>
        </div>
      ) : (
        <div className="images-gallery">
          {photos.map((photo) => (
            <div key={photo.id} className="image-card">
              <img
                src={photo.url}
                alt={`Photo animal`}
                className="image-thumbnail"
                onClick={() => setSelectedPhoto(photo)}
              />
              <button
                className="delete-image-btn"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-image-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto.url} alt="Agrandissement" className="full-image" />
            <button className="modal-close-btn" onClick={() => setSelectedPhoto(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}