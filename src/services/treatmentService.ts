import { supabase } from './supabaseClient';

export interface Treatment {
  id: number;
  animal_id: string;
  treatment_name: string;
  frequency: string | null;
  end_date: string | null;
  document_url: string | null;
  photo_url: string | null;
  user_id: string | null;
  created_at: string;
}

export interface TreatmentInput {
  animal_id: string;
  treatment_name: string;
  frequency: string | null;
  end_date: string | null;
  document_url: string | null;
  photo_url: string | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const treatmentService = {
  async getTreatmentsByAnimal(animalId: string): Promise<Treatment[]> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTreatmentById(id: number): Promise<Treatment | null> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTreatment(data: TreatmentInput): Promise<Treatment> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert([{
        animal_id: data.animal_id,
        treatment_name: data.treatment_name,
        frequency: data.frequency,
        end_date: data.end_date,
        document_url: data.document_url,
        photo_url: data.photo_url,
        user_id: user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return treatment;
  },

  async createTreatmentWithDocument(
    file: File,
    treatmentData: Omit<TreatmentInput, 'document_url' | 'photo_url'>
  ): Promise<Treatment> {
    try {
      const base64String = await fileToBase64(file);
      const { data: { user } } = await supabase.auth.getUser();

      const { data: treatment, error } = await supabase
        .from('treatments')
        .insert([{
          animal_id: treatmentData.animal_id,
          treatment_name: treatmentData.treatment_name,
          frequency: treatmentData.frequency,
          end_date: treatmentData.end_date,
          document_url: base64String,
          photo_url: null,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return treatment;
    } catch (error) {
      throw new Error(`Failed to create treatment with document: ${error}`);
    }
  },

  async createTreatmentWithPhoto(
    file: File,
    treatmentData: Omit<TreatmentInput, 'document_url' | 'photo_url'>
  ): Promise<Treatment> {
    try {
      const base64String = await fileToBase64(file);
      const { data: { user } } = await supabase.auth.getUser();

      const { data: treatment, error } = await supabase
        .from('treatments')
        .insert([{
          animal_id: treatmentData.animal_id,
          treatment_name: treatmentData.treatment_name,
          frequency: treatmentData.frequency,
          end_date: treatmentData.end_date,
          document_url: null,
          photo_url: base64String,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return treatment;
    } catch (error) {
      throw new Error(`Failed to create treatment with photo: ${error}`);
    }
  },

  async updateTreatment(id: number, data: Partial<TreatmentInput>): Promise<Treatment> {
    const updateData: any = {};
    if (data.treatment_name !== undefined) updateData.treatment_name = data.treatment_name;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.end_date !== undefined) updateData.end_date = data.end_date;
    if (data.document_url !== undefined) updateData.document_url = data.document_url;
    if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;

    const { data: treatment, error } = await supabase
      .from('treatments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return treatment;
  },

  async updateTreatmentDocument(id: number, file: File): Promise<Treatment> {
    try {
      const base64String = await fileToBase64(file);

      const { data: treatment, error } = await supabase
        .from('treatments')
        .update({ document_url: base64String })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return treatment;
    } catch (error) {
      throw new Error(`Failed to update treatment document: ${error}`);
    }
  },

  async updateTreatmentPhoto(id: number, file: File): Promise<Treatment> {
    try {
      const base64String = await fileToBase64(file);

      const { data: treatment, error } = await supabase
        .from('treatments')
        .update({ photo_url: base64String })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return treatment;
    } catch (error) {
      throw new Error(`Failed to update treatment photo: ${error}`);
    }
  },

  async deleteTreatment(id: number): Promise<void> {
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTreatmentDocument(id: number): Promise<Treatment> {
    const { data: treatment, error } = await supabase
      .from('treatments')
      .update({ document_url: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return treatment;
  },

  async deleteTreatmentPhoto(id: number): Promise<Treatment> {
    const { data: treatment, error } = await supabase
      .from('treatments')
      .update({ photo_url: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return treatment;
  }
};