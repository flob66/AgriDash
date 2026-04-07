import AnimalCard from '../AnimalCard/AnimalCard';
import './AnimalList.css';

interface AnimalListProps {
  animals: any[];
  loading: boolean;
  onEdit: (animal: any) => void;
  onDelete: (id: string) => void;
}

const AnimalList = ({ animals, loading, onEdit, onDelete }: AnimalListProps) => {
  if (loading) {
    return (
      <div className="animal-list-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p>Chargement de vos animaux...</p>
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="animal-list-empty">
        <div className="empty-icon">🐄</div>
        <h3>Aucun animal enregistré</h3>
        <p>Commencez par ajouter votre premier animal à votre exploitation</p>
        {/* <button className="empty-action-btn" onClick={() => document.querySelector('[data-add-animal]')?.dispatchEvent(new Event('click'))}>
          <span>➕</span>
          Ajouter un animal
        </button> */}
      </div>
    );
  }

  return (
    <div className="animal-list">
      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AnimalList;