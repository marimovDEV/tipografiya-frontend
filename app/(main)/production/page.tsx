"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, Clock, Package, Layers, 
  CheckCircle2, AlertCircle, ChevronRight, 
  Search, Activity, User, ArrowRight,
  ChevronDown, ChevronUp, History, Info, Zap
} from "lucide-react"
import Link from "next/link"
import { Order, ProductionStepItem } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

const STEP_LABELS: Record<string, string> = {
  queue: "Navbat",
  prepress: "Pre-press",
  printing: "Chop",
  drying: "Quritish",
  lamination: "Laminatsiya",
  cutting: "Kesish",
  die_cutting: "Shtans",
  gluing: "Yelim",
  qc: "Sifat Nazorat",
  packaging: "Qadoq",
  ready: "Sklad",
  dispatch: "Yuklash",
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
    case 'in_progress': return 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)] animate-pulse'
    case 'problem': return 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.3)]'
    default: return 'bg-slate-800 text-slate-400'
  }
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchProductionOrders()
    const interval = setInterval(fetchProductionOrders, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchProductionOrders = async () => {
    try {
      const response = await fetchWithAuth("/api/orders/")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      const allOrders: Order[] = data.results || data
      const productionOrders = allOrders.filter((order) =>
        ["pending", "approved", "in_production", "ready"].includes(order.status)
      )
      setOrders(productionOrders)
    } catch (error) {
      console.error("Error fetching production orders:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const toggleOrder = (id: string | number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.box_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && orders.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full animate-pulse" />
        <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
        <Zap className="absolute inset-0 m-auto text-primary w-8 h-8" />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Zavod ma'lumotlari yuklanmoqda...</p>
    </div>
  )

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
            <span className="text-primary italic">ZAVOD</span> MONITORING
            <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[10px] h-6 px-3 ml-2">LIVE DATA</Badge>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <Activity className="w-3 h-3 text-primary" /> Ishlab chiqarish jarayonlari nazorat paneli
          </p>
        </div>
        <div className="relative group w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="BUYURTMA NOMERI YOKI MIJOZNI QIDIRING..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-slate-900/40 border border-slate-800 rounded-2xl pl-12 pr-4 text-[11px] font-black uppercase text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-slate-900 rounded-[40px] bg-slate-950/20">
            <Layers className="h-16 w-16 mx-auto mb-6 text-slate-800 opacity-50" />
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.4em]">Hozircha faol buyurtmalar mavjud emas</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="bg-slate-900/40 border-slate-800 rounded-[35px] overflow-hidden group hover:border-slate-700/50 transition-all duration-500 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Order Header */}
                <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/[0.03] bg-gradient-to-r from-slate-900 to-slate-900/0">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-[12px] font-black bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full tracking-wider uppercase italic">#{order.order_number?.split('-').pop()}</span>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight italic">{order.box_type || "Kitob"}</h3>
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-600" /> {order.client?.full_name}
                       </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex flex-col items-center px-6">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Umumiy Miqdor</p>
                       <p className="text-lg font-black text-primary italic uppercase tracking-tighter">{order.quantity?.toLocaleString() || 0} <span className="text-[10px] font-bold opacity-50 not-italic ml-1">DONA</span></p>
                    </div>
                    <div className="h-12 w-px bg-slate-800 opacity-50" />
                    <div className="flex flex-col items-center px-6">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Muddati</p>
                       <p className={`text-lg font-black italic tracking-tighter ${new Date(order.deadline!) < new Date() ? 'text-rose-500' : 'text-slate-300'}`}>
                          {order.deadline ? format(new Date(order.deadline), "dd.MM.yyyy") : "—"}
                       </p>
                    </div>
                    <div className="h-12 w-px bg-slate-800 opacity-50" />
                    <div className="flex flex-col items-end min-w-[140px]">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                          <span className="text-2xl font-black text-white italic">{order.overall_progress || 0}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/[0.03]">
                          <div 
                            className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000" 
                            style={{ width: `${order.overall_progress || 0}%` }} 
                          />
                       </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleOrder(order.id)}
                      className="ml-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800 text-slate-400"
                    >
                      {expandedOrders[order.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>                {/* Expanded Details - Simplified for Results */}
                {expandedOrders[order.id] && (
                  <div className="p-8 lg:p-12 bg-black/20 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* Left: Overall Health & Stats */}
                      <div className="space-y-8">
                         <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                               <Activity className="w-3 h-3 text-primary" /> UMUMIY NATIJA
                            </h4>
                            <div className="bg-slate-900/40 rounded-[2.5rem] p-8 border border-slate-800/50 relative overflow-hidden group/stats">
                               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/stats:opacity-10 transition-opacity">
                                  <Zap className="w-32 h-32 text-primary" />
                               </div>
                               <div className="relative z-10">
                                  <p className="text-6xl font-black text-white italic tracking-tighter mb-2">{order.overall_progress || 0}%</p>
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">BUYURTMANING TO'LIQ BITISH KO'RSATKICHI</p>
                                  
                                  <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 mb-8">
                                     <div 
                                       className="h-full bg-gradient-to-r from-primary to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                                       style={{ width: `${order.overall_progress || 0}%` }} 
                                     />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Buyurtma Miqdori</p>
                                        <p className="text-xl font-black text-white italic">{order.quantity?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic">DONA</span></p>
                                     </div>
                                     <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">O'rtacha Tezlik</p>
                                        <p className="text-xl font-black text-emerald-500 italic">+{Math.round((order.overall_progress || 0) * 0.8)} <span className="text-[10px] opacity-30 not-italic">P/H</span></p>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Right: Worker Contribution (The Main Focus) */}
                      <div className="space-y-8">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <User className="w-3 h-3 text-amber-500" /> ISHCHILAR HISSOBOTI (% ULUSH)
                         </h4>
                         
                         <div className="space-y-4">
                            {(() => {
                              const totalPossibleWork = (order.quantity || 1) * (order.production_steps?.length || 1);
                              const workerLogs = order.production_steps?.flatMap(s => s.production_logs || []) || [];
                              const contributions = workerLogs.reduce((acc, log) => {
                                if (!acc[log.worker_name]) acc[log.worker_name] = 0;
                                acc[log.worker_name] += (log.produced_qty || 0);
                                return acc;
                              }, {} as Record<string, number>);

                              const sortedWorkers = Object.entries(contributions).sort((a,b) => b[1] - a[1]);

                              if (sortedWorkers.length === 0) {
                                return (
                                  <div className="py-20 text-center bg-slate-900/20 rounded-[2.5rem] border border-slate-800/50 border-dashed">
                                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic">Hozircha ishchilar faoliyati qayd etilmagan</p>
                                  </div>
                                )
                              }

                              return sortedWorkers.map(([name, qty]) => {
                                const percentage = Math.round((qty / totalPossibleWork) * 100);
                                return (
                                  <div key={name} className="group/worker bg-slate-900/40 border border-slate-800/50 p-6 rounded-[2rem] hover:border-primary/30 transition-all hover:bg-slate-900/60">
                                     <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                           <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5 text-primary group-hover/worker:scale-110 transition-transform">
                                              <User className="w-6 h-6" />
                                           </div>
                                           <div>
                                              <p className="text-sm font-black text-white uppercase italic tracking-tight group-hover/worker:text-primary transition-colors">{name}</p>
                                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ishlab chiqargan miqdor</p>
                                           </div>
                                        </div>
                                        <div className="text-right">
                                           <p className="text-2xl font-black text-white italic tracking-tighter">{percentage}%</p>
                                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Buyurtmadagi ulushi</p>
                                        </div>
                                     </div>
                                     
                                     <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                           <div 
                                             className="h-full bg-primary transition-all duration-1000" 
                                             style={{ width: `${percentage}%` }} 
                                           />
                                        </div>
                                        <div className="flex justify-between items-center">
                                           <p className="text-[10px] font-black text-slate-600 uppercase italic">Progress</p>
                                           <p className="text-[10px] font-black text-slate-200 uppercase italic tracking-tighter">{qty.toLocaleString()} / {totalPossibleWork.toLocaleString()} <span className="opacity-30 text-[8px] not-italic ml-1">WORK-UNITS</span></p>
                                        </div>
                                     </div>
                                  </div>
                                )
                              });
                            })()}
                         </div>
                      </div>
                    </div>

                    {/* Compact Recent Logs - Just for context */}
                    <div className="mt-12 pt-12 border-t border-white/5">
                        <div className="flex items-center justify-between mb-6">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                              <History className="w-3 h-3 text-slate-600" /> SO'NGGI HARAKATLAR
                           </h4>
                           <Link href={`/orders/${order.id}`}>
                              <Button variant="ghost" className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest">Batafsil ma'lumot <ChevronRight className="w-3 h-3 ml-1" /></Button>
                           </Link>
                        </div>
                        <div className="flex flex-wrap gap-4">
                           {order.production_steps?.flatMap(s => s.production_logs || []).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4).map((log) => (
                             <div key={log.id} className="bg-slate-900/40 border border-slate-800/50 px-4 py-2 rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="text-[10px] font-black text-slate-300 uppercase italic">{log.worker_name}</span>
                                <span className="text-[10px] font-black text-primary uppercase">+{log.produced_qty}</span>
                                <span className="text-[9px] font-black text-slate-600 uppercase tabular-nums">{format(new Date(log.created_at), "HH:mm")}</span>
                             </div>
                           ))}
                        </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
