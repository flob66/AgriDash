import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="header-logo">
          <h1>AgriDash</h1>
        </Link>
        
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">
            Tableau de bord
          </Link>
          <Link to="/account" className="nav-link">
            Mon compte
          </Link>
        </nav>

        <div className="header-user">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}