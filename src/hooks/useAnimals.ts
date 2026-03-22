import { useState, useEffect, useCallback } from 'react';
import { animalsService, type Animal, type CreateAnimalData, type UpdateAnimalData } from '../services/animalsService';
import { supabase } from '../services/supabaseClient';

interface Filters {
  search: string;
  species: string;
  sortBy: 'name' | 'age';
  sortOrder: 'asc' | 'desc';
}

export const useAnimals = (filters: Filters) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchAnimals = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await animalsService.getAnimals(userId, {
        search: filters.search,
        species: filters.species,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setAnimals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [userId, filters.search, filters.species, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const createAnimal = async (data: CreateAnimalData) => {
    if (!userId) throw new Error('Utilisateur non authentifié');

    setError(null);
    try {
      await animalsService.createAnimal(userId, data);
      await fetchAnimals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      throw err;
    }
  };

  const updateAnimal = async (animalId: string, data: UpdateAnimalData) => {
    setError(null);
    try {
      await animalsService.updateAnimal(animalId, data);
      await fetchAnimals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
      throw err;
    }
  };

  const deleteAnimal = async (animalId: string) => {
    setError(null);
    try {
      await animalsService.deleteAnimal(animalId);
      await fetchAnimals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  };

  const refreshAnimals = () => {
    fetchAnimals();
  };

  return {
    animals,
    loading,
    error,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    refreshAnimals,
  };
};