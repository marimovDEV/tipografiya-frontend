"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical, 
  Calendar,
  Filter,
  Search,
  User as UserIcon,
  Tag
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRole } from "@/lib/context/role-context"

const COLUMN_CONFIG = [
  { id: 'pending', title: 'Kutilmoqda', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100', icon: Clock },
  { id: 'in_progress', title: 'Jarayonda', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300', icon: ActivityIcon },
  { id: 'completed', title: 'Tugadi', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300', icon: CheckCircle2 },
  { id: 'delayed', title: 'Kechikdi', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300', icon: AlertCircle },
]

export default function TasksPage() {
  const { currentRole } = useRole()
  const [tasks, setTasks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    employee: "",
    deadline: "",
    priority: "medium",
    status: "pending"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetchWithAuth("/api/tasks/"),
        fetchWithAuth("/api/users/stats/") // Using stats to get only workers easily
      ])
      
      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (usersRes.ok) setEmployees(await usersRes.json())
    } catch (error) {
      console.error("Fetch data error:", error)
      toast.error("Ma'lumotlarni yuklab bo'lmadi")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.employee) {
      toast.error("Vazifa nomi va mas'ul xodimni kiriting")
      return
    }

    try {
      const res = await fetchWithAuth("/api/tasks/", {
        method: "POST",
        body: JSON.stringify(newTask)
      })

      if (res.ok) {
        toast.success("Vazifa muvaffaqiyatli yaratildi")
        setIsCreateModalOpen(false)
        setNewTask({ title: "", description: "", employee: "", deadline: "", priority: "medium", status: "pending" })
        fetchData()
      } else {
        toast.error("Vazifani yaratishda xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Create task error:", error)
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`/api/tasks/${taskId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
        toast.success("Vazifa holati yangilandi")
      }
    } catch (error) {
      console.error("Update task status error:", error)
      toast.error("Holatni yangilashda xatolik")
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Yuqori</Badge>
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">O'rta</Badge>
      case 'low':
        return <Badge variant="secondary">Past</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header - DARK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">📋 Vazifalar</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 pl-1">Jamoa vazifalarini boshqarish va nazorat qilish</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-800 bg-slate-900 text-slate-400 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 hover:bg-slate-800 transition-all">
            <Filter className="w-4 h-4" />
            Saralash
          </Button>
          {currentRole === 'admin' && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:opacity-90 rounded-xl h-10 px-5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Yangi Vazifa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-slate-800 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden p-0">
                <DialogHeader className="bg-slate-900 p-6 border-b border-slate-800">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-white italic">Yangi Vazifa Biriktirish</DialogTitle>
                  <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    Xodimga yangi vazifa bering va muddatini belgilang.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 p-8">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vazifa nomi</Label>
                    <Input 
                      id="title" 
                      placeholder="Masalan: Banner dizayn" 
                      className="h-12 bg-slate-900 border-slate-800 rounded-xl focus-visible:ring-primary/20 text-white font-medium"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tavsif</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Vazifa haqida batafsil ma'lumot..." 
                      className="min-h-[100px] bg-slate-900 border-slate-800 rounded-xl focus-visible:ring-primary/20 text-white font-medium"
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mas'ul xodim</Label>
                      <Select value={newTask.employee} onValueChange={v => setNewTask({...newTask, employee: v})}>
                        <SelectTrigger className="h-12 bg-slate-900 border-slate-800 rounded-xl focus:ring-primary/20 text-white">
                          <SelectValue placeholder="Xodim tanlang" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id} className="focus:bg-slate-800 focus:text-white uppercase text-[10px] font-black">{emp.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioritet</Label>
                      <Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}>
                        <SelectTrigger className="h-12 bg-slate-900 border-slate-800 rounded-xl focus:ring-primary/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          <SelectItem value="low" className="focus:bg-slate-800 focus:text-white uppercase text-[10px] font-black">Past</SelectItem>
                          <SelectItem value="medium" className="focus:bg-slate-800 focus:text-white uppercase text-[10px] font-black">O'rta</SelectItem>
                          <SelectItem value="high" className="focus:bg-slate-800 focus:text-white uppercase text-[10px] font-black text-rose-400">Yuqori</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Muddat (Deadline)</Label>
                    <Input 
                      id="deadline" 
                      type="datetime-local" 
                      className="h-12 bg-slate-900 border-slate-800 rounded-xl focus-visible:ring-primary/20 text-white font-mono"
                      value={newTask.deadline}
                      onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter className="bg-slate-900 p-6 border-t border-slate-800 gap-3">
                  <Button variant="ghost" className="h-11 rounded-xl text-[11px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-white/5" onClick={() => setIsCreateModalOpen(false)}>Bekor qilish</Button>
                  <Button className="bg-primary text-white h-11 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest" onClick={handleCreateTask}>Vazifani Yaratish</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Kanban Board - DARK */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 min-w-max h-full min-h-[600px]">
          {COLUMN_CONFIG.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id)
            const Icon = column.icon

            const getColumnStyles = (id: string) => {
               switch(id) {
                  case 'pending': return 'bg-slate-900/60 border-slate-800 text-slate-400';
                  case 'in_progress': return 'bg-blue-950/20 border-blue-900/30 text-blue-400';
                  case 'completed': return 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400';
                  case 'delayed': return 'bg-rose-950/20 border-rose-900/30 text-rose-400';
                  default: return 'bg-slate-900 border-slate-800 text-slate-400';
               }
            }

            return (
              <div key={column.id} className="w-80 flex flex-col gap-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${getColumnStyles(column.id)} backdrop-blur-sm shadow-xl`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">{column.title}</h3>
                  </div>
                  <Badge className="bg-white/5 text-current border border-current/20 font-black text-[10px] px-2 py-0.5 rounded-lg shadow-inner">
                    {columnTasks.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4 p-3 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 shadow-inner">
                  {columnTasks.map(task => (
                    <Card 
                      key={task.id} 
                      className="group cursor-pointer hover:shadow-2xl hover:border-primary/40 transition-all border border-slate-800 bg-slate-900/80 rounded-2xl overflow-hidden relative"
                    >
                      <CardContent className="p-5 space-y-4 relative z-10">
                        <div className="flex items-start justify-between">
                          <h4 className="font-black text-[13px] leading-tight text-white uppercase tracking-tight group-hover:text-primary transition-colors pr-2">{task.title}</h4>
                          <MoreVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {task.description && (
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed italic">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3">
                          {task.priority === 'high' ? (
                             <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">YUQORI</Badge>
                          ) : task.priority === 'medium' ? (
                             <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">O'RTA</Badge>
                          ) : (
                             <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">PAST</Badge>
                          )}
                          
                          {task.deadline && (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-800">
                              <Calendar className="w-3 h-3 text-primary/60" />
                              {format(new Date(task.deadline), "d MMM")}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-slate-800/60 font-sans">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700/50 shadow-inner group-hover:bg-primary/20 group-hover:text-primary transition-all">
                              <UserIcon className="w-3 h-3" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter hover:text-white transition-colors group-hover:text-slate-300">
                              {task.employee_name?.split(' ')[0]}
                            </span>
                          </div>
                          
                          <Select 
                            defaultValue={task.status} 
                            onValueChange={(v) => handleUpdateTaskStatus(task.id, v)}
                          >
                            <SelectTrigger className="h-8 w-28 text-[9px] font-black uppercase tracking-widest bg-slate-800/40 border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 transition-all focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                              {COLUMN_CONFIG.map(c => (
                                <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase transition-colors focus:bg-slate-800">{c.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800/50 rounded-3xl text-slate-700 opacity-80 bg-slate-900/20">
                       <ClipboardIcon className="w-8 h-8 mb-3 opacity-20" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Bo'sh</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function ClipboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}
