import React from 'react';
import type { Vaccination } from '../../services/vaccinationService';
import './VaccinationList.css';

interface VaccinationListProps {
  vaccinations: Vaccination[];
  onEdit: (vaccination: Vaccination) => void;
  onDelete: (vaccination: Vaccination) => void;
}

export const VaccinationList: React.FC<VaccinationListProps> = ({
  vaccinations,
  onEdit,
  onDelete
}) => {
  if (vaccinations.length === 0) {
    return (
      <div className="vaccination-list-empty">
        <p>Aucune vaccination enregistrée</p>
      </div>
    );
  }

  const formatDate = (date: string | null): string => {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleDownloadDocument = (documentUrl: string, vaccineName: string) => {
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
        link.download = `vaccin_${vaccineName.replace(/\s/g, '_')}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);
      } else {

        link.href = documentUrl;
        link.download = `vaccin_${vaccineName.replace(/\s/g, '_')}.pdf`;
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
    <div className="vaccination-list">
      <div className="vaccination-list-header">
        <div className="header-name">Nom du vaccin</div>
        <div className="header-last-date">Dernier vaccin</div>
        <div className="header-next-date">Prochain vaccin</div>
        <div className="header-document">Certificat</div>
        <div className="header-actions">Actions</div>
      </div>

      {vaccinations.map((vaccination) => (
        <div key={vaccination.id} className="vaccination-item">
          <div className="item-name">
            <strong>{vaccination.vaccine_name}</strong>
          </div>
          <div className="item-last-date">
            {formatDate(vaccination.last_vaccine_date)}
          </div>
          <div className="item-next-date">
            {formatDate(vaccination.next_vaccine_date)}
          </div>
          <div className="item-document">
            {vaccination.document_url ? (
              <button 
                className="btn-download-document"
                onClick={() => handleDownloadDocument(vaccination.document_url!, vaccination.vaccine_name)}
                title="Télécharger le certificat"
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
              onClick={() => onEdit(vaccination)}
              title="Modifier"
            >
              ✏️
            </button>
            <button 
              className="btn-delete"
              onClick={() => onDelete(vaccination)}
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