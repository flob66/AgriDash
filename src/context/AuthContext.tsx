import React, { createContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

interface AuthContextType {
  user: any | null
  loading: boolean
  loginWithEmail: (email: string, password: string) => Promise<any>
  registerWithEmail: (email: string, password: string) => Promise<any>
  loginWithGoogle: () => Promise<any>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    initialize()

    const subscription = authService.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => {
      subscription.data.subscription.unsubscribe()
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