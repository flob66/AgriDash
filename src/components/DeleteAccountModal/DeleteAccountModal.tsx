import { useState } from 'react'
import { authService } from '../../services/authService'
import './DeleteAccountModal.css'

interface DeleteAccountModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteAccountModal({ onClose, onSuccess }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await authService.deleteUser(password)
      
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Erreur lors de la suppression du compte')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Supprimer définitivement mon compte</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="warning-message">
            ⚠️ Attention : Cette action est irréversible !
          </div>
          
          <p className="info-text">
            Vous êtes sur le point de supprimer définitivement votre compte ainsi que toutes vos données associées.
            Veuillez confirmer en saisissant votre mot de passe.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Saisissez votre mot de passe"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="confirm-btn"
                disabled={loading}
              >
                {loading ? 'Suppression en cours...' : 'Confirmer la suppression'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}