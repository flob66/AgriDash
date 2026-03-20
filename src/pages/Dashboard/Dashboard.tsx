import { Header } from '../../components/Header/Header'
import './Dashboard.css'

export function Dashboard() {
  const userName = "Jean" // À remplacer par le nom de l'utilisateur connecté
  
  const dashboardCards = [
    {
      id: 1,
      title: "Mes animaux",
      description: "Gérez votre cheptel",
      icon: "🐄",
      color: "card-success"
    },
    {
      id: 2,
      title: "Tâches",
      description: "Organisez votre travail",
      icon: "✅",
      color: "card-warning"
    },
    {
      id: 3,
      title: "Calendrier",
      description: "Planifiez vos activités",
      icon: "📅",
      color: "card-primary"
    },
    {
      id: 4,
      title: "Rapports",
      description: "Analysez vos données",
      icon: "📊",
      color: "card-info"
    }
  ]

  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <div className="welcome-icon">🌾</div>
          <div className="welcome-text">
            <h2>Bonjour {userName} 👋</h2>
            <p>Bienvenue sur votre tableau de bord AgriDash</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Animaux</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Tâches en cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Événements</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Rapports</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {dashboardCards.map((card) => (
            <div key={card.id} className={`dashboard-card ${card.color}`}>
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}