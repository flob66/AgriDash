import type { Task } from '../../services/tasksService';
import { TaskCard } from './TaskCard';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onInfo: (task: Task) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onInfo }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-icon">📋</div>
        <p>Aucune tâche enregistrée</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task)}
          onInfo={() => onInfo(task)}
        />
      ))}
    </div>
  );
}