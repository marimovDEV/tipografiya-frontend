"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole =
  | "admin"
  | "project_manager"
  | "warehouse"
  | "cutter"
  | "printer"
  | "finishing"
  | "qc"
  | "accountant"
  | "sales_manager"
  | "production_manager"
  | "warehouse_manager"
  | "operator_print"
  | "operator_cutting"
  | "operator_packing"
  | "quality_controller"
  | "finance_manager"
  | "shop_floor_supervisor"
  | "customer_service"

interface RoleContextType {
  currentRole: UserRole
  user: any | null
  token: string | null
  setCurrentRole: (role: UserRole) => void
  login: (token: string, user: any) => void
  logout: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("admin")
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setCurrentRole(parsedUser.role)
    }
  }, [])

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    setCurrentRole(newUser.role)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    setCurrentRole("admin") // Fallback
  }

  return (
    <RoleContext.Provider value={{ currentRole, user, token, setCurrentRole, login, logout }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within RoleProvider")
  }
  return context
}
