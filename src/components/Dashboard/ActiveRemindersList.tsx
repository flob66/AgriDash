import { useEffect, useState } from 'react';
import { getActiveReminders, type ReminderWithTask } from '../../services/remindersService';
import './ActiveRemindersList.css';

interface ActiveRemindersListProps {
  userId: string;
}

export function ActiveRemindersList({ userId }: ActiveRemindersListProps) {
  const [reminders, setReminders] = useState<ReminderWithTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      const data = await getActiveReminders(userId);
      setReminders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="active-reminders-loading">Chargement des rappels...</div>;
  if (reminders.length === 0) return null;

  const getPriorityClass = (daysLeft: number) => {
    if (daysLeft <= 1) return 'priority-high';
    if (daysLeft <= 3) return 'priority-medium';
    return 'priority-low';
  };

  return (
    <div className="active-reminders-list">
      <h3>Rappels imminents</h3>
      <div className="reminders-scroll">
        {reminders.map(reminder => {
          const daysLeft = Math.ceil((new Date(reminder.reminder_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          return (
            <div key={reminder.id} className={`reminder-card ${getPriorityClass(daysLeft)}`}>
              <div className="reminder-name">{reminder.reminder_name}</div>
              <div className="reminder-details">
                <span>📅 {new Date(reminder.reminder_date).toLocaleDateString('fr-FR')}</span>
                <span>⏰ {daysLeft <= 0 ? 'Aujourd\'hui' : `J-${daysLeft}`}</span>
                <span>📌 {reminder.task_title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}