import React, { useState, useEffect } from 'react';
import { vaccinationService, type Vaccination } from '../../services/vaccinationService';
import { treatmentService, type Treatment } from '../../services/treatmentService';
import { healthIssueService, type HealthIssue } from '../../services/healthIssueService';
import './AnimalHealthHistory.css';

interface AnimalHealthHistoryProps {
  animalId: string;
}

export const AnimalHealthHistory: React.FC<AnimalHealthHistoryProps> = ({ animalId }) => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'treatments' | 'health-issues'>('vaccinations');

  useEffect(() => {
    loadHealthData();
  }, [animalId]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const [vaccinationsData, treatmentsData, healthIssuesData] = await Promise.all([
        vaccinationService.getVaccinationsByAnimal(animalId),
        treatmentService.getTreatmentsByAnimal(animalId),
        healthIssueService.getHealthIssuesByAnimal(animalId)
      ]);
      setVaccinations(vaccinationsData);
      setTreatments(treatmentsData);
      setHealthIssues(healthIssuesData);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null): string => {
    if (!date) return 'Non renseignée';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const hasAnyData = vaccinations.length > 0 || treatments.length > 0 || healthIssues.length > 0;

  if (loading) {
    return (
      <div className="animal-health-history">
        <h3>Historique sanitaire</h3>
        <div className="health-loading">Chargement de l'historique...</div>
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="animal-health-history">
        <h3>Historique sanitaire</h3>
        <div className="health-empty">
          <span className="empty-icon">🏥</span>
          <p>Aucun évènement de santé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animal-health-history">
      <h3>Historique sanitaire</h3>

      <div className="health-tabs">
        <button
          className={`health-tab ${activeTab === 'vaccinations' ? 'active' : ''}`}
          onClick={() => setActiveTab('vaccinations')}
        >
          💉 Vaccinations ({vaccinations.length})
        </button>
        <button
          className={`health-tab ${activeTab === 'treatments' ? 'active' : ''}`}
          onClick={() => setActiveTab('treatments')}
        >
          💊 Traitements ({treatments.length})
        </button>
        <button
          className={`health-tab ${activeTab === 'health-issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('health-issues')}
        >
          🏥 Problèmes de santé ({healthIssues.length})
        </button>
      </div>

      <div className="health-content">
        {activeTab === 'vaccinations' && (
          <div className="health-section">
            {vaccinations.length === 0 ? (
              <div className="section-empty">Aucune vaccination enregistrée</div>
            ) : (
              <div className="health-list">
                {vaccinations.map((vaccination) => (
                  <div key={vaccination.id} className="health-card">
                    <div className="health-card-header">
                      <strong>{vaccination.vaccine_name}</strong>
                    </div>
                    <div className="health-card-details">
                      <div className="detail-row">
                        <span className="detail-label">Dernier vaccin:</span>
                        <span className="detail-value">{formatDate(vaccination.last_vaccine_date)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Prochain vaccin:</span>
                        <span className="detail-value">{formatDate(vaccination.next_vaccine_date)}</span>
                      </div>
                      {vaccination.document_url && (
                        <div className="detail-row">
                          <span className="detail-label">Certificat:</span>
                          <a href={vaccination.document_url} target="_blank" rel="noopener noreferrer" className="document-link">
                            📄 Télécharger
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="health-section">
            {treatments.length === 0 ? (
              <div className="section-empty">Aucun traitement enregistré</div>
            ) : (
              <div className="health-list">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="health-card">
                    <div className="health-card-header">
                      <strong>{treatment.treatment_name}</strong>
                    </div>
                    <div className="health-card-details">
                      {treatment.frequency && (
                        <div className="detail-row">
                          <span className="detail-label">Fréquence:</span>
                          <span className="detail-value">{treatment.frequency}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Date début:</span>
                        <span className="detail-value">{formatDate(treatment.created_at)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Date fin:</span>
                        <span className="detail-value">{formatDate(treatment.end_date)}</span>
                      </div>
                      {treatment.document_url && (
                        <div className="detail-row">
                          <span className="detail-label">Document:</span>
                          <a href={treatment.document_url} target="_blank" rel="noopener noreferrer" className="document-link">
                            📄 Télécharger
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'health-issues' && (
          <div className="health-section">
            {healthIssues.length === 0 ? (
              <div className="section-empty">Aucun problème de santé enregistré</div>
            ) : (
              <div className="health-list">
                {healthIssues.map((issue) => (
                  <div key={issue.id} className="health-card">
                    <div className="health-card-header">
                      <strong>{issue.name}</strong>
                    </div>
                    <div className="health-card-details">
                      {issue.symptoms && (
                        <div className="detail-row">
                          <span className="detail-label">Symptômes:</span>
                          <span className="detail-value">{issue.symptoms}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Date apparition:</span>
                        <span className="detail-value">{formatDate(issue.date)}</span>
                      </div>
                      {issue.duration && (
                        <div className="detail-row">
                          <span className="detail-label">Durée:</span>
                          <span className="detail-value">{issue.duration}</span>
                        </div>
                      )}
                      {issue.treatment && (
                        <div className="detail-row">
                          <span className="detail-label">Traitement:</span>
                          <span className="detail-value">{issue.treatment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};