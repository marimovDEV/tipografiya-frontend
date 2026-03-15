"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Material } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface WasteMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: Material | null
  onSuccess: () => void
}

export function WasteMaterialDialog({
  open,
  onOpenChange,
  material,
  onSuccess,
}: WasteMaterialDialogProps) {
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!material || !quantity) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(`/api/inventory/${material.id}/report_waste/`, {
        method: "POST",
        body: JSON.stringify({
          quantity: parseFloat(quantity),
          reason,
        }),
      })

      if (response.ok) {
        toast.success("Yaroqsiz material muvaffaqiyatli qayd etildi")
        onSuccess()
        onOpenChange(false)
        setQuantity("")
        setReason("")
      } else {
        const error = await response.json()
        toast.error(error.error || "Xatolik yuz berdi")
      }
    } catch (error) {
      toast.error("Server bilan bog'lanishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yaroqsiz Materialni Qayd Etish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{material?.name}</p>
            <p className="text-xs text-muted-foreground">
              Mavjud qoldiq: {material?.current_stock} {material?.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Miqdor ({material?.unit}) *</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Sabab *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masalan: Brak, yirtilgan, sifatiga mos emas..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !quantity || !reason}
          >
            {loading ? "Yuborilmoqda..." : "Qayd etish"}
            <Trash2 className="ml-2 w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
