import './AnimalFilters.css';

interface Filters {
  search: string;
  species: string;
  sortBy: 'name' | 'age';
  sortOrder: 'asc' | 'desc';
}

interface AnimalFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
}

const AnimalFilters = ({ filters, onFilterChange }: AnimalFiltersProps) => {
  const speciesOptions = [
    { value: '', label: 'Toutes', icon: '🐾' },
    { value: 'Vache', label: 'Vache', icon: '🐄' },
    { value: 'Mouton', label: 'Mouton', icon: '🐑' },
    { value: 'Chèvre', label: 'Chèvre', icon: '🐐' },
    { value: 'Cheval', label: 'Cheval', icon: '🐴' },
    { value: 'Poule', label: 'Poule', icon: '🐔' },
    { value: 'Cochon', label: 'Cochon', icon: '🐷' },
  ];

  const handleSpeciesChange = (speciesValue: string) => {
    onFilterChange({ species: speciesValue });
  };

  const clearSearch = () => {
    if (filters.search) {
      onFilterChange({ search: '' });
    }
  };

  return (
    <div className="animal-filters">
      <div className="filters-container">
        <div className="filter-group search-group">
          <label className="filter-label">
            <span className="filter-icon">🔍</span>
            Rechercher
          </label>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Nom de l'animal..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="search-input"
            />
            {filters.search && (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="filter-group species-group">
          <label className="filter-label">
            <span className="filter-icon">🐾</span>
            Espèce
          </label>
          <div className="species-buttons">
            {speciesOptions.map((species) => (
              <button
                key={species.value}
                className={`species-btn ${filters.species === species.value ? 'active' : ''}`}
                onClick={() => handleSpeciesChange(species.value)}
                aria-pressed={filters.species === species.value}
              >
                <span className="species-icon">{species.icon}</span>
                <span className="species-label">{species.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group sort-group">
          <label className="filter-label">
            <span className="filter-icon">📊</span>
            Trier par
          </label>
          <div className="sort-controls">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as 'name' | 'age' })}
              className="sort-select"
            >
              <option value="name">Nom</option>
              <option value="age">Âge</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() =>
                onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
              }
              aria-label={`Trier par ordre ${filters.sortOrder === 'asc' ? 'décroissant' : 'croissant'}`}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalFilters;