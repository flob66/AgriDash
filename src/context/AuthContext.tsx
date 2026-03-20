import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

interface AuthContextType {
  user: any | null
  session: any | null
  loading: boolean
  loginWithEmail: (email: string, password: string) => Promise<any>
  registerWithEmail: (email: string, password: string) => Promise<any>
  loginWithGoogle: () => Promise<any>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        const currentSession = await authService.getSession()
        setSession(currentSession)
        setUser(currentSession?.user || null)
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loginWithEmail = async (email: string, password: string) => {
    return await authService.loginWithEmail(email, password)
  }

  const registerWithEmail = async (email: string, password: string) => {
    return await authService.registerWithEmail(email, password)
  }

  const loginWithGoogle = async () => {
    return await authService.loginWithGoogle()
  }

  const logout = async () => {
    await authService.logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}