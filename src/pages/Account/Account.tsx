import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabaseClient'
import DeleteAccountModal from '../../components/DeleteAccountModal/DeleteAccountModal'
import './Account.css'
import { Header } from '../../components/Header/Header'

interface UserProfile {
  email: string
  created_at: string
  full_name?: string
}

export function Account() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadProfile()
  }, [user, navigate])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    navigate('/register', { state: { message: 'Compte supprimé avec succès' } })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="account-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div className="account-container">
        <div className="account-card">
          <div className="account-header">
            <div className="account-avatar">👤</div>
            <h1 className="account-title">Mon compte</h1>
            <p className="account-subtitle">Gérez vos informations personnelles</p>
          </div>
          
          <div className="account-info">
            <div className="info-group">
              <div className="info-icon">📧</div>
              <div className="info-content">
                <label>Adresse email</label>
                <p>{user?.email}</p>
              </div>
            </div>
            
            <div className="info-group">
              <div className="info-icon">👨‍🌾</div>
              <div className="info-content">
                <label>Nom complet</label>
                <p>{profile?.full_name || 'Non renseigné'}</p>
              </div>
            </div>
            
            <div className="info-group">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <label>Membre depuis</label>
                <p>{profile?.created_at ? formatDate(profile.created_at) : 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          <div className="account-actions">
            <button 
              className="delete-account-btn"
              onClick={handleDeleteAccount}
            >
              <span className="btn-icon">🗑️</span>
              Supprimer définitivement mon compte
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  )
}