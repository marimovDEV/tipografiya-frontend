"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, ShieldAlert, Check, RefreshCcw, PackageX } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"

interface ResetWarehouseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ResetWarehouseModal({ isOpen, onClose, onSuccess }: ResetWarehouseModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmation: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.confirmation !== "RESET") {
      toast.error("Tasdiqlash so'zi noto'g'ri (RESET deb yozishingiz shart)")
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth("/api/inventory/bulk-reset/", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Omborni tozalashda xatolik yuz berdi")
      }

      toast.success("Omborxona muvaffaqiyatli tozalandi!")
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error("Warehouse reset error:", error)
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-slate-100 rounded-3xl overflow-hidden p-0 gap-0">
        <form onSubmit={handleSubmit}>
          <div className="p-6 pb-4 border-b border-orange-900/50 bg-orange-950/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3 text-orange-500">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                    <PackageX className="h-6 w-6 text-orange-500" />
                </div>
                Omborni Tozalash
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-medium">
                Diqqat! Bu amal barcha materiallar, partiyalar va ombor tarixi ma'lumotlarini butunlay o'chirib tashlaydi.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 p-4 bg-orange-950/20 border border-orange-900/30 rounded-2xl flex gap-3 items-start">
               <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
               <div className="text-xs font-semibold text-orange-400 leading-relaxed">
                  Ushbu amalni ortga qaytarib bo'lmaydi. Faqat omborga tegishli ma'lumotlar yo'q qilinadi.
               </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Password */}
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-wider">Xavfsizlik Paroli</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-slate-950 border-slate-700 h-12 rounded-xl focus:ring-orange-500 text-slate-200"
                placeholder="••••••••"
              />
            </div>

            {/* Confirmation Keyword */}
            <div className="space-y-3">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-wider flex justify-between">
                Tasdiqlash (RESET)
                <span className="text-orange-500 text-[10px font-normal]">Hammasini o'chirish uchun RESET deb yozing</span>
              </Label>
              <Input
                type="text"
                required
                value={formData.confirmation}
                onChange={(e) => setFormData({ ...formData, confirmation: e.target.value.toUpperCase() })}
                className="bg-slate-950 border-slate-700 h-12 rounded-xl focus:ring-orange-500 font-black uppercase tracking-widest text-orange-500 placeholder:text-slate-800"
                placeholder="RESET"
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button
              type="submit"
              disabled={loading || formData.confirmation !== "RESET"}
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20 gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <>
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                  TOZALANMOQDA...
                </>
              ) : (
                <>
                  OMBORNI TO'LIQ TOZALASH
                  <Check className="h-6 w-6 stroke-[3px]" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
