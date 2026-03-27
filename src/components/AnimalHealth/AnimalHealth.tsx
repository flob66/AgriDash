import { useState } from 'react';
import './AnimalHealth.css';

interface Vaccination {
  id: string;
  vaccine_name: string;
  date: string;
  next_due_date: string;
  notes: string;
}

interface Treatment {
  id: string;
  treatment_name: string;
  date: string;
  dosage: string;
  notes: string;
}

interface HealthIssue {
  id: string;
  issue_type: string;
  diagnosis: string;
  date: string;
  status: string;
  treatment: string;
  notes: string;
}

interface AnimalHealthProps {
  healthHistory: {
    vaccinations: Vaccination[];
    treatments: Treatment[];
    healthIssues: HealthIssue[];
  };
}

export function AnimalHealth({ healthHistory }: AnimalHealthProps) {
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'treatments' | 'issues'>('vaccinations');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="status-badge active">En cours</span>;
      case 'resolved':
        return <span className="status-badge resolved">Résolu</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const hasAnyData = () => {
    return healthHistory.vaccinations.length > 0 ||
           healthHistory.treatments.length > 0 ||
           healthHistory.healthIssues.length > 0;
  };

  if (!hasAnyData()) {
    return (
      <div className="animal-health-card">
        <div className="animal-health-header">
          <div className="health-title">
            <span className="title-icon">🏥</span>
            <h2>Historique sanitaire</h2>
          </div>
        </div>
        <div className="no-health-data">
          <div className="no-data-icon">💊</div>
          <p>Aucun évènement de santé</p>
          <span>Ajoutez des informations médicales pour suivre la santé de votre animal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animal-health-card">
      <div className="animal-health-header">
        <div className="health-title">
          <span className="title-icon">🏥</span>
          <h2>Historique sanitaire</h2>
        </div>
      </div>

      <div className="health-tabs">
        <button
          className={`tab-btn ${activeTab === 'vaccinations' ? 'active' : ''}`}
          onClick={() => setActiveTab('vaccinations')}
        >
          Vaccinations ({healthHistory.vaccinations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'treatments' ? 'active' : ''}`}
          onClick={() => setActiveTab('treatments')}
        >
          Traitements ({healthHistory.treatments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          Problèmes de santé ({healthHistory.healthIssues.length})
        </button>
      </div>

      <div className="health-content">
        {activeTab === 'vaccinations' && (
          <div className="health-list">
            {healthHistory.vaccinations.length === 0 ? (
              <div className="empty-list">Aucune vaccination enregistrée</div>
            ) : (
              healthHistory.vaccinations.map((vaccination) => (
                <div key={vaccination.id} className="health-item">
                  <div className="health-item-header">
                    <h3>{vaccination.vaccine_name}</h3>
                    <span className="health-date">{formatDate(vaccination.date)}</span>
                  </div>
                  {vaccination.next_due_date && (
                    <div className="health-detail">
                      <span className="detail-label">Prochain rappel :</span>
                      <span>{formatDate(vaccination.next_due_date)}</span>
                    </div>
                  )}
                  {vaccination.notes && (
                    <div className="health-detail">
                      <span className="detail-label">Notes :</span>
                      <span>{vaccination.notes}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="health-list">
            {healthHistory.treatments.length === 0 ? (
              <div className="empty-list">Aucun traitement enregistré</div>
            ) : (
              healthHistory.treatments.map((treatment) => (
                <div key={treatment.id} className="health-item">
                  <div className="health-item-header">
                    <h3>{treatment.treatment_name}</h3>
                    <span className="health-date">{formatDate(treatment.date)}</span>
                  </div>
                  {treatment.dosage && (
                    <div className="health-detail">
                      <span className="detail-label">Dosage :</span>
                      <span>{treatment.dosage}</span>
                    </div>
                  )}
                  {treatment.notes && (
                    <div className="health-detail">
                      <span className="detail-label">Notes :</span>
                      <span>{treatment.notes}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="health-list">
            {healthHistory.healthIssues.length === 0 ? (
              <div className="empty-list">Aucun problème de santé enregistré</div>
            ) : (
              healthHistory.healthIssues.map((issue) => (
                <div key={issue.id} className="health-item">
                  <div className="health-item-header">
                    <div className="issue-header">
                      <h3>{issue.issue_type}</h3>
                      {getStatusBadge(issue.status)}
                    </div>
                    <span className="health-date">{formatDate(issue.date)}</span>
                  </div>
                  <div className="health-detail">
                    <span className="detail-label">Diagnostic :</span>
                    <span>{issue.diagnosis}</span>
                  </div>
                  {issue.treatment && (
                    <div className="health-detail">
                      <span className="detail-label">Traitement :</span>
                      <span>{issue.treatment}</span>
                    </div>
                  )}
                  {issue.notes && (
                    <div className="health-detail">
                      <span className="detail-label">Notes :</span>
                      <span>{issue.notes}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}