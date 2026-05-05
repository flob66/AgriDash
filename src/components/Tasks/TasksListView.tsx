import type { Task } from '../../services/tasksService';
import './TasksListView.css';

interface TasksListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onInfo: (task: Task) => void;
}

function getTaskStatus(dueDate: string | null): { label: string; className: string } {
  if (!dueDate) return { label: 'Aucune date', className: 'status-none' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dueDate);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate < today) return { label: 'En retard', className: 'status-late' };
  if (taskDate.getTime() === today.getTime()) return { label: 'Aujourd\'hui', className: 'status-today' };
  return { label: 'À venir', className: 'status-upcoming' };
}

export function TasksListView({ tasks, onEdit, onDelete, onInfo }: TasksListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="tasks-list-view-empty">
        <div className="empty-icon">📋</div>
        <p>Aucune tâche à afficher</p>
      </div>
    );
  }

  const formatDate = (date: string | null): string => {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="tasks-list-view">
      <div className="list-header">
        <div className="header-title">Tâche</div>
        <div className="header-date">Date d'échéance</div>
        <div className="header-status">Statut</div>
        <div className="header-actions">Actions</div>
      </div>
      {tasks.map((task) => {
        const status = getTaskStatus(task.due_date);
        return (
          <div key={task.id} className="list-row">
            <div className="row-title">
              <strong>{task.title}</strong>
              {task.description && <span className="task-desc-preview">{task.description.substring(0, 50)}</span>}
            </div>
            <div className="row-date">{formatDate(task.due_date)}</div>
            <div className="row-status">
              <span className={`status-badge ${status.className}`}>{status.label}</span>
            </div>
            <div className="row-actions">
              <button className="action-btn info" onClick={() => onInfo(task)}>ℹ️</button>
              <button className="action-btn edit" onClick={() => onEdit(task)}>✏️</button>
              <button className="action-btn delete" onClick={() => onDelete(task)}>🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}