
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Filter, X, MoreVertical, Edit } from "lucide-react"
import { getStatusLabel, formatCurrency } from "@/lib/data/mock-data"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusPill } from "@/components/ui/status-pill"
import { Order, OrderStatus } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
                    <TableRow key={order.id} className="group hover:bg-slate-800/20 transition-all border-b border-slate-800/50 text-xs">
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
                        {order.quantity.toLocaleString()}
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
                        <StatusPill status={order.status} className="shadow-lg shadow-black/20" />
                      </TableCell>
                      <TableCell className="py-5 text-right pr-8">
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex justify-end">
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

      {/* Pagination Placeholder (if needed in future) */}
      <div className="flex justify-center pt-4">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Jami: {filteredOrders.length} natija</p>
      </div>
    </div>
  )
}
