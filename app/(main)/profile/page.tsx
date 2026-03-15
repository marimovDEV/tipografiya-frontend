"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Zap,
  User as UserIcon,
  Calendar,
  Briefcase,
  Layers,
  Settings,
  Shield,
  MapPin,
  Trophy,
  AlertTriangle
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { format } from "date-fns"
import { uz } from "date-fns/locale"
import { AttendanceCard } from "@/components/employees/AttendanceCard"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [activeTask, setActiveTask] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      // 1. User Info
      const userRes = await fetchWithAuth("/api/users/me/")
      if (!userRes.ok) throw new Error("Profil ma'lumotlarini yuklab bo'lmadi")
      const userData = await userRes.json()
      setUser(userData)

      // 2. Production Stats
      const statsRes = await fetchWithAuth("/api/users/production-stats/")
      if (statsRes.ok) setStats(await statsRes.json())

      // 3. Work History
      const historyRes = await fetchWithAuth("/api/users/work-history/")
      if (historyRes.ok) setHistory(await historyRes.json())

      // 4. Active Task
      const activeRes = await fetchWithAuth("/api/production/active/")
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveTask(activeData.length > 0 ? activeData[0] : null)
      }

      // 5. General Tasks (kept for compatibility)
      const tasksRes = await fetchWithAuth(`/api/users/${userData.id}/tasks/`)
      if (tasksRes.ok) setTasks(await tasksRes.json())
      
    } catch (error) {
      console.error("Fetch profile error:", error)
      toast.error("Ma'lumotlarni yuklab bo'lmadi")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskAction = async (taskId: string, action: 'start' | 'complete') => {
    try {
      const res = await fetchWithAuth(`/api/tasks/${taskId}/${action}_task/`, { method: "POST" })
      if (res.ok) {
        toast.success(action === 'start' ? "Vazifa boshlandi" : "Vazifa yakunlandi")
        fetchProfileData()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Aloqa xatosi")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
            <p className="text-sm font-black text-slate-500 tracking-[0.2em]">PROFIL YUKLANMOQDA...</p>
        </div>
      </div>
    )
  }

  if (!user) return <div className="p-10 text-center text-white">Foydalanuvchi ma'lumotlari topilmadi</div>

  const today = new Date().toDateString()
  const tasksToday = tasks.filter(t => new Date(t.created_at).toDateString() === today)
  const pendingTasks = tasksToday.filter(t => t.status === 'pending')
  const inProgressTasks = tasksToday.filter(t => t.status === 'in_progress')
  const completedToday = tasksToday.filter(t => t.status === 'completed').length

  return (
    <div className="min-w-[1000px] space-y-6 bg-slate-950 min-h-screen font-sans text-slate-100 p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                    PRODUCTION MONITOR <span className="text-primary">v2.0</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Ishchi boshqaruv va nazorat markazi</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(), "EEEE, d-MMMM", { locale: uz })}</span>
                <span className="text-sm font-black text-white font-mono">{format(new Date(), "HH:mm")}</span>
            </div>
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${user?.status === 'working' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-800/50 border-slate-700"}`}>
                <div className={`w-2 h-2 rounded-full ${user?.status === 'working' ? "bg-emerald-500 animate-ping" : "bg-slate-500"}`} />
                <span className={`text-[11px] font-black uppercase tracking-widest ${user?.status === 'working' ? "text-emerald-400" : "text-slate-500"}`}>
                    {user?.status === 'working' ? "Tizimda Aktiv" : "Offlayn"}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Info */}
        <div className="col-span-3 space-y-6">
            <Card className="border-none shadow-premium overflow-hidden bg-slate-900/40 border border-slate-800">
                <div className="h-32 bg-gradient-to-br from-indigo-600/20 via-primary/10 to-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className="h-24 w-24 rounded-[2rem] bg-slate-800 border-4 border-slate-950 flex items-center justify-center text-primary shadow-2xl overflow-hidden relative group">
                            <span className="text-3xl font-black uppercase tracking-tighter">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                        </div>
                    </div>
                </div>
                <CardContent className="pt-14 pb-6 px-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">
                            {user.first_name} {user.last_name}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-black border border-slate-700 text-[9px] bg-slate-800/50 text-slate-500 font-mono tracking-tighter">@{user.username}</Badge>
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[9px] uppercase px-2">{user.role}</Badge>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <Briefcase size={16} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Bo'lim / Smena</p>
                                <p className="text-xs font-bold text-slate-300">{user.department || "Printing"} / {user.shift || "09:00 - 18:00"}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Shield size={16} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Supervisor</p>
                                <p className="text-xs font-bold text-slate-300">{user.supervisor_name || "Asosiy Admin"}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Manzil Status</p>
                                <p className="text-xs font-bold text-slate-300">Zavod - B blok</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AttendanceCard onStatusChange={fetchProfileData} />

            <Card className="border-none shadow-premium bg-slate-900 text-white overflow-hidden relative border border-slate-800">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <TrendingUp className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[11px] font-black flex items-center gap-2 tracking-[0.2em] text-slate-500 uppercase">
                        Ish Unumdorligi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 tracking-widest">
                            <span>REJA (Today)</span>
                            <span className="text-primary">{tasksToday.length > 0 ? Math.round((completedToday / tasksToday.length) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-800">
                            <div 
                                className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-700" 
                                style={{ width: `${tasksToday.length > 0 ? (completedToday / tasksToday.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-3 bg-slate-800/20 rounded-xl border border-slate-800/50 text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">OAV</p>
                            <p className="text-lg font-black text-emerald-400">22 <span className="text-[10px] text-slate-600 uppercase">daq</span></p>
                        </div>
                        <div className="p-3 bg-slate-800/20 rounded-xl border border-slate-800/50 text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Star</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <p className="text-lg font-black text-white italic">4.9</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Main Feed */}
        <div className="col-span-9 space-y-6">
            {/* Production Statistics Bar */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <Layers size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">KUNLIK</p>
                            <p className="text-lg font-black text-white">{stats?.today?.produced || 0} <span className="text-[9px] text-slate-600">Dona</span></p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HAFTALIK</p>
                            <p className="text-lg font-black text-white">{stats?.weekly?.produced || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BRAK (OY)</p>
                            <p className="text-lg font-black text-rose-400">{stats?.monthly?.defects || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <Trophy size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">REYTINQ</p>
                            <p className="text-lg font-black text-white italic">{stats?.rating || "4.9"}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Task Section */}
            <Card className="border-none shadow-premium bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-white/5 border-b border-white/5 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                            <Zap size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight text-white uppercase italic">FAOL VAZIFA (LIVE)</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hozirgi vaqtda bajarilayotgan ishlab chiqarish bosqichi</CardDescription>
                        </div>
                    </div>
                    {activeTask && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                            SHU YERDASIZ
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-6">
                    {activeTask ? (
                        <div className="grid grid-cols-12 gap-6 items-center">
                            <div className="col-span-8 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Buyurtma No</p>
                                        <p className="text-xl font-black text-white font-mono">{activeTask.order_number}</p>
                                    </div>
                                    <div className="flex-1 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Ish Bosqichi</p>
                                        <p className="text-xl font-black text-primary uppercase">{activeTask.step_display}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BERILDI</p>
                                        <p className="text-lg font-black text-white">{activeTask.input_qty}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">TAYYOR</p>
                                        <p className="text-lg font-black text-emerald-400">{activeTask.produced_qty}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest">BRAK</p>
                                        <p className="text-lg font-black text-rose-400">{activeTask.defect_qty}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 pl-6 border-l border-slate-800 space-y-3">
                                <Button 
                                    className="w-full h-12 rounded-xl bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
                                    onClick={() => window.location.href='/dashboard/'}
                                >
                                    HISOBOT BERISH
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-slate-800 text-slate-400 font-black text-[11px] uppercase tracking-widest"
                                    onClick={() => window.location.href='/dashboard/'}
                                >
                                    BATAFSIL KO'RISH
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                                <AlertTriangle className="text-slate-600" />
                            </div>
                            <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest">Hozirda aktiv ishlab chiqarish vazifasi yo'q</p>
                            <Button 
                                variant="link" 
                                className="text-primary font-black text-[10px] uppercase mt-2"
                                onClick={() => window.location.href='/dashboard/'}
                            >
                                VAZIFA TANLASH →
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>            {/* Assigned Stages & Work History Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Assigned Stages (Section 5) */}
                <Card className="col-span-4 border-none shadow-premium bg-slate-900/40 border border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-800/50">
                        <CardTitle className="text-xs font-black tracking-[0.15em] text-slate-500 uppercase flex items-center gap-2">
                           <Layers className="h-4 w-4" />
                           BIRIKTIRILGAN BOSQICHLAR
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-wrap gap-2">
                            {user.assigned_stages?.length > 0 ? (
                                user.assigned_stages.map((stage: string, idx: number) => (
                                    <Badge 
                                        key={idx} 
                                        className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] py-1.5 px-3 rounded-lg uppercase tracking-wider"
                                    >
                                        {stage}
                                    </Badge>
                                ))
                            ) : (
                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 w-full">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Bosqichlar biriktirilmagan</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">
                                <AlertTriangle className="inline h-3 w-3 mr-1 mb-0.5" />
                                DIQQAT: Faqat biriktirilgan bosqichlar bo'yicha vazifa olishingiz mumkin.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Production History (Section 6) */}
                <Card className="col-span-8 border-none shadow-premium bg-slate-900/40 border border-slate-800 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-slate-800/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-black tracking-[0.15em] text-slate-500 uppercase flex items-center gap-2">
                           <History className="h-4 w-4" />
                           OXIRGI ISH TARIXI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/30 text-slate-500 uppercase text-[9px] font-black tracking-[0.15em]">
                                    <tr>
                                        <th className="px-6 py-3">Sana</th>
                                        <th className="px-6 py-3">Bosqich</th>
                                        <th className="px-6 py-3 text-right">Tayyor</th>
                                        <th className="px-6 py-3 text-right">Brak</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {history.length > 0 ? (
                                        history.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-[10px] font-black text-slate-400 font-mono capitalize">
                                                        {format(new Date(log.date), "d-MMM, HH:mm", { locale: uz })}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase tracking-tight economy-font truncate max-w-[150px]">
                                                            {log.order_number}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.1em]">
                                                            {log.step}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-black text-emerald-400">+{log.produced}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-black text-rose-500">{log.defects}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-10 text-center">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ish tarixi mavjud emas</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}
