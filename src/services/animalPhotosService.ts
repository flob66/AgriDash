import { supabase } from '../services/supabaseClient';

export interface AnimalPhoto {
  id: number;
  animal_id: string;
  file_url: string; 
  user_id: string;
  created_at: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadAnimalPhoto = async (file: File, animalId: string): Promise<string> => {
  const base64String = await fileToBase64(file);

  const { data: { user } } = await supabase.auth.getUser();

  const { error: dbError } = await supabase
    .from('animal_photos')
    .insert({
      animal_id: animalId,
      file_url: base64String,
      user_id: user?.id,
    })
    .select()
    .single();

  if (dbError) {
    throw new Error(`Database insert failed: ${dbError.message}`);
  }

  return base64String;
};

export const getAnimalPhotos = async (animalId: string): Promise<AnimalPhoto[]> => {
  const { data, error } = await supabase
    .from('animal_photos')
    .select('*')
    .eq('animal_id', animalId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  return data || [];
};

export const deleteAnimalPhoto = async (photoId: number): Promise<void> => {
  const { error: dbError } = await supabase
    .from('animal_photos')
    .delete()
    .eq('id', photoId);

  if (dbError) {
    throw new Error(`Failed to delete photo: ${dbError.message}`);
  }
};

export const animalPhotosService = {
  uploadAnimalPhoto,
  getAnimalPhotos,
  deleteAnimalPhoto,
};