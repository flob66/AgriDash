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

  const getUserInitial = () => {
    if (!user?.email) return '👤'
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/dashboard" className="header-logo">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">AgriDash</span>
        </Link>
        
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">
            Tableau de bord
          </Link>
          <Link to="/animals" className="nav-link">
            Mes animaux
          </Link>
          <Link to="/account" className="nav-link">
            Mon compte
          </Link>
        </nav>

        <div className="header-user">
          <div className="user-info">
            <div className="user-avatar">
              {getUserInitial()}
            </div>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  )
}