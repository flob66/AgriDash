import React from 'react';
import type { HealthIssue } from '../../services/healthIssueService';
import './HealthIssueList.css';

interface HealthIssueListProps {
  healthIssues: HealthIssue[];
  onEdit: (healthIssue: HealthIssue) => void;
  onDelete: (healthIssue: HealthIssue) => void;
}

export const HealthIssueList: React.FC<HealthIssueListProps> = ({
  healthIssues,
  onEdit,
  onDelete
}) => {
  if (healthIssues.length === 0) {
    return (
      <div className="health-issue-list-empty">
        <p>Aucun problème de santé enregistré</p>
      </div>
    );
  }

  const formatDate = (date: string | null): string => {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="health-issue-list">
      <div className="health-issue-list-header">
        <div className="header-name">Problème</div>
        <div className="header-symptoms">Symptômes</div>
        <div className="header-date">Date apparition</div>
        <div className="header-duration">Durée</div>
        <div className="header-treatment">Traitement</div>
        <div className="header-actions">Actions</div>
      </div>

      {healthIssues.map((healthIssue) => (
        <div key={healthIssue.id} className="health-issue-item">
          <div className="item-name">
            <strong>{healthIssue.name}</strong>
          </div>
          <div className="item-symptoms">
            {healthIssue.symptoms || '-'}
          </div>
          <div className="item-date">
            {formatDate(healthIssue.date)}
          </div>
          <div className="item-duration">
            {healthIssue.duration || '-'}
          </div>
          <div className="item-treatment">
            {healthIssue.treatment || '-'}
          </div>
          <div className="item-actions">
            <button 
              className="btn-edit"
              onClick={() => onEdit(healthIssue)}
              title="Modifier"
            >
              ✏️
            </button>
            <button 
              className="btn-delete"
              onClick={() => onDelete(healthIssue)}
              title="Supprimer"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};