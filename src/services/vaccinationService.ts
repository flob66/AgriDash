import { supabase } from './supabaseClient'

export interface Vaccination {
  id: number;
  animal_id: string;
  vaccine_name: string;
  last_vaccine_date: string | null;
  next_vaccine_date: string | null;
  document_url: string | null;
  user_id: string | null;
  created_at: string;
}

export interface VaccinationInput {
  animal_id: string;
  vaccine_name: string;
  last_vaccine_date: string | null;
  next_vaccine_date: string | null;
  document_url: string | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const vaccinationService = {

  async getVaccinationsByAnimal(animalId: string): Promise<Vaccination[]> {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getVaccinationById(id: number): Promise<Vaccination | null> {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createVaccination(data: VaccinationInput): Promise<Vaccination> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .insert([{
        animal_id: data.animal_id,
        vaccine_name: data.vaccine_name,
        last_vaccine_date: data.last_vaccine_date,
        next_vaccine_date: data.next_vaccine_date,
        document_url: data.document_url,
        user_id: user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return vaccination;
  },

  async createVaccinationWithDocument(
    file: File, 
    vaccinationData: Omit<VaccinationInput, 'document_url'>
  ): Promise<Vaccination> {
    try {

      const base64String = await fileToBase64(file);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: vaccination, error } = await supabase
        .from('vaccinations')
        .insert([{
          animal_id: vaccinationData.animal_id,
          vaccine_name: vaccinationData.vaccine_name,
          last_vaccine_date: vaccinationData.last_vaccine_date,
          next_vaccine_date: vaccinationData.next_vaccine_date,
          document_url: base64String,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return vaccination;
    } catch (error) {
      throw new Error(`Failed to create vaccination with document: ${error}`);
    }
  },

  async updateVaccination(id: number, data: Partial<VaccinationInput>): Promise<Vaccination> {
    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .update({
        vaccine_name: data.vaccine_name,
        last_vaccine_date: data.last_vaccine_date,
        next_vaccine_date: data.next_vaccine_date,
        document_url: data.document_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return vaccination;
  },

  async updateVaccinationDocument(id: number, file: File): Promise<Vaccination> {
    try {
      const base64String = await fileToBase64(file);

      const { data: vaccination, error } = await supabase
        .from('vaccinations')
        .update({ document_url: base64String })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return vaccination;
    } catch (error) {
      throw new Error(`Failed to update vaccination document: ${error}`);
    }
  },

  async deleteVaccination(id: number): Promise<void> {
    const { error } = await supabase
      .from('vaccinations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteVaccinationDocument(id: number): Promise<Vaccination> {
    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .update({ document_url: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return vaccination;
  }
};