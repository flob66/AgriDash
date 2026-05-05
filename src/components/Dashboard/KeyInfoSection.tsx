import { useState, useEffect } from 'react';
import {
  getKeyInfoConfig,
  updateKeyInfoConfig,
  getUpcomingTasks,
  getActiveReminders,
  getStats,
  type KeyInfoConfig,
  type UpcomingTask,
  type ActiveReminder,
  type Stats,
} from '../../services/dashboardKeyInfoService';
import { KeyInfoCard } from './KeyInfoCard';
import { KeyInfoModal } from './KeyInfoModal';
import './KeyInfoSection.css';

interface KeyInfoSectionProps {
  userId: string;
  sectionId: number;
}

export function KeyInfoSection({ userId, sectionId  }: KeyInfoSectionProps) {
  const [config, setConfig] = useState<KeyInfoConfig | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadAll = async () => {
    console.log('sectionId', sectionId)
    try {
      const configData = await getKeyInfoConfig(userId);
      setConfig(configData);

      if (configData.rendus) {
        const tasks = await getUpcomingTasks(userId);
        setUpcomingTasks(tasks);
      }
      if (configData.rappels) {
        const reminders = await getActiveReminders(userId);
        setActiveReminders(reminders);
      }
      if (configData.statistiques) {
        const statsData = await getStats(userId);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading key info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadAll();
    }
  }, [userId]);

  const handleSaveConfig = async (fields: string[]) => {
    try {
      await updateKeyInfoConfig(userId, fields);
      await loadAll();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  if (loading) {
    return (
      <div className="key-info-loading">
        <div className="spinner-small"></div>
        <p>Chargement des informations clés...</p>
      </div>
    );
  }

  const enabledCards = [];

  if (config?.rendus) {
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

  if (config?.rappels) {
    enabledCards.push(
      <KeyInfoCard key="rappels" title="Rappels actifs" emptyMessage="Aucun rappel actif">
        <ul>
          {activeReminders.map(reminder => (
            <li key={reminder.id}>
              <strong>{reminder.reminder_name}</strong> – {new Date(reminder.reminder_date).toLocaleDateString('fr-FR')}
            </li>
          ))}
        </ul>
      </KeyInfoCard>
    );
  }

  if (config?.statistiques && stats) {
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
        <button className="configure-btn" onClick={() => setShowModal(true)}>
          ⚙️ Configurer
        </button>
      </div>
      {enabledCards.length === 0 ? (
        <div className="key-info-empty">
          <p>Aucun module activé. Cliquez sur "Configurer" pour choisir les informations à afficher.</p>
        </div>
      ) : (
        <div className="key-info-grid">{enabledCards}</div>
      )}
      <KeyInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveConfig}
        initialConfig={config || { rendus: true, rappels: true, statistiques: true }}
      />
    </div>
  );
}