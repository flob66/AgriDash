import { Header } from '../../components/Header/Header'
import './Dashboard.css'

export function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Bienvenue sur votre tableau de bord</h2>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Mes animaux</h3>
            <p>Gérez votre cheptel</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Tâches</h3>
            <p>Organisez votre travail</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Calendrier</h3>
            <p>Planifiez vos activités</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Rapports</h3>
            <p>Analysez vos données</p>
          </div>
        </div>
      </main>
    </div>
  )
}