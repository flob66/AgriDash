export const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPassword(password: string): boolean {
    if (password.length < 6) return false
    if (!/\d/.test(password)) return false
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
    return true
  },

  getPasswordErrorMessage(): string {
    return 'Le mot de passe doit contenir au moins 6 caractères, 1 chiffre et 1 caractère spécial'
  },
}