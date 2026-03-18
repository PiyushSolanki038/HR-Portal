import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('siswit_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('siswit_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('siswit_user')
  }

  const setMustChangePassword = (val) => {
    const updatedUser = { ...user, mustChangePassword: val }
    setUser(updatedUser)
    localStorage.setItem('siswit_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setMustChangePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
