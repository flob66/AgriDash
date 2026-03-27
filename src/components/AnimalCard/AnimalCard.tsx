import { Link } from 'react-router-dom';
import './AnimalCard.css';

interface Animal {
  id: string;
  name: string;
  species: string;
  age?: number | null;
  created_at: string;
  [key: string]: any;
}

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
}

const AnimalCard = ({ animal, onEdit, onDelete }: AnimalCardProps) => {
  const getSpeciesEmoji = (species: string): string => {
    const emojis: Record<string, string> = {
      vache: '🐄',
      bovin: '🐄',
      mouton: '🐑',
      ovin: '🐑',
      chèvre: '🐐',
      caprin: '🐐',
      cheval: '🐴',
      équin: '🐴',
      poule: '🐔',
      volaille: '🐔',
      cochon: '🐷',
      porcin: '🐷',
    };
    return emojis[species?.toLowerCase()] || '🌾';
  };

  const getSpeciesLabel = (species: string): string => {
    const labels: Record<string, string> = {
      vache: 'Bovin',
      bovin: 'Bovin',
      mouton: 'Ovin',
      ovin: 'Ovin',
      chèvre: 'Caprin',
      caprin: 'Caprin',
      cheval: 'Équin',
      équin: 'Équin',
      poule: 'Volaille',
      volaille: 'Volaille',
      cochon: 'Porcin',
      porcin: 'Porcin',
    };
    return labels[species?.toLowerCase()] || species;
  };

  return (
    <div className="animal-card">
      <div className="animal-card-header">
        <div className="animal-avatar">
          <span className="animal-emoji">{getSpeciesEmoji(animal.species)}</span>
        </div>
        <div className="animal-actions">
          <Link 
            to={`/animals/${animal.id}`} 
            className="action-btn info"
            aria-label="Informations"
            title="Voir la fiche détaillée"
          >
            ℹ️
          </Link>
          <button 
            className="action-btn edit" 
            onClick={() => onEdit(animal)}
            aria-label="Modifier"
            title="Modifier"
          >
            ✏️
          </button>
          <button 
            className="action-btn delete" 
            onClick={() => onDelete(animal.id)}
            aria-label="Supprimer"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="animal-card-content">
        <h3 className="animal-name">{animal.name}</h3>
        <div className="animal-details">
          {animal.species && (
            <div className="animal-detail-item">
              <span className="detail-icon">🐾</span>
              <div className="detail-info">
                <span className="detail-label">Espèce</span>
                <span className="detail-value">{getSpeciesLabel(animal.species)}</span>
              </div>
            </div>
          )}
          {animal.age !== null && animal.age !== undefined && (
            <div className="animal-detail-item">
              <span className="detail-icon">📅</span>
              <div className="detail-info">
                <span className="detail-label">Âge</span>
                <span className="detail-value">
                  {animal.age} {animal.age > 1 ? 'ans' : 'an'}
                </span>
              </div>
            </div>
          )}
          <div className="animal-detail-item">
            <span className="detail-icon">🕒</span>
            <div className="detail-info">
              <span className="detail-label">Ajouté le</span>
              <span className="detail-value">
                {new Date(animal.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;