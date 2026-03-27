import './AnimalInfo.css';

interface Animal {
  id: string;
  name: string;
  species: string;
  age: number;
  user_id: string;
  created_at: string;
}

interface AnimalInfoProps {
  animal: Animal;
}

export function AnimalInfo({ animal }: AnimalInfoProps) {
  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      vache: '🐄',
      mouton: '🐑',
      chèvre: '🐐',
      cheval: '🐴',
      poule: '🐔',
      cochon: '🐷',
    };
    return emojis[species?.toLowerCase()] || '🐾';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="animal-info-card">
      <div className="animal-info-header">
        <div className="animal-info-icon">{getSpeciesEmoji(animal.species)}</div>
        <h2>Informations générales</h2>
      </div>
      
      <div className="animal-info-content">
        <div className="info-row">
          <span className="info-label">Nom :</span>
          <span className="info-value">{animal.name}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Espèce :</span>
          <span className="info-value">{animal.species || 'Non spécifiée'}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Âge :</span>
          <span className="info-value">
            {animal.age !== null ? `${animal.age} an${animal.age > 1 ? 's' : ''}` : 'Âge non spécifié'}
          </span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Date d'ajout :</span>
          <span className="info-value">{formatDate(animal.created_at)}</span>
        </div>
      </div>
    </div>
  );
}