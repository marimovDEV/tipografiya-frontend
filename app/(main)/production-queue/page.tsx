"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Settings, Play, Pause, CheckCircle, Clock, AlertCircle,
    TrendingUp, Zap, Calendar, Users, ArrowUp, ArrowDown, RefreshCw
} from "lucide-react"
import {
    getMachineQueue,
    getProductionAnalytics,
    optimizeMachineQueue,
    updateStepPriority,
    getMachineAvailability
} from "@/lib/api/printery"
import { fetchWithAuth } from "@/lib/api-client"
import type { MachineQueue, ProductionAnalytics } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Machine {
    id: string
    machine_name: string
    machine_type: string
    is_active: boolean
}

export default function ProductionQueueDashboard() {
    const [machines, setMachines] = useState<Machine[]>([])
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null)
    const [machineQueue, setMachineQueue] = useState<MachineQueue[]>([])
    const [analytics, setAnalytics] = useState<ProductionAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedStep, setSelectedStep] = useState<MachineQueue | null>(null)
    const [priorityDialogOpen, setPriorityDialogOpen] = useState(false)
    const [newPriority, setNewPriority] = useState(5)

    useEffect(() => {
        loadMachines()
        loadAnalytics()
    }, [])

    useEffect(() => {
        if (selectedMachine) {
            loadMachineQueue(selectedMachine)
        }
    }, [selectedMachine])

    async function loadMachines() {
        try {
            const response = await fetchWithAuth("/api/machines/")
            const data = await response.json()
            const machinesData = data.results || data
            setMachines(machinesData.filter((m: Machine) => m.is_active))
            if (machinesData.length > 0) {
                setSelectedMachine(machinesData[0].id)
            }
        } catch (error) {
            console.error("Failed to load machines:", error)
        } finally {
            setLoading(false)
        }
    }

    async function loadMachineQueue(machineId: string) {
        try {
            const response = await getMachineQueue(machineId)
            setMachineQueue(response.queue || [])
        } catch (error) {
            console.error("Failed to load queue:", error)
        }
    }

    async function loadAnalytics() {
        try {
            const data = await getProductionAnalytics()
            setAnalytics(data)
        } catch (error) {
            console.error("Failed to load analytics:", error)
        }
    }

    async function handleOptimizeQueue() {
        if (!selectedMachine) return

        try {
            await optimizeMachineQueue(selectedMachine)
            toast.success("Navbat optimallashtirildi")
            loadMachineQueue(selectedMachine)
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    async function handleUpdatePriority() {
        if (!selectedStep) return

        try {
            await updateStepPriority(selectedStep.id, newPriority)
            toast.success("Ustuvorlik o'zgartirildi")
            setPriorityDialogOpen(false)
            if (selectedMachine) {
                loadMachineQueue(selectedMachine)
            }
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return "bg-red-100 text-red-700"
        if (priority <= 5) return "bg-orange-100 text-orange-700"
        return "bg-gray-100 text-gray-700"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700"
            case "in_progress": return "bg-blue-100 text-blue-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="space-y-6 pb-20 min-w-[1240px]">
            {/* Header - DARK */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Ishlab Chiqarish Navbati</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 pl-1">
                        Stanoklar navbati va jadvallashtirish • ERP-QUEUE-X2
                    </p>
                </div>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl border-slate-800 bg-slate-900 text-slate-400 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-5 hover:bg-slate-800 transition-all shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                    Yangilash
                </Button>
            </div>

            {/* Analytics Cards - DARK */}
            {analytics && (
                <div className="grid grid-cols-4 gap-6">
                    <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 group hover:border-slate-700 transition-all rounded-[2rem] overflow-hidden relative">
                        <CardContent className="p-7 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-slate-800 text-slate-400 rounded-xl border border-slate-700"><Clock size={18} /></div>
                                <Badge className="bg-slate-800 text-slate-500 border border-slate-700 font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-full">QUEUE</Badge>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Kutilmoqda</p>
                            <h2 className="text-3xl font-black font-mono text-white tracking-tighter">{analytics.total_pending}</h2>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 group hover:border-blue-500/50 transition-all rounded-[2rem] overflow-hidden relative">
                        <CardContent className="p-7 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20"><Play size={18} /></div>
                                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-full">ACTIVE</Badge>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Jarayonda</p>
                            <h2 className="text-3xl font-black font-mono text-blue-400 tracking-tighter">{analytics.total_in_progress}</h2>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 group hover:border-emerald-500/50 transition-all rounded-[2rem] overflow-hidden relative">
                        <CardContent className="p-7 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><CheckCircle size={18} /></div>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-full">TODAY</Badge>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Bugun Tugadi</p>
                            <h2 className="text-3xl font-black font-mono text-emerald-400 tracking-tighter">{analytics.total_completed_today}</h2>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 group hover:border-rose-500/50 transition-all rounded-[2rem] overflow-hidden relative">
                        <CardContent className="p-7 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20"><AlertCircle size={18} /></div>
                                <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-full">LATE</Badge>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Kechikkan</p>
                            <h2 className="text-3xl font-black font-mono text-rose-500 tracking-tighter">{analytics.late_steps_count}</h2>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Machine Tabs - DARK */}
            <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-6 px-10">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Settings size={20} /></div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Stanoklar Navbati</h3>
                        </div>
                        {selectedMachine && (
                            <Button size="sm" onClick={handleOptimizeQueue} className="bg-primary text-white hover:opacity-90 rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">
                                <Zap className="w-4 h-4 mr-2" />
                                Optimallash
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                    <Tabs value={selectedMachine || undefined} onValueChange={setSelectedMachine}>
                        <TabsList className="grid w-full bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-8" style={{ gridTemplateColumns: `repeat(${machines.length}, 1fr)` }}>
                            {machines.map((machine) => (
                                <TabsTrigger 
                                    key={machine.id} 
                                    value={machine.id}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-500"
                                >
                                    <Settings className="w-3.5 h-3.5 mr-2 opacity-50" />
                                    {machine.machine_name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {machines.map((machine) => (
                            <TabsContent key={machine.id} value={machine.id} className="space-y-4 mt-0">
                                {loading ? (
                                    <div className="text-center py-24">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-primary/20" />
                                        <p className="mt-6 text-[11px] font-black uppercase tracking-widest text-slate-500">Navbat yuklanmoqda...</p>
                                    </div>
                                ) : machineQueue.length === 0 ? (
                                    <div className="text-center py-32 border-4 border-dashed border-slate-800/50 rounded-[3rem] bg-slate-900/20">
                                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                            <CheckCircle size={40} />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                                            Ushbu stanokda faol vazifalar yo'q
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {machineQueue.map((item, index) => (
                                            <Card
                                                key={item.id}
                                                className={`transition-all duration-300 rounded-3xl overflow-hidden relative group border-2 ${
                                                    item.status === "in_progress"
                                                        ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(79,70,229,0.15)]"
                                                        : item.is_ready
                                                            ? "border-emerald-500/30 bg-slate-900/40"
                                                            : "border-slate-800 bg-slate-900/20"
                                                }`}
                                            >
                                                <CardContent className="p-8">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            {/* Header */}
                                                            <div className="flex items-center gap-5 mb-8">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-950 border-4 border-slate-800 shadow-xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform">
                                                                    {item.queue_position || index + 1}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                                                                        {item.order_number}
                                                                    </h4>
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                        {item.client_name}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Badge className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                                        item.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                                                        item.status === "in_progress" ? "bg-primary/20 text-white border-primary/30 animate-pulse" :
                                                                        "bg-slate-800 text-slate-400 border-slate-700"
                                                                    }`}>
                                                                        {item.status === "completed" && "Tugallangan"}
                                                                        {item.status === "in_progress" && "Jarayonda"}
                                                                        {item.status === "pending" && "Kutilmoqda"}
                                                                    </Badge>
                                                                    <Badge className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                                        item.priority <= 2 ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                                                                        item.priority <= 5 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                                                        "bg-slate-800 text-slate-400 border-slate-700"
                                                                    }`}>
                                                                        USTUVORLIK: {item.priority}
                                                                    </Badge>
                                                                    {!item.is_ready && item.depends_on && (
                                                                        <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                                            <AlertCircle className="w-3 h-3 mr-2" />
                                                                            Bloklangan
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Details Grid */}
                                                            <div className="grid grid-cols-4 gap-8">
                                                                <div className="space-y-1.5">
                                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ish Bosqichi</p>
                                                                    <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{item.step}</p>
                                                                </div>
                                                                {item.assigned_to && (
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Mas'ul Shaxs</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-[9px] border border-primary/30 uppercase">
                                                                                {item.assigned_to[0]}
                                                                            </div>
                                                                            <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{item.assigned_to}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {item.estimated_duration_minutes && (
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Muddati</p>
                                                                        <p className="text-sm font-black text-white font-mono">
                                                                            {Math.floor(item.estimated_duration_minutes / 60)}s {item.estimated_duration_minutes % 60}d
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {item.estimated_start && (
                                                                    <div className="space-y-1.5 text-right">
                                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Boshlash Vaqti</p>
                                                                        <p className="text-sm font-black text-primary font-mono tracking-tighter uppercase italic">
                                                                            {new Date(item.estimated_start).toLocaleString("uz-UZ", {
                                                                                month: "short",
                                                                                day: "numeric",
                                                                                hour: "2-digit",
                                                                                minute: "2-digit"
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions Panel */}
                                                        <div className="pl-12 flex flex-col gap-3">
                                                            <Button
                                                                variant="outline"
                                                                className="w-14 h-14 rounded-2xl border-slate-800 bg-slate-900 shadow-lg hover:border-primary/50 group/btn transition-all group-hover:scale-105"
                                                                onClick={() => {
                                                                    setSelectedStep(item)
                                                                    setNewPriority(item.priority)
                                                                    setPriorityDialogOpen(true)
                                                                }}
                                                            >
                                                                {item.priority <= 2 ? (
                                                                    <ArrowUp className="w-6 h-6 text-rose-500 group-hover/btn:scale-125 transition-transform" />
                                                                ) : item.priority <= 5 ? (
                                                                    <ArrowUp className="w-6 h-6 text-orange-500 group-hover/btn:scale-125 transition-transform" />
                                                                ) : (
                                                                    <ArrowDown className="w-6 h-6 text-slate-600 group-hover/btn:scale-125 transition-transform" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Priority Dialog - DARK */}
            <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
                <DialogContent className="sm:max-w-md border-slate-800 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden p-0">
                    <DialogHeader className="bg-slate-900 p-6 border-b border-slate-800">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-white italic">Ustuvorlikni O'zgartirish</DialogTitle>
                    </DialogHeader>
                    <div className="p-10 space-y-8">
                        {selectedStep && (
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap size={64} className="text-white" />
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tanlangan Vazifa</p>
                                <p className="text-lg font-black text-white uppercase tracking-tight">{selectedStep.order_number}</p>
                                <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-1 italic">{selectedStep.step}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Ustuvorlik Darajasi (1 = MAX SPEED, 10 = NORMAL)
                            </label>
                            <div className="flex items-center gap-8 px-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary"
                                />
                                <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-slate-800 flex flex-col items-center justify-center shadow-xl">
                                    <span className="text-4xl font-black font-mono text-primary leading-none">{newPriority}</span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase mt-1">LEVEL</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">
                                <span className="text-rose-500/60">CRITICAL POWER</span>
                                <span>STANDARD FLOW</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 text-sans">
                            <Button
                                variant="ghost"
                                className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                onClick={() => setPriorityDialogOpen(false)}
                            >
                                Bekor qilish
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                                onClick={handleUpdatePriority}
                            >
                                KONFIG RATSIYANI SAQLASH
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
