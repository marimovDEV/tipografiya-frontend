"use client"

import { useState, useEffect } from "react"
import { Sparkline } from "@/components/ui/sparkline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchWithAuth } from "@/lib/api-client"
import { useUserMode } from "@/hooks/useUserMode"
import { useRole } from "@/lib/context/role-context"
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  ArrowRight, DollarSign, Package, CheckCircle, Clock, ChevronRight,
  Factory, Activity, ShoppingCart, TrendingUp, TrendingDown, Wallet, Plus, Users, AlertCircle,
  Zap, ArrowUpRight, ArrowDownRight, CircleDollarSign, Filter, Settings2, BarChart3, Binary, ShieldCheck, Search
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts'
import { getMonthlyPlan, updateMonthlyPlan, MonthlyPlan } from "@/lib/api/finance"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { format } from "date-fns"
import WorkerProductionPanel from "@/components/production/WorkerProductionPanel"
import { ClientFormModal } from "@/components/clients/ClientFormModal"

const CATEGORIES = {
  income: [
    { value: "Buyurtma to'lovi", label: "Buyurtma to'lovi" },
    { value: "Boshqa", label: "Boshqa foyda" }
  ],
  expense: [
    { value: "Ish haq", label: "Ish haqi (Salary)" },
    { value: "Material", label: "Material sotib olish" },
    { value: "Ijara", label: "Ijara" },
    { value: "Kommunal", label: "Kommunal to'lovlar" },
    { value: "Solig'", label: "Soliqlar" },
    { value: "Boshqa", label: "Boshqa harajat" }
  ]
}

