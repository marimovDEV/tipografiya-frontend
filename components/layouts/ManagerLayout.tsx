/**
 * Manager Layout
 * Production-focused vertical sidebar layout for project managers
 * Matches the premium Industrial Dark theme of the Admin panel
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
    LogOut,
    CheckSquare,
    Users2,
    Clock,
    ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

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
        { name: 'Analitika', href: '/reports', icon: TrendingUp },
    ]

    return (
        <div className="min-h-screen bg-slate-950 flex flex-row font-sans">
            {/* Professional Manager Sidebar - DARK */}
            <aside className="w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500 font-black shadow-inner border border-blue-500/30">M</div>
                        <h1 className="text-xl font-black tracking-tight text-white italic">PrintERP</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Production Node</p>
                        <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-1.5 py-0 text-[8px] font-black uppercase">Manager</Badge>
                    </div>
                </div>

                <div className="px-4 py-8 flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-black text-[11px] uppercase tracking-tight group relative
                                    ${isActive
                                        ? 'bg-blue-600/20 text-blue-400 translate-x-1 shadow-lg shadow-blue-600/10'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5 hover:translate-x-1'
                                    }
                                `}
                            >
                                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]" />}
                                <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-600 group-hover:text-white'}`} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                <div className="p-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Node Status • Active</span>
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
            <div className="flex-1 ml-64 min-w-[1000px] flex flex-col bg-[#0f172a]">
                {/* Global Top Bar - DARK */}
                <header className="h-14 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{format(new Date(), "EEEE, d-MMMM")}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-right">
                            <div className="hidden sm:block">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter leading-none">Access Mode</p>
                                <p className="text-xs font-black text-white">Production Manager</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center ml-2">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
