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

  const handleDownloadDocument = (documentUrl: string, issueName: string) => {
    try {
      const link = document.createElement('a');

      if (documentUrl.startsWith('data:application/pdf;base64,')) {
        const base64Data = documentUrl.replace('data:application/pdf;base64,', '');

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        link.href = blobUrl;
        link.download = `probleme_sante_${issueName.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);
      } else {
        link.href = documentUrl;
        link.download = `probleme_sante_${issueName.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Impossible de télécharger le document');
    }
  };

  const handleViewPhoto = (photoUrl: string) => {
    window.open(photoUrl, '_blank');
  };

  return (
    <div className="health-issue-list">
      <div className="health-issue-list-header">
        <div className="header-name">Problème</div>
        <div className="header-symptoms">Symptômes</div>
        <div className="header-date">Date apparition</div>
        <div className="header-duration">Durée</div>
        <div className="header-treatment">Traitement</div>
        <div className="header-photo">Photo</div>
        <div className="header-document">Document</div>
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
          <div className="item-photo">
            {healthIssue.photo_url ? (
              <button 
                className="btn-view-photo"
                onClick={() => handleViewPhoto(healthIssue.photo_url!)}
                title="Voir la photo"
              >
                🖼️ Voir photo
              </button>
            ) : (
              <span className="no-photo">Aucune</span>
            )}
          </div>
          <div className="item-document">
            {healthIssue.document_url ? (
              <button 
                className="btn-download-document"
                onClick={() => handleDownloadDocument(healthIssue.document_url!, healthIssue.name)}
                title="Télécharger le document"
              >
                📄 Télécharger PDF
              </button>
            ) : (
              <span className="no-document">Aucun</span>
            )}
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