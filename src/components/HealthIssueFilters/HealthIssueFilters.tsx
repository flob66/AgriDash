import { useState, useEffect } from 'react';
import './HealthIssueFilters.css';

interface HealthIssueFiltersProps {
  animals: { id: string; name: string }[];
  onFiltersChange: (filters: {
    searchName: string;
    searchSymptoms: string;
    animalId: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export function HealthIssueFilters({ animals, onFiltersChange }: HealthIssueFiltersProps) {
  const [searchName, setSearchName] = useState('');
  const [searchSymptoms, setSearchSymptoms] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    onFiltersChange({
      searchName,
      searchSymptoms,
      animalId,
      dateFrom,
      dateTo
    });
  }, [searchName, searchSymptoms, animalId, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearchName('');
    setSearchSymptoms('');
    setAnimalId('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="health-filters">
      <div className="filters-grid">
        <div className="filter-group">
          <label>Nom du problème</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Rechercher par nom du problème..."
          />
        </div>

        <div className="filter-group">
          <label>Symptômes</label>
          <input
            type="text"
            value={searchSymptoms}
            onChange={(e) => setSearchSymptoms(e.target.value)}
            placeholder="Rechercher par symptômes..."
          />
        </div>

        <div className="filter-group">
          <label>Animal</label>
          <select value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
            <option value="">Tous les animaux</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date de début</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Date de fin</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="filter-group filter-actions">
          <button type="button" onClick={resetFilters} className="btn-reset">
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}