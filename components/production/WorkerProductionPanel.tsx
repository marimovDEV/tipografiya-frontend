"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Zap, 
  Pause, 
  ArrowRight,
  ClipboardList,
  History,
  Info,
  ChevronDown,
  Search,
  Activity
} from "lucide-react"
import { toast } from "sonner"
import { claimProductionStep, reportStepProgress, requestMaterialFromWarehouse, completeProductionStep } from "@/lib/api/printery"
import { fetchWithAuth } from "@/lib/api-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductionStep {
  id: string
  order_number: string
  client_name: string
  step: string
  sequence: number
  status: string
  quantity: number
  input_qty: number
  produced_qty?: number
  defect_qty?: number
  available_qty?: number
}

export default function WorkerProductionPanel({ searchQuery = "" }: { searchQuery?: string }) {
  const [availableOrders, setAvailableOrders] = useState<ProductionStep[]>([])
  const [activeStep, setActiveStep] = useState<ProductionStep | null>(null)
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<any[]>([])
  const [stepStats, setStepStats] = useState<Record<string, { display: string, count: number, total_available: number }>>({})
  
  // Reporting state
  const [produced, setProduced] = useState("")
  const [defects, setDefects] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Requisition state
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [reqQuantity, setReqQuantity] = useState("")
  const [reqLoading, setReqLoading] = useState(false)
  const [dailyStats, setDailyStats] = useState({ produced: 0, defects: 0 })

  // Step filter state
  const [stepFilter, setStepFilter] = useState<string>("ALL")

  useEffect(() => {
    fetchUserData()
    fetchWorkerData()
    fetchMaterials()
    fetchStepStats()
    fetchDailyStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetchWithAuth("/api/users/me/")
      if (res.ok) {
        setUser(await res.json())
      }
    } catch (e) {
      console.error("Fetch user error:", e)
    }
  }

  const handleStartShift = async () => {
    try {
      setSubmitting(true)
      const res = await fetchWithAuth("/api/users/start-shift/", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setUser({ ...user, status: data.status })
        toast.success("Smena boshlandi. Ishga tushishingiz mumkin.")
      }
    } catch (e) {
      toast.error("Xatolik: Smenani boshlab bo'lmadi")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEndShift = async () => {
    try {
      setSubmitting(true)
      const res = await fetchWithAuth("/api/users/end-shift/", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setUser({ ...user, status: data.status })
        setActiveStep(null)
        toast.info("Ishyakunlandi. Yaxshi dam oling!")
        fetchWorkerData()
      }
    } catch (e) {
      toast.error("Xatolik: Smenani yakunlab bo'lmadi")
    } finally {
      setSubmitting(false)
    }
  }

  const fetchDailyStats = async () => {
    try {
      const res = await fetchWithAuth("/api/users/production-stats/")
      if (res.ok) {
        const data = await res.json()
        setDailyStats({
          produced: data.today?.produced || 0,
          defects: data.today?.defects || 0
        })
      }
    } catch (e) {
      console.error("Fetch daily stats error:", e)
    }
  }

  const fetchStepStats = async () => {
    try {
      const res = await fetchWithAuth("/api/production/stats/")
      if (res.ok) {
        setStepStats(await res.json())
      }
    } catch (e) {
      console.error("Fetch step stats error:", e)
    }
  }

  const fetchMaterials = async () => {
    try {
      const res = await fetchWithAuth("/api/inventory/")
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.results || data)
      }
    } catch (e) {
      console.error("Fetch materials error:", e)
    }
  }

  const fetchWorkerData = async () => {
    try {
      setLoading(true)
      const [activeRes, availableRes] = await Promise.all([
        fetchWithAuth("/api/production/active/"),
        fetchWithAuth("/api/production/available/")
      ])

      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActiveStep(activeData[0] || null)
      }

      if (availableRes.ok) {
        setAvailableOrders(await availableRes.json())
      }
    } catch (error) {
      console.error("Fetch worker data error:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    let filtered = availableOrders
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.client_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (stepFilter !== "ALL") {
      filtered = filtered.filter(o => o.step === stepFilter)
    }
    return filtered
  }, [availableOrders, searchQuery, stepFilter]);

  const uniqueSteps = useMemo(() => {
    const steps = new Set<string>()
    steps.add("ALL")
    availableOrders.forEach(o => steps.add(o.step))
    return Array.from(steps)
  }, [availableOrders]);

  const handleStart = async (stepId: string) => {
    if (user?.status !== 'working') {
      toast.error("Smenani boshlamasdan turib ishni boshlab bo'lmaydi!")
      return
    }
    try {
      await fetchWithAuth(`/api/production/${stepId}/claim/`, { method: "POST" })
      toast.success("Vazifa boshlandi")
      fetchWorkerData()
    } catch (error) {
      toast.error("Xatolik: Vazifani boshlab bo'lmadi")
    }
  }

  const handleReport = async () => {
    if (user?.status !== 'working') {
      toast.error("Smena yakunlangan. Hisobot yuborish uchun smenani qayta boshlang.")
      return
    }
    if (!activeStep) return
    if (!produced) {
      toast.error("Bajarilgan miqdorni kiriting")
      return
    }

    try {
      setSubmitting(true)
      await reportStepProgress({
        production_step_id: activeStep.id,
        produced_qty: parseInt(produced),
        defect_qty: parseInt(defects || "0")
      })
      toast.success("Hisobot saqlandi")
      setProduced("")
      setDefects("")
      fetchWorkerData()
      fetchDailyStats()
    } catch (error) {
      toast.error("Hisobotni yuborishda xatolik")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestMaterial = async () => {
    if (user?.status !== 'working') {
      toast.error("Smenani boshlamasdan turib material olib bo'lmaydi!")
      return
    }
    if (!activeStep || !selectedMaterial || !reqQuantity) {
    try {
      const material = materials.find(m => m.id === selectedMaterial)
      const qty = parseFloat(reqQuantity)
      
      if (material && material.current_stock < qty) {
        toast.error(`Omborda yetarli qoldiq yo'q. Mavjud: ${material.current_stock} ${material.unit}`)
        return
      }

      setReqLoading(true)
      await requestMaterialFromWarehouse({
        production_step_id: activeStep.id,
        material_id: selectedMaterial,
        quantity: qty
      })
      toast.success("Material olindi va log qilindi")
      setIsRequisitionOpen(false)
      setSelectedMaterial("")
      setReqQuantity("")
    } catch (error) {
      toast.error((error as any)?.message || "Material olishda xatolik")
    } finally {
      setReqLoading(false)
    }
  }

  const handleComplete = async () => {
    if (user?.status !== 'working') {
      toast.error("Smena yakunlangan. Vazifani yakunlash uchun smenani qayta boshlang.")
      return
    }
    if (!activeStep) return
    try {
      setSubmitting(true)
      await completeProductionStep(activeStep.id)
      toast.success("Vazifa muvaffaqiyatli yakunlandi")
      setActiveStep(null)
      fetchWorkerData()
      fetchDailyStats()
      fetchStepStats()
    } catch (error) {
      toast.error("Vazifani yakunlashda xatolik")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* SHIFT CONTROL TERMINAL - NEW */}
      <div className="grid grid-cols-1 gap-6">
        <Card className={`border overflow-hidden rounded-[2.5rem] transition-all duration-500 ${
          user?.status === 'working' 
          ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_20px_50px_rgba(16,185,129,0.1)]" 
          : "border-slate-800 bg-slate-900/40"
        }`}>
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl border transition-all duration-500 ${
                user?.status === 'working'
                ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse"
                : "bg-slate-800 text-slate-500 border-slate-700"
              }`}>
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                  ISHCHI TERMINALI <span className="mx-2 opacity-20">|</span> 
                  <span className={user?.status === 'working' ? "text-emerald-500" : "text-slate-600"}>
                    {user?.status === 'working' ? "SMENA FAOAL" : "SMENA YOPILGAN"}
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                   <p className="text-xl font-black text-white italic tracking-tighter uppercase">
                     {user?.first_name} {user?.last_name || 'Xodim'}
                   </p>
                   <Badge className={`${user?.status === 'working' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'} border-none text-[8px] font-black`}>
                      {user?.role?.toUpperCase()}
                   </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user?.status === 'working' ? (
                <Button 
                  onClick={handleEndShift}
                  disabled={submitting}
                  className="h-14 px-8 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 border-none transition-all group"
                >
                  <Pause className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                  Smenani Tugatish
                </Button>
              ) : (
                <Button 
                  onClick={handleStartShift}
                  disabled={submitting}
                  className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 border-none transition-all group"
                >
                  <Play className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform fill-current" />
                  Smenani Boshlash
                </Button>
              )}
            </div>
          </div>
          
          {user?.status === 'working' && (
            <div className="px-8 py-3 bg-emerald-500/10 border-t border-emerald-500/10 flex items-center justify-between">
               <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Tizimga muvaffaqiyatli kirildi. Barcha vazifalar faollashtirildi.</p>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase">Live Tracking Active</span>
               </div>
            </div>
          )}
        </Card>
      </div>

      {/* Step Overview Section */}
      <div className="mb-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
          <Activity className="w-3 h-3 text-indigo-500" />
          ETAPLAR BO'YICHA HOLAT
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar-h">
          {Object.entries(stepStats).map(([code, data]) => (
            <button
              key={code}
              onClick={() => setStepFilter(code)}
              className={`flex-shrink-0 w-48 p-4 rounded-3xl border transition-all text-left relative overflow-hidden group ${
                stepFilter === code
                ? "bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              {stepFilter === code && (
                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              )}
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">
                {data.display}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white font-mono">{data.count}</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">TA</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                <p className="text-[9px] font-black text-amber-500/80 uppercase">
                  {data.total_available} dona mavjud
                </p>
              </div>
            </button>
          ))}
          {Object.keys(stepStats).length === 0 && (
            <div className="w-full py-8 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Hozircha hech qanday etapda vazifa yo'q</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
      {/* ACTIVE PRODUCTION - LEFT (Span 7) */}
      <div className="col-span-7 space-y-6">
        <Card className="border border-indigo-500/30 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.1)]">
          <CardHeader className="bg-indigo-600/10 border-b border-indigo-500/20 py-6 px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                  <Zap size={20} className="animate-pulse" />
                </div>
                <div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">FAOL VAZIFA</h3>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Bajirilayotgan jarayon</p>
                </div>
              </div>
              {activeStep && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase px-3 py-1 rounded-lg">
                  JARAYONDA
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {activeStep ? (
              <div className="space-y-8">
                {/* Order Details */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">#{activeStep.order_number}</h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{activeStep.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ish bosqichi</p>
                    <Badge variant="outline" className="mt-1 border-slate-700 text-slate-300 font-black text-[11px] uppercase px-4 py-1.5 rounded-xl bg-slate-800">
                      {activeStep.step}
                    </Badge>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-5 gap-3">
                   <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-3xl text-center">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">JAMI</p>
                     <p className="text-xl font-black font-mono text-white">{activeStep.input_qty}</p>
                   </div>
                   <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-center">
                     <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">BAJARILDI</p>
                     <p className="text-xl font-black font-mono text-emerald-400">{activeStep.produced_qty || 0}</p>
                   </div>
                   <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-center">
                     <p className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest mb-1">BRAK</p>
                     <p className="text-xl font-black font-mono text-rose-500">{activeStep.defect_qty || 0}</p>
                   </div>
                   <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-3xl text-center">
                     <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-1">MAVJUD</p>
                     <p className="text-xl font-black font-mono text-amber-400">
                        {activeStep.available_qty || 0}
                     </p>
                   </div>
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl text-center">
                      <p className="text-[8px] font-black text-indigo-400/60 uppercase tracking-widest mb-1">QOLGAN</p>
                      <p className="text-xl font-black font-mono text-indigo-400">
                         {Math.max(0, activeStep.input_qty - (activeStep.produced_qty || 0))}
                      </p>
                    </div>
                </div>

                {/* Input Controls */}
                <div className="space-y-6 pt-4 border-t border-slate-800/50">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bajarildi (dona)</Label>
                         <Input 
                           type="number" 
                           placeholder="0"
                           className="h-14 bg-slate-950 border-slate-800 rounded-2xl text-xl font-black font-mono focus:ring-indigo-500/20"
                           value={produced}
                           onChange={e => setProduced(e.target.value)}
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Brak (nuqson)</Label>
                         <Input 
                           type="number" 
                           placeholder="0"
                           className="h-14 bg-slate-950 border-slate-800 rounded-2xl text-xl font-black font-mono focus:ring-rose-500/20 text-rose-500"
                           value={defects}
                           onChange={e => setDefects(e.target.value)}
                         />
                      </div>
                   </div>
                   
                   <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-14 rounded-2xl border-slate-800 bg-slate-900 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:bg-slate-800"
                        onClick={() => setIsRequisitionOpen(true)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Material Olish
                      </Button>
                       <Button 
                        className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all border-none"
                        onClick={handleReport}
                        disabled={submitting}
                      >
                        {submitting ? "SAQLANMOQDA..." : "SAQLASH"}
                      </Button>
                      <Button 
                        className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all border-none"
                        onClick={handleComplete}
                        disabled={submitting}
                      >
                        {submitting ? "..." : "TAMOMLASH"}
                      </Button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                   <ClipboardList size={32} className="text-slate-700" />
                </div>
                <h4 className="text-lg font-black text-slate-600 uppercase tracking-tight">Vazifa tanlanmagan</h4>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2 px-12">
                  Ishni boshlash uchun o&apos;ng tarafdagi kutilayotgan vazifalardan birini tanlang
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RECENT LOGS - SMALL */}
        <div className="grid grid-cols-2 gap-6">
            <Card className="border border-slate-800 bg-slate-900/40 rounded-[2rem] overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <History size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bugungi unumdorlik</p>
                    <p className="text-xl font-black text-white font-mono">{dailyStats.produced.toLocaleString()} <span className="text-[9px] text-slate-600">dona</span></p>
                 </div>
              </CardContent>
           </Card>
           <Card className="border border-slate-800 bg-slate-900/40 rounded-[2rem] overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bugungi brak</p>
                    <p className="text-xl font-black text-rose-500 font-mono text-right">{dailyStats.defects.toLocaleString()} <span className="text-[9px] text-rose-500/40">dona</span></p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* AVAILABLE ORDERS - RIGHT (Span 5) */}
      <div className="col-span-5">
        <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem] h-full flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-6 px-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 shadow-inner">
                <ClipboardList size={20} />
              </div>
              <div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">ADMIN BERGAN VAZIFA</h3>
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Navbatdagi vazifalar</p>
              </div>
            </div>
            <Badge className="bg-slate-800 text-slate-500 border border-slate-700 font-black text-[10px] px-2.5 py-1 rounded-lg">
              {availableOrders.length} TA
            </Badge>
          </CardHeader>
          <CardContent className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Step Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800/50 pb-4">
              {uniqueSteps.map(step => (
                <button
                  key={step}
                  onClick={() => setStepFilter(step)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                    stepFilter === step
                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                    : "bg-slate-800/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {step === "ALL" ? "BARCHASI" : (stepStats[step]?.display || step)}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => (
                <div key={idx} className="p-5 rounded-2.5xl bg-slate-800/30 border border-slate-800 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <h4 className="text-lg font-black text-white tracking-tighter uppercase group-hover:text-indigo-400 transition-colors">#{order.order_number}</h4>
                         <Badge variant="outline" className="border-slate-700 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                           {order.step}
                         </Badge>
                       </div>
                        <div className="flex items-center gap-4">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{order.client_name}</p>
                           <div className="w-1 h-1 rounded-full bg-slate-700" />
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter italic">{order.input_qty} dona</p>
                           {order.available_qty !== undefined && (
                             <>
                               <div className="w-1 h-1 rounded-full bg-slate-700" />
                               <p className="text-[10px] font-black text-amber-500 uppercase tracking-tighter italic">Mavjud: {order.available_qty}</p>
                             </>
                           )}
                        </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleStart(order.id)}
                      disabled={!!activeStep}
                      className={`rounded-xl h-10 px-5 font-black text-[10px] uppercase tracking-widest transition-all ${
                        activeStep 
                        ? "bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed" 
                        : "bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white"
                      }`}
                    >
                      BOSHLASH
                      <ArrowRight className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              )) : (
                 <div className="py-24 text-center opacity-40">
                    <Info size={40} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {searchQuery || stepFilter !== "ALL" ? "Filterga mos buyurtmalar topilmadi" : "Hozircha bo'sh buyurtmalar yo'q"}
                    </p>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Material Requisition Modal - DARK */}
      <Dialog open={isRequisitionOpen} onOpenChange={setIsRequisitionOpen}>
        <DialogContent className="sm:max-w-md border-slate-800 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden p-0">
          <DialogHeader className="bg-slate-900 p-6 border-b border-slate-800">
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-white italic">Ombordan Materialni Olish</DialogTitle>
            <DialogDescription className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              Material miqdorini kiriting va tasdiqlang
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
             <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Materialni tanlang</Label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="Material..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {materials.map(m => (
                      <SelectItem key={m.id} value={m.id} className="text-white uppercase font-black text-[10px] py-3 focus:bg-slate-800">
                        {m.name} ({m.current_stock} {m.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Miqdori (kerakli)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-xl font-black font-mono text-white"
                  value={reqQuantity}
                  onChange={e => setReqQuantity(e.target.value)}
                />
             </div>
             
             <div className={`p-4 border rounded-2xl flex items-start gap-3 transition-colors ${
                selectedMaterial && materials.find(m => m.id === selectedMaterial)?.current_stock < parseFloat(reqQuantity || "0")
                ? "bg-red-500/10 border-red-500/50"
                : "bg-indigo-600/5 border-indigo-500/20"
             }`}>
                {selectedMaterial && materials.find(m => m.id === selectedMaterial)?.current_stock < parseFloat(reqQuantity || "0") ? (
                   <AlertCircle size={16} className="text-red-500 mt-0.5" />
                ) : (
                   <Info size={16} className="text-indigo-400 mt-0.5" />
                )}
                <p className={`text-[9px] font-black uppercase leading-relaxed ${
                   selectedMaterial && materials.find(m => m.id === selectedMaterial)?.current_stock < parseFloat(reqQuantity || "0")
                   ? "text-red-400"
                   : "text-slate-400"
                }`}>
                  {selectedMaterial && materials.find(m => m.id === selectedMaterial)?.current_stock < parseFloat(reqQuantity || "0") 
                  ? "Xatolik: Omborda yetarli material mavjud emas! Qizil bilan belgilangan miqdorni kamaytiring yoki admin bilan bog'laning."
                  : "Materialni olganingizda u zaxiradan darhol chegiriladi. Admin barcha operatsiyalarni ko'rib boradi."}
                </p>
             </div>
          </div>
          <DialogFooter className="bg-slate-900 p-6 border-t border-slate-800 gap-3">
            <Button variant="ghost" className="h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-white/5" onClick={() => setIsRequisitionOpen(false)}>Bekor qilish</Button>
            <Button 
                className={`h-12 px-10 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-none ${
                   selectedMaterial && materials.find(m => m.id === selectedMaterial)?.current_stock < parseFloat(reqQuantity || "0")
                   ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                   : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
                }`}
                onClick={handleRequestMaterial}
                disabled={reqLoading || (selectedMaterial && materials.find(m => m.id === selectedMaterial)?.current_stock < parseFloat(reqQuantity || "0"))}
            >
                {reqLoading ? "OLINMOQDA..." : "TASDIQLASH VA OLISH"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
