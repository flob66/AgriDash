import { useState, useEffect } from 'react';
import { getReminders, deleteReminder, type ReminderWithTask } from '../../services/remindersService';
import type { Task } from '../../services/tasksService';
import './ReminderList.css';

interface RemindersListProps {
  userId: string;
  tasks: Task[];
  onReminderDelete: () => void;
  onReminderClick: (task: Task) => void;
}

export function RemindersList({ userId, tasks, onReminderDelete, onReminderClick }: RemindersListProps) {
  const [reminders, setReminders] = useState<ReminderWithTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await getReminders(userId);
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadReminders();
  }, [userId]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer ce rappel ?')) {
      setDeletingId(id);
      try {
        await deleteReminder(id);
        await loadReminders();
        onReminderDelete();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredReminders = reminders.filter(r =>
    r.reminder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="reminders-list-loading">Chargement des rappels...</div>;

  return (
    <div className="reminders-list-container">
      <h3>Gestion des rappels</h3>
      <div className="reminders-filters">
        <input
          type="text"
          placeholder="Filtrer par nom de rappel"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredReminders.length === 0 ? (
        <p className="no-reminders">Aucun rappel trouvé</p>
      ) : (
        <div className="reminders-table">
          <div className="reminders-table-header">
            <span>Nom</span>
            <span>Date</span>
            <span>Tâche associée</span>
            <span>Actions</span>
          </div>
          {filteredReminders.map(reminder => {
            const associatedTask = tasks.find(t => t.id === reminder.task_id);
            return (
              <div key={reminder.id} className="reminders-table-row">
                <span className="reminder-name">{reminder.reminder_name}</span>
                <span className="reminder-date">{new Date(reminder.reminder_date).toLocaleDateString('fr-FR')}</span>
                <span 
                  className="reminder-task-name" 
                  onClick={() => associatedTask && onReminderClick(associatedTask)}
                  style={{ cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'underline' }}
                >
                  {reminder.task_title}
                </span>
                <div className="reminder-actions">
                  <button
                    className="reminder-delete-btn"
                    onClick={() => handleDelete(reminder.id)}
                    disabled={deletingId === reminder.id}
                  >
                    {deletingId === reminder.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}