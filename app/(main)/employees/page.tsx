"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Phone, ClipboardList, TrendingUp, Users, Activity, Layers } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import Link from "next/link"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetchWithAuth("/api/users/stats/")
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      } else {
        toast.error("Xodimlar ma'lumotlarini yuklab bo'lmadi")
      }
    } catch (error) {
      console.error("Fetch employees error:", error)
      toast.error("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px] uppercase px-2 py-0.5">Ishlamoqda</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black text-[10px] uppercase px-2 py-0.5">Jarayonda</Badge>
      case 'completed':
        return <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black text-[10px] uppercase px-2 py-0.5">Tugatdi</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-800 text-slate-500 border border-slate-700 font-black text-[10px] uppercase px-2 py-0.5">Yo'q</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
            <p className="text-sm font-black text-slate-500 tracking-[0.2em]">TIZIM YUKLANMOQDA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-[1240px] px-8 py-6 space-y-6 bg-slate-950 min-h-screen font-sans text-slate-100 pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex items-center gap-6">
            <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-3 text-white uppercase italic">
                    XODIMLAR MARKAZI
                    <Badge className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                        STAFF v2.0
                    </Badge>
                </h1>
                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-0.5 italic">Xodimlar ish faoliyati va tarkibiy monitoringi</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="ISMNI QIDIRING..." 
                    className="pl-10 h-10 bg-slate-800/50 border-slate-700 text-slate-100 font-bold placeholder:text-slate-600 rounded-xl focus:ring-primary focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Link href="/settings">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 border border-primary/20 shadow-lg shadow-primary/20 px-6">
                    <UserPlus className="w-4 h-4" />
                    YANGI XODIM
                </Button>
            </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Users className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jami Xodimlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white italic">{employees.length} <span className="text-xs font-normal text-slate-500 tracking-normal opacity-50">nafar</span></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Activity className="h-16 w-16 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hozir Ishda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400 italic">
              {employees.filter(e => e.status === 'working' || e.status === 'in_progress').length} <span className="text-xs font-normal text-slate-500 tracking-normal opacity-50">nafar</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <ClipboardList className="h-16 w-16 text-blue-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bugungi Vazifalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-400 italic">
              {employees.reduce((acc, curr) => acc + (curr.tasks_today || 0), 0)} <span className="text-xs font-normal text-slate-500 tracking-normal opacity-50">ta</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <TrendingUp className="h-16 w-16 text-amber-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Samaradorlik (O'rtacha)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-400 italic">4.9 <span className="text-xs font-normal text-slate-500 tracking-normal opacity-50">ball</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-premium bg-slate-900/40 border border-slate-800 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800/30 border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-black tracking-tight text-white uppercase italic">Xodimlar Ro'yxati</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-800/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Xodim</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lavozim</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bog'lanish</TableHead>
                <TableHead className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Bugungi Vazifa</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Holati</TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Boshqaruv</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800">
              {filteredEmployees.map((worker) => (
                <TableRow key={worker.id} className="group border-slate-800 transition-all hover:bg-white/5">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-slate-800 shadow-xl group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={`https://avatar.vercel.sh/${worker.id}.png`} />
                        <AvatarFallback className="bg-slate-800 text-slate-400 font-black">
                          {worker.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-sm text-slate-100 group-hover:text-primary transition-colors">{worker.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-tighter uppercase italic">ID: {worker.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className="font-black text-[10px] uppercase border-slate-700 bg-slate-800/50 text-slate-300 px-2 py-0.5 tracking-widest">
                      {worker.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      {worker.phone || "KRITILMAGAN"}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-sm border border-primary/20 shadow-lg shadow-primary/5 group-hover:scale-110 transition-transform">
                      {worker.tasks_today || 0}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {getStatusBadge(worker.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Link href={`/employees/${worker.id}`}>
                      <Button variant="ghost" size="sm" className="rounded-xl bg-slate-800 hover:bg-primary hover:text-white text-slate-400 font-black text-[10px] px-4 gap-2 transition-all group-hover:shadow-lg group-hover:shadow-primary/20">
                        PROFILNI KO'RISH
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center opacity-40">
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                    <p className="text-sm font-black text-slate-600 uppercase tracking-widest italic">Xodimlar topilmadi</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
