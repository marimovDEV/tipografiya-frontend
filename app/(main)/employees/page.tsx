"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  UserPlus, 
  Phone, 
  ClipboardList, 
  TrendingUp, 
  Users, 
  Activity, 
  Layers,
  Pencil,
  Trash2,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import Link from "next/link"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Visibility toggles
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Form States
  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "worker"
  })

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    role: "worker",
    password: ""
  })

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

  const handleCreateUser = async () => {
    if (!addForm.username || !addForm.password || !addForm.first_name || !addForm.last_name) {
      toast.error("Barcha majburiy maydonlarni to'ldiring")
      return
    }
    setActionLoading(true)
    try {
      const res = await fetchWithAuth("/api/users/", {
        method: "POST",
        body: JSON.stringify(addForm)
      })
      if (res.ok) {
        toast.success("Yangi xodim qo'shildi")
        setIsAddModalOpen(false)
        setAddForm({ username: "", password: "", first_name: "", last_name: "", role: "worker" })
        fetchEmployees()
      } else {
        const err = await res.json()
        toast.error(err.detail || err.username?.[0] || "Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Tizimda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role || "worker",
      password: ""
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editForm.first_name || !editForm.last_name) {
      toast.error("Ism va familiya majburiy")
      return
    }
    setActionLoading(true)
    try {
      const payload: any = { ...editForm }
      if (!payload.password) delete payload.password

      const res = await fetchWithAuth(`/api/users/${selectedUser.id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success("Ma'lumotlar yangilandi")
        setIsEditModalOpen(false)
        fetchEmployees()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Tizimda xatolik")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteUser = async () => {
    setActionLoading(true)
    try {
      const res = await fetchWithAuth(`/api/users/${selectedUser.id}/`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Xodim o'chirildi")
        setIsDeleteModalOpen(false)
        fetchEmployees()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Tizimda xatolik")
    } finally {
      setActionLoading(false)
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
            <Button 
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 border border-primary/20 shadow-lg shadow-primary/20 px-6"
                onClick={() => setIsAddModalOpen(true)}
            >
                <UserPlus className="w-4 h-4" />
                YANGI XODIM
            </Button>
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
                    <div className="flex items-center justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-primary hover:text-white text-slate-400"
                            onClick={() => handleEditClick(worker)}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {worker.role !== 'admin' && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-400"
                                onClick={() => handleDeleteClick(worker)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Link href={`/employees/${worker.id}`}>
                          <Button variant="ghost" size="sm" className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 font-black text-[10px] px-3 gap-2 border border-slate-700/50">
                            PROFIL
                          </Button>
                        </Link>
                    </div>
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

      {/* MODALS */}
      {/* Add Employee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[500px] rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-slate-800/50 px-8 py-6 border-b border-slate-800">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Yangi Xodim Qo'shish</DialogTitle>
            <DialogDescription className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Tizim uchun yangi operator protokoli yaratish</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ism *</Label>
                <Input 
                  value={addForm.first_name} 
                  onChange={e => setAddForm({...addForm, first_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                  placeholder="Ismni kiriting"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Familiya *</Label>
                <Input 
                  value={addForm.last_name} 
                  onChange={e => setAddForm({...addForm, last_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                  placeholder="Familiyani kiriting"
                />
              </div>
            </div>
            <div className="space-y-4">
               <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Login (Username) *</Label>
                <Input 
                  value={addForm.username} 
                  onChange={e => setAddForm({...addForm, username: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                  placeholder="tizim_logini"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parol *</Label>
                <div className="relative">
                  <Input 
                    type={showAddPassword ? "text" : "password"}
                    value={addForm.password} 
                    onChange={e => setAddForm({...addForm, password: e.target.value})}
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold pr-10"
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                  >
                    {showAddPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol / Lavozim</Label>
                <Select value={addForm.role} onValueChange={v => setAddForm({...addForm, role: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="worker" className="font-bold text-xs uppercase">Ishchi / Operator</SelectItem>
                        <SelectItem value="admin" className="font-bold text-xs uppercase">Administrator</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-800/30 px-8 py-6 border-t border-slate-800">
            <Button variant="ghost" className="text-slate-500 font-black text-[10px] uppercase h-11" onClick={() => setIsAddModalOpen(false)}>Bekor qilish</Button>
            <Button className="bg-primary text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl" onClick={handleCreateUser} disabled={actionLoading}>
                {actionLoading ? "Yaratilmoqda..." : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[500px] rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="bg-slate-800/50 px-8 py-6 border-b border-slate-800">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Xodimni Tahrirlash</DialogTitle>
            <DialogDescription className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Mavjud xodim ma'lumotlarini yangilash</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ism</Label>
                <Input 
                  value={editForm.first_name} 
                  onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Familiya</Label>
                <Input 
                  value={editForm.last_name} 
                  onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                  className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yangi Parol (Ixtiyoriy)</Label>
                <div className="relative">
                  <Input 
                    type={showEditPassword ? "text" : "password"}
                    value={editForm.password} 
                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                    placeholder="O'zgartirish uchun kiriting..."
                    className="bg-slate-950 border-slate-800 h-12 rounded-xl focus:ring-primary text-sm font-bold pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol / Lavozim</Label>
                <Select value={editForm.role} onValueChange={v => setEditForm({...editForm, role: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl text-sm font-bold">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="worker" className="font-bold text-xs uppercase">Ishchi / Operator</SelectItem>
                        <SelectItem value="admin" className="font-bold text-xs uppercase">Administrator</SelectItem>
                        <SelectItem value="warehouse" className="font-bold text-xs uppercase">Omborchi</SelectItem>
                        <SelectItem value="accountant" className="font-bold text-xs uppercase">Buxgalter</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-800/30 px-8 py-6 border-t border-slate-800">
            <Button variant="ghost" className="text-slate-500 font-black text-[10px] uppercase h-11" onClick={() => setIsEditModalOpen(false)}>Bekor qilish</Button>
            <Button className="bg-primary text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl" onClick={handleUpdateUser} disabled={actionLoading}>
                {actionLoading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 rounded-3xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic tracking-tight">Xodimni o&apos;chirish?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-xs font-medium">Bu amalni ortga qaytarib bo&apos;lmaydi. Xodim <b>{selectedUser?.username}</b> tizimdan butunlay o&apos;chiriladi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-slate-900 border-slate-800 text-slate-400 font-black text-[10px] uppercase h-11">BEKOR QILISH</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl"
            >
                O&apos;CHIRISH
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
