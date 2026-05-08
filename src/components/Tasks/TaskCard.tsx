import type { Task } from '../../services/tasksService';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onInfo: () => void;
}

export function TaskCard({ task, onEdit, onDelete, onInfo }: TaskCardProps) {
  const formatDate = (date: string | null): string => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <div className="task-actions">
          <button className="btn-info" onClick={onInfo}>ℹ️</button>
          <button className="btn-edit" onClick={onEdit}>✏️</button>
          <button className="btn-delete" onClick={onDelete}>🗑️</button>
        </div>
      </div>
      {task.description && (
        <div className="task-description">
          <p>{task.description}</p>
        </div>
      )}
      <div className="task-footer">
        <span className="task-date">📅 {formatDate(task.due_date)}</span>
        <span className="task-status">{task.status || 'Pending'}</span>
      </div>
    </div>
  );
}