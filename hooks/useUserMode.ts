/**
 * useUserMode Hook
 * Manages user mode state and provides mode-aware utilities
 */

'use client'

import { useEffect, useState } from 'react'
import { UserMode, getUserMode, getModeConfig, hasFeatureAccess } from '@/lib/mode-config'
import type { User } from '@/lib/types'

export function useUserMode() {
    const [user, setUser] = useState<User | null>(null)
    const [mode, setMode] = useState<UserMode>('worker')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const userData: User = JSON.parse(storedUser)
                const userMode = getUserMode(userData.role)

                // Add mode to user object
                userData.mode = userMode

                setUser(userData)
                setMode(userMode)
            } catch (error) {
                console.error('Failed to parse user data:', error)
            }
        }
        setLoading(false)
    }, [])

    const config = getModeConfig(mode)

    return {
        user,
        mode,
        config,
        loading,
        isAdmin: mode === 'admin',
        isManager: mode === 'manager',
        isWorker: mode === 'worker',
        isClient: mode === 'client',
        hasFeature: (feature: string) => hasFeatureAccess(mode, feature),
        isTouchOptimized: config.touchOptimized || false,
        isSimplified: config.simplifiedUI || false
    }
}
