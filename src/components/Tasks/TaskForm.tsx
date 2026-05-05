import { useState, useEffect } from 'react';
import './TaskForm.css';

interface TaskFormProps {
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: string;
  onSubmit: (data: { title: string; description: string | null; due_date: string | null }) => Promise<void>;
  submitLabel: string;
  isLoading?: boolean;
}

export function TaskForm({ initialTitle = '', initialDescription = '', initialDueDate = '', onSubmit, submitLabel, isLoading = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [errors, setErrors] = useState<{ title?: string; due_date?: string }>({});

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setDueDate(initialDueDate);
  }, [initialTitle, initialDescription, initialDueDate]);

  const validate = (): boolean => {
    const newErrors: { title?: string; due_date?: string } = {};
    if (!title.trim()) newErrors.title = 'Le nom de la tâche est obligatoire';
    if (dueDate && isNaN(new Date(dueDate).getTime())) newErrors.due_date = 'Date invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="task-title">Nom de la tâche *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'error' : ''}
          placeholder="Ex: Nettoyer l'étable"
          disabled={isLoading}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="task-date">Date d'échéance</label>
        <input
          id="task-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={errors.due_date ? 'error' : ''}
          disabled={isLoading}
        />
        {errors.due_date && <span className="error-message">{errors.due_date}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="task-description">Description (optionnelle)</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Détails supplémentaires..."
          disabled={isLoading}
        />
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? 'Enregistrement...' : submitLabel}
      </button>
    </form>
  );
}