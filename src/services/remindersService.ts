import { supabase } from './supabaseClient';

export interface Reminder {
  id: number;
  user_id: string;
  task_id: number;
  reminder_name: string;
  reminder_date: string;
  created_at: string;
}

export interface ReminderWithTask extends Reminder {
  task_title: string;
}

export async function getReminders(userId: string): Promise<ReminderWithTask[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      id,
      user_id,
      task_id,
      reminder_name,
      reminder_date,
      created_at,
      tasks:task_id (title)
    `)
    .eq('user_id', userId)
    .order('reminder_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(r => ({
    ...r,
    task_title: r.tasks?.[0]?.title || 'Tâche inconnue'
  }));
}

export async function getActiveReminders(userId: string): Promise<ReminderWithTask[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      id,
      user_id,
      task_id,
      reminder_name,
      reminder_date,
      created_at,
      tasks:task_id (title)
    `)
    .eq('user_id', userId)
    .gte('reminder_date', today)
    .order('reminder_date', { ascending: true })
    .limit(5);

  if (error) throw error;
  return (data || []).map(r => ({
    ...r,
    task_title: r.tasks?.[0]?.title || 'Tâche inconnue'
  }));
}

export async function getCalendarReminders(userId: string): Promise<ReminderWithTask[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      id,
      user_id,
      task_id,
      reminder_name,
      reminder_date,
      created_at,
      tasks:task_id (title)
    `)
    .eq('user_id', userId)
    .order('reminder_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(r => ({
    ...r,
    task_title: r.tasks?.[0]?.title || 'Tâche inconnue'
  }));
}

export async function getTaskReminders(taskId: number): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('task_id', taskId)
    .order('reminder_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createReminder(
  userId: string,
  taskId: number,
  name: string,
  reminderDate: string
): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      task_id: taskId,
      reminder_name: name,
      reminder_date: reminderDate,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReminder(reminderId: number): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId);

  if (error) throw error;
}