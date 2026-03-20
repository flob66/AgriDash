import { supabase } from './supabaseClient'

export const authService = {
  async registerWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    return { data, error }
  },

  async loginWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  onAuthStateChange(callback: (user: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
    return { data: { subscription } }
  },

  async deleteUser(password: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        return { 
          success: false, 
          error: 'Utilisateur non authentifié' 
        }
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      })

      if (signInError) {
        return { 
          success: false, 
          error: 'Mot de passe incorrect' 
        }
      }

      const { data, error: functionError } = await supabase.rpc('delete_user')

      if (functionError) {
        return { 
          success: false, 
          error: functionError.message 
        }
      }

      if (!data?.success) {
        return { 
          success: false, 
          error: data?.error || 'Erreur lors de la suppression' 
        }
      }

      await supabase.auth.signOut()

      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue' 
      }
    }
  },
}