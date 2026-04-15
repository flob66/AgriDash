import { useState } from 'react';
import { useAnimals } from '../../hooks/useAnimals';
import AnimalForm from '../../components/AnimalForm/AnimalForm';
import AnimalList from '../../components/AnimalList/AnimalList';
import AnimalFilters from '../../components/AnimalFilters/AnimalFilters';
import { Header } from '../../components/Header/Header';
import './Animals.css';

interface Filters {
  search: string;
  species: string[];
  sortBy: 'name' | 'age';
  sortOrder: 'asc' | 'desc';
}

export function Animals() {
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    species: [],
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const {
    animals,
    loading,
    error,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    refreshAnimals,
  } = useAnimals(filters);

  const handleAddAnimal = () => {
    setEditingAnimal(null);
    setShowForm(true);
  };

  const handleEditAnimal = (animal: any) => {
    setEditingAnimal(animal);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAnimal(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingAnimal) {
      await updateAnimal(editingAnimal.id, data);
    } else {
      await createAnimal(data);
    }
    handleFormClose();
    refreshAnimals();
  };

  const handleDeleteAnimal = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      await deleteAnimal(id);
      refreshAnimals();
    }
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleModalOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleFormClose();
    }
  };

  return (
    <div className="animals-page">
      <Header />
      <div className="animals-container">
        <div className="animals-header">
          <div className="header-title-section">
            <div className="header-icon">🐄</div>
            <div>
              <h1>Mes Animaux</h1>
              <p>Gérez votre cheptel et suivez vos animaux</p>
            </div>
          </div>
          <button className="btn-primary" onClick={handleAddAnimal}>
            <span className="btn-icon">➕</span>
            Ajouter un animal
          </button>
        </div>

        <div className="animals-content">
          <AnimalFilters filters={filters} onFilterChange={handleFilterChange} />

          {showForm && (
            <div className="modal-overlay" onClick={handleModalOverlayClick}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleFormClose}>×</button>
                <AnimalForm
                  initialData={editingAnimal}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormClose}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <AnimalList
            animals={animals}
            loading={loading}
            onEdit={handleEditAnimal}
            onDelete={handleDeleteAnimal}
          />
        </div>
      </div>
    </div>
  );
}