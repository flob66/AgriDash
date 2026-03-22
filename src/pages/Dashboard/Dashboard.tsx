import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '../../components/Header/Header';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseClient';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [animalCount, setAnimalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const userName = user?.email?.split('@')[0] || "Utilisateur";
  
  useEffect(() => {
    const fetchAnimalCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('animals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (error) throw error;
        setAnimalCount(count || 0);
      } catch (err) {
        console.error('Erreur lors du comptage des animaux:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimalCount();
  }, [user]);
  
  const dashboardCards = [
    {
      id: 1,
      title: "Mes animaux",
      description: "Gérez votre cheptel",
      icon: "🐄",
      color: "card-success",
      link: "/animals",
      buttonText: "Voir mes animaux"
    },
    {
      id: 2,
      title: "Tâches",
      description: "Organisez votre travail",
      icon: "✅",
      color: "card-warning",
      link: null,
      buttonText: "Bientôt disponible",
      disabled: true
    },
    {
      id: 3,
      title: "Calendrier",
      description: "Planifiez vos activités",
      icon: "📅",
      color: "card-primary",
      link: null,
      buttonText: "Bientôt disponible",
      disabled: true
    },
    {
      id: 4,
      title: "Rapports",
      description: "Analysez vos données",
      icon: "📊",
      color: "card-info",
      link: null,
      buttonText: "Bientôt disponible",
      disabled: true
    }
  ];

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
            <div className="stat-value">
              {loading ? '...' : animalCount}
            </div>
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
              {card.link ? (
                <Link to={card.link} className="card-button">
                  {card.buttonText}
                </Link>
              ) : (
                <button className="card-button disabled" disabled={card.disabled}>
                  {card.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}