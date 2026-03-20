import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '../../components/AuthForm/AuthForm'
import { useAuth } from '../../hooks/useAuth'
import './Register.css'

export function Register() {
  const navigate = useNavigate()
  const { registerWithEmail, loginWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailRegister = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const { error } = await registerWithEmail(email, password)

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Email déjà utilisé')
      } else {
        setError("Erreur lors de l'inscription")
      }
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
    <div className="register-page">
      <div className="register-container">
        <div className="register-brand">
          <div className="register-logo">🌾</div>
          <h1 className="register-title">AgriDash</h1>
          <p className="register-subtitle">Rejoignez la communauté des jeunes agriculteurs</p>
        </div>
        <AuthForm
          mode="register"
          onSubmit={handleEmailRegister}
          onGoogleLogin={handleGoogleLogin}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}