import { supabase } from './supabaseClient';

export interface KeyInfoConfig {
  rendus: boolean;
  rappels: boolean;
  statistiques: boolean;
}

export interface UpcomingTask {
  id: number;
  title: string;
  due_date: string;
  status: string;
}

export interface ActiveReminder {
  id: number;
  reminder_name: string;
  reminder_date: string;
  task_id: number | null;
}

export interface Stats {
  totalAnimals: number;
  totalTasks: number;
}

export async function getKeyInfoConfig(userId: string): Promise<KeyInfoConfig> {
  const { data: section, error: sectionError } = await supabase
    .from('dashboard_sections')
    .select('id')
    .eq('user_id', userId)
    .eq('title', 'key_info')
    .maybeSingle();

  if (sectionError && sectionError.code !== 'PGRST116') {
    throw sectionError;
  }

  if (!section) {
    await supabase.rpc('init_key_info_section', { user_id_param: userId });
    return { rendus: true, rappels: true, statistiques: true };
  }

  const { data: fields, error: fieldsError } = await supabase
    .from('dashboard_section_fields')
    .select('label, is_enabled')
    .eq('section_id', section.id);

  if (fieldsError) throw fieldsError;

  const config: KeyInfoConfig = {
    rendus: false,
    rappels: false,
    statistiques: false,
  };

  fields?.forEach(field => {
    if (field.label === 'rendus') config.rendus = field.is_enabled;
    if (field.label === 'rappels') config.rappels = field.is_enabled;
    if (field.label === 'statistiques') config.statistiques = field.is_enabled;
  });

  return config;
}

export async function updateKeyInfoConfig(userId: string, fields: string[]): Promise<void> {
  const { data: section, error: sectionError } = await supabase
    .from('dashboard_sections')
    .select('id')
    .eq('user_id', userId)
    .eq('title', 'key_info')
    .single();

  if (sectionError) throw sectionError;
  if (!section) return;

  const updates = fields.map(field => ({
    section_id: section.id,
    label: field,
    is_enabled: true,
  }));

  const allFields = ['rendus', 'rappels', 'statistiques'];
  const disabledFields = allFields.filter(f => !fields.includes(f));

  for (const field of disabledFields) {
    await supabase
      .from('dashboard_section_fields')
      .update({ is_enabled: false })
      .eq('section_id', section.id)
      .eq('label', field);
  }

  for (const field of updates) {
    await supabase
      .from('dashboard_section_fields')
      .update({ is_enabled: true })
      .eq('section_id', field.section_id)
      .eq('label', field.label);
  }
}

export async function getUpcomingTasks(userId: string): Promise<UpcomingTask[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, due_date, status')
    .eq('user_id', userId)
    .gte('due_date', today)
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(5);

  if (error) throw error;
  return data || [];
}

export async function getActiveReminders(userId: string): Promise<ActiveReminder[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('reminders')
    .select('id, reminder_name, reminder_date, task_id')
    .eq('user_id', userId)
    .gte('reminder_date', today)
    .order('reminder_date', { ascending: true })
    .limit(5);

  if (error) throw error;
  return data || [];
}

export async function getStats(userId: string): Promise<Stats> {
  const { count: animalCount, error: animalError } = await supabase
    .from('animals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (animalError) throw animalError;

  const { count: taskCount, error: taskError } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (taskError) throw taskError;

  return {
    totalAnimals: animalCount || 0,
    totalTasks: taskCount || 0,
  };
}