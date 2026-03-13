import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Dashboard.css'

export function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>AgriDash</h1>
        <button onClick={handleLogout} className="logout-button">
          Déconnexion
        </button>
      </nav>
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Bienvenue sur votre tableau de bord</h2>
          <p>Connecté en tant que : {user?.email}</p>
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