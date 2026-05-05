import { useState, useEffect } from 'react';
import { Header } from '../../components/Header/Header';
import { useAuth } from '../../hooks/useAuth';
import { getTasks, createTask, updateTask, deleteTask, searchTasks, type Task, type TaskInput } from '../../services/tasksService';
import { TaskModal } from '../../components/Tasks/TaskModal';
import { TaskForm } from '../../components/Tasks/TaskForm';
import { DeleteTaskModal } from '../../components/Tasks/DeleteTaskModal';
import { TaskInfoModal } from '../../components/Tasks/TaskInfoModal';
import { TasksFilters } from '../../components/Tasks/TasksFilters';
import { TasksListView } from '../../components/Tasks/TasksListView';
import { TasksCalendar } from '../../components/Tasks/TasksCalendar';
import './Tasks.css';

type ViewMode = 'list' | 'calendar';

export function Tasks() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [infoTaskId, setInfoTaskId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allTasks, searchQuery, sortOrder]);

  const loadTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getTasks(user.id);
      setAllTasks(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = async () => {
    if (!user) return;
    let tasks = [...allTasks];
    if (searchQuery.trim()) {
      tasks = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    tasks.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredTasks(tasks);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateTask = async (taskData: TaskInput) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createTask(user.id, taskData);
      showMessage('success', 'Tâche créée avec succès');
      setShowCreateModal(false);
      await loadTasks();
    } catch (error) {
      showMessage('error', 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData: TaskInput) => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      await updateTask(editingTask.id, taskData);
      showMessage('success', 'Tâche modifiée avec succès');
      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      showMessage('error', 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      showMessage('success', 'Tâche supprimée avec succès');
      setDeletingTask(null);
      await loadTasks();
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setInfoTaskId(task.id);
  };

  return (
    <div className="tasks-page">
      <Header />
      <main className="tasks-content">
        <div className="tasks-header">
          <h1>Mes tâches</h1>
          <div className="header-actions">
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 Vue Liste
              </button>
              <button
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                📅 Vue Calendrier
              </button>
            </div>
            <button className="btn-add-task" onClick={() => setShowCreateModal(true)}>
              + Ajouter une tâche
            </button>
          </div>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {viewMode === 'list' && (
          <TasksFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        )}

        {loading ? (
          <div className="tasks-loading">
            <div className="spinner"></div>
            <p>Chargement des tâches...</p>
          </div>
        ) : viewMode === 'list' ? (
          <TasksListView
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onInfo={(task) => setInfoTaskId(task.id)}
          />
        ) : (
          <TasksCalendar tasks={filteredTasks} onTaskClick={handleTaskClick} />
        )}
      </main>

      <TaskModal isOpen={showCreateModal} title="Ajouter une tâche" onClose={() => setShowCreateModal(false)}>
        <TaskForm onSubmit={handleCreateTask} submitLabel="Créer" isLoading={isSubmitting} />
      </TaskModal>

      <TaskModal isOpen={!!editingTask} title="Modifier la tâche" onClose={() => setEditingTask(null)}>
        {editingTask && (
          <TaskForm
            initialTitle={editingTask.title}
            initialDescription={editingTask.description || ''}
            initialDueDate={editingTask.due_date || ''}
            onSubmit={handleUpdateTask}
            submitLabel="Enregistrer"
            isLoading={isSubmitting}
          />
        )}
      </TaskModal>

      <DeleteTaskModal
        isOpen={!!deletingTask}
        taskTitle={deletingTask?.title || ''}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
        isDeleting={isDeleting}
      />

      <TaskInfoModal
        isOpen={infoTaskId !== null}
        taskId={infoTaskId}
        onClose={() => setInfoTaskId(null)}
      />
    </div>
  );
}