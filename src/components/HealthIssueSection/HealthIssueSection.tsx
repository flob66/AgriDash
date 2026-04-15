import React, { useState, useEffect } from 'react';
import { type HealthIssue, healthIssueService } from '../../services/healthIssueService';
import { HealthIssueForm } from '../HealthIssueForm/HealthIssueForm';
import { HealthIssueList } from '../HealthIssueList/HealthIssueList';
import './HealthIssueSection.css';

interface HealthIssueSectionProps {
  animalId: string;
}

export const HealthIssueSection: React.FC<HealthIssueSectionProps> = ({ animalId }) => {
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHealthIssue, setEditingHealthIssue] = useState<HealthIssue | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadHealthIssues();
  }, [animalId]);

  const loadHealthIssues = async () => {
    try {
      setLoading(true);
      const data = await healthIssueService.getHealthIssuesByAnimal(animalId);
      setHealthIssues(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des problèmes de santé');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddClick = () => {
    setEditingHealthIssue(null);
    setShowForm(true);
  };

  const handleEditClick = (healthIssue: HealthIssue) => {
    setEditingHealthIssue(healthIssue);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingHealthIssue(null);
  };

  const handleFormSubmit = async (data: Omit<HealthIssue, 'id' | 'created_at' | 'animal_id'>) => {
    try {
      if (editingHealthIssue) {
        await healthIssueService.updateHealthIssue(editingHealthIssue.id, {
          name: data.name,
          symptoms: data.symptoms,
          duration: data.duration,
          date: data.date,
          treatment: data.treatment,
          animal_id: animalId
        });
        showMessage('success', 'Problème de santé modifié avec succès');
      } else {
        await healthIssueService.createHealthIssue({
          animal_id: animalId,
          name: data.name,
          symptoms: data.symptoms,
          duration: data.duration,
          date: data.date,
          treatment: data.treatment
        });
        showMessage('success', 'Problème de santé ajouté avec succès');
      }

      await loadHealthIssues();
      handleFormClose();
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteClick = async (healthIssue: HealthIssue) => {
    const confirmed = window.confirm('Confirmer la suppression du problème de santé ?');

    if (!confirmed) return;

    try {
      await healthIssueService.deleteHealthIssue(healthIssue.id);
      await loadHealthIssues();
      showMessage('success', 'Problème de santé supprimé avec succès');
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="health-issue-section">
      <div className="health-issue-section-header">
        <h3>Problèmes de santé</h3>
        <button className="btn-add" onClick={handleAddClick}>
          + Ajouter un problème de santé
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <HealthIssueForm
          healthIssue={editingHealthIssue}
          animalId={animalId}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <HealthIssueList
          healthIssues={healthIssues}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};