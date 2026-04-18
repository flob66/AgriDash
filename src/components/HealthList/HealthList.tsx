import { useNavigate } from 'react-router-dom';
import type { HealthIssueWithAnimal } from '../../services/healthHistoryService';
import './HealthList.css';

interface HealthListProps {
  issues: HealthIssueWithAnimal[];
}

export function HealthList({ issues }: HealthListProps) {
  const navigate = useNavigate();

  if (issues.length === 0) {
    return (
      <div className="list-empty">
        <p>Aucun problème de santé trouvé.</p>
      </div>
    );
  }

  return (
    <div className="health-list">
      <table className="health-table">
        <thead>
          <tr>
            <th>Nom du problème</th>
            <th>Symptômes</th>
            <th>Date</th>
            <th>Durée</th>
            <th>Traitement</th>
            <th>Animal</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr 
              key={issue.id} 
              onClick={() => navigate(`/animals/${issue.animal_id}`)}
              className="clickable-row"
            >
              <td data-label="Nom du problème">{issue.name}</td>
              <td data-label="Symptômes">{issue.symptoms || '-'}</td>
              <td data-label="Date">{new Date(issue.date).toLocaleDateString()}</td>
              <td data-label="Durée">{issue.duration || '-'}</td>
              <td data-label="Traitement">{issue.treatment || '-'}</td>
              <td data-label="Animal">{issue.animal_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}