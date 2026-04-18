import { useState, useEffect } from 'react';
import { HealthIssueFilters } from '../../components/HealthIssueFilters/HealthIssueFilters';
import { HealthGallery } from '../../components/HealthGallery/HealthGallery';
import { HealthList } from '../../components/HealthList/HealthList';
import { getUserHealthIssues, type HealthIssueWithAnimal } from '../../services/healthHistoryService';
import { supabase } from '../../services/supabaseClient';
import './HealthHistory.css';
import { Header } from '../../components/Header/Header';

export function HealthHistory() {
  const [issues, setIssues] = useState<HealthIssueWithAnimal[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<HealthIssueWithAnimal[]>([]);
  const [animals, setAnimals] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const healthIssues = await getUserHealthIssues();
      setIssues(healthIssues);
      setFilteredIssues(healthIssues);

      const { data: userAnimals } = await supabase
        .from('animals')
        .select('id, name')
        .order('name');

      if (userAnimals) {
        setAnimals(userAnimals);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l’historique de santé :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: {
    searchName: string;
    searchSymptoms: string;
    animalId: string;
    dateFrom: string;
    dateTo: string;
  }) => {
    let filtered = [...issues];

    if (filters.searchName) {
      filtered = filtered.filter(issue =>
        issue.name.toLowerCase().includes(filters.searchName.toLowerCase())
      );
    }

    if (filters.searchSymptoms) {
      filtered = filtered.filter(issue =>
        issue.symptoms?.toLowerCase().includes(filters.searchSymptoms.toLowerCase())
      );
    }

    if (filters.animalId) {
      filtered = filtered.filter(issue => issue.animal_id === filters.animalId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(issue => issue.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(issue => issue.date <= filters.dateTo);
    }

    setFilteredIssues(filtered);
  };

  if (loading) {
    return (
      <div className="health-history-loading">
        <div className="spinner"></div>
        <p>Chargement de l’historique de santé...</p>
      </div>
    );
  }

  return (
    <div className="health-history-page">
      <Header />
      
      <div className="page-header">
        <h1>Historique de santé</h1>
        <div className="view-toggle">
          <button
            type="button"
            className={`toggle-btn ${viewMode === 'gallery' ? 'active' : ''}`}
            onClick={() => setViewMode('gallery')}
          >
            Vue galerie
          </button>
          <button
            type="button"
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Vue liste
          </button>
        </div>
      </div>

      <HealthIssueFilters animals={animals} onFiltersChange={handleFiltersChange} />

      {viewMode === 'gallery' ? (
        <HealthGallery issues={filteredIssues} />
      ) : (
        <HealthList issues={filteredIssues} />
      )}
    </div>
  );
}