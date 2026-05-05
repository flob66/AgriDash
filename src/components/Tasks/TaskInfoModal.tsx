import { useEffect, useState } from 'react';
import { getTaskById, type TaskWithReminders } from '../../services/tasksService';
import './TaskInfoModal.css';

interface TaskInfoModalProps {
  isOpen: boolean;
  taskId: number | null;
  onClose: () => void;
}

export function TaskInfoModal({ isOpen, taskId, onClose }: TaskInfoModalProps) {
  const [task, setTask] = useState<TaskWithReminders | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTask();
    }
  }, [isOpen, taskId]);

  const loadTask = async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTaskById(taskId);
      setTask(data);
    } catch (err) {
      setError('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null): string => {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="task-info-modal-overlay" onClick={handleOverlayClick}>
      <div className="task-info-modal">
        <div className="modal-header">
          <h3>Informations de la tâche</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="info-loading">
              <div className="spinner-small"></div>
              <p>Chargement...</p>
            </div>
          ) : error ? (
            <div className="info-error">{error}</div>
          ) : task ? (
            <>
              <div className="info-section">
                <div className="info-row">
                  <span className="info-label">Nom :</span>
                  <span className="info-value">{task.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date prévue :</span>
                  <span className="info-value">{formatDate(task.due_date)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Description :</span>
                  <span className="info-value">{task.description || 'Aucune description'}</span>
                </div>
              </div>

              <div className="reminders-section">
                <h4>Rappels associés</h4>
                {task.reminders.length === 0 ? (
                  <p className="no-reminders">Aucun rappel associé à cette tâche</p>
                ) : (
                  <ul className="reminders-list">
                    {task.reminders.map((reminder) => (
                      <li key={reminder.id}>
                        <span className="reminder-name">{reminder.reminder_name}</span>
                        <span className="reminder-date">{formatDate(reminder.reminder_date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>
        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}