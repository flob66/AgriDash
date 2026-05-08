import { useState, useEffect } from 'react';
import type { Task } from '../../services/tasksService';
import './ReminderModal.css';

interface ReminderModalProps {
  isOpen: boolean;
  tasks: Task[];
  onClose: () => void;
  onSave: (taskId: number, name: string, date: string) => Promise<void>;
}

export function ReminderModal({ isOpen, tasks, onClose, onSave }: ReminderModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [reminderName, setReminderName] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [errors, setErrors] = useState<{ task?: string; name?: string; date?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTaskId('');
      setReminderName('');
      setReminderDate('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { task?: string; name?: string; date?: string } = {};
    if (!selectedTaskId) newErrors.task = 'Veuillez sélectionner une tâche';
    if (!reminderName.trim()) newErrors.name = 'Le nom du rappel est obligatoire';
    if (!reminderDate) newErrors.date = 'La date du rappel est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(selectedTaskId as number, reminderName.trim(), reminderDate);
      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="reminder-modal-overlay" onClick={handleOverlayClick}>
      <div className="reminder-modal">
        <div className="modal-header">
          <h3>Ajouter un rappel</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Tâche *</label>
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(Number(e.target.value))}>
              <option value="">Sélectionner une tâche</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.title} - {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : 'Pas de date'}</option>
              ))}
            </select>
            {errors.task && <span className="error-message">{errors.task}</span>}
          </div>
          <div className="form-group">
            <label>Nom du rappel *</label>
            <input type="text" value={reminderName} onChange={(e) => setReminderName(e.target.value)} placeholder="Ex: Préparer le matériel" />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Date du rappel *</label>
            <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}