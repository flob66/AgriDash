import { supabase } from './supabaseClient';

export interface KeyInfoConfig {
  rendus: boolean;
  rappels: boolean;
  statistiques: boolean;
  showWelcome: boolean;
  showStatsCards: boolean;
  showShortcuts: boolean;
}

export interface UpcomingTask {
  id: number;
  title: string;
  due_date: string;
  status: string;
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
    .single();

  if (sectionError && sectionError.code !== 'PGRST116') throw sectionError;

  if (!section) {
    await supabase.rpc('init_key_info_section', { user_id_param: userId });
    return { rendus: true, rappels: true, statistiques: true, showWelcome: true, showStatsCards: true, showShortcuts: true };
  }

  const fields = ['rendus', 'rappels', 'statistiques', 'showWelcome', 'showStatsCards', 'showShortcuts'];
  const { data: existingFields, error: fieldsError } = await supabase
    .from('dashboard_section_fields')
    .select('label, is_enabled')
    .eq('section_id', section.id)
    .in('label', fields);

  if (fieldsError) throw fieldsError;

  const config: KeyInfoConfig = {
    rendus: true,
    rappels: true,
    statistiques: true,
    showWelcome: true,
    showStatsCards: true,
    showShortcuts: true,
  };

  existingFields?.forEach(f => {
    if (f.label === 'rendus') config.rendus = f.is_enabled;
    if (f.label === 'rappels') config.rappels = f.is_enabled;
    if (f.label === 'statistiques') config.statistiques = f.is_enabled;
    if (f.label === 'showWelcome') config.showWelcome = f.is_enabled;
    if (f.label === 'showStatsCards') config.showStatsCards = f.is_enabled;
    if (f.label === 'showShortcuts') config.showShortcuts = f.is_enabled;
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

  const allFields = ['rendus', 'rappels', 'statistiques', 'showWelcome', 'showStatsCards', 'showShortcuts'];
  for (const field of allFields) {
    const isEnabled = fields.includes(field);
    const { data: updated, error: updateError } = await supabase
      .from('dashboard_section_fields')
      .update({ is_enabled: isEnabled })
      .eq('section_id', section.id)
      .eq('label', field)
      .select();

    if (updateError) throw updateError;

    if (!updated || updated.length === 0) {
      await supabase.from('dashboard_section_fields').insert({
        section_id: section.id,
        label: field,
        field_type: 'boolean',
        is_enabled: isEnabled,
      });
    }
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
    .order('due_date', { ascending: true, nullsFirst: false })
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

  return { totalAnimals: animalCount || 0, totalTasks: taskCount || 0 };
}