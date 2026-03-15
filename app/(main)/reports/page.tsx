"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts"
import {
  TrendingUp, Users, Package, AlertTriangle,
  DollarSign, Clock, LayoutDashboard, Calendar as CalendarIcon,
  ArrowDown, ArrowUp, Zap, Box, UserCheck,
  ArrowRight, Download, ChevronRight, Activity, Filter
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/data/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { uz } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchReports()
    }
  }, [date])

  const fetchReports = async () => {
    setLoading(true)
    try {
      if (!date?.from || !date?.to) return

      const params = new URLSearchParams({
        start_date: date.from.toISOString(),
        end_date: date.to.toISOString()
      })

      const res = await fetchWithAuth(`/api/reports/?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        toast.error("Hisobotlarni yuklashda xatolik")
      }
    } catch (e) {
      console.error(e)
      toast.error("Tarmoq xatoligi")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground font-bold animate-pulse">Analitika yuklanmoqda...</p>
    </div>
  )

  if (!data) return <div className="p-20 text-center text-muted-foreground font-bold">Ma'lumot topilmadi</div>

  const { financials, bottlenecks, consumption, worker_performance, top_products, charts } = data

  const chartData = charts.labels.map((label: string, i: number) => ({
    name: label,
    revenue: charts.revenue[i],
    profit: charts.profit[i]
  }))

  const pieData = top_products.map((p: any) => ({
    name: p.box_type,
    value: p.revenue
  }))

  const bottleneckData = bottlenecks.map((b: any) => ({
    name: b.step,
    vaqti: b.avg_minutes,
    display: b.step === 'queue' ? 'Navbat' :
      b.step === 'cutting' ? 'Kesish' :
        b.step === 'printing' ? 'Chop etish' :
          b.step === 'gluing' ? 'Yelimlash' :
            b.step === 'drying' ? 'Quritish' :
              b.step === 'packaging' ? 'Qadoqlash' : b.step
  }))

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground font-outfit uppercase">ERP Analitika</h1>
          <p className="text-muted-foreground mt-2 font-medium text-sm lg:text-base">Kompaniya samaradorligi va moliyaviy ko'rsatkichlar</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-bold rounded-xl h-12 border-border bg-card hover:bg-card/80",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "d MMM, yyyy", { locale: uz })} -{" "}
                        {format(date.to, "d MMM, yyyy", { locale: uz })}
                      </>
                    ) : (
                      format(date.from, "d MMM, yyyy", { locale: uz })
                    )
                  ) : (
                    <span>Sana tanlang</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-border bg-popover" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={uz}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 text-primary-foreground min-w-[140px]"
            onClick={async () => {
              try {
                if (!data) return;
                const xlsx = await import("xlsx");

                // Sheet 1: Financials
                const ws_fin = xlsx.utils.json_to_sheet([{
                  "Jami Tushum": data.financials.total_revenue,
                  "Sof Foyda": data.financials.net_profit,
                  "Buyurtmalar": data.financials.order_count,
                  "O'r. Chek": data.financials.avg_order_value,
                  "Xarajat": data.financials.total_cost
                }]);

                // Sheet 2: Top Products
                const ws_prod = xlsx.utils.json_to_sheet(data.top_products.map((p: any) => ({
                  "Mahsulot": p.box_type,
                  "Tushum": p.revenue,
                  "Buyurtmalar": p.count
                })));

                // Sheet 3: Material Usage
                const ws_mat = xlsx.utils.json_to_sheet(data.consumption.map((c: any) => ({
                  "Material": c.material__name,
                  "Ishlatildi": c.total_used
                })));

                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws_fin, "Moliya");
                xlsx.utils.book_append_sheet(wb, ws_prod, "Mahsulotlar");
                xlsx.utils.book_append_sheet(wb, ws_mat, "Materiallar");

                xlsx.writeFile(wb, "ERP_Hisobot.xlsx");
                toast.success("Hisobot yuklab olindi");
              } catch (e) {
                console.error(e);
                toast.error("Export xatoligi");
              }
            }}
          >
            <Download className="h-5 w-5 mr-2" /> EXPORT
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem
          title="Jami Tushum"
          value={formatCurrency(financials.total_revenue)}
          icon={DollarSign}
          color="blue"
          subText={`${financials.order_count} ta buyurtma`}
        />
        <KPIItem
          title="Sof Foyda"
          value={formatCurrency(financials.net_profit)}
          icon={TrendingUp}
          color="green"
          subText={`Rentabellik: ${((financials.net_profit / (financials.total_revenue || 1)) * 100).toFixed(1)}%`}
          highlightColor={((financials.net_profit / (financials.total_revenue || 1)) * 100) < 10 ? "text-red-500" : "text-emerald-500"}
        />
        <KPIItem
          title="O'rtacha Chek"
          value={formatCurrency(financials.avg_order_value)}
          icon={Zap}
          color="orange"
          subText="Buyurtma boshiga"
        />
        <KPIItem
          title="Sklad Holati"
          value={`${data.inventory_health.low_stock_count} ta`}
          icon={AlertTriangle}
          color={data.inventory_health.low_stock_count > 0 ? "red" : "green"}
          subText="Kam qolgan materiallar"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Revenue/Profit Chart */}
        <Card className="xl:col-span-2 rounded-[2rem] border shadow-sm bg-card p-2 overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-blue-500" /> Moliyaviy Dinamika
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Tanlangan davr bo'yicha tushum va foyda grafigi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="revenue" name="Jami Tushum" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Sof Foyda" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Pie */}
        <Card className="rounded-[2rem] border shadow-sm bg-card p-2 overflow-hidden h-full flex flex-col">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              <Box className="h-5 w-5 text-foreground" /> Top Mahsulotlar
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Kategoriyalar ulushi</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Bottlenecks */}
        <Card className="rounded-[2rem] border shadow-sm bg-card p-2">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-orange-500" />
              Ishlab Chiqarish To'siqlari
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Har bir bosqichdagi o'rtacha kechikish (daqiqa)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottleneckData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="display" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="vaqti" name="O'rtacha vaqt" fill="#f97316" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Worker Performance */}
        <Card className="rounded-[2rem] border shadow-sm bg-card p-2 overflow-hidden flex flex-col">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Xodimlar Reytingi
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Eng ko'p operatsiya bajargan xodimlar</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3 mt-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {worker_performance.length > 0 ? worker_performance.map((worker: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 group hover:bg-muted/60 transition-all border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-primary font-black text-xs border border-border">
                      {worker.assigned_to__first_name?.[0]}{worker.assigned_to__last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm leading-tight">{worker.assigned_to__first_name} {worker.assigned_to__last_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mt-0.5">Operator</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-black text-foreground">{worker.completed_count} ta</span>
                    <div className="h-1.5 w-20 bg-background rounded-full overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (worker.completed_count / (worker_performance[0].completed_count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 text-muted-foreground font-bold italic">Ma'lumot yo'q</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Material Consumption */}
      <Card className="rounded-[3rem] border-none shadow-xl p-8 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute -top-20 -right-20 opacity-10">
          <Box size={300} />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-2">Sklad: Xomashyo Sarfi</h3>
            <p className="text-slate-400 font-medium italic">Davr oralig'ida eng ko'p ishlatilgan materiallar</p>

            <div className="mt-8 lg:mt-12 space-y-5">
              {consumption.map((c: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-base lg:text-lg text-slate-200">{c.material__name}</span>
                    <span className="font-bold text-blue-400">{c.total_used.toLocaleString()} birlik</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                      style={{ width: `${Math.min(100, (c.total_used / (consumption[0].total_used || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-6 lg:p-8 bg-slate-900/50 rounded-[3rem] border border-slate-800 backdrop-blur-sm">
            <div className="text-center space-y-2 mb-8">
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Jami Material Xarajati</p>
              <p className="text-3xl lg:text-5xl font-black text-white">{formatCurrency(financials.total_cost)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 lg:p-6 rounded-3xl bg-slate-950 text-center border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 mb-1 uppercase">Xarajat Ulushi</p>
                <p className="text-lg lg:text-xl font-black text-red-400">{((financials.total_cost / (financials.total_revenue || 1)) * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 lg:p-6 rounded-3xl bg-slate-950 text-center border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 mb-1 uppercase">Foyda Marjasi</p>
                <p className="text-lg lg:text-xl font-black text-green-400">{((financials.net_profit / (financials.total_revenue || 1)) * 100).toFixed(1)}%</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-white/90 font-black mt-8 transition-all hover:scale-[1.02] shadow-xl">
                  BATAFSIL SKLAD HISOBOTI <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase">Materiallar Sarfi (Batafsil)</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="font-bold text-slate-400">Material Nomi</TableHead>
                        <TableHead className="font-bold text-slate-400 text-right">Jami Sarf</TableHead>
                        <TableHead className="font-bold text-slate-400 text-right">Ulush (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consumption.map((c: any, i: number) => (
                        <TableRow key={i} className="border-slate-800/50">
                          <TableCell className="font-bold">{c.material__name}</TableCell>
                          <TableCell className="text-right font-black text-blue-500">{c.total_used.toLocaleString()} birlik</TableCell>
                          <TableCell className="text-right">
                            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 font-bold text-xs">
                              {((c.total_used / (consumption.reduce((acc: number, cur: any) => acc + cur.total_used, 0) || 1)) * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </div>
  )
}

function KPIItem({ title, value, icon: Icon, color, subText, highlightColor }: any) {
  const colorMap: any = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  }

  return (
    <Card className="rounded-[2.5rem] border shadow-sm bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl border ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-3xl font-black text-foreground mt-2 font-outfit">{value}</h3>
          {subText && (
            <p className={cn("text-[10px] font-bold text-muted-foreground mt-3 flex items-center gap-1 uppercase italic tracking-wider", highlightColor)}>
              <ChevronRight className="h-3 w-3" /> {subText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
