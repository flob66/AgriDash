import React, { useState } from 'react'
import { validators } from '../../utils/validators'
import './AuthForm.css'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<void>
  onGoogleLogin: () => Promise<void>
  error: string | null
  loading: boolean
}

export function AuthForm({ mode, onSubmit, onGoogleLogin, error, loading }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!validators.isValidEmail(email)) {
      setLocalError('Email invalide')
      return
    }

    if (!validators.isValidPassword(password)) {
      setLocalError(validators.getPasswordErrorMessage())
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas')
      return
    }

    await onSubmit(email, password)
  }

  const getTitle = () => {
    return mode === 'login' ? 'Connexion' : 'Inscription'
  }

  const getButtonText = () => {
    return mode === 'login' ? 'Se connecter' : "S'inscrire"
  }

  return (
    <div className="auth-form-container">
      <div className="auth-card">
        <h2 className="auth-title">{getTitle()}</h2>
        
        {(error || localError) && (
          <div className="auth-error">{error || localError}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Adresse email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="form-input"
              placeholder="jean.dupont@example.fr"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="submit-button"
          >
            {loading ? (
              <span className="button-loading">Chargement...</span>
            ) : (
              getButtonText()
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>Ou continuer avec</span>
        </div>

        <button
          onClick={onGoogleLogin}
          disabled={loading}
          className="google-button"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>
              Pas encore de compte ?{' '}
              <a href="/register" className="auth-link">Créer un compte</a>
            </p>
          ) : (
            <p>
              Déjà un compte ?{' '}
              <a href="/login" className="auth-link">Se connecter</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}