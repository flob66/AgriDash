import { useNavigate } from 'react-router-dom';
import type { HealthIssueWithAnimal } from '../../services/healthHistoryService';
import './HealthGallery.css';

interface HealthGalleryProps {
  issues: HealthIssueWithAnimal[];
}

export function HealthGallery({ issues }: HealthGalleryProps) {
  const navigate = useNavigate();
  const issuesWithPhotos = issues.filter(issue => issue.photo_url);

  if (issuesWithPhotos.length === 0) {
    return (
      <div className="gallery-empty">
        <p>Aucun problème de santé avec photos trouvé.</p>
      </div>
    );
  }

  return (
    <div className="health-gallery">
      <div className="gallery-grid">
        {issuesWithPhotos.map((issue) => (
          <div
            key={issue.id}
            className="gallery-card"
            onClick={() => navigate(`/animals/${issue.animal_id}`)}
          >
            <div className="gallery-card-image">
              <img src={issue.photo_url!} alt={issue.name} />
            </div>
            <div className="gallery-card-info">
              <h3>{issue.name}</h3>
              <p className="animal-name">{issue.animal_name}</p>
              <p className="issue-date">{new Date(issue.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}