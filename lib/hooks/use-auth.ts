"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types/auth"

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Fetch user profile with role
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*, role:roles(*)")
        .eq("id", authUser.id)
        .single()

      if (error) throw error
      setUser(profile as UserProfile)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load user"))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadUser()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChanged(() => {
      loadUser()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [loadUser, supabase])

  return { user, loading, error }
}
