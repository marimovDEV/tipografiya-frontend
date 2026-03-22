
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Filter, X, MoreVertical, Edit, CheckCircle2, Truck, DollarSign, AlertCircle, Trash2 } from "lucide-react"
import { getStatusLabel, formatCurrency } from "@/lib/data/mock-data"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { Order, OrderStatus } from "@/lib/types"
import { getStepLabelUz, generateUUID } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/api-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const FILTER_CATEGORIES = [
  { id: "all", label: "Barchasi" },
  { id: "jarayonda", label: "Jarayonda" },
  { id: "tugagan", label: "Tugagan" },
  { id: "kechikkan", label: "Kechikkan" },
]

function PaymentStatusPill({ status }: { status: string }) {
  const styles = {
    unpaid: "bg-red-500/10 text-red-500 border-red-500/20",
    partially_paid: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    fully_paid: "bg-green-500/10 text-green-500 border-green-500/20",
  }[status] || "bg-slate-500/10 text-slate-500 border-slate-500/20"

  const labels = {
    unpaid: "To'lanmagan",
    partially_paid: "Avans",
    fully_paid: "To'langan",
  }[status] || status

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles}`}>
      {labels}
    </span>
  )
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isHandoverDialogOpen, setIsHandoverDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [handoverAmount, setHandoverAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetchWithAuth("/api/orders/")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      // Support paginated response
      const ordersData = data.results || data
      setOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFinishOrder = async (orderId: string | number) => {
    if (!confirm("Ushbu buyurtmani tayyor holatga o'tkazmoqchimisiz?")) return
    
    try {
      const res = await fetchWithAuth(`/api/orders/${orderId}/finish/`, {
        method: 'POST'
      })
      if (res.ok) {
        toast.success("Buyurtma tayyor holatga o'tkazildi")
        fetchOrders()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      console.error(error)
      toast.error("Aloqa xatosi")
    }
  }

  const handleDeleteOrder = async (orderId: string | number) => {
    if (!confirm("Ushbu buyurtmani o'chirib yuborishni xohlaysizmi?")) return
    
    try {
      const res = await fetchWithAuth(`/api/orders/${orderId}/`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success("Buyurtma o'chirildi")
        fetchOrders()
      } else {
        toast.error("O'chirishda xatolik yuz berdi")
      }
    } catch (error) {
      console.error(error)
      toast.error("Aloqa xatosi")
    }
  }

  const openHandoverDialog = (order: Order) => {
    const debt = Math.max(0, (order.total_price || 0) - (order.advance_payment || 0))
    setSelectedOrder(order)
    setHandoverAmount(debt)
    setIsHandoverDialogOpen(true)
  }

  const handleHandoverSubmit = async () => {
    if (!selectedOrder) return
    setProcessing(true)
    
    try {
      // 1. If there's a payment, record it first
      if (handoverAmount > 0) {
        const payRes = await fetchWithAuth(`/api/transactions/`, {
            method: 'POST',
            body: JSON.stringify({
                order_link: selectedOrder.id,
                client: selectedOrder.client?.id,
                amount: handoverAmount,
                type: 'income',
                category: 'sales',
                payment_method: paymentMethod,
                idempotency_key: generateUUID(),
                notes: `Buyurtma #${selectedOrder.order_number} topshirish vaqtidagi yakuniy to'lov`
            })
        })
        if (!payRes.ok) {
            toast.error("To'lovni saqlashda xatolik!")
            setProcessing(false)
            return
        }
      }

      // 2. Perform Handover
      const res = await fetchWithAuth(`/api/orders/${selectedOrder.id}/handover/`, {
        method: 'POST'
      })
      
      if (res.ok) {
        toast.success("Buyurtma topshirildi!")
        setIsHandoverDialogOpen(false)
        fetchOrders()
      } else {
        toast.error("Topshirishda xatolik!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Xatolik yuz berdi")
    } finally {
      setProcessing(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.client?.full_name && order.client.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.box_type && order.box_type.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesCategory = true;
    if (activeFilter === "jarayonda") {
      matchesCategory = ["approved", "in_production", "ready"].includes(order.status);
    } else if (activeFilter === "tugagan") {
      matchesCategory = ["delivered", "completed"].includes(order.status);
    } else if (activeFilter === "kechikkan") {
      matchesCategory = !!order.is_delayed;
    }

    return matchesSearch && matchesCategory;
  })

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-outfit uppercase italic">Buyurtmalar</h1>
          <p className="text-slate-500 mt-1 font-bold text-[10px] uppercase tracking-widest pl-1 border-l-2 border-primary ml-1 h-3 flex items-center">
            &nbsp; Barchasi: {orders.length} ta buyurtma
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/orders/new">
            <Button className="bg-primary text-white hover:bg-primary/90 font-black shadow-lg shadow-primary/20 rounded-xl h-12 px-8 transition-all hover:scale-105 active:scale-95 border-none text-[11px] uppercase tracking-widest">
              <Plus className="h-4 w-4 mr-2" />
              Yangi Buyurtma
            </Button>
          </Link>
        </div>
      </div>


      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="QIDIRISH... (ID, MIJOZ, MAHSULOT)"
            className="pl-12 h-12 bg-slate-900/50 border-slate-800 rounded-2xl focus:ring-primary/20 transition-all font-black text-[11px] uppercase tracking-widest text-white placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`
                px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border
                ${activeFilter === cat.id
                  ? "bg-white text-slate-950 border-white shadow-xl shadow-white/10 scale-105"
                  : "bg-slate-900/40 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-400"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>


      {/* High Density Table */}
      {/* Responsive View - Desktop Table / Mobile Cards */}
      <div className="hidden md:block">
        <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-800/30">
                  <TableRow className="hover:bg-transparent border-b border-slate-800">
                    <TableHead className="w-[100px] font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 pl-8">Buyurtma ID</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5">Mijoz ma'lumotlari</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5">Mahsulot turi</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-right">Miqdor</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-right">Umumiy Summa</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-right">Avans</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-right">Qoldiq</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-center">To'lov</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-center">Holat</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-right pr-8 w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-none">
                      <TableCell colSpan={10} className="text-center py-32 text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tizim yuklanmoqda...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow className="border-none">
                      <TableCell colSpan={10} className="text-center py-32 text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <p className="font-black text-lg text-slate-400 uppercase tracking-tighter italic">BUYURTMALAR TOPILMADI</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Qidiruv so'zini tahrirlang yoki filtrni o'zgartiring</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="group hover:bg-slate-800/20 transition-all border-b border-slate-800/50 text-xs text-white">
                        <TableCell className="py-5 font-mono font-black text-xs text-slate-400 pl-8">
                          #{order.order_number?.split('-').pop()}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="font-black text-white text-[13px] leading-tight uppercase tracking-tight italic group-hover:text-primary transition-colors">{order.client?.full_name}</div>
                          {order.client?.company && (
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate max-w-[150px] mt-1">{order.client.company}</div>
                          )}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="font-black text-[11px] text-slate-100 uppercase tracking-tight">{order.box_type || 'Standart'}</div>
                        </TableCell>
                        <TableCell className="py-5 text-right font-mono text-[11px] text-slate-400 font-bold">
                          <span className="text-emerald-500">{Math.round(order.completed_quantity || 0)}</span> / {Math.round(order.quantity).toLocaleString()} ta
                        </TableCell>
                        <TableCell className="py-5 text-right font-mono font-black text-sm text-white italic">
                          {formatCurrency(order.total_price || 0)}
                        </TableCell>
                        <TableCell className="py-5 text-right font-mono text-[11px] text-amber-500 font-black">
                          {order.advance_payment ? formatCurrency(order.advance_payment) : "-"}
                        </TableCell>
                        <TableCell className="py-5 text-right font-mono text-[11px] text-slate-500 font-bold">
                          {formatCurrency(Math.max(0, (order.total_price || 0) - (order.advance_payment || 0)))}
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <PaymentStatusPill status={order.payment_status || 'unpaid'} />
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <StatusPill status={order.status} className="shadow-lg shadow-black/20" />
                            {order.status === 'in_production' && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleFinishOrder(order.id)}
                                    className="h-6 px-2 text-[8px] font-black uppercase tracking-tighter text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/20"
                                >
                                    Tugatish
                                </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-5 text-right pr-8">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'ready' && (
                                <Button 
                                    size="sm" 
                                    onClick={() => openHandoverDialog(order)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-lg shadow-lg shadow-emerald-500/20"
                                >
                                    Topshirish
                                </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700">
                                  <MoreVertical className="h-4 w-4 text-slate-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-slate-800 bg-slate-900 shadow-2xl p-2 min-w-[180px]">
                                <Link href={`/orders/${order.id}`}>
                                  <DropdownMenuItem className="gap-3 cursor-pointer font-black text-[10px] uppercase tracking-widest py-3 rounded-xl focus:bg-primary/10 focus:text-primary">
                                    <Eye className="h-4 w-4" /> Ko'rish (Monitoring)
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/orders/${order.id}/edit`}>
                                  <DropdownMenuItem className="gap-3 cursor-pointer font-black text-[10px] uppercase tracking-widest py-3 rounded-xl focus:bg-indigo-500/10 focus:text-indigo-400">
                                    <Edit className="h-4 w-4" /> Tahrirlash
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="gap-3 cursor-pointer font-black text-[10px] uppercase tracking-widest py-3 rounded-xl focus:bg-red-500/10 focus:text-red-500 text-red-500/80"
                                >
                                  <Trash2 className="h-4 w-4" /> O'chirish
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Yuklanmoqda...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="font-black text-lg text-slate-400 uppercase tracking-tighter italic">BUYURTMALAR TOPILMADI</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="bg-slate-900/40 border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500">#{order.order_number?.split('-').pop()}</div>
                  <div className="font-black text-white text-lg uppercase italic">{order.client?.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{order.box_type || 'Standart'}</div>
                </div>
                <StatusPill status={order.status} className="text-[8px] h-5" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800">
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">MIQDOR</p>
                   <p className="text-sm font-black text-white italic">{Math.round(order.quantity).toLocaleString()} ta</p>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-slate-500 uppercase mb-1">SUMMA</p>
                   <p className="text-sm font-black text-primary italic">{formatCurrency(order.total_price || 0)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <PaymentStatusPill status={order.payment_status || 'unpaid'} />
                <Link href={`/orders/${order.id}`} className="flex-1 ml-4">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-10 font-black text-[9px] uppercase tracking-widest">
                    Batafsil
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Placeholder (if needed in future) */}
      <div className="flex justify-center pt-4">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Jami: {filteredOrders.length} natija</p>
      </div>

      {/* Handover & Payment Dialog */}
      <Dialog open={isHandoverDialogOpen} onOpenChange={setIsHandoverDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              Mijozga Topshirish
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold uppercase text-[10px]">
              Buyurtma #{selectedOrder?.order_number?.split('-').pop()} • {selectedOrder?.client?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* Status Summary */}
            <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500">Umumiy Summa</span>
                    <span className="font-mono font-black text-sm">{formatCurrency(selectedOrder?.total_price || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-amber-500">
                    <span className="text-[10px] font-black uppercase">To'langan (Avans)</span>
                    <span className="font-mono font-black text-sm">{formatCurrency(selectedOrder?.advance_payment || 0)}</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex justify-between items-center text-primary">
                    <span className="text-[10px] font-black uppercase">Qarz (Qoldiq)</span>
                    <span className="font-mono font-black text-lg italic">{formatCurrency(Math.max(0, (selectedOrder?.total_price || 0) - (selectedOrder?.advance_payment || 0)))}</span>
                </div>
            </div>

            {/* Payment Section */}
            {Math.max(0, (selectedOrder?.total_price || 0) - (selectedOrder?.advance_payment || 0)) > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <DollarSign className="h-4 w-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">To'lovni qabul qilish</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">To'lov Summasi</Label>
                            <Input 
                                type="number"
                                value={handoverAmount}
                                onChange={(e) => setHandoverAmount(parseFloat(e.target.value) || 0)}
                                className="bg-slate-950 border-slate-800 focus:ring-primary rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">To'lov Usuli</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="bg-slate-950 border-slate-800 rounded-xl">
                                    <SelectValue placeholder="Tanlang" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800">
                                    <SelectItem value="cash">Naqd</SelectItem>
                                    <SelectItem value="card">Plastik (Karta)</SelectItem>
                                    <SelectItem value="transfer">O'tkazma (Perexisl)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 italic">
                <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-slate-400">Topshirish bosilgandan so'ng buyurtma holati "Topshirildi" ga o'zgaradi va tarixga saqlanadi.</p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button 
                variant="ghost" 
                onClick={() => setIsHandoverDialogOpen(false)}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
                Bekor qilish
            </Button>
            <Button 
                onClick={handleHandoverSubmit}
                disabled={processing}
                className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl h-11 shadow-lg shadow-primary/20"
            >
                {processing ? "Bajarilmoqda..." : "Topshirish va Yakunlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
