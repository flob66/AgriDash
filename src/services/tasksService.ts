import { supabase } from './supabaseClient';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Reminder {
  id: number;
  reminder_name: string;
  reminder_date: string;
  task_id: number | null;
  created_at: string;
}

export interface TaskWithReminders extends Task {
  reminders: Reminder[];
}

export interface TaskInput {
  title: string;
  description: string | null;
  due_date: string | null;
  status?: string | null;
}

export async function getTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

export async function getTaskById(taskId: number): Promise<TaskWithReminders> {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError) throw taskError;

  const { data: reminders, error: remindersError } = await supabase
    .from('reminders')
    .select('id, reminder_name, reminder_date, task_id, created_at')
    .eq('task_id', taskId)
    .order('reminder_date', { ascending: true });

  if (remindersError) throw remindersError;

  return {
    ...task,
    reminders: reminders || [],
  };
}

export async function createTask(userId: string, task: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status || 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(taskId: number, task: Partial<TaskInput>): Promise<Task> {
  const updateData: any = {};
  if (task.title !== undefined) updateData.title = task.title;
  if (task.description !== undefined) updateData.description = task.description;
  if (task.due_date !== undefined) updateData.due_date = task.due_date;
  if (task.status !== undefined) updateData.status = task.status;

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: number): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

export async function searchTasks(userId: string, query: string): Promise<Task[]> {
  if (!query.trim()) {
    return getTasks(userId);
  }
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .ilike('title', `%${query}%`)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

export async function getTasksSorted(userId: string, order: 'asc' | 'desc'): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: order === 'asc', nullsFirst: false });

  if (error) throw error;
  return data || [];
}
