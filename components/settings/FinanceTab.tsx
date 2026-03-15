"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Binary, TrendingUp, Calendar, Save, RefreshCw, DollarSign } from "lucide-react"
import { getMonthlyPlan, updateMonthlyPlan, MonthlyPlan } from "@/lib/api/finance"
import { toast } from "sonner"

export function FinanceTab() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [plan, setPlan] = useState<MonthlyPlan | null>(null)
  
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [plannedAmount, setPlannedAmount] = useState("")

  const months = [
    { value: 1, label: "Yanvar" },
    { value: 2, label: "Fevral" },
    { value: 3, label: "Mart" },
    { value: 4, label: "Aprel" },
    { value: 5, label: "May" },
    { value: 6, label: "Iyun" },
    { value: 7, label: "Iyul" },
    { value: 8, label: "Avgust" },
    { value: 9, label: "Sentyabr" },
    { value: 10, label: "Oktyabr" },
    { value: 11, label: "Noyabr" },
    { value: 12, label: "Dekabr" },
  ]

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  useEffect(() => {
    fetchPlan()
  }, [selectedMonth, selectedYear])

  const fetchPlan = async () => {
    setLoading(true)
    try {
      const data = await getMonthlyPlan(selectedMonth, selectedYear)
      setPlan(data)
      setPlannedAmount(data.plan_amount.toString())
    } catch (error) {
      console.error("Failed to fetch plan:", error)
      toast.error("Rejani yuklab bo'lmadi")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    const amount = parseFloat(plannedAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error("Iltimos, to'g'ri summa kiriting")
      return
    }

    setSubmitting(true)
    try {
      await updateMonthlyPlan(amount, selectedMonth, selectedYear)
      toast.success("Moliya rejasi yangilandi")
      fetchPlan()
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Configuration Form */}
        <Card className="lg:col-span-1 border-slate-800 bg-slate-900/40 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] scale-150 rotate-12 transition-transform group-hover:rotate-0">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <CardHeader className="bg-slate-800/30 border-b border-slate-800 p-7">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Reja Sozlamalari
            </CardTitle>
            <CardDescription className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-1">
              Oy va yil uchun maqsadli tushumni belgilang
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Oy</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(v) => setSelectedMonth(parseInt(v))}
                >
                  <SelectTrigger className="h-12 bg-slate-950/50 border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-inner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800">
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value.toString()} className="font-black text-[10px] uppercase tracking-widest text-slate-400 focus:bg-primary focus:text-white">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yil</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger className="h-12 bg-slate-950/50 border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-inner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800">
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()} className="font-black text-[10px] uppercase tracking-widest text-slate-400 focus:bg-primary focus:text-white">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_amount" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Rejalashtirilgan Summa (UZS)
              </Label>
              <div className="relative">
                <Binary className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <Input
                  id="plan_amount"
                  type="number"
                  placeholder="0"
                  value={plannedAmount}
                  onChange={(e) => setPlannedAmount(e.target.value)}
                  className="h-14 bg-slate-950/50 border-slate-800 pl-11 rounded-xl font-mono font-black text-white focus:ring-primary/20 shadow-inner"
                />
              </div>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={submitting || loading}
              className="w-full h-14 bg-primary text-white hover:opacity-90 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all mt-4"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  SAQLANMOQDA...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  REJANI SAQLASH
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Plan Preview / Stats */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40 rounded-[2rem] overflow-hidden relative">
          <CardHeader className="bg-slate-800/30 border-b border-slate-800 p-7">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Progress Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MA'LUMOTLAR YUKLANMOQDA...</p>
              </div>
            ) : plan ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amalga oshirilgan</p>
                    <h4 className="text-4xl font-black font-mono text-emerald-400 tracking-tighter">
                      {plan.completed.toLocaleString()} <span className="text-[10px] text-slate-600">UZS</span>
                    </h4>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Qolgan summa</p>
                    <h4 className="text-4xl font-black font-mono text-white tracking-tighter">
                      {plan.remaining.toLocaleString()} <span className="text-[10px] text-slate-600">UZS</span>
                    </h4>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ijro darajasi</p>
                    <span className="text-4xl font-black font-mono text-primary leading-none">{plan.progress}%</span>
                  </div>
                  <div className="h-6 bg-slate-800 rounded-full overflow-hidden p-1.5 shadow-inner border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 rounded-full relative shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(plan.progress, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800">
                    <div className="flex items-center gap-4 text-slate-500 italic">
                        <TrendingUp className="w-5 h-5 opacity-20" />
                        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                            {plan.progress >= 100 
                                ? "Mablag' tushumlari rejalashtirilgan oylik ko'rsatkichdan oshdi. Tizim barqaror."
                                : plan.progress > 50 
                                    ? "Oylik reja yarimidan ko'pi bajarilgan. Monitoringni davom ettiring."
                                    : "Mablag' tushumlari rejadan orqada qolmoqda. Faollikni oshirish tavsiya etiladi."
                            }
                        </p>
                    </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.2em]">Reja ma'lumotlari topilmadi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
