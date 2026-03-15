"use client"

import type React from "react"
import { useRole } from "@/lib/context/role-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield, Zap, Server, Activity, Monitor, Lock, Cpu, Globe, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { login } = useRole()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Ensure no double slashes and correct trailing slash
      const baseUrl = API_URL?.replace(/\/$/, "") || ""
      const endpoint = "/api/login/"
      const fullUrl = `${baseUrl}${endpoint}`

      console.log("Login attempt:", { fullUrl, username })

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response. Check console for details.")
      }

      const data = await response.json()

      if (!response.ok) {
        console.error("Login failed response:", data)
        throw new Error(data.error || data.detail || `Login failed: ${response.status}`)
      }

      login(data.token, data.user)
      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Login error details:", error)
      setError(error instanceof Error ? error.message : "Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* LEFT SIDE - BRANDING & INDUSTRIAL INFO */}
      <div className="hidden lg:flex w-7/12 flex-col justify-between p-12 bg-[#1e293b] relative overflow-hidden border-r border-[#334155]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        
        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                Print<span className="text-blue-500">ERP</span>
              </h1>
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase mt-1">Enterprise Resource Planning</p>
            </div>
          </div>

          <div className="space-y-6 mt-20">
            <h2 className="text-5xl font-black text-white leading-tight uppercase italic tracking-tighter">
              Industrial <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Production</span> <br />
              Management
            </h2>
            <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed">
              Zamonamiy tipografiya va bosmaxonalar uchun mo'ljallangan, ishlab chiqarishni to'liq avtomatlashtirish va nazorat qilish tizimi.
            </p>
          </div>
        </div>

        {/* Bottom Status Panel */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Server size={14} className="text-blue-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Server</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-white">ONLINE</span>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Production</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-white">ACTIVE</span>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Monitor size={14} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">4 UNIT</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">
            <Globe size={12} />
            <span>Regional Network: Tashkent Central Node</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-6">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Shield size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">PrintERP</h1>
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Tizimga Kirish</h2>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Xavfsiz terminal orqali autentifikatsiya</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="username" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foydalanuvchi-ID</label>
                  <Cpu size={12} className="text-slate-700" />
                </div>
                <div className="relative group">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masalan: admin_01"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl px-6 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-bold placeholder:text-slate-700 border-2"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Zap size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maxfiy Kalit (Parol)</label>
                  <Lock size={12} className="text-slate-700" />
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-14 bg-slate-900/50 border-slate-800 rounded-2xl px-6 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-white font-bold placeholder:text-slate-700 border-2"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                <p className="text-[11px] font-black text-rose-500 uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            <Button 
                type="submit" 
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 group uppercase text-[11px] tracking-[0.2em]" 
                disabled={isLoading}
            >
              <span className="flex items-center gap-3">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AUTENTIFIKATSIYA...
                  </>
                ) : (
                  <>
                    TIZIMGA KIRISH
                    <Zap size={16} className="fill-white group-hover:scale-110 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <div className="pt-10 flex flex-col items-center gap-6">
            <div className="h-px w-20 bg-slate-800" />
            
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-1.5"><Monitor size={10} /> TERMINAL: ERP-FACTORY-X01</span>
                    <span className="h-1 w-1 bg-slate-800 rounded-full" />
                    <span className="flex items-center gap-1.5 text-emerald-500/60"><Zap size={10} /> ENCRYPTION: active</span>
                </div>
                <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">© 2026 PrintERP Industrial OS • All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
