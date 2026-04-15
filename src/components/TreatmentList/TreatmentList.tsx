import React from 'react';
import type { Treatment } from '../../services/treatmentService';
import './TreatmentList.css';

interface TreatmentListProps {
  treatments: Treatment[];
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatment: Treatment) => void;
}

export const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  onEdit,
  onDelete
}) => {
  if (treatments.length === 0) {
    return (
      <div className="treatment-list-empty">
        <p>Aucun traitement enregistré</p>
      </div>
    );
  }

  const formatDate = (date: string | null): string => {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleDownloadDocument = (documentUrl: string, treatmentName: string) => {
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
        link.download = `traitement_${treatmentName.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(blobUrl);
      } else {
        link.href = documentUrl;
        link.download = `traitement_${treatmentName.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Impossible de télécharger le document');
    }
  };

  return (
    <div className="treatment-list">
      <div className="treatment-list-header">
        <div className="header-name">Nom du traitement</div>
        <div className="header-frequency">Fréquence</div>
        <div className="header-end-date">Date de fin</div>
        <div className="header-document">Document</div>
        <div className="header-actions">Actions</div>
      </div>

      {treatments.map((treatment) => (
        <div key={treatment.id} className="treatment-item">
          <div className="item-name">
            <strong>{treatment.treatment_name}</strong>
          </div>
          <div className="item-frequency">
            {treatment.frequency || 'Non spécifiée'}
          </div>
          <div className="item-end-date">
            {formatDate(treatment.end_date)}
          </div>
          <div className="item-document">
            {treatment.document_url ? (
              <button 
                className="btn-download-document"
                onClick={() => handleDownloadDocument(treatment.document_url!, treatment.treatment_name)}
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
              onClick={() => onEdit(treatment)}
              title="Modifier"
            >
              ✏️
            </button>
            <button 
              className="btn-delete"
              onClick={() => onDelete(treatment)}
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