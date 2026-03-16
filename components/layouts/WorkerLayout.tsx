/**
 * Worker Layout
 * Professional desktop-optimized layout for production workers
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
    CheckSquare, 
    User, 
    LogOut, 
    LayoutDashboard, 
    Briefcase,
    Zap,
    ShieldCheck,
    Clock,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'

interface WorkerLayoutProps {
    children: ReactNode
}

export default function WorkerLayout({ children }: WorkerLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/auth/login')
    }

    const navigation = [
        { name: 'Boshqaruv', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Mening vazifalarim', href: '/tasks', icon: CheckSquare },
        { name: 'Profil', href: '/profile', icon: User },
    ]

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans overflow-x-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Desktop Professional Sidebar - DARK */}
            <aside 
                className={`
                    w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl
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
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Ishchi Boshqaruvi</p>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0 text-[8px] font-black uppercase">v1.2</Badge>
                    </div>
                </div>

                <div className="px-4 py-8 flex-1 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-tight group relative
                                    ${isActive
                                        ? 'bg-primary/10 text-primary translate-x-1 border border-primary/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5 hover:translate-x-1'
                                    }
                                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
                                <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-primary' : 'text-slate-600 group-hover:text-white'}`} />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* Sidebar Bottom Extras */}
                <div className="p-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{format(new Date(), "HH:mm")} • Barqaror</span>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all font-black text-[10px] uppercase tracking-widest group border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut className="w-4 h-4 transition-colors group-hover:text-rose-400" />
                        <span>Tizimdan chiqish</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
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
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{format(new Date(), "EEEE, d-MMMM", { locale: uz })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-none">Holat</p>
                                <p className="text-xs font-black text-white italic">Operator Paneli</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
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
