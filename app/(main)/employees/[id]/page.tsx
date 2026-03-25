"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Clock, 
  Phone, 
  History as HistoryIcon,
  Activity,
  ShieldCheck,
  Zap,
  Edit,
  BarChart3,
  Lock,
  Unlock,
  Box,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"
import { uz } from "date-fns/locale"

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [worker, setWorker] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [activeTasks, setActiveTasks] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Dialog States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form States
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    department: "",
    password: "",
    daily_target: 1000,
    quality_rating: 5.0
  })

  useEffect(() => {
    fetchWorkerData()
    // Poll for active task updates
    const interval = setInterval(fetchWorkerData, 30000)
    return () => clearInterval(interval)
  }, [id])

  const fetchWorkerData = async () => {
    try {
      const [userRes, statsRes, historyRes, activeRes, attendRes] = await Promise.all([
        fetchWithAuth(`/api/users/${id}/`),
        fetchWithAuth(`/api/users/production-stats/?user_id=${id}`),
        fetchWithAuth(`/api/users/work-history/?user_id=${id}`),
        fetchWithAuth(`/api/production/active/?user_id=${id}`),
        fetchWithAuth(`/api/attendance/today/?user_id=${id}`)
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setWorker(userData)
        setEditForm({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          role: userData.role || "worker",
          department: userData.department || "Ishlab chiqarish",
          password: "",
          daily_target: userData.daily_target || 1000,
          quality_rating: userData.quality_rating || 5.0
        })
      }
      if (statsRes.ok) setStats(await statsRes.json())
      if (historyRes.ok) setHistory(await historyRes.json())
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveTasks(Array.isArray(activeData) ? activeData : [])
      }
      if (attendRes.ok && attendRes.status !== 204) setAttendance(await attendRes.json())
    } catch (error) {
      console.error("Fetch worker data error:", error)
      toast.error("Ma'lumotlarni yuklab bo'lmadi")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editForm.first_name || !editForm.last_name) {
      toast.error("Ism va familiyani kiritish majburiy")
      return
    }
    setActionLoading(true)
    try {
      const payload: any = { ...editForm }
      if (!payload.password) delete payload.password

      const res = await fetchWithAuth(`/api/users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success("Ma'lumotlar yangilandi")
        setIsEditModalOpen(false)
        fetchWorkerData()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Tizimda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    setActionLoading(true)
    try {
      const res = await fetchWithAuth(`/api/users/${id}/`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Xodim o'chirildi")
        router.push("/employees")
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Tizimda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleBlock = async () => {
    setActionLoading(true)
    try {
      const res = await fetchWithAuth(`/api/users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !worker.is_active })
      })
      if (res.ok) {
        toast.success(worker.is_active ? "Xodim bloklandi" : "Xodim blokdan chiqarildi")
        setIsBlockModalOpen(false)
        fetchWorkerData()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Tizimda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
            <p className="text-sm font-black text-slate-500 tracking-[0.2em]">XODIM MA'LUMOTLARI YUKLANMOQDA...</p>
        </div>
      </div>
    )
  }

  if (!worker) return <div>Xodim topilmadi</div>

  return (
    <div className="min-w-[1240px] px-8 py-6 space-y-6 bg-slate-950 min-h-screen font-sans text-slate-100 pb-20">
      {/* Top Header Section */}
      <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex items-center gap-6">
            <Link href="/employees">
                <Button variant="ghost" size="sm" className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold gap-2 border border-slate-700/50">
                    <ArrowLeft className="w-4 h-4" />
                    XODIMLAR
                </Button>
            </Link>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/50 shadow-lg">
                    <AvatarImage src={worker.avatar_url || `https://avatar.vercel.sh/${id}.png`} />
                    <AvatarFallback className="font-black bg-primary text-white">
                        {worker.first_name?.[0]}{worker.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                        {worker.first_name} {worker.last_name}
                        <Badge className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                            !worker.is_active ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : 
                            worker.status === 'working' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}>
                            {!worker.is_active ? "🛑 BLOKLANGAN" : (worker.status === 'working' ? "🟢 ISHDA" : "⚪ YO'Q")}
                        </Badge>
                    </h1>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-2">
                        {worker.role_display || "Operator"} • {worker.department || "Ishlab chiqarish"} bo'limi 
                        <span className="text-slate-700">•</span>
                        <span className="text-amber-500 flex items-center gap-1"><Zap className="w-3 h-3 fill-amber-500" /> {worker.quality_rating}</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-primary flex items-center gap-1">🏆 #{stats?.rank || 1}</span>
                    </p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-300 font-bold gap-2 hover:bg-slate-800" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4" />
                TAHRIRLASH
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-300 font-bold gap-2 hover:bg-slate-800" onClick={() => setIsStatsModalOpen(true)}>
                <BarChart3 className="w-4 h-4" />
                STATISTIKA
            </Button>
            <Button size="sm" variant="outline" className={`rounded-xl font-bold gap-2 ${
                worker.is_active 
                ? "border-red-900/30 bg-red-900/10 text-red-400 hover:bg-red-900/20" 
                : "border-emerald-900/30 bg-emerald-900/10 text-emerald-400 hover:bg-emerald-900/20"
            }`} onClick={() => setIsBlockModalOpen(true)}>
                {worker.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {worker.is_active ? "BLOKLASH" : "BLOKDAN CHIQARISH"}
            </Button>
            {worker.role !== 'admin' && (
                <Button size="sm" variant="destructive" className="rounded-xl font-bold gap-2 bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20" onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2 className="w-4 h-4" />
                    O'CHIRISH
                </Button>
            )}
        </div>
      </div>

      {/* Action Modals */}
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[500px] rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-slate-800/50 px-8 py-6 border-b border-slate-800">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Xodim Ma'lumotlarini Tahrirlash</DialogTitle>
            <DialogDescription className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Sistemadagi xodim protokollarini yangilash</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ism</Label>
                <Input 
                  value={editForm.first_name} 
                  onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Familiya</Label>
                <Input 
                  value={editForm.last_name} 
                  onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefon</Label>
                  <Input 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bo'lim</Label>
                  <Input 
                    value={editForm.department} 
                    onChange={e => setEditForm({...editForm, department: e.target.value})}
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                  />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yangi Parol (Ixtiyoriy)</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={editForm.password} 
                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                    placeholder="O'zgartirish uchun kiriting..."
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kunlik Reja (Dona)</Label>
                    <Input 
                        type="number"
                        value={editForm.daily_target} 
                        onChange={e => setEditForm({...editForm, daily_target: parseInt(e.target.value) || 0})}
                        className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sifat Reytingi (0-5)</Label>
                    <Input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editForm.quality_rating} 
                        onChange={e => setEditForm({...editForm, quality_rating: parseFloat(e.target.value) || 0})}
                        className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol / Lavozim</Label>
                <Select value={editForm.role} onValueChange={v => setEditForm({...editForm, role: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="worker" className="font-bold text-xs uppercase">Ishchi / Operator</SelectItem>
                        <SelectItem value="admin" className="font-bold text-xs uppercase">Administrator</SelectItem>
                        <SelectItem value="warehouse" className="font-bold text-xs uppercase">Omborchi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter className="bg-slate-800/30 px-8 py-6 border-t border-slate-800">
            <Button variant="ghost" className="text-slate-500 font-black text-[10px] uppercase h-11" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</Button>
            <Button className="bg-primary text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl" onClick={handleUpdateUser} disabled={actionLoading}>
                {actionLoading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation */}
      <AlertDialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 rounded-3xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic tracking-tight">
                {worker.is_active ? "Xodimni bloklash?" : "Blokdan chiqarish?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs font-medium">
                {worker.is_active 
                  ? "Diqqat! Bloklangandan so'ng xodim tizimga kira olmaydi va barcha amallari to'xtatiladi." 
                  : "Xodim qayta faollashtiriladi va tizimga kirish imkoniga ega bo'ladi."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-slate-900 border-slate-800 text-slate-400 font-black text-[10px] uppercase h-11">BEKOR QILISH</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleToggleBlock}
                className={`text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl ${worker.is_active ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
                {worker.is_active ? "BLOKLASH" : "FAOLASHTIRISH"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 rounded-3xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic tracking-tight">
                Xodimni o'chirish?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs font-medium">
                Diqqat! Bu amalni ortga qaytarib bo'lmaydi. Xodim tizimdan butunlay o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-slate-900 border-slate-800 text-slate-400 font-black text-[10px] uppercase h-11">BEKOR QILISH</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl"
            >
                O'CHIRISH
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Statistics Modal */}
      <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[800px] rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-slate-800/50 px-8 py-6 border-b border-slate-800">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                Ish Faoliyati Monitoringi
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-3 gap-6">
                <Card className="bg-slate-950 border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-500 mb-2" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bugun</span>
                    <span className="text-2xl font-black text-emerald-400">+{stats?.today?.produced || 0}</span>
                </Card>
                <Card className="bg-slate-950 border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-500 mb-2" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Haftalik</span>
                    <span className="text-2xl font-black text-blue-400">+{stats?.weekly?.produced || 0}</span>
                </Card>
                <Card className="bg-slate-950 border-slate-800 p-6 rounded-2xl flex flex-col items-center gap-2">
                    <Zap className="w-5 h-5 text-slate-500 mb-2" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Oylik</span>
                    <span className="text-2xl font-black text-amber-500">+{stats?.monthly?.produced || 0}</span>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 border-b border-slate-800 pb-2">SIFAT KO'RSATKICHLARI</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase">QUALITY SCORE (BUGUN)</span>
                            <span className="text-lg font-black text-emerald-400">{stats?.today?.efficiency || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[94%]" style={{ width: `${stats?.today?.efficiency || 0}%` }} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase">SYSTEM RATING (GENERAL)</span>
                            <span className="text-lg font-black text-amber-400">{stats?.rating || 0} / 5.0</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${((stats?.rating || 0) / 5) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-emerald-600 uppercase">XATOLAR KO'RSATKICHI</p>
                        <p className="text-sm font-black text-emerald-400">JUDA PAST (OPTIMAL)</p>
                    </div>
                </div>
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl">
                        <XCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-rose-600 uppercase">KECHIKISHLAR</p>
                        <p className="text-sm font-black text-rose-400">0 TA (YAXSHI)</p>
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-800/30 px-8 py-6 border-t border-slate-800">
            <Button className="bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase h-11 px-10 rounded-xl" onClick={() => setIsStatsModalOpen(false)}>YOPISH</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Stats Column */}
        <div className="col-span-4 space-y-6">
            {/* Performance KPIs */}
            <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800">
                <CardHeader className="pb-2 border-b border-slate-800/50">
                    <CardTitle className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Ish faoliyati statistikasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Tayyorlandi (Bugun)</span>
                            <span className="text-2xl font-black text-white">{stats?.today?.produced || 0}</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">ta mahsulot</span>
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex flex-col items-center border-red-900/20">
                            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Brak (Chiqindi)</span>
                            <span className="text-2xl font-black text-red-400">{stats?.today?.defects || 0}</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">ta mahsulot</span>
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex flex-col items-center border-emerald-900/20">
                            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Samaradorlik</span>
                            <span className="text-2xl font-black text-emerald-400">{stats?.today?.efficiency || 0}%</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">QC ko'rsatkichi</span>
                        </div>
                        <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex flex-col items-center border-blue-900/20">
                            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">O'rtacha Tezlik</span>
                            <span className="text-2xl font-black text-blue-400">{stats?.avg_speed || 0}/soat</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">ish unumi</span>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden">
                        <TrendingUp className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-primary/5" />
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase mb-1 tracking-widest">KUNLIK REJA IJROSI</p>
                                <p className="text-xl font-black text-white italic">{stats?.plan_progress || 0}% <span className="text-xs font-normal text-slate-400 opacity-60">bajarildi</span></p>
                            </div>
                            <div className="h-12 w-1 bg-primary/20 rounded-full" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${stats?.plan_progress || 0}%` }} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Board */}
            <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800">
                <CardHeader className="pb-2 border-b border-slate-800/50">
                    <CardTitle className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        Bugungi davomat
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase">KIRISH</span>
                            <span className="text-sm font-black text-emerald-400">
                                {attendance?.clock_in ? format(new Date(attendance.clock_in), "HH:mm") : "--:--"}
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase">CHIQISH</span>
                            <span className="text-sm font-black text-red-400">
                                {attendance?.clock_out ? format(new Date(attendance.clock_out), "HH:mm") : "--:--"}
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase">ISH VAQTI</span>
                            <span className="text-sm font-black text-white">
                                {attendance?.total_hours || "0.0"} <span className="text-[10px] text-slate-600">soat</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Timer className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-amber-600/70 uppercase">Tanaffusda bo'lgan vaqt</p>
                            <p className="text-xs font-black text-amber-400">{attendance?.total_break_minutes || 0} daqiqa</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-black border-amber-500/30 text-amber-500">
                            {attendance?.status === 'on_break' ? "PAUZADA" : "NORMA"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Content Column */}
        <div className="col-span-8 space-y-6">
            
            {/* Live Current Task Monitoring */}
            <Card className="border-none shadow-premium bg-slate-900 border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <div className="absolute right-0 top-0 p-8 opacity-[0.03] scale-150 rotate-12">
                   <Zap className="w-32 h-32" />
                </div>
                
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                        <CardTitle className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Hozirgi bajarilayotgan vazifa
                        </CardTitle>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {activeTasks.length > 0 ? (
                            activeTasks.map((task) => (
                                <div key={task.id} className="flex gap-8 p-6 bg-slate-800/20 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all group/active">
                                    <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700 shadow-xl group-hover/active:border-emerald-500/30 transition-all">
                                        <Box className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BUYURTMA</p>
                                            <p className="text-lg font-black text-white italic">#{task.order_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BOSQICH</p>
                                            <p className="text-lg font-black text-emerald-400">{task.step_display}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">BUYURTMA MIQDORI</p>
                                            <p className="text-lg font-black text-slate-300">{task.order_quantity?.toLocaleString()} <span className="text-xs font-normal opacity-50">ta</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PROGRES</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-black text-blue-400">
                                                    {task.order_quantity > 0 ? Math.round(((task.produced_qty + task.defect_qty) / task.order_quantity) * 100) : 0}%
                                                </p>
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                                                    <div 
                                                        className="h-full bg-blue-500 transition-all duration-1000" 
                                                        style={{ width: `${task.order_quantity > 0 ? Math.round(((task.produced_qty + task.defect_qty) / task.order_quantity) * 100) : 0}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center gap-2 border-l border-slate-800 pl-6">
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="text-[10px] font-black uppercase text-primary hover:bg-primary/10"
                                            onClick={() => window.location.href=`/orders/${task.order}/`}
                                        >
                                            BATAFSIL <ArrowLeft className="w-3 h-3 rotate-180 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                 <ClipboardList className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                 <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Hozirda faol vazifa yo'q</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Assigned Tasks & History Tabs */}
            <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-800/20">
                    <CardTitle className="text-sm font-black uppercase italic text-white flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4 text-primary" />
                        Ish Tarixi va Vazifalar
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                                <tr>
                                    <th className="px-6 py-4">Sana / Vaqt</th>
                                    <th className="px-6 py-4">Buyurtma</th>
                                    <th className="px-6 py-4">Bosqich</th>
                                    <th className="px-6 py-4">Tayyorlandi</th>
                                    <th className="px-6 py-4">Brak</th>
                                    <th className="px-6 py-4">Izoh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.length > 0 ? (
                                    history.map((log) => (
                                        <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                                {format(new Date(log.date), "dd.MM.yyyy HH:mm")}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-black text-slate-100">
                                                #{log.order_number}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-blue-400">
                                                {log.step}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-black text-emerald-400">
                                                +{log.produced}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-black text-red-400">
                                                {log.defects}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500 italic max-w-[200px] truncate">
                                                {log.notes || "—"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                             <AlertTriangle className="w-10 h-10 text-slate-800 mx-auto mb-3" />
                                             <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Ma'lumotlar mavjud emas</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Metadata Section */}
            <div className="grid grid-cols-2 gap-6">
                <Card className="border-none shadow-premium bg-slate-800/20 border border-slate-800/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tizimga oxirgi kirish</p>
                            <p className="text-sm font-bold text-white">{worker.last_login ? format(new Date(worker.last_login), "dd.MM.yyyy HH:mm") : "Hozirgacha kirmagan"}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-premium bg-emerald-500/5 border border-emerald-500/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Zap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tizim barqarorligi</p>
                            <p className="text-sm font-bold text-emerald-400 italic">99.9% UPTIME</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}

function Timer({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="12" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  )
}
