import { supabase } from '../services/supabaseClient';

export interface Vaccination {
  id: string;
  animal_id: string;
  vaccine_name: string;
  date: string;
  next_due_date: string;
  notes: string;
  created_at: string;
}

export interface Treatment {
  id: string;
  animal_id: string;
  treatment_name: string;
  date: string;
  dosage: string;
  notes: string;
  created_at: string;
}

export interface HealthIssue {
  id: string;
  animal_id: string;
  issue_type: string;
  diagnosis: string;
  date: string;
  status: string;
  treatment: string;
  notes: string;
  created_at: string;
}

export const healthService = {
  async getAnimalHealthHistory(animalId: string) {
    const [vaccinations, treatments, healthIssues] = await Promise.all([
      this.getVaccinations(animalId),
      this.getTreatments(animalId),
      this.getHealthIssues(animalId)
    ]);

    return {
      vaccinations,
      treatments,
      healthIssues
    };
  },

  async getVaccinations(animalId: string) {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('animal_id', animalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Vaccination[];
  },

  async getTreatments(animalId: string) {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('animal_id', animalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Treatment[];
  },

  async getHealthIssues(animalId: string) {
    const { data, error } = await supabase
      .from('health_issues')
      .select('*')
      .eq('animal_id', animalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as HealthIssue[];
  },

  async createVaccination(animalId: string, data: Omit<Vaccination, 'id' | 'animal_id' | 'created_at'>) {
    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .insert([{ ...data, animal_id: animalId }])
      .select()
      .single();

    if (error) throw error;
    return vaccination as Vaccination;
  },

  async createTreatment(animalId: string, data: Omit<Treatment, 'id' | 'animal_id' | 'created_at'>) {
    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert([{ ...data, animal_id: animalId }])
      .select()
      .single();

    if (error) throw error;
    return treatment as Treatment;
  },

  async createHealthIssue(animalId: string, data: Omit<HealthIssue, 'id' | 'animal_id' | 'created_at'>) {
    const { data: healthIssue, error } = await supabase
      .from('health_issues')
      .insert([{ ...data, animal_id: animalId }])
      .select()
      .single();

    if (error) throw error;
    return healthIssue as HealthIssue;
  },

  async updateVaccination(vaccinationId: string, data: Partial<Vaccination>) {
    const { data: vaccination, error } = await supabase
      .from('vaccinations')
      .update(data)
      .eq('id', vaccinationId)
      .select()
      .single();

    if (error) throw error;
    return vaccination as Vaccination;
  },

  async updateTreatment(treatmentId: string, data: Partial<Treatment>) {
    const { data: treatment, error } = await supabase
      .from('treatments')
      .update(data)
      .eq('id', treatmentId)
      .select()
      .single();

    if (error) throw error;
    return treatment as Treatment;
  },

  async updateHealthIssue(healthIssueId: string, data: Partial<HealthIssue>) {
    const { data: healthIssue, error } = await supabase
      .from('health_issues')
      .update(data)
      .eq('id', healthIssueId)
      .select()
      .single();

    if (error) throw error;
    return healthIssue as HealthIssue;
  },

  async deleteVaccination(vaccinationId: string) {
    const { error } = await supabase
      .from('vaccinations')
      .delete()
      .eq('id', vaccinationId);

    if (error) throw error;
  },

  async deleteTreatment(treatmentId: string) {
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', treatmentId);

    if (error) throw error;
  },

  async deleteHealthIssue(healthIssueId: string) {
    const { error } = await supabase
      .from('health_issues')
      .delete()
      .eq('id', healthIssueId);

    if (error) throw error;
  },
};