import './TasksFilters.css';

interface TasksFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
}

export function TasksFilters({ searchQuery, onSearchChange, sortOrder, onSortChange }: TasksFiltersProps) {
  return (
    <div className="tasks-filters">
      <div className="filter-group search-group">
        <input
          type="text"
          placeholder="Rechercher une tâche..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filter-group sort-group">
        <label>Trier par date :</label>
        <select value={sortOrder} onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}>
          <option value="asc">Date croissante</option>
          <option value="desc">Date décroissante</option>
        </select>
      </div>
    </div>
  );
}