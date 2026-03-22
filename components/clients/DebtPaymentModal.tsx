"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Wallet, CreditCard, Banknote, Landmark, Smartphone, Check } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { Client } from "@/lib/types"

interface DebtPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  onSuccess: () => void
}

export function DebtPaymentModal({ isOpen, onClose, client, onSuccess }: DebtPaymentModalProps) {
  const paymentMethods = [
    { id: "cash", label: "Naqd", icon: Banknote, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { id: "card", label: "Plastik", icon: CreditCard, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  ]
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [formData, setFormData] = useState({
    amount: "",
    method: "cash",
    description: "",
    order_id: "general", // "general" or order ID
  })

  useEffect(() => {
    if (isOpen) {
      fetchUnpaidOrders()
    }
  }, [isOpen, client.id])

  const fetchUnpaidOrders = async () => {
    try {
      const resp = await fetchWithAuth(`/api/customers/${client.id}/orders/`)
      if (resp.ok) {
        const data = await resp.json()
        // Filter for orders that aren't fully paid
        setOrders(data.filter((o: any) => o.payment_status !== 'fully_paid'))
      }
    } catch (err) {
      console.error("Fetch orders error:", err)
    }
  }

  const balance = Number(client.balance || 0)
  const currentDebt = balance < 0 ? Math.abs(balance) : 0

  const handleQuickAmount = (val: number) => {
    const finalVal = Math.min(val, currentDebt)
    setFormData({ ...formData, amount: finalVal.toString() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = Number(formData.amount)
    if (!formData.amount || amountNum <= 0) {
      toast.error("Iltimos, to'lov summasini kiriting")
      return
    }

    if (amountNum > currentDebt) {
        toast.error(`To'lov qarzdan (${currentDebt.toLocaleString()} so'm) ko'p bo'lishi mumkin emas`)
        return
    }

    try {
      setLoading(true)
      const payload: any = {
        amount: amountNum,
        method: formData.method,
        description: formData.description,
      }
      
      if (formData.order_id !== "general") {
        payload.order_id = formData.order_id
      }

      const response = await fetchWithAuth(`/api/customers/${client.id}/add_payment/`, {
        method: "POST",
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || "To'lovni saqlashda xatolik yuz berdi")
      }

      toast.success("To'lov muvaffaqiyatli qabul qilindi")
      onSuccess()
      onClose()
      setFormData({ amount: "", method: "cash", description: "" })
    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-100 rounded-3xl overflow-hidden p-0 gap-0">
        <form onSubmit={handleSubmit}>
          <div className="p-6 pb-4 border-b border-slate-800/50 bg-slate-900/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Wallet className="h-6 w-6 text-emerald-500" />
                </div>
                Qarz To'lash
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">
                {client.full_name} tomonidan to'lov qabul qilish
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Joriy qarz:</span>
                <div className="text-xl font-black text-red-500 font-mono">
                    {currentDebt.toLocaleString()} <span className="text-xs">so'm</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mijoz:</span>
                <div className="text-sm font-bold text-slate-300 truncate max-w-[150px]">
                    {client.company || client.full_name}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Amount Input */}
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-wider flex justify-between">
                To'lov Summasi
                {formData.amount && (
                    <span className="text-emerald-500 animate-in fade-in slide-in-from-right-2">
                        Qoldiq: {(Math.max(0, currentDebt - Number(formData.amount))).toLocaleString()} so'm
                    </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  autoFocus
                  required
                  max={currentDebt}
                  value={formData.amount}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val > currentDebt) {
                        setFormData({ ...formData, amount: currentDebt.toString() })
                    } else {
                        setFormData({ ...formData, amount: e.target.value })
                    }
                  }}
                  className="bg-slate-950 border-slate-700 h-14 text-2xl font-black text-emerald-400 focus:ring-emerald-500 rounded-2xl px-4"
                  placeholder="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">SO'M</div>
              </div>

              {/* Quick Sums */}
              <div className="flex gap-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-slate-950 border-slate-800 hover:bg-slate-800 text-[10px] font-black h-8 rounded-lg"
                    onClick={() => handleQuickAmount(1000000)}
                    disabled={currentDebt < 1000000}
                >
                    1 000 000
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-slate-950 border-slate-800 hover:bg-slate-800 text-[10px] font-black h-8 rounded-lg"
                    onClick={() => handleQuickAmount(2000000)}
                    disabled={currentDebt < 2000000}
                >
                    2 000 000
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-black h-8 rounded-lg"
                    onClick={() => handleQuickAmount(currentDebt)}
                >
                    Hammasini to'lash
                </Button>
              </div>
            </div>

            {/* Order Selection */}
            {orders.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-wider italic">To'lovni bog'lash (Buyurtma)</Label>
                <Select 
                  value={formData.order_id} 
                  onValueChange={(val) => setFormData({ ...formData, order_id: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700 h-12 rounded-xl text-xs font-bold">
                    <SelectValue placeholder="Umumiy hisobga (Hech qanday buyurtmaga bog'lamasdan)" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="general" className="text-xs font-bold py-3 border-b border-white/5">
                      <div className="flex flex-col">
                        <span>Umumiy hisobga (Buyurtmaga bog'lamasdan)</span>
                        <span className="text-[10px] text-slate-500 font-normal">Bu to'lov birorta buyurtmani "To'langan" holatiga o'tkazmaydi</span>
                      </div>
                    </SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id.toString()} className="text-xs font-bold py-3 border-b border-white/5">
                        <div className="flex justify-between items-center w-full gap-8">
                          <div className="flex flex-col">
                            <span>#{order.order_number} — {order.box_type || 'Noma\'lum mahsulot'}</span>
                            <span className="text-[10px] text-slate-500 font-normal">Qoldiq: {(order.total_price - (order.total_paid || 0)).toLocaleString()} so'm</span>
                          </div>
                          {order.payment_status === 'partially_paid' && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">Qisman</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Methods Grid */}
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">To'lov Usuli</Label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isActive = formData.method === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, method: method.id })}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 gap-2 ${
                        isActive 
                          ? `bg-slate-100 border-white text-slate-900 shadow-xl scale-[1.02]` 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? "text-slate-900" : method.color}`} />
                      <span className="text-xs font-black uppercase tracking-tight">{method.label}</span>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-slate-900 stroke-[4px]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Izoh (ixtiyoriy)</Label>
              <Textarea
                placeholder="To'lov haqida qo'shimcha ma'lumot..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-950 border-slate-700 rounded-2xl min-h-[80px] focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 gap-3"
            >
              {loading ? "Yuklanmoqda..." : "TO'LOVNI QABUL QILISH"}
              {!loading && <Check className="h-6 w-6 stroke-[3px]" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
