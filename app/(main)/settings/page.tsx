"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"
import { DEFAULT_SETTINGS } from "@/lib/default-settings"
import { EmployeesTab } from "@/components/settings/EmployeesTab"
import { FinanceTab } from "@/components/settings/FinanceTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users2, DollarSign, Settings2, Binary, ShieldAlert } from "lucide-react"
import { ResetSystemModal } from "@/components/settings/ResetSystemModal"

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetchWithAuth("/api/settings/"),
        fetchWithAuth("/api/users/")
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings({ ...DEFAULT_SETTINGS, ...data })
      }

      if (usersRes.ok) {
        const userData = await usersRes.json()
        setUsers(userData)
      }
    } catch (error: any) {
      console.error("Settings error:", error)
      toast.error("Sozlamalarni yuklab bo'lmadi")
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TERMINAL YUKLANMOQDA...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 min-w-[1240px]">
      {/* Header - DARK STYLE */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Sistem Sozlamalari</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 pl-1 mt-1">
            <Binary className="w-3.5 h-3.5 text-primary/40" />
            Konfiguratsiya Markazi • v1.4-STABLE
          </p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 mb-10 h-14 backdrop-blur-sm shadow-xl">
          <TabsTrigger 
            value="employees" 
            className="rounded-xl px-10 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all h-full"
          >
            <Users2 className="w-4 h-4" />
            Xodimlar Boshqaruvi
          </TabsTrigger>
          <TabsTrigger 
            value="finance" 
            className="rounded-xl px-10 data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all h-full"
          >
            <DollarSign className="w-4 h-4" />
            Moliya Rejalashtirish
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-xl px-10 data-[state=active]:bg-red-500 data-[state=active]:text-white flex items-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all h-full"
          >
            <ShieldAlert className="w-4 h-4" />
            Tizim Xavfsizligi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <EmployeesTab
            settings={settings}
            setSettings={setSettings}
            users={users}
          />
        </TabsContent>

        <TabsContent value="finance" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FinanceTab />
        </TabsContent>

        <TabsContent value="security" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase italic">Tizimni Tozalash</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Barcha operatsion ma'lumotlarni o'chirish</p>
                </div>
              </div>
              
              <div className="p-4 bg-red-950/20 border border-red-900/20 rounded-2xl">
                <p className="text-xs text-red-400 font-medium leading-relaxed">
                  DIQQAT: Ushbu amal barcha buyurtmalar, mijozlar, to'lovlar va ombor tarixini butunlay o'chirib tashlaydi.
                  Faqat yangi bazadan boshlamoqchi bo'lsangiz ishlating.
                </p>
              </div>

              <button
                onClick={() => setIsResetModalOpen(true)}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3"
              >
                TIZIMNI RESET QILISH (DANGER ZONE)
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ResetSystemModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
      />
    </div>
  )
}
