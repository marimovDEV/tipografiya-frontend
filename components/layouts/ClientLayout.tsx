/**
 * Client Layout
 * Minimal, clean layout for client portal
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Plus, User, LogOut } from 'lucide-react'

interface ClientLayoutProps {
    children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    const navigation = [
        { name: 'Mening Buyurtmalarim', href: '/my-orders', icon: Package },
        { name: 'Yangi Buyurtma', href: '/new-order', icon: Plus },
        { name: 'Profil', href: '/profile', icon: User },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Clean Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">PrintERP</h1>
                        <p className="text-sm text-muted-foreground">Mijoz Portali</p>
                    </div>

                    <nav className="flex gap-4">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                    ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden md:inline">{item.name}</span>
                                </Link>
                            )
                        })}
                        
                        <div className="w-px h-6 bg-border mx-2 hidden md:block self-center"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-red-500 hover:bg-red-500/10 font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Chiqish</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-5xl p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t bg-card">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>© 2026 PrintERP. Barcha huquqlar himoyalangan.</p>
                </div>
            </footer>
        </div>
    )
}
