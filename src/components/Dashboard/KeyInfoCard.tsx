import './KeyInfoCard.css';

interface KeyInfoCardProps {
  title: string;
  children: React.ReactNode;
  emptyMessage?: string;
}

export function KeyInfoCard({ title, children, emptyMessage }: KeyInfoCardProps) {
  const hasData = Array.isArray(children) ? children.length > 0 : children !== null && children !== undefined;

  return (
    <div className="key-info-card">
      <div className="card-header">
        <h4>{title}</h4>
      </div>
      <div className="card-content">
        {hasData ? children : <p className="empty-message">{emptyMessage || 'Aucune donnée'}</p>}
      </div>
    </div>
  );
}