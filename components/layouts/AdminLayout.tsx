/**
 * Admin Layout
 * Full-featured layout with professional styling
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Users,
    Activity,
    Package,
    DollarSign,
    TrendingUp,
    Users2,
    CheckSquare,
    Settings,
    Clock,
    LogOut,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface AdminLayoutProps {
    children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Buyurtmalar', href: '/orders', icon: FileText },
        { name: 'Mijozlar', href: '/clients', icon: Users },
        { name: 'Ishlab chiqarish', href: '/production', icon: Activity },
        { name: 'Omborxona', href: '/warehouse', icon: Package },
        { name: 'Moliya', href: '/moliya', icon: DollarSign },
        { name: '📊 Analitika & Hisobotlar', href: '/reports-dashboard', icon: TrendingUp },
        { name: 'Xodimlar', href: '/employees', icon: Users2 },
        { name: 'Vazifalar', href: '/tasks', icon: CheckSquare },
        { name: 'Sozlamalar', href: '/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-x-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Professional Admin Sidebar - DARK */}
            <aside 
                className={`
                    w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black shadow-inner border border-primary/30">P</div>
                        <h1 className="text-xl font-black tracking-tight text-white italic">PrintERP</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Enterprise Central</p>
                        <Badge className="bg-primary/20 text-primary border border-primary/30 px-1.5 py-0 text-[8px] font-black uppercase">v1.4</Badge>
                    </div>
                </div>

                <div className="px-4 py-6 flex-1 space-y-1 overflow-y-auto no-scrollbar font-sans">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-black text-[11px] uppercase tracking-tight group relative
                                    ${isActive
                                        ? 'bg-primary/20 text-primary translate-x-1 shadow-lg shadow-primary/10'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5 hover:translate-x-1'
                                    }
                                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-slate-600 group-hover:text-white'}`} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                <div className="p-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">System Cloud • Online</span>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-black text-[10px] uppercase tracking-widest group"
                    >
                        <LogOut className="w-4 h-4 transition-colors group-hover:text-rose-400" />
                        <span>Chiqish</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area - DARK */}
            <div className="flex-1 md:ml-64 flex flex-col w-full max-w-full overflow-x-hidden">
                {/* Global Top Bar - DARK */}
                <header className="h-16 md:h-14 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{format(new Date(), "EEEE, d-MMMM")}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter leading-none">Security</p>
                                <p className="text-xs font-black text-white">Administrator Access</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-10 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
