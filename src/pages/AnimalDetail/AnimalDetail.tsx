import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { animalsService } from '../../services/animalsService';
import { AnimalDetailInfo } from '../../components/AnimalDetailInfo/AnimalDetailInfo';
import { AnimalImageGallery } from '../../components/AnimalImageGallery/AnimalImageGallery';
import { AnimalHealthHistory } from '../../components/AnimalHealthHistory/AnimalHealthHistory';
import './AnimalDetail.css';

interface Animal {
  id: string;
  name: string;
  species: string | null;
  age: number | null;
  created_at: string;
}

export const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAnimal();
    }
  }, [id]);

  const loadAnimal = async () => {
    try {
      setLoading(true);
      const data = await animalsService.getAnimalById(id!);
      if (!data) {
        setError('Animal non trouvé');
      } else {
        setAnimal(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/animals');
  };

  if (loading) {
    return (
      <div className="animal-detail-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de la fiche...</p>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="animal-detail-error">
        <div className="error-icon">⚠️</div>
        <h2>{error || 'Animal non trouvé'}</h2>
        <button className="btn-back" onClick={handleBack}>
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="animal-detail-container">
      <div className="animal-detail-header">
        <button className="btn-back" onClick={handleBack}>
          ← Retour
        </button>
        <div className="header-icon">🐄</div>
        <h1>Fiche détaillée</h1>
      </div>

      <div className="animal-detail-content">
        <AnimalDetailInfo animal={animal} />
        <AnimalImageGallery animalId={animal.id} />
        <AnimalHealthHistory animalId={animal.id} />
      </div>
    </div>
  );
};