"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MultiModeLayout from "@/components/layouts/MultiModeLayout"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for both legacy token and potential user data
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token && !user) {
      router.push("/auth/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-50">Yuklanmoqda...</div>
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return <MultiModeLayout>{children}</MultiModeLayout>
}
