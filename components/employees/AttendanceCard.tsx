"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Fingerprint, LogOut, ShieldCheck, Timer } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface AttendanceCardProps {
  onStatusChange?: () => void
}

export function AttendanceCard({ onStatusChange }: AttendanceCardProps) {
  const [attendance, setAttendance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liveStats, setLiveStats] = useState({ workHours: 0, breakMinutes: 0 })
  const router = useRouter()

  // Live timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (!attendance) return

      const now = new Date()
      const clockIn = new Date(attendance.clock_in)
      
      // Calculate work hours
      let hours = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      
      // Calculate active break minutes
      let currentBreakMins = 0
      if (attendance.status === 'on_break' && attendance.break_start) {
        const breakStart = new Date(attendance.break_start)
        currentBreakMins = Math.floor((now.getTime() - breakStart.getTime()) / (1000 * 60))
      }
      
      setLiveStats({
        workHours: parseFloat(hours.toFixed(2)),
        breakMinutes: (attendance.total_break_minutes || 0) + currentBreakMins
      })
    }, 10000) // Update every 10 seconds for smoothness

    return () => clearInterval(timer)
  }, [attendance])

  const fetchTodayAttendance = async () => {
    try {
      const res = await fetchWithAuth("/api/attendance/today/")
      if (res.ok && res.status !== 204) {
        setAttendance(await res.json())
      } else {
        setAttendance(null)
      }
    } catch (error) {
      console.error("Fetch attendance error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayAttendance()
  }, [])

  const handleClockIn = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/api/attendance/clock_in/", { method: "POST" })
      if (res.ok) {
        toast.success("Ish kuni boshlandi. Xush kelibsiz!")
        fetchTodayAttendance()
        onStatusChange?.()
      } else {
        const data = await res.json()
        toast.error(data.error || "Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Server bilan aloqa uzildi")
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/api/attendance/clock_out/", { method: "POST" })
      if (res.ok) {
        toast.success("Ish kuni yakunlandi. Charchamang!")
        fetchTodayAttendance()
        onStatusChange?.()
        router.push('/production')
      } else {
        const data = await res.json()
        toast.error(data.error || "Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Server bilan aloqa uzildi")
    } finally {
      setLoading(false)
    }
  }

  const handleStartBreak = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/api/attendance/start_break/", { method: "POST" })
      if (res.ok) {
        toast.success("Tanaffus boshlandi")
        fetchTodayAttendance()
        onStatusChange?.()
      } else {
        const data = await res.json()
        toast.error(data.error || "Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Server bilan aloqa uzildi")
    } finally {
      setLoading(false)
    }
  }

  const handleEndBreak = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/api/attendance/end_break/", { method: "POST" })
      if (res.ok) {
        toast.success("Ishga qaytdingiz. Kuch-quvvat tilingiz!")
        fetchTodayAttendance()
        onStatusChange?.()
      } else {
        const data = await res.json()
        toast.error(data.error || "Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Server bilan aloqa uzildi")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !attendance) return <div className="h-48 animate-pulse bg-slate-900 rounded-2xl border border-slate-800" />

  const isWorking = attendance && attendance.status === 'working'
  const isOnBreak = attendance && attendance.status === 'on_break'
  const isFinished = attendance && attendance.status === 'finished'

  return (
    <Card className="border-none shadow-premium bg-slate-900/50 border border-slate-800 overflow-hidden">
      <CardHeader className="pb-3 bg-slate-800/30 border-b border-slate-800">
        <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-black flex items-center gap-2 tracking-[0.15em] text-slate-500 uppercase">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Davomat Monitori
            </CardTitle>
            {attendance && (
                <Badge className={`font-black text-[10px] px-2 py-0 h-5 border ${
                    isWorking ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                    isOnBreak ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-slate-800 text-slate-500 border-slate-700"
                }`}>
                    {isWorking ? "AKTIV" : isOnBreak ? "TANAFFUSDA" : "YAKUNLANDI"}
                </Badge>
            )}
        </div>
        <CardDescription className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
            Sana: {format(new Date(), "yyyy-MM-dd")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {attendance ? (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800/50">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Kirish Vaqti</span>
                        <div className="text-lg font-black font-mono text-white flex items-center gap-2">
                            <Clock className="h-4 w-4 text-emerald-400" />
                            {format(new Date(attendance.clock_in), "HH:mm:ss")}
                        </div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800/50">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Chiqish Vaqti</span>
                        <div className="text-lg font-black font-mono text-slate-600">
                            {attendance.clock_out ? format(new Date(attendance.clock_out), "HH:mm:ss") : "--:--:--"}
                        </div>
                    </div>
                </div>
                
                {isWorking || isOnBreak ? (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${isWorking ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full animate-ping ${isWorking ? "bg-emerald-500" : "bg-amber-500"}`} />
                            <span className={`text-xs font-black uppercase ${isWorking ? "text-emerald-400" : "text-amber-400"}`}>
                                {isWorking ? "Hozirda ishda" : "Hozirda tanaffusda"}
                            </span>
                        </div>
                        <div className="text-right">
                             <p className={`text-[9px] font-black uppercase ${isWorking ? "text-emerald-500/40" : "text-amber-500/40"}`}>
                                 {isWorking ? "Ish davomiyligi" : "Tanaffus ketti"}
                             </p>
                             <p className={`text-sm font-black ${isWorking ? "text-emerald-500" : "text-amber-500"}`}>
                                 {isWorking 
                                    ? `${liveStats.workHours > 0 ? liveStats.workHours : (attendance.total_hours || "0.0")} soat` 
                                    : `${liveStats.breakMinutes > 0 ? liveStats.breakMinutes : (attendance.total_break_minutes || 0)} daqiqa`
                                 }
                             </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 flex items-center justify-between">
                         <span className="text-xs font-black text-slate-500 uppercase">Ish kuni yakunlandi</span>
                         <div className="text-right">
                             <p className="text-[9px] font-black text-slate-500 uppercase">Jami ish vaqti</p>
                             <p className="text-sm font-black text-white">{attendance.total_hours} soat</p>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="py-10 text-center bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-800">
                <div className="inline-flex p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner mb-4">
                    <Fingerprint className="h-10 w-10 text-slate-700" />
                </div>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">Hali ish kuni boshlanmagan</p>
            </div>
        )}

        {!attendance && (
            <Button 
                onClick={handleClockIn} 
                className="w-full h-14 bg-primary hover:opacity-90 text-white font-black rounded-2xl shadow-lg shadow-primary/20 gap-3 transition-all hover:scale-[1.01] uppercase text-[11px] tracking-widest"
                disabled={loading}
            >
                <Fingerprint className="h-5 w-5" />
                ISHNI BOSHLASH
            </Button>
        )}

        {isWorking && (
            <div className="flex gap-4">
                <Button 
                    onClick={handleStartBreak} 
                    className="flex-1 h-14 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-white text-amber-500 font-black rounded-2xl gap-3 transition-all uppercase text-[11px] tracking-widest"
                    disabled={loading}
                >
                    <Timer className="h-5 w-5" />
                    TANAFFUS
                </Button>
                <Button 
                    onClick={handleClockOut} 
                    variant="outline"
                    className="flex-1 h-14 border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 font-black rounded-2xl gap-3 transition-all uppercase text-[11px] tracking-widest"
                    disabled={loading}
                >
                    <LogOut className="h-5 w-5 text-rose-500 rotate-180" />
                    TUGATISH
                </Button>
            </div>
        )}

        {isOnBreak && (
            <Button 
                onClick={handleEndBreak} 
                className="w-full h-14 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 gap-3 transition-all hover:scale-[1.01] uppercase text-[11px] tracking-widest"
                disabled={loading}
            >
                <Clock className="h-5 w-5" />
                QAYTISH (ISHGA)
            </Button>
        )}
      </CardContent>
    </Card>
  )
}
