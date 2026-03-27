import { supabase } from '../services/supabaseClient';

export interface Animal {
  id: string;
  created_at: string;
  name: string;
  species: string | null;
  age: number | null;
  user_id: string;
}

export interface CreateAnimalData {
  name: string;
  species?: string | null;
  age?: number | null;
}

export interface UpdateAnimalData {
  name?: string;
  species?: string | null;
  age?: number | null;
}

export const animalsService = {
  async getAnimals(userId: string, filters?: { search?: string; species?: string; sortBy?: 'name' | 'age'; sortOrder?: 'asc' | 'desc' }) {
    let query = supabase
      .from('animals')
      .select('*')
      .eq('user_id', userId);

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.species) {
      query = query.eq('species', filters.species);
    }

    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Animal[];
  },

  async createAnimal(userId: string, data: CreateAnimalData) {
    const { data: animal, error } = await supabase
      .from('animals')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return animal as Animal;
  },

  async updateAnimal(animalId: string, data: UpdateAnimalData) {
    const { data: animal, error } = await supabase
      .from('animals')
      .update(data)
      .eq('id', animalId)
      .select()
      .single();

    if (error) throw error;
    return animal as Animal;
  },

  async deleteAnimal(animalId: string) {

    const { data: photos, error: fetchError } = await supabase
      .from('animal_photos')
      .select('id')
      .eq('animal_id', animalId);

    if (fetchError) {
      console.error('Error fetching photos:', fetchError);
      throw new Error(`Impossible de récupérer les photos: ${fetchError.message}`);
    }

    if (photos && photos.length > 0) {
      const photoIds = photos.map(photo => photo.id);

      const { error: deletePhotosError } = await supabase
        .from('animal_photos')
        .delete()
        .in('id', photoIds);

      if (deletePhotosError) {
        console.error('Error deleting photos:', deletePhotosError);
        throw new Error(`Impossible de supprimer les photos: ${deletePhotosError.message}`);
      }

      console.log(`Deleted ${photoIds.length} photos for animal ${animalId}`);
    }

    const { error: deleteAnimalError } = await supabase
      .from('animals')
      .delete()
      .eq('id', animalId);

    if (deleteAnimalError) {
      throw new Error(`Impossible de supprimer l'animal: ${deleteAnimalError.message}`);
    }

    return { success: true, deletedPhotosCount: photos?.length || 0 };
  },
};