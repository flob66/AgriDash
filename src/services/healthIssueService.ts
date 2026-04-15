import { supabase } from './supabaseClient'

export interface HealthIssue {
  id: number;
  animal_id: string;
  name: string;
  symptoms: string | null;
  duration: string | null;
  date: string | null;
  treatment: string | null;
  user_id: string | null;
  created_at: string;
}

export interface HealthIssueInput {
  animal_id: string;
  name: string;
  symptoms: string | null;
  duration: string | null;
  date: string | null;
  treatment: string | null;
}

export const healthIssueService = {
  async getHealthIssuesByAnimal(animalId: string): Promise<HealthIssue[]> {
    const { data, error } = await supabase
      .from('health_issues')
      .select('*')
      .eq('animal_id', animalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getHealthIssueById(id: number): Promise<HealthIssue | null> {
    const { data, error } = await supabase
      .from('health_issues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createHealthIssue(data: HealthIssueInput): Promise<HealthIssue> {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
    }

    const insertData = {
      animal_id: data.animal_id,
      name: data.name,
      symptoms: data.symptoms || null,
      duration: data.duration || null,
      date: data.date || null,
      treatment: data.treatment || null,
      user_id: user.id
    };

    const { data: healthIssue, error } = await supabase
      .from('health_issues')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.message?.includes('row-level security policy')) {
        throw new Error('Erreur de permission. Veuillez vous déconnecter et reconnecter.');
      }
      throw error;
    }

    return healthIssue;
  },

  async updateHealthIssue(id: number, data: Partial<HealthIssueInput>): Promise<HealthIssue> {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.symptoms !== undefined) updateData.symptoms = data.symptoms;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.treatment !== undefined) updateData.treatment = data.treatment;

    const { data: healthIssue, error } = await supabase
      .from('health_issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.message?.includes('row-level security policy')) {
        throw new Error('Erreur de permission. Vous ne pouvez modifier que vos propres données.');
      }
      throw error;
    }

    return healthIssue;
  },

  async deleteHealthIssue(id: number): Promise<void> {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Utilisateur non authentifié. Veuillez vous connecter.');
    }

    const { error } = await supabase
      .from('health_issues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      if (error.message?.includes('row-level security policy')) {
        throw new Error('Erreur de permission. Vous ne pouvez supprimer que vos propres données.');
      }
      throw error;
    }
  },

  async checkAuth(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }
};