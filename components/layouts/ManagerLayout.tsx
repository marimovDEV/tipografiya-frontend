/**
 * Manager Layout
 * Production-focused layout for project managers
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    FileText,
    Activity,
    TrendingUp,
    AlertCircle,
    LogOut,
    CheckSquare,
    Users2
} from 'lucide-react'

interface ManagerLayoutProps {
    children: ReactNode
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Buyurtmalar', href: '/orders', icon: FileText },
        { name: 'Ishlab chiqarish', href: '/production', icon: Activity },
        { name: 'Mijozlar', href: '/clients', icon: Users },
        { name: 'Xodimlar', href: '/employees', icon: Users2 },
        { name: 'Vazifalar', href: '/tasks', icon: CheckSquare },
        { name: 'Hisobotlar', href: '/reports', icon: TrendingUp },
        { name: 'To\'siqlar', href: '/bottlenecks', icon: AlertCircle },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">PrintERP</h1>
                        <p className="text-sm text-muted-foreground">Ishlab Chiqarish Menejeri</p>
                    </div>

                    <nav className="flex gap-4">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm
                    ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                        
                        <div className="w-px h-6 bg-border mx-2 self-center hidden sm:block"></div>
                        
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm text-red-500 hover:bg-red-500/10 font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Chiqish</span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    )
}
