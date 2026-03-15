"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    telegram_id: "",
    status: "new",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetchWithAuth("/api/customers/", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create client")
      }

      toast.success("Mijoz muvaffaqiyatli qo'shildi")
      router.push("/clients")
      router.refresh()
    } catch (error) {
      console.error("Error creating client:", error)
      toast.error("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yangi mijoz</h1>
          <p className="text-muted-foreground mt-2">Yangi mijoz ma'lumotlarini kiriting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mijoz ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">To'liq ism *</Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Ism familiyani kiriting"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Kompaniya</Label>
                <Input
                  id="company"
                  placeholder="Kompaniya nomini kiriting"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegram_id">Telegram ID / Username</Label>
                <Input
                  id="telegram_id"
                  placeholder="@username yoki ID"
                  value={formData.telegram_id}
                  onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Mijoz statusi</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue placeholder="Statusni tanlang" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Yangi</SelectItem>
                    <SelectItem value="regular">Doimiy</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="blacklist">Qora ro'yxat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Manzil</Label>
              <Input
                id="address"
                placeholder="Mijoz manzilini kiriting"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Izohlar</Label>
              <Textarea
                id="notes"
                placeholder="Qo'shimcha ma'lumotlar..."
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
              <Link href="/clients" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Bekor qilish
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
