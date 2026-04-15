import React from 'react';
import './AnimalDetailInfo.css';

interface AnimalDetailInfoProps {
  animal: {
    id: string;
    name: string;
    species: string;
    age: number | null;
    created_at: string;
  };
}

export const AnimalDetailInfo: React.FC<AnimalDetailInfoProps> = ({ animal }) => {
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

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="animal-detail-info">
      <div className="info-header">
        <div className="info-avatar">
          <span className="info-emoji">{getSpeciesEmoji(animal.species)}</span>
        </div>
        <h2>{animal.name}</h2>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-icon">🏷️</span>
          <div className="info-content">
            <span className="info-label">Nom</span>
            <span className="info-value">{animal.name}</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-icon">🐾</span>
          <div className="info-content">
            <span className="info-label">Espèce</span>
            <span className="info-value">
              {animal.species ? getSpeciesLabel(animal.species) : 'Non renseignée'}
            </span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-icon">📅</span>
          <div className="info-content">
            <span className="info-label">Âge</span>
            <span className="info-value">
              {animal.age !== null && animal.age !== undefined 
                ? `${animal.age} ${animal.age > 1 ? 'ans' : 'an'}` 
                : 'Non renseigné'}
            </span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-icon">🕒</span>
          <div className="info-content">
            <span className="info-label">Ajouté le</span>
            <span className="info-value">{formatDate(animal.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};