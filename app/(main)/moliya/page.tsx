"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Search, 
  Filter, 
  Download,
  Calendar,
  User,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { format } from "date-fns"

const CATEGORIES = {
  income: [
    { value: "Buyurtma to'lovi", label: "Buyurtma to'lovi" },
    { value: "Boshqa", label: "Boshqa foyda" }
  ],
  expense: [
    { value: "Ish haq", label: "Ish haqi (Salary)" },
    { value: "Material", label: "Material sotib olish" },
    { value: "Ijara", label: "Ijara" },
    { value: "Kommunal", label: "Kommunal to'lovlar" },
    { value: "Solig'", label: "Soliqlar" },
    { value: "Boshqa", label: "Boshqa harajat" }
  ]
}

export default function MoliyaPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "Boshqa",
    worker: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd")
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transRes, workersRes] = await Promise.all([
        fetchWithAuth("/api/transactions/"),
        fetchWithAuth("/api/users/stats/")
      ])
      
      if (transRes.ok) setTransactions(await transRes.json())
      if (workersRes.ok) setWorkers(await workersRes.json())
    } catch (error) {
      console.error("Fetch finance data error:", error)
      toast.error("Ma'lumotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) {
      toast.error("Summa va kategoriyani kiritish majburiy")
      return
    }

    try {
      const res = await fetchWithAuth("/api/transactions/", {
        method: "POST",
        body: JSON.stringify({
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          worker: formData.category === "Ish haq" ? formData.worker : null,
          description: formData.description,
          date: formData.date
        })
      })

      if (res.ok) {
        toast.success("Amaliyot muvaffaqiyatli saqlandi")
        setIsModalOpen(false)
        setFormData({
          type: "expense",
          amount: "",
          category: "Boshqa",
          worker: "",
          description: "",
          date: format(new Date(), "yyyy-MM-dd")
        })
        fetchData()
      } else {
        toast.error("Xatolik yuz berdi")
      }
    } catch (error) {
      console.error("Submit transaction error:", error)
      toast.error("Tizimda xatolik")
    }
  }

  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0),
    balance: 0
  }
  stats.balance = stats.totalIncome - stats.totalExpense

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.worker_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">💰 Moliya Markazi</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 pl-1">Pul oqimi va harajatlar nazorati</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-400 font-black text-[10px] uppercase tracking-widest gap-2 h-12 px-6 hover:bg-slate-800 transition-all">
            <Download className="w-4 h-4" />
            Eksport (Excel)
          </Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:opacity-90 rounded-xl h-12 px-8 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all border-none">
                <Plus className="w-5 h-5 mr-2" />
                Yangi Operatsiya
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] border-slate-800 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden p-0">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="bg-slate-900 p-8 border-b border-slate-800">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white italic">Pul Oqimi Qo'shish</DialogTitle>
                  <DialogDescription className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    Kirim yoki chiqim amaliyotini ro'yxatga oling.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 p-8">
                  {/* Type Selector */}
                  <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'income', category: CATEGORIES.income[0].value})}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Kirim
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'expense', category: CATEGORIES.expense[0].value})}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      Chiqim
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Summa (UZS)</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        className="h-14 bg-slate-900 border-slate-800 rounded-2xl focus-visible:ring-primary/20 text-xl font-black text-white px-6"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sana</Label>
                      <Input 
                        type="date" 
                        className="h-14 bg-slate-900 border-slate-800 rounded-2xl focus-visible:ring-primary/20 font-mono text-white px-6"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Turkum (Kategoriya)</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={v => setFormData({...formData, category: v})}
                      >
                        <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-white px-6 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          {(formData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense).map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="focus:bg-slate-900 font-black text-[10px] uppercase tracking-wider py-3">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.category === "Ish haq" && (
                      <div className="space-y-2 animate-in slide-in-from-right duration-300">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Xodim</Label>
                        <Select 
                          value={formData.worker} 
                          onValueChange={v => setFormData({...formData, worker: v})}
                        >
                          <SelectTrigger className="h-14 bg-slate-900 border-slate-800 rounded-2xl text-white px-6">
                            <SelectValue placeholder="Xodimni tanlang" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-slate-800 text-white">
                            {workers.map(w => (
                              <SelectItem key={w.id} value={w.id} className="focus:bg-slate-900 font-black text-[10px] uppercase py-3">
                                {w.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Izoh (Tavsif)</Label>
                    <Input 
                      placeholder="Qisqacha izoh kiriting..."
                      className="h-14 bg-slate-900 border-slate-800 rounded-2xl focus-visible:ring-primary/20 text-white px-6"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <DialogFooter className="bg-slate-900 p-8 border-t border-slate-800 gap-4">
                  <Button 
                    variant="ghost" 
                    type="button"
                    className="h-12 rounded-xl text-[11px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-white/5" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-primary text-white h-12 px-10 rounded-xl font-black text-[11px] uppercase tracking-widest border-none shadow-lg shadow-primary/20"
                  >
                    Saqlash
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-slate-900/40 border-slate-800 rounded-[2rem] overflow-hidden relative group hover:border-emerald-500/30 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jami Daromad</CardDescription>
            <CardTitle className="text-4xl font-black text-white tracking-tighter italic">KIRIM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-400">
              {stats.totalIncome.toLocaleString()} <span className="text-sm opacity-50">UZS</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 rounded-[2rem] overflow-hidden relative group hover:border-rose-500/30 transition-all duration-500 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingDown className="w-16 h-16 text-rose-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jami Harajatlar</CardDescription>
            <CardTitle className="text-4xl font-black text-white tracking-tighter italic">CHIQIM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-400">
              {stats.totalExpense.toLocaleString()} <span className="text-sm opacity-50">UZS</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-primary/20 rounded-[2rem] overflow-hidden relative group shadow-[0_0_50px_rgba(79,70,229,0.1)] hover:border-primary/40 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <Wallet className="w-16 h-16 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Balans (Sof foyda)</CardDescription>
            <CardTitle className="text-4xl font-black text-white tracking-tighter italic">QOLDIQ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black ${stats.balance >= 0 ? 'text-primary' : 'text-rose-400'}`}>
              {stats.balance.toLocaleString()} <span className="text-sm opacity-50">UZS</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-3xl">
        <CardHeader className="p-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">Operatsiyalar Tarixi</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Barcha moliyaviy harakatlar ro'yxati</CardDescription>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Qidirish (izoh, kategoriya, xodim)..." 
                className="pl-14 h-14 bg-slate-950 border-slate-800 rounded-2xl focus-visible:ring-primary/20 text-white font-medium shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="py-6 px-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</TableHead>
                  <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Turi x Kategoriya</TableHead>
                  <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Izoh</TableHead>
                  <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bog'lanish</TableHead>
                  <TableHead className="py-6 text-right px-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Summa (UZS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id} className="border-slate-800/50 hover:bg-white/5 transition-colors group">
                    <TableCell className="py-6 px-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 font-mono text-xs text-slate-400">
                          {format(new Date(t.date), "dd")}
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase italic">
                          {format(new Date(t.date), "MMM, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="space-y-1.5 min-w-[150px]">
                        <div className="flex items-center gap-2">
                           {t.type === 'income' ? 
                             <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black px-1.5 py-0">KIRIM</Badge> :
                             <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black px-1.5 py-0">CHIQIM</Badge>
                           }
                        </div>
                        <div className="text-[11px] font-black text-white uppercase tracking-tight">{t.category}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <p className="text-[11px] font-medium text-slate-400 italic max-w-xs truncate">
                        {t.description || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="py-6">
                      {t.worker_name ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 w-fit">
                          <User className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-black text-primary uppercase">{t.worker_name}</span>
                        </div>
                      ) : t.client_name ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 w-fit">
                          <User className="w-3 h-3 text-blue-400" />
                          <span className="text-[9px] font-black text-blue-400 uppercase">{t.client_name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-700 italic uppercase">Umumiy</span>
                      )}
                    </TableCell>
                    <TableCell className="py-6 text-right px-10">
                      <div className={`text-lg font-black tracking-tighter ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : '-'} {parseFloat(t.amount).toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                         <CircleDollarSign className="w-16 h-16 text-slate-600" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Operatsiyalar topilmadi</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
