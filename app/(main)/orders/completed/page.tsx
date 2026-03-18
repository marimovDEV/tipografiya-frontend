"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle2, Truck, Clock, Eye, MoreVertical } from "lucide-react"
import { formatCurrency } from "@/lib/data/mock-data"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { Order } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"

export default function CompletedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleHandover = async (orderId: string | number) => {
    try {
      const response = await fetchWithAuth(`/api/orders/${orderId}/handover/`, {
        method: "POST"
      })
      
      if (!response.ok) throw new Error("Handover failed")
      
      toast.success("Buyurtma topshirildi!")
      fetchOrders() // Refresh list
    } catch (error) {
        console.error("Handover error:", error)
        toast.error("Topshirishda xatolik yuz berdi")
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
    </div>
  )
}
