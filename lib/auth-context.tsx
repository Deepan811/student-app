"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  status?: string
  profilePicture?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (userData: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem("auth_token", authToken)
    localStorage.setItem("auth_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, token: null, login, logout, isLoading: true }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
