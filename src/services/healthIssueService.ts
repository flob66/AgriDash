import { supabase } from './supabaseClient'

export interface HealthIssue {
  id: number;
  animal_id: string;
  name: string;
  symptoms: string | null;
  duration: string | null;
  date: string | null;
  treatment: string | null;
  photo_url: string | null;
  document_url: string | null;
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
  photo_url: string | null;
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
      photo_url: data.photo_url || null,
      document_url: data.document_url || null,
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

  async createHealthIssueWithDocument(
    file: File,
    healthIssueData: Omit<HealthIssueInput, 'document_url' | 'photo_url'>
  ): Promise<HealthIssue> {
    try {
      const base64String = await fileToBase64(file);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data: healthIssue, error } = await supabase
        .from('health_issues')
        .insert([{
          animal_id: healthIssueData.animal_id,
          name: healthIssueData.name,
          symptoms: healthIssueData.symptoms || null,
          duration: healthIssueData.duration || null,
          date: healthIssueData.date || null,
          treatment: healthIssueData.treatment || null,
          document_url: base64String,
          photo_url: null,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return healthIssue;
    } catch (error) {
      throw new Error(`Failed to create health issue with document: ${error}`);
    }
  },

  async createHealthIssueWithPhoto(
    file: File,
    healthIssueData: Omit<HealthIssueInput, 'document_url' | 'photo_url'>
  ): Promise<HealthIssue> {
    try {
      const base64String = await fileToBase64(file);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data: healthIssue, error } = await supabase
        .from('health_issues')
        .insert([{
          animal_id: healthIssueData.animal_id,
          name: healthIssueData.name,
          symptoms: healthIssueData.symptoms || null,
          duration: healthIssueData.duration || null,
          date: healthIssueData.date || null,
          treatment: healthIssueData.treatment || null,
          document_url: null,
          photo_url: base64String,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return healthIssue;
    } catch (error) {
      throw new Error(`Failed to create health issue with photo: ${error}`);
    }
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
    if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;
    if (data.document_url !== undefined) updateData.document_url = data.document_url;

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

  async updateHealthIssueDocument(id: number, file: File): Promise<HealthIssue> {
    try {
      const base64String = await fileToBase64(file);

      const { data: healthIssue, error } = await supabase
        .from('health_issues')
        .update({ document_url: base64String })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return healthIssue;
    } catch (error) {
      throw new Error(`Failed to update health issue document: ${error}`);
    }
  },

  async updateHealthIssuePhoto(id: number, file: File): Promise<HealthIssue> {
    try {
      const base64String = await fileToBase64(file);

      const { data: healthIssue, error } = await supabase
        .from('health_issues')
        .update({ photo_url: base64String })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return healthIssue;
    } catch (error) {
      throw new Error(`Failed to update health issue photo: ${error}`);
    }
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

  async deleteHealthIssueDocument(id: number): Promise<HealthIssue> {
    const { data: healthIssue, error } = await supabase
      .from('health_issues')
      .update({ document_url: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return healthIssue;
  },

  async deleteHealthIssuePhoto(id: number): Promise<HealthIssue> {
    const { data: healthIssue, error } = await supabase
      .from('health_issues')
      .update({ photo_url: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return healthIssue;
  },

  async checkAuth(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }
};