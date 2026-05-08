import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '../../components/Header/Header';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseClient';
import { getTasks } from '../../services/tasksService';
import { getActiveReminders } from '../../services/remindersService';
import { getKeyInfoConfig, updateKeyInfoConfig, getStats, type KeyInfoConfig } from '../../services/dashboardKeyInfoService';
import { KeyInfoSection } from '../../components/Dashboard/KeyInfoSection';
import { AddSectionModal } from '../../components/Dashboard/AddSectionModal';
import { CustomSection } from '../../components/Dashboard/CustomSection';
import { DeleteSectionModal } from '../../components/Dashboard/DeleteSectionModal';
import { DraggableDashboardSection } from '../../components/Dashboard/DraggableDashboardSection';
import { KeyInfoModal } from '../../components/Dashboard/KeyInfoModal';
import { ActiveRemindersList } from '../../components/Dashboard/ActiveRemindersList';
import {
  getDashboardSections,
  createCustomSection,
  deleteCustomSection,
  updateSectionsOrder,
  type DashboardSection,
} from '../../services/dashboardCustomSectionsService';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [animalCount, setAnimalCount] = useState(0);
  const [healthIssueCount, setHealthIssueCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [activeReminderCount, setActiveReminderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<number[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [config, setConfig] = useState<KeyInfoConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const userName = user?.email?.split('@')[0] || "Utilisateur";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [statsData, tasks, reminders, counts, configData] = await Promise.all([
          getStats(user.id),
          getTasks(user.id),
          getActiveReminders(user.id),
          (async () => {
            const { count: animalCount, error: animalError } = await supabase
              .from('animals')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            if (animalError) throw animalError;
            const { data: animals } = await supabase
              .from('animals')
              .select('id')
              .eq('user_id', user.id);
            let healthCount = 0;
            if (animals && animals.length > 0) {
              const animalIds = animals.map(a => a.id);
              const { count, error: healthError } = await supabase
                .from('health_issues')
                .select('*', { count: 'exact', head: true })
                .in('animal_id', animalIds);
              if (!healthError) healthCount = count || 0;
            }
            return { animalCount: animalCount || 0, healthCount };
          })(),
          getKeyInfoConfig(user.id)
        ]);
        console.log('Stats data:', statsData);
        setAnimalCount(counts.animalCount);
        setHealthIssueCount(counts.healthCount);
        setTaskCount(tasks.length);
        setActiveReminderCount(reminders.length);
        setConfig(configData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (user) loadSections();
  }, [user]);

  const loadSections = async () => {
    if (!user) return;
    try {
      const data = await getDashboardSections(user.id);
      setSections(data);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const handleAddSection = async (title: string, fields: { key: string; value: string }[]) => {
    if (!user) return;
    await createCustomSection(user.id, title, fields);
    await loadSections();
  };

  const handleDeleteClick = (sectionId: number, sectionTitle: string) => {
    setDeleteTarget({ id: sectionId, title: sectionTitle });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (isEditMode) {
      setPendingDeletes([...pendingDeletes, deleteTarget.id]);
      setSections(sections.filter(s => s.id !== deleteTarget.id));
    } else {
      await deleteCustomSection(deleteTarget.id);
      await loadSections();
    }
    setDeleteTarget(null);
  };

  const cancelDelete = () => setDeleteTarget(null);

  const handleDragStart = (id: number, index: number) => {
    sessionStorage.setItem('draggedSectionId', String(id));
    sessionStorage.setItem('draggedSectionIndex', String(index));
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    setDragOverIndex(targetIndex);
    console.log('Drag over index:', dragOverIndex);
    console.log('Event', e);
  };

  const handleDrop = (sourceId: number, targetIndex: number) => {
    const sourceIndex = sections.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDragOverIndex(null);
      return;
    }
    const newSections = [...sections];
    const [moved] = newSections.splice(sourceIndex, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections);
    setDragOverIndex(null);
  };

  const saveChanges = async () => {
    for (const id of pendingDeletes) await deleteCustomSection(id);
    const updates = sections.map((section, idx) => ({ id: section.id, order_index: idx }));
    await updateSectionsOrder(updates);
    setPendingDeletes([]);
    setIsEditMode(false);
    await loadSections();
  };

  const saveConfig = async (fields: string[]) => {
    if (!user) return;
    await updateKeyInfoConfig(user.id, fields);
    const newConfig = await getKeyInfoConfig(user.id);
    setConfig(newConfig);
  };

  const displayedSections = sections.filter(s => !pendingDeletes.includes(s.id));

  const dashboardCards = [
    { id: 1, title: "Mes animaux", description: "Gérez votre cheptel", icon: "🐄", color: "card-success", link: "/animals", buttonText: "Voir mes animaux" },
    { id: 2, title: "Santé", description: "Historique des problèmes de santé", icon: "🏥", color: "card-primary", link: "/health-history", buttonText: "Voir l'historique santé" },
    { id: 3, title: "Tâches", description: "Organisez votre travail", icon: "✅", color: "card-warning", link: "/tasks", buttonText: "Voir mes tâches" },
    { id: 4, title: "Calendrier", description: "Planifiez vos activités", icon: "📅", color: "card-info", link: "/tasks?view=calendar", buttonText: "Voir le calendrier" },
    { id: 5, title: "Rapports", description: "Analysez vos données", icon: "📊", color: "card-secondary", link: null, buttonText: "Bientôt disponible", disabled: true }
  ];

  if (loading) return <div className="loading-dashboard">Chargement...</div>;

  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-content">
        {config?.showWelcome && (
          <div className="welcome-card">
            <div className="welcome-icon">🌾</div>
            <div className="welcome-text">
              <h2>Bonjour {userName} 👋</h2>
              <p>Bienvenue sur votre tableau de bord AgriDash</p>
            </div>
          </div>
        )}

        <div className="dashboard-controls">
          <button className="btn-config" onClick={() => setShowConfigModal(true)}>Configurer l'affichage</button>
        </div>

        {config?.showStatsCards && (
          <>
            {user && <ActiveRemindersList userId={user.id} />}
            <div className="dashboard-stats">
              <div className="stat-card"><div className="stat-value">{animalCount}</div><div className="stat-label">Animaux</div></div>
              <div className="stat-card"><div className="stat-value">{healthIssueCount}</div><div className="stat-label">Problèmes de santé</div></div>
              <div className="stat-card"><div className="stat-value">{taskCount}</div><div className="stat-label">Tâches</div></div>
              <div className="stat-card"><div className="stat-value">{activeReminderCount}</div><div className="stat-label">Rappels actifs</div></div>
            </div>
          </>
        )}

        {config?.showShortcuts && (
          <div className="dashboard-grid">
            {dashboardCards.map((card) => (
              <div key={card.id} className={`dashboard-card ${card.color}`}>
                <div className="card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.link && !card.disabled ? (
                  <Link to={card.link} className="card-button">{card.buttonText}</Link>
                ) : (
                  <button className="card-button disabled" disabled={card.disabled}>{card.buttonText}</button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="custom-sections-header">
          <h2>Tableau de bord personnalisé</h2>
          <div className="custom-actions">
            {!isEditMode && <button className="btn-edit-mode" onClick={() => setIsEditMode(true)}>✏️ Éditer le dashboard</button>}
            <button className="btn-add-section" onClick={() => setShowAddModal(true)}>+ Ajouter une section</button>
          </div>
        </div>

        {displayedSections.length === 0 && !isEditMode && (
          <div className="custom-sections-empty">Aucune section personnalisée. Cliquez sur "Ajouter une section".</div>
        )}

        <div className="custom-sections-grid">
          {displayedSections.map((section, idx) => {
            let content = null;
            if (section.title === 'key_info' && user && config) {
              content = <KeyInfoSection userId={user.id} config={config} />;
            } else if (section.is_custom) {
              content = (
                <CustomSection
                  title={section.title}
                  fields={section.fields}
                  isEditMode={isEditMode}
                  onDelete={() => handleDeleteClick(section.id, section.title)}
                />
              );
            }
            if (!content) return null;
            return (
              <DraggableDashboardSection
                key={section.id}
                id={section.id}
                index={idx}
                isEditMode={isEditMode}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {content}
              </DraggableDashboardSection>
            );
          })}
        </div>

        {isEditMode && (pendingDeletes.length > 0 || sections.length > 0) && (
          <div className="edit-mode-footer">
            <button className="btn-save-changes" onClick={saveChanges}>Valider mes changements</button>
          </div>
        )}
      </main>

      <AddSectionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddSection} />
      <DeleteSectionModal isOpen={!!deleteTarget} sectionName={deleteTarget?.title || ''} onConfirm={confirmDelete} onCancel={cancelDelete} />
      {config && (
        <KeyInfoModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSave={saveConfig}
          initialConfig={config}
        />
      )}
    </div>
  );
}