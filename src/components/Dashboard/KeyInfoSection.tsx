import { useState, useEffect } from 'react';
import {
  getUpcomingTasks,
  getStats,
  type KeyInfoConfig,
  type UpcomingTask,
  type Stats,
} from '../../services/dashboardKeyInfoService';
import { getActiveReminders as getActiveRemindersService } from '../../services/remindersService';
import { KeyInfoCard } from './KeyInfoCard';
import './KeyInfoSection.css';

interface KeyInfoSectionProps {
  userId: string;
  config: KeyInfoConfig;
}

export function KeyInfoSection({ userId, config }: KeyInfoSectionProps) {
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [activeReminders, setActiveReminders] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];
      if (config.rendus) promises.push(getUpcomingTasks(userId));
      else promises.push(Promise.resolve([]));
      if (config.rappels) promises.push(getActiveRemindersService(userId));
      else promises.push(Promise.resolve([]));
      if (config.statistiques) promises.push(getStats(userId));
      else promises.push(Promise.resolve(null));

      const [tasks, reminders, statsData] = await Promise.all(promises);
      setUpcomingTasks(tasks || []);
      setActiveReminders(reminders || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading key info data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, config.rendus, config.rappels, config.statistiques]);

  if (loading) {
    return (
      <div className="key-info-loading">
        <div className="spinner-small"></div>
        <p>Chargement des informations clés...</p>
      </div>
    );
  }

  const enabledCards = [];

  if (config.rendus) {
    enabledCards.push(
      <KeyInfoCard key="rendus" title="Prochaines dates de rendu" emptyMessage="Aucune tâche à venir">
        <ul>
          {upcomingTasks.map(task => (
            <li key={task.id}>
              <strong>{task.title}</strong> – {new Date(task.due_date).toLocaleDateString('fr-FR')}
            </li>
          ))}
        </ul>
      </KeyInfoCard>
    );
  }

  if (config.rappels) {
    const sortedReminders = [...activeReminders].sort(
      (a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
    );
    const topReminders = sortedReminders.slice(0, 5);
    enabledCards.push(
      <KeyInfoCard key="rappels" title="Rappels actifs" emptyMessage="Aucun rappel actif">
        <ul>
          {topReminders.map(reminder => {
            const daysLeft = Math.ceil((new Date(reminder.reminder_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            let priorityClass = '';
            if (daysLeft <= 1) priorityClass = 'priority-high';
            else if (daysLeft <= 3) priorityClass = 'priority-medium';
            else priorityClass = 'priority-low';
            return (
              <li key={reminder.id} className={`reminder-item ${priorityClass}`}>
                <div className="reminder-dashboard-item">
                  <strong>{reminder.reminder_name}</strong>
                  <span>{new Date(reminder.reminder_date).toLocaleDateString('fr-FR')}</span>
                  <span className="reminder-days">({daysLeft} jour{daysLeft > 1 ? 's' : ''})</span>
                  <span className="reminder-task">Tâche : {reminder.task_title}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </KeyInfoCard>
    );
  }

  if (config.statistiques && stats) {
    enabledCards.push(
      <KeyInfoCard key="statistiques" title="Statistiques">
        <div className="stat-item">
          <span className="stat-label">Total animaux</span>
          <span className="stat-value">{stats.totalAnimals}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total tâches</span>
          <span className="stat-value">{stats.totalTasks}</span>
        </div>
      </KeyInfoCard>
    );
  }

  return (
    <div className="key-info-section">
      <div className="key-info-header">
        <h2>Informations clés</h2>
      </div>
      {enabledCards.length === 0 ? (
        <div className="key-info-empty">
          <p>Aucun module activé. Cliquez sur "Configurer" pour choisir les informations à afficher.</p>
        </div>
      ) : (
        <div className="key-info-grid">{enabledCards}</div>
      )}
    </div>
  );
}