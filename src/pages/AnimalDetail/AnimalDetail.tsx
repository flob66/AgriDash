import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { animalsService } from '../../services/animalsService';
import { healthService } from '../../services/healthService';
import {AnimalInfo} from '../../components/AnimalInfo/AnimalInfo';
import {AnimalImages} from '../../components/AnimalImages/AnimalImages';
import {AnimalHealth} from '../../components/AnimalHealth/AnimalHealth';
import './AnimalDetail.css';

interface Animal {
  id: string;
  name: string;
  species: string;
  age: number;
  user_id: string;
  created_at: string;
}

interface AnimalPhoto {
  id: string;
  url: string;
  created_at: string;
}

interface Vaccination {
  id: string;
  vaccine_name: string;
  date: string;
  next_due_date: string;
  notes: string;
}

interface Treatment {
  id: string;
  treatment_name: string;
  date: string;
  dosage: string;
  notes: string;
}

interface HealthIssue {
  id: string;
  issue_type: string;
  diagnosis: string;
  date: string;
  status: string;
  treatment: string;
  notes: string;
}

interface HealthHistory {
  vaccinations: Vaccination[];
  treatments: Treatment[];
  healthIssues: HealthIssue[];
}

export function AnimalDetail() {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [healthHistory, setHealthHistory] = useState<HealthHistory>({
    vaccinations: [],
    treatments: [],
    healthIssues: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAnimalData();
    }
  }, [id]);

  const loadAnimalData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [animalData, photosData, healthData] = await Promise.all([
        animalsService.getAnimalById(id),
        animalsService.getAnimalPhotos(id),
        healthService.getAnimalHealthHistory(id)
      ]);
      
      setAnimal(animalData);
      setPhotos(photosData);
      setHealthHistory(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="animal-detail-loading">
          <div className="spinner"></div>
          <p>Chargement de la fiche animal...</p>
        </div>
      </>
    );
  }

  if (error || !animal) {
    return (
      <>
        <Header />
        <div className="animal-detail-error">
          <div className="error-icon">⚠️</div>
          <h2>Erreur</h2>
          <p>{error || 'Animal non trouvé'}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="animal-detail-page">
        <div className="animal-detail-container">
          <div className="animal-detail-header">
            <h1>Fiche détaillée</h1>
          </div>
          
          <div className="animal-detail-sections">
            <AnimalInfo animal={animal} />
            <AnimalImages animalId={animal.id} photos={photos} onPhotoAdded={loadAnimalData} />
            <AnimalHealth healthHistory={healthHistory} />
          </div>
        </div>
      </div>
    </>
  );
}