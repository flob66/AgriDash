import { supabase } from './supabaseClient';

export interface HealthIssueWithAnimal {
  id: number;
  animal_id: string;
  name: string;
  symptoms: string;
  duration: string;
  date: string;
  treatment: string;
  photo_url: string | null;
  document_url: string | null;
  created_at: string;
  animal_name: string;
  animal_species: string;
}

export async function getUserHealthIssues(): Promise<HealthIssueWithAnimal[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('health_issues')
    .select(`
      *,
      animals:animal_id (
        name,
        species
      )
    `)
    .eq('animals.user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    animal_id: item.animal_id,
    name: item.name,
    symptoms: item.symptoms,
    duration: item.duration,
    date: item.date,
    treatment: item.treatment,
    photo_url: item.photo_url,
    document_url: item.document_url,
    created_at: item.created_at,
    animal_name: item.animals?.name || 'Unknown',
    animal_species: item.animals?.species || 'Unknown'
  }));
}

export async function uploadHealthIssuePhoto(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('health-issues-photos')
    .upload(fileName, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('health-issues-photos')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function uploadHealthIssueDocument(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('health-issues-documents')
    .upload(fileName, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('health-issues-documents')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteHealthIssuePhoto(photoUrl: string): Promise<void> {
  const fileName = photoUrl.split('/').pop();
  if (!fileName) return;

  await supabase.storage
    .from('health-issues-photos')
    .remove([fileName]);
}