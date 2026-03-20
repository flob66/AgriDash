import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../pages/Login/Login'
import { Register } from '../pages/Register/Register'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { Account } from '../pages/Account/Account'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

export function AppRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Chargement...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}