export default function DashboardPage() {
  const { isAdmin } = useUserMode()
  const { currentRole } = useRole()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null)
  const [workers, setWorkers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Edit modal state
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false)
  const [newPlanAmount, setNewPlanAmount] = useState("")
  const [submittingPlan, setSubmittingPlan] = useState(false)

  // Transaction modal state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [transactionFormData, setTransactionFormData] = useState({
    type: "expense",
    amount: "",
    category: "Boshqa",
    worker: "",
    client: "",
    payment_method: "cash",
    description: "",
    date: format(new Date(), "yyyy-MM-dd")
  })
  const [submittingTransaction, setSubmittingTransaction] = useState(false)
  const [isDebtPaymentFlow, setIsDebtPaymentFlow] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchWorkers()
    fetchClients()
    
    // Live clock update
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetchWithAuth("/api/customers/")
      if (res.ok) {
        const result = await res.json()
        setClients(Array.isArray(result) ? result : (result.results || []))
      }
    } catch (e) {
      console.error("Fetch clients error:", e)
    }
  }

  const fetchWorkers = async () => {
    try {
      const res = await fetchWithAuth("/api/users/stats/")
      if (res.ok) setWorkers(await res.json())
    } catch (e) {
      console.error("Fetch workers error:", e)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetchWithAuth("/api/dashboard/")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
      if (currentRole === 'admin') {
        const plan = await getMonthlyPlan()
        setMonthlyPlan(plan)
        setNewPlanAmount(plan.plan_amount.toString())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transactionFormData.amount || !transactionFormData.category) {
      toast.error("Summa va kategoriyani kiritish majburiy")
      return
    }

    try {
      const amount = parseFloat(transactionFormData.amount)
      
      // Validation: Payment should not exceed debt in Debt Payment Flow
      if (isDebtPaymentFlow && transactionFormData.client) {
        const client = clients.find(c => c.id.toString() === transactionFormData.client)
        if (client) {
          const debt = Math.abs(parseFloat(client.balance || "0"))
          if (amount > debt) {
            toast.error(`To'lov summasi qarzdan (${debt.toLocaleString()} UZS) oshib ketishi mumkin emas`)
            return
          }
        }
      }

      setSubmittingTransaction(true)
      const res = await fetchWithAuth("/api/transactions/", {
        method: "POST",
        body: JSON.stringify({
          type: transactionFormData.type,
          amount: parseFloat(transactionFormData.amount),
          category: transactionFormData.category,
          worker: transactionFormData.category === "Ish haq" ? transactionFormData.worker : null,
          client: transactionFormData.category === "Buyurtma to'lovi" ? transactionFormData.client : null,
          payment_method: transactionFormData.payment_method,
          description: transactionFormData.description,
          date: transactionFormData.date
        })
      })

      if (res.ok) {
        toast.success(isDebtPaymentFlow ? "Qarz to'lovi muvaffaqiyatli saqlandi" : "Amaliyot muvaffaqiyatli saqlandi")
        setIsTransactionModalOpen(false)
        setTransactionFormData({
          type: "expense",
          amount: "",
          category: "Boshqa",
          worker: "",
          client: "",
          payment_method: "cash",
          description: "",
          date: format(new Date(), "yyyy-MM-dd")
        })
        fetchDashboardData() // Refresh dashboard stats
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Submit transaction error:", error)
      toast.error("Tizimda xatolik")
    } finally {
      setSubmittingTransaction(false)
    }
  }

  const handleUpdatePlan = async () => {
    try {
      setSubmittingPlan(true)
      const amount = parseFloat(newPlanAmount)
      if (isNaN(amount)) throw new Error("Noto'g'ri summa kiritildi")
      
      await updateMonthlyPlan(amount)
      toast.success("Oylik reja muvaffaqiyatli yangilandi!")
      setIsEditPlanOpen(false)
      const plan = await getMonthlyPlan()
      setMonthlyPlan(plan)
    } catch (e: any) {
      toast.error(e.message || "Xatolik yuz berdi")
    } finally {
      setSubmittingPlan(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TIZIM TERMINALI YUKLANMOQDA...</p>
    </div>
  )
  if (!data) return null

  const { stats, production_stages, alerts, active_workers, top_worker, chart_data, task_stats } = data

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Space - DARK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">Boshqaruv Markazi</h1>
            <Badge className="bg-primary/20 text-primary border border-primary/30 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg shadow-primary/10">FAOL MONITORING</Badge>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
            <Binary className="w-3.5 h-3.5 text-primary/40" />
            Terminal: ERP-DASH-X10 • <span className="hidden sm:inline">Session:</span> {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-2xl border-slate-800 bg-slate-900/50 backdrop-blur-sm font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-5 shadow-sm transition-all ${showFilters ? 'text-primary border-primary/50 bg-primary/10' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'YOPISH' : 'FILTERLAR'}
          </Button>
          <Link href="/orders/new">
            <Button className="bg-primary text-white hover:opacity-90 rounded-2xl h-11 px-8 font-black text-[10px] uppercase tracking-[0.15em] shadow-[0_8px_30px_-6px_rgba(79,70,229,0.5)] transition-all">
              [ + ] YANGI BUYURTMA
            </Button>
          </Link>
        </div>
        </div>

      {/* SEARCH BAR - DARK */}
      {showFilters && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="BUYURTMA RAQAMI YOKI MIJOZ ISMI BO'YICHA QIDIRISH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 bg-slate-900/40 border-slate-800 rounded-2xl pl-14 font-black text-[11px] tracking-widest text-white focus-visible:ring-primary/20 placeholder:text-slate-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <Badge variant="outline" className="text-[8px] border-slate-700 hover:border-slate-500">TOZALASH</Badge>
              </button>
            )}
          </div>
        </div>
      )}

      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent className="sm:max-w-[550px] border-slate-800 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden p-0">
          <form onSubmit={handleTransactionSubmit}>
            <DialogHeader className="bg-slate-900 p-8 border-b border-slate-800">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white italic">
                {isDebtPaymentFlow ? "Qarzni Qabul Qilish" : "Pul Oqimi Qo'shish"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                {isDebtPaymentFlow ? "Mijozdan to'lovni qabul qiling va hisobga oling." : "Kirim yoki chiqim amaliyotini ro'yxatga oling."}
              </DialogDescription>
            </DialogHeader>
            
            <div className={`grid gap-6 p-8 overflow-y-auto max-h-[70vh] ${isDebtPaymentFlow ? 'bg-slate-950/50' : ''}`}>
              {/* General Type Toggle (Hidden in Debt Flow) */}
              {!isDebtPaymentFlow && (
                <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setTransactionFormData({...transactionFormData, type: 'income', category: CATEGORIES.income[0].value})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${transactionFormData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Kirim
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTransactionFormData({...transactionFormData, type: 'expense', category: CATEGORIES.expense[0].value})}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${transactionFormData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Chiqim
                  </button>
                </div>
              )}

              {/* Step 1: Client Selection (Top Priority in Debt Flow) */}
              {(isDebtPaymentFlow || transactionFormData.category === "Buyurtma to'lovi") && (
                <div className="space-y-4 animate-in slide-in-from-top duration-500">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {isDebtPaymentFlow ? "1. Mijozni Tanlang" : "Mijoz (Qarz To'lovchi)"}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={transactionFormData.client} 
                        onValueChange={v => setTransactionFormData({...transactionFormData, client: v})}
                      >
                        <SelectTrigger className="h-16 bg-slate-900 border-slate-800 rounded-2xl text-white px-6 text-lg font-bold ring-offset-slate-950 focus:ring-primary/20 flex-1">
                          <SelectValue placeholder="Mijozni qidirish..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white max-h-[300px]">
                          {(() => {
                            const debtors = clients.filter(c => parseFloat(c.balance) < 0);
                            const list = (isDebtPaymentFlow && debtors.length > 0) ? debtors : clients;
                            return list.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()} className="focus:bg-slate-900 font-bold py-4">
                                <div className="flex flex-col">
                                  <span>{c.full_name}</span>
                                  {parseFloat(c.balance) < 0 && (
                                    <span className="text-[10px] text-rose-500 font-black">
                                      Qarz: {Math.abs(parseFloat(c.balance)).toLocaleString()} UZS
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ));
                          })()}
                          {clients.length === 0 && (
                            <div className="p-4 text-center text-slate-500 text-xs font-black uppercase">
                              Mijozlar topilmadi
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button"
                        onClick={() => setIsClientModalOpen(true)}
                        className="h-16 w-16 bg-slate-900 border-slate-800 rounded-2xl flex items-center justify-center text-primary hover:bg-slate-800"
                        title="Yangi mijoz"
                      >
                        <Plus size={24} />
                      </Button>
                    </div>
                  </div>

                  {isDebtPaymentFlow && transactionFormData.client && (
                    <div className="grid grid-cols-3 gap-4 animate-in zoom-in-95 duration-500">
                      {[
                        { label: 'Umumiy qarz', val: Math.abs(clients.find(c => c.id.toString() === transactionFormData.client)?.total_orders || 0), color: 'slate' },
                        { label: 'To\'langan', val: clients.find(c => c.id.toString() === transactionFormData.client)?.total_paid || 0, color: 'emerald' },
                        { label: 'Qolgan qarz', val: Math.abs(clients.find(c => c.id.toString() === transactionFormData.client)?.balance || 0), color: 'rose', active: true },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-2xl border transition-all ${stat.active ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
                          <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${stat.active ? 'text-rose-500' : 'text-slate-500'}`}>{stat.label}</p>
                          <p className="text-sm font-black text-white italic truncate">{stat.val.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment Amount */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {isDebtPaymentFlow ? "2. To'lov Summasi (UZS)" : "Summa (UZS)"}
                  </Label>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      className="h-20 bg-slate-900 border-slate-800 rounded-2xl focus-visible:ring-primary/20 text-3xl font-black text-white px-8 transition-all group-focus-within:border-primary/50"
                      value={transactionFormData.amount}
                      max={isDebtPaymentFlow && transactionFormData.client ? Math.abs(parseFloat(clients.find(c => c.id.toString() === transactionFormData.client)?.balance || "0")) : undefined}
                      onChange={e => {
                        let val = e.target.value;
                        if (isDebtPaymentFlow && transactionFormData.client && val) {
                          const debt = Math.abs(parseFloat(clients.find(c => c.id.toString() === transactionFormData.client)?.balance || "0"));
                          if (parseFloat(val) > debt) {
                            val = debt.toString();
                          }
                        }
                        setTransactionFormData({...transactionFormData, amount: val});
                      }}
                      required
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">UZS</span>
                    </div>
                  </div>
                </div>

                {isDebtPaymentFlow && transactionFormData.client && (
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:text-primary font-black text-[10px] uppercase tracking-wider"
                      onClick={() => {
                        const debt = Math.abs(clients.find(c => c.id.toString() === transactionFormData.client)?.balance || 0);
                        setTransactionFormData({...transactionFormData, amount: (debt / 2).toString()});
                      }}
                    >
                      50% To'lash
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-slate-800 bg-slate-900/50 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 font-black text-[10px] uppercase tracking-wider transition-all"
                      onClick={() => {
                        const debt = Math.abs(clients.find(c => c.id.toString() === transactionFormData.client)?.balance || 0);
                        setTransactionFormData({...transactionFormData, amount: debt.toString()});
                      }}
                    >
                      To'liq yopish
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 3: Logistics (Method, Date, Note) */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">To'lov Turi</Label>
                  <Select 
                    value={transactionFormData.payment_method} 
                    onValueChange={v => setTransactionFormData({...transactionFormData, payment_method: v})}
                  >
                    <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-white px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="cash" className="focus:bg-slate-900 font-black text-[10px] uppercase tracking-wider py-3">Naqd</SelectItem>
                      <SelectItem value="card" className="focus:bg-slate-900 font-black text-[10px] uppercase tracking-wider py-3">Plastik karta</SelectItem>
                      <SelectItem value="bank" className="focus:bg-slate-900 font-black text-[10px] uppercase tracking-wider py-3">Bank o'tkazma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sana</Label>
                  <Input 
                    type="date" 
                    className="h-14 bg-slate-900 border-slate-800 rounded-2xl focus-visible:ring-primary/20 font-mono text-white px-6"
                    value={transactionFormData.date}
                    onChange={e => setTransactionFormData({...transactionFormData, date: e.target.value})}
                  />
                </div>
              </div>

              {!isDebtPaymentFlow && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Turkum (Kategoriya)</Label>
                  <Select 
                    value={transactionFormData.category} 
                    onValueChange={v => setTransactionFormData({...transactionFormData, category: v})}
                  >
                    <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-white px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {(transactionFormData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="focus:bg-slate-900 font-black text-[10px] uppercase tracking-wider py-3">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {transactionFormData.category === "Ish haq" && !isDebtPaymentFlow && (
                <div className="space-y-2 animate-in slide-in-from-right duration-300">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Xodim</Label>
                  <Select 
                    value={transactionFormData.worker} 
                    onValueChange={v => setTransactionFormData({...transactionFormData, worker: v})}
                  >
                    <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-white px-6">
                      <SelectValue placeholder="Xodimni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {workers.map(w => (
                        <SelectItem key={w.id} value={w.id} className="focus:bg-slate-900 font-black text-[10px] uppercase py-3">
                          {w.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Izoh (Tavsif)</Label>
                <Input 
                  placeholder="Qisqacha izoh kiriting..."
                  className="h-14 bg-slate-900 border-slate-800 rounded-2xl focus-visible:ring-primary/20 text-white px-6"
                  value={transactionFormData.description}
                  onChange={e => setTransactionFormData({...transactionFormData, description: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter className="bg-slate-900 p-8 border-t border-slate-800 gap-4">
              <Button 
                variant="ghost" 
                type="button"
                className="h-12 rounded-xl text-[11px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-white/5" 
                onClick={() => setIsTransactionModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button 
                type="submit"
                disabled={submittingTransaction}
                className="bg-primary text-white h-12 px-10 rounded-xl font-black text-[11px] uppercase tracking-widest border-none shadow-lg shadow-primary/20"
              >
                {submittingTransaction ? 'SAQLANMOQDA...' : 'SAQLASH'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Conditionally Render Worker Panel or Admin Stats */}
      {!isAdmin ? (
        <WorkerProductionPanel searchQuery={searchQuery} />
      ) : (
        <>
      {/* Quick Actions - NEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: 'Yangi Buyurtma', href: '/orders/new', icon: ShoppingCart, color: 'primary' },
          { label: 'Yangi Mijoz', onClick: () => setIsClientModalOpen(true), icon: Users, color: 'emerald' },
          { label: 'Yangi Operatsiya', onClick: () => {
            setIsDebtPaymentFlow(false)
            setTransactionFormData({...transactionFormData, type: 'income', category: CATEGORIES.income[0].value})
            setIsTransactionModalOpen(true)
          }, icon: DollarSign, color: 'blue' },
          { label: 'Xarajat Qo\'shish', onClick: () => {
             setIsDebtPaymentFlow(false)
             setTransactionFormData({...transactionFormData, type: 'expense', category: CATEGORIES.expense[0].value})
             setIsTransactionModalOpen(true)
          }, icon: TrendingDown, color: 'rose' },
          { label: 'Qarz To\'lash', onClick: () => {
             setIsDebtPaymentFlow(true)
             setTransactionFormData({...transactionFormData, type: 'income', category: 'Buyurtma to\'lovi'})
             setIsTransactionModalOpen(true)
          }, icon: Wallet, color: 'emerald' },
        ].map((action, i) => (
          action.href ? (
            <Link key={i} href={action.href}>
              <Button className={`w-full h-16 bg-slate-900/40 border-slate-800 hover:border-${action.color}-500/50 rounded-2xl flex items-center justify-start gap-4 px-6 group transition-all`}>
                <div className={`p-2 rounded-xl bg-${action.color}-500/10 text-${action.color}-500 group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
              </Button>
            </Link>
          ) : (
            <Button key={i} onClick={action.onClick} className={`w-full h-16 bg-slate-900/40 border-slate-800 hover:border-${action.color}-500/50 rounded-2xl flex items-center justify-start gap-4 px-6 group transition-all`}>
              <div className={`p-2 rounded-xl bg-${action.color}-500/10 text-${action.color}-500 group-hover:scale-110 transition-transform`}>
                <action.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
            </Button>
          )
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Financial & Production KPIs */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          {/* Moliya KPI - NEW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <Card className="bg-slate-900/40 border-slate-800 rounded-[2rem] p-6 hover:border-primary/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-20 h-20 text-white" />
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">BUGUNGI DAROMAD</p>
                <h4 className="text-2xl font-black text-white italic tracking-tighter">{stats.today_income?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic">UZS</span></h4>
                <div className="mt-4 flex items-center gap-2">
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] px-1.5 h-4 font-black">ACTIVE</Badge>
                </div>
             </Card>
             <Card className="bg-slate-900/40 border-slate-800 rounded-[2rem] p-6 hover:border-rose-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-20 h-20 text-white" />
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">BUGUNGI XARAJAT</p>
                <h4 className="text-2xl font-black text-rose-400 italic tracking-tighter">{stats.today_expense?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic">UZS</span></h4>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 w-1/3" />
                   </div>
                </div>
             </Card>
             <Card className="bg-slate-950/60 border-primary/20 rounded-[2rem] p-6 group relative overflow-hidden shadow-[0_15px_40px_rgba(79,70,229,0.15)]">
                <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
                  <DollarSign className="w-20 h-20 text-white" />
                </div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">SOF FOYDA</p>
                <h4 className="text-2xl font-black text-white italic tracking-tighter">{(stats.today_income - stats.today_expense)?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic">UZS</span></h4>
                <div className="mt-4">
                   <Sparkline data={[10, 40, 30, 50, 40, 60, 80]} className="h-4 text-primary" />
                </div>
             </Card>
          </div>

          {/* Buyurtmalar KPI - NEW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Faol buyurtmalar</p>
                   <h4 className="text-3xl font-black text-white italic">{stats.active_orders}</h4>
                </div>
                <div className="mt-4 flex gap-1">
                   {Array.from({length: 8}).map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < stats.active_orders ? 'bg-primary' : 'bg-slate-800'}`} />)}
                </div>
             </div>
             <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Jarayonda</p>
                   <h4 className="text-3xl font-black text-amber-500 italic">{production_stages.printing || 0}</h4>
                </div>
                <p className="text-[8px] font-black text-slate-600 uppercase mt-2">Chop etish va ishlov berishda</p>
             </div>
             <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tugallangan (Bugun)</p>
                   <h4 className="text-3xl font-black text-emerald-500 italic">{stats.today_orders}</h4>
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Yetkazib berishga tayyor</p>
                </div>
             </div>
          </div>

          {/* Ishlab chiqarish KPI - NEW */}
          <Card className="bg-slate-900/40 border-slate-800 rounded-[2.5rem] p-6 sm:p-8 relative group overflow-hidden">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bugungi ishlab chiqarish</p>
                   <h4 className="text-4xl font-black text-white italic tracking-tighter">{stats.today_produced_qty?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic">DONA</span></h4>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brak (Zarar)</p>
                   <h4 className="text-4xl font-black text-rose-500 italic tracking-tighter">{stats.today_defect_qty?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic">DONA</span></h4>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Samaradorlik</p>
                   <div className="flex items-center gap-3">
                      <h4 className="text-4xl font-black text-emerald-400 italic tracking-tighter">{stats.today_efficiency}%</h4>
                      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                         <TrendingUp size={16} />
                      </div>
                   </div>
                </div>
             </div>
             <div className="mt-8 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-primary shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${stats.today_efficiency}%` }} />
             </div>
          </Card>
        </div>

        {/* Right: Moliya Tezkor Panel - NEW */}
        <div className="col-span-1 lg:col-span-4">
           <Card className="h-full bg-slate-900/40 border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="bg-slate-800/30 p-8 border-b border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Wallet className="w-3.5 h-3.5 text-primary" /> MOLIYA TERMINALI
                    </h4>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => {
                        setTransactionFormData({...transactionFormData, type: 'income', category: CATEGORIES.income[0].value})
                        setIsTransactionModalOpen(true)
                      }}
                      className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-primary group-hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex items-end justify-between">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Bugungi jami kirim</p>
                       <p className="text-2xl font-black text-white italic tracking-tighter">{stats.today_income?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic ml-1">UZS</span></p>
                    </div>
                    <div className="flex items-end justify-between">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Bugungi jami chiqim</p>
                       <p className="text-2xl font-black text-rose-400 italic tracking-tighter">{stats.today_expense?.toLocaleString()} <span className="text-[10px] opacity-30 not-italic ml-1">UZS</span></p>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-center bg-slate-950/20">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">BALANS</p>
                    <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black">XAVFSIZ</Badge>
                 </div>
                 <h2 className="text-5xl font-black text-white italic tracking-tighter mb-8">{(stats.today_income - stats.today_expense)?.toLocaleString()} <span className="text-sm opacity-20 not-italic ml-2">UZS</span></h2>
                 
                 <Button 
                    onClick={() => {
                      setTransactionFormData({...transactionFormData, type: 'income', category: CATEGORIES.income[0].value})
                      setIsTransactionModalOpen(true)
                    }}
                    className="w-full h-14 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:opacity-90 transition-all"
                  >
                    + OPERATSIYA KIRITISH
                 </Button>
              </div>
           </Card>
        </div>
      </div>

      {/* OYLIK REJA TERMINAL - DARK */}
      {isAdmin && monthlyPlan && (
          <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 overflow-hidden relative group rounded-[2.5rem]">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent skew-x-12 translate-x-1/4" />
              <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-4 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><BarChart3 size={20} /></div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Moliyaviy Ijro Monitoringi</h3>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsEditPlanOpen(true)} className="h-9 rounded-xl border-slate-700 bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all px-4 shadow-sm">
                        REJANI TAHRIRLASH
                    </Button>
                  </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                      <div className="col-span-1 space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                             <Binary className="w-3.5 h-3.5 text-primary/40" />
                             Rejalashtirilgan summa
                          </p>
                          <h4 className="text-3xl font-black font-mono text-white tracking-tighter">
                            {monthlyPlan.plan_amount.toLocaleString()} <span className="text-[10px] font-black text-slate-600 uppercase italic">uzs</span>
                          </h4>
                      </div>
                      <div className="col-span-1 space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amalga oshirilgan tushum</p>
                          <h4 className="text-3xl font-black font-mono text-emerald-400 tracking-tighter">
                            {monthlyPlan.completed.toLocaleString()} <span className="text-[10px] font-black text-slate-600 uppercase italic">uzs</span>
                          </h4>
                      </div>
                      <div className="col-span-1 lg:col-span-2 space-y-5">
                          <div className="flex justify-between items-end">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ijro darajasi progressi</p>
                              <span className="text-3xl font-black font-mono text-primary leading-none">{monthlyPlan.progress}%</span>
                          </div>
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full relative shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-1000"
                                style={{ width: `${Math.min(monthlyPlan.progress, 100)}%` }}
                              >
                                  <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                              </div>
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}

      {/* PIPELINE & CONTROLS - DARK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PRODUCTION FLOW (Span 8) */}
          <Card className="col-span-1 lg:col-span-8 border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem]">
              <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-4 px-8">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Activity size={20} /></div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Ishlab chiqarish yo'nalishi vizualizatsiyasi</h3>
                  </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-12 relative overflow-hidden">
                  <div className="hidden sm:block absolute top-1/2 left-8 right-8 h-1 bg-slate-800/50 -translate-y-[2.5rem]" />
                  <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-8 sm:gap-4">
                      {[
                        { id: 'warehouse', label: 'OMBOR', icon: Package },
                        { id: 'printing', label: 'CHOP ETISH', icon: Factory },
                        { id: 'varnishing', label: 'LAKLASH', icon: Activity },
                        { id: 'cutting', label: 'KESISH', icon: ArrowUpRight },
                        { id: 'assembly', label: "YIG'ISH", icon: CheckCircle },
                        { id: 'qc', label: 'SIFAT', icon: ShieldCheck }
                      ].map((step, index, arr) => {
                        const count = production_stages[step.id] || 0
                        const isActive = count > 0
                        
                        return (
                          <div key={step.id} className="flex-1 flex flex-col items-center group">
                              <div className={`w-16 h-16 rounded-2xl border-2 transition-all duration-700 flex items-center justify-center relative ${
                                isActive 
                                  ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-110 z-10' 
                                  : 'bg-slate-800/50 border-slate-800 opacity-40 group-hover:opacity-100'
                              }`}>
                                <step.icon size={26} className={isActive ? 'text-primary' : 'text-slate-600'} />
                                {isActive && (
                                    <div className="absolute -top-3 -right-3 w-7 h-7 bg-primary text-white text-[11px] font-black rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900 animate-bounce-slow">
                                        {count}
                                    </div>
                                )}
                              </div>
                              <p className={`text-[9px] font-black mt-5 uppercase tracking-[0.2em] ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                                {step.id === 'varnishing' ? 'LAKLASH' : step.label}
                              </p>
                          </div>
                        )
                      })}
                  </div>
              </CardContent>
          </Card>

          {/* ALERTS TERMINAL (Span 4) */}
          <Card className="col-span-1 lg:col-span-4 border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem]">
              <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-4 px-8">
                  <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl"><AlertCircle size={20} /></div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Ombor holati ogohlantirishi</h3>
                  </div>
              </CardHeader>
              <CardContent className="p-8">
                   <div className="space-y-4">
                      {alerts.low_stock.length > 0 ? alerts.low_stock.slice(0, 4).map((m: any, idx: number) => (
                         <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-800/30 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all shadow-sm group">
                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-slate-900 shadow-inner flex items-center justify-center text-rose-400 group-hover:bg-slate-800 group-hover:scale-110 transition-all">
                                 <Package size={20} />
                             </div>
                             <div>
                                 <p className="text-[11px] font-black text-slate-200 uppercase leading-none mb-1">{m.name}</p>
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Min. zaxira: {m.min_stock} {m.unit}</p>
                             </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-rose-400/60 uppercase leading-none mb-1">Hozrda</p>
                              <p className="text-lg font-black font-mono text-rose-500">{m.current_stock}</p>
                           </div>
                         </div>
                      )) : (
                         <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <CheckCircle size={32} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Ombor holati barqaror</p>
                        </div>
                      )}
                   </div>
              </CardContent>
          </Card>
      </div>

      {/* LOWER GRID: Dynamic Data - DARK */}
      <div className="grid grid-cols-12 gap-6">
            {/* RECENT ACTIVITY / CHART (Span 7) */}
            <Card className="col-span-12 lg:col-span-8 border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem]">
                 <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-4 px-8 flex flex-row items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl"><TrendingUp size={20} /></div>
                         <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Moliya Dinamikasi</h3>
                     </div>
                     <div className="flex gap-2">
                        {['Haftalik', 'Oylik'].map(t => (
                            <button key={t} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Oylik' ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                 </CardHeader>
                 <CardContent className="p-10">
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart_data.labels.map((l: string, i: number) => ({
                                name: l,
                                value: chart_data.income[i] / 1000000,
                            }))}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(79, 70, 229)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="rgb(79, 70, 229)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#475569' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '20px',
                                        border: '1px solid #1e293b',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ fontWeight: '900', color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                    itemStyle={{ color: '#f8fafc', fontWeight: '800' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="rgb(79, 70, 229)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                 </CardContent>
            </Card>

            {/* ACTIVE WORKER TERMINAL (Span 5) */}
            <Card className="col-span-12 lg:col-span-4 border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem]">
                 <CardHeader className="bg-slate-800/30 border-b border-slate-800 py-4 px-8">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Users size={20} /></div>
                         <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Operatorlar Monitoringi</h3>
                     </div>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="space-y-4">
                         {active_workers.length > 0 ? (
                            <>
                                {/* TOP PERFORMER WIDGET */}
                                <div className="mb-6 p-5 rounded-3xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Zap size={48} className="text-primary" />
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">BUGUNGI TOP ISHCHI</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 p-0.5 border border-white/20">
                                            <img src={`https://ui-avatars.com/api/?name=${top_worker?.worker__first_name || 'Staff'}&background=random`} alt="top-worker" className="w-full h-full object-cover rounded-[14px]" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                              {top_worker ? `${top_worker.worker__first_name} ${top_worker.worker__last_name}` : 'Hozircha ma\'lumot yo\'q'}
                                            </h4>
                                            {top_worker && (
                                              <div className="flex gap-4 mt-1">
                                                  <p className="text-[10px] font-black text-emerald-400 uppercase">BAJARILDI: {top_worker.total_produced.toLocaleString()}</p>
                                                  <p className="text-[10px] font-black text-rose-500 uppercase">BRAK: {top_worker.total_defect.toLocaleString()}</p>
                                              </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {active_workers.map((w: any, i: number) => (
                                        <div key={i} className="p-5 flex items-center justify-between rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-primary/40 transition-all group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-950 border-4 border-slate-800 shadow-xl flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/150?u=${w.assigned_to__first_name}`} alt="avatar" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-slate-100 uppercase tracking-tight leading-none mb-1.5">{w.assigned_to__first_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-primary/20 text-primary border border-primary/30 font-black text-[8px] px-2 py-0.5 rounded-full">{w.step}</Badge>
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">ORD #{w.order__order_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-slate-500 uppercase">BAJARILDI</p>
                                                            <p className="text-sm font-black font-mono text-emerald-400 leading-none">{(w.produced_qty || 0).toLocaleString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] font-black text-slate-500 uppercase">BRAK</p>
                                                            <p className="text-sm font-black font-mono text-rose-500 leading-none">{(w.defect_qty || 0).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 justify-end mt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">ONLAYN</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                             <div className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                    <Users size={32} className="text-slate-700" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">Monitoring o'chirilgan</p>
                            </div>
                        )}
                    </div>
                 </CardContent>
            </Card>
      </div>
      </>
      )}
      {/* Edit Plan Modal - DARK */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="sm:max-w-md border-slate-800 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden p-0">
          <DialogHeader className="bg-slate-900 p-6 border-b border-slate-800">
            <DialogTitle className="text-xl font-black font-sans uppercase tracking-tight text-white italic">Moliya Rejasini Yangilash</DialogTitle>
          </DialogHeader>
          <div className="p-10 py-8">
            <div className="grid gap-4">
              <label htmlFor="plan_amount" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Rejalashtirilgan Summa (UZS)
              </label>
              <div className="relative group">
                <Binary className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                <Input
                    id="plan_amount"
                    type="number"
                    placeholder="Summani kiriting..."
                    value={newPlanAmount}
                    onChange={(e) => setNewPlanAmount(e.target.value)}
                    className="h-16 bg-slate-900 border-slate-800 font-mono font-black text-2xl pl-14 rounded-2xl focus-visible:ring-primary/20 text-white shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-600 italic mt-1 font-black uppercase tracking-widest pl-1 opacity-60">* Ushbu summa oylik KPI progressini belgilaydi.</p>
            </div>
          </div>
          <DialogFooter className="bg-slate-900 p-6 border-t border-slate-800 gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 hover:bg-white/5"
              onClick={() => setIsEditPlanOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button 
              type="button" 
              className="h-12 px-10 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
              onClick={handleUpdatePlan}
              disabled={submittingPlan}
            >
              {submittingPlan ? "SAQLANMOQDA..." : "REJANI SAQLASH"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Client Modal */}
      {isClientModalOpen && (
        <ClientFormModal 
          onClose={() => setIsClientModalOpen(false)}
          onSave={(newClient) => {
            setIsClientModalOpen(false)
            fetchClients()
            if (newClient && isTransactionModalOpen) {
              setTransactionFormData(prev => ({ ...prev, client: (newClient as any).id.toString() }))
            }
          }}
        />
      )}
    </div>
  )
}
