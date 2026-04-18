import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '../../components/Header/Header';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabaseClient';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [animalCount, setAnimalCount] = useState(0);
  const [healthIssueCount, setHealthIssueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const userName = user?.email?.split('@')[0] || "Utilisateur";

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      try {
        const { count: animalCount, error: animalError } = await supabase
          .from('animals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (animalError) throw animalError;
        setAnimalCount(animalCount || 0);

        const { data: animals } = await supabase
          .from('animals')
          .select('id')
          .eq('user_id', user.id);

        if (animals && animals.length > 0) {
          const animalIds = animals.map(a => a.id);
          const { count: healthCount, error: healthError } = await supabase
            .from('health_issues')
            .select('*', { count: 'exact', head: true })
            .in('animal_id', animalIds);

          if (!healthError) {
            setHealthIssueCount(healthCount || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
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
      title: "Santé",
      description: "Historique des problèmes de santé",
      icon: "🏥",
      color: "card-primary",
      link: "/health-history",
      buttonText: "Voir l'historique santé"
    },
    {
      id: 3,
      title: "Tâches",
      description: "Organisez votre travail",
      icon: "✅",
      color: "card-warning",
      link: null,
      buttonText: "Bientôt disponible",
      disabled: true
    },
    {
      id: 4,
      title: "Calendrier",
      description: "Planifiez vos activités",
      icon: "📅",
      color: "card-info",
      link: null,
      buttonText: "Bientôt disponible",
      disabled: true
    },
    {
      id: 5,
      title: "Rapports",
      description: "Analysez vos données",
      icon: "📊",
      color: "card-secondary",
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
            <div className="stat-value">
              {loading ? '...' : healthIssueCount}
            </div>
            <div className="stat-label">Problèmes de santé</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Tâches en cours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Événements</div>
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
  )
}