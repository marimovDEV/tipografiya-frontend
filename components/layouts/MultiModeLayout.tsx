/**
 * Multi-Mode Layout Component
 * Renders different layouts based on user mode
 */

'use client'

import { ReactNode } from 'react'
import { useUserMode } from '@/hooks/useUserMode'
import { getThemeClass } from '@/lib/mode-config'

// Import mode-specific layouts
import AdminLayout from './AdminLayout'
import ManagerLayout from './ManagerLayout'
import WorkerLayout from './WorkerLayout'
import ClientLayout from './ClientLayout'

interface MultiModeLayoutProps {
    children: ReactNode
}

export default function MultiModeLayout({ children }: MultiModeLayoutProps) {
    const { mode, loading } = useUserMode()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
                </div>
            </div>
        )
    }

    // Apply theme class to body
    if (typeof document !== 'undefined') {
        document.body.className = getThemeClass(mode)
    }

    // Render mode-specific layout
    switch (mode) {
        case 'admin':
            return <AdminLayout>{children}</AdminLayout>

        case 'manager':
            return <ManagerLayout>{children}</ManagerLayout>

        case 'worker':
            return <WorkerLayout>{children}</WorkerLayout>

        case 'client':
            return <ClientLayout>{children}</ClientLayout>

        default:
            return <div>Unknown mode: {mode}</div>
    }
}
