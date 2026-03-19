"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle2, Truck, Clock, Eye, MoreVertical, DollarSign, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/data/mock-data"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { Order } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"

export default function CompletedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
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
      // Fetch both 'ready' (finished production) and 'delivered' (handed over)
      const response = await fetchWithAuth("/api/orders/?status=ready")
      const responseDelivered = await fetchWithAuth("/api/orders/?status=delivered")
      
      if (!response.ok || !responseDelivered.ok) throw new Error("Failed to fetch orders")
      
      const dataReady = await response.json()
      const dataDelivered = await responseDelivered.json()
      
      const readyOrders = dataReady.results || dataReady
      const deliveredOrders = dataDelivered.results || dataDelivered
      
      // Combine and sort by completion/delivery date
      const combined = [...readyOrders, ...deliveredOrders].sort((a, b) => {
        const dateA = new Date(a.completed_at || a.created_at).getTime()
        const dateB = new Date(b.completed_at || b.created_at).getTime()
        return dateB - dateA
      })
      
      setOrders(combined)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const handleHandover = (order: Order) => {
    const debt = Math.max(0, (Number(order.total_price) || 0) - (Number(order.advance_payment) || 0))
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
                order: selectedOrder.id,
                client: selectedOrder.client?.id,
                amount: handoverAmount,
                type: 'income',
                category: 'sales',
                payment_method: paymentMethod,
                notes: `Buyurtma #${selectedOrder.order_number} topshirish vaqtidagi yakuniy to'lov (Completed sahifasi)`
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
      (order.book_name && order.book_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch
  })

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-outfit uppercase italic">Tugagan ishlar</h1>
          <p className="text-slate-500 mt-1 font-bold text-[10px] uppercase tracking-widest pl-1 border-l-2 border-emerald-500 ml-1 h-3 flex items-center">
            &nbsp; Tayyor va topshirilgan: {orders.length} ta buyurtma
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="QIDIRISH... (ID, MIJOZ, KITOB)"
            className="pl-12 h-12 bg-slate-900/50 border-slate-800 rounded-2xl focus:ring-primary/20 transition-all font-black text-[11px] uppercase tracking-widest text-white placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="border border-slate-800 shadow-2xl bg-slate-900/40 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-800/30">
                  <TableRow className="hover:bg-transparent border-b border-slate-800">
                    <TableHead className="w-[120px] font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 pl-8">Buyurtma ID</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5">Mijoz / Mahsulot</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-right">Miqdor</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-center">Tayyor bo'lgan vaqt</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-center">Holat</TableHead>
                    <TableHead className="font-black text-slate-500 text-[9px] uppercase tracking-[0.2em] py-5 text-center">Topshirish</TableHead>
                    <TableHead className="py-5 pr-8 w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-slate-500">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        Yuklanmoqda...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-slate-500 italic uppercase font-black text-[10px] tracking-widest">
                        Tugagan ishlar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order: any) => (
                      <TableRow key={order.id} className="group hover:bg-slate-800/20 transition-all border-b border-slate-800/50 text-xs text-white">
                        <TableCell className="py-5 font-mono font-black text-xs text-slate-400 pl-8">
                          #{order.order_number?.split('-').pop()}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="font-black text-white text-[13px] leading-tight uppercase tracking-tight italic">{order.client?.full_name}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                             {order.book_name || order.box_type || 'Mahsulot'}
                          </div>
                        </TableCell>
                        <TableCell className="py-5 text-right font-mono text-[11px] text-slate-400 font-bold">
                          {order.quantity.toLocaleString()} ta
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <div className="flex flex-col items-center">
                             <div className="text-[10px] font-black text-slate-300 uppercase">
                               {order.completed_at ? format(new Date(order.completed_at), "dd.MM.yyyy") : "-"}
                             </div>
                             <div className="text-[9px] font-bold text-slate-600 uppercase">
                               {order.completed_at ? format(new Date(order.completed_at), "HH:mm") : ""}
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          <StatusPill status={order.status} />
                        </TableCell>
                        <TableCell className="py-5 text-center">
                          {order.status === 'ready' ? (
                            <Button 
                              onClick={() => handleHandover(order.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                              <Truck className="h-3 w-3 mr-2" /> Topshirildi
                            </Button>
                          ) : (
                            <div className="flex flex-col items-center text-emerald-500">
                               <div className="flex items-center gap-1 text-[9px] font-black uppercase">
                                  <CheckCircle2 className="h-3 w-3" /> Topshirilgan
                               </div>
                               <div className="text-[8px] font-bold opacity-70">
                                  {order.delivered_at ? format(new Date(order.delivered_at), "dd.MM HH:mm") : ""}
                               </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-5 text-right pr-8">
                           <Link href={`/orders/${order.id}`}>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-slate-800">
                                <Eye className="h-4 w-4 text-slate-500" />
                              </Button>
                           </Link>
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
        {filteredOrders.map((order: any) => (
          <Card key={order.id} className="bg-slate-900/40 border-slate-800 rounded-[1.5rem] p-5 space-y-4">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500">#{order.order_number?.split('-').pop()}</div>
                  <div className="font-black text-white text-lg uppercase italic leading-none">{order.client?.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate max-w-[200px]">
                    {order.book_name || order.box_type}
                  </div>
               </div>
               <StatusPill status={order.status} className="text-[8px] h-5" />
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50">
               <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">MIQDOR</p>
                  <p className="text-sm font-black text-white italic">{order.quantity.toLocaleString()} ta</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">TAYYOR BO'LDI</p>
                  <p className="text-[10px] font-black text-slate-300">
                    {order.completed_at ? format(new Date(order.completed_at), "dd.MM HH:mm") : "-"}
                  </p>
               </div>
            </div>

            <div className="pt-2">
              {order.status === 'ready' ? (
                <Button 
                   onClick={() => handleHandover(order.id)}
                   className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl"
                >
                   <Truck className="h-4 w-4 mr-2" /> Topshirildi
                </Button>
              ) : (
                <div className="w-full flex items-center justify-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                   <CheckCircle2 className="h-4 w-4" />
                   <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Topshirilgan</p>
                      <p className="text-[9px] font-bold opacity-70 mt-1">
                        {order.delivered_at ? format(new Date(order.delivered_at), "dd MMMM HH:mm") : ""}
                      </p>
                   </div>
                </div>
              )}
            </div>
          </Card>
        ))}
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
                    <span className="font-mono font-black text-lg italic">{formatCurrency(Math.max(0, (Number(selectedOrder?.total_price) || 0) - (Number(selectedOrder?.advance_payment) || 0)))}</span>
                </div>
            </div>

            {/* Payment Section */}
            {Math.max(0, (Number(selectedOrder?.total_price) || 0) - (Number(selectedOrder?.advance_payment) || 0)) > 0 && (
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
