import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '../../components/AuthForm/AuthForm'
import { useAuth } from '../../hooks/useAuth'
import './Login.css'

export function Login() {
  const navigate = useNavigate()
  const { loginWithEmail, loginWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error } = await loginWithEmail(email, password)

    if (error) {
      setError('Identifiants incorrects')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await loginWithGoogle()

    if (error) {
      setError('Connexion Google échouée')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">🌾</div>
          <h1 className="login-title">AgriDash</h1>
          <p className="login-subtitle">Gérez votre exploitation agricole en toute simplicité</p>
        </div>
        <AuthForm
          mode="login"
          onSubmit={handleEmailLogin}
          onGoogleLogin={handleGoogleLogin}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}