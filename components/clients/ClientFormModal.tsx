"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"
import type { Client } from "@/lib/types"

interface ClientFormModalProps {
    client?: Client | null
    onClose: () => void
    onSave: (client?: Client) => void
}

export function ClientFormModal({
    client,
    onClose,
    onSave,
}: ClientFormModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: client?.full_name || "",
        company: client?.company || "",
        phone: client?.phone || "",
        email: client?.email || "",
        address: client?.address || "",
        notes: client?.notes || "",
        telegram_id: client?.telegram_id || "",
        status: client?.status || "new",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = client ? `/api/customers/${client.id}/` : "/api/customers/"
            const method = client ? "PUT" : "POST"

            const response = await fetchWithAuth(url, {
                method,
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error("Failed to save client")
            }

            const savedClient = await response.json()
            toast.success(client ? "Mijoz muvaffaqiyatli tahrirlandi" : "Mijoz muvaffaqiyatli qo'shildi")
            onSave(savedClient)
        } catch (error) {
            console.error("Error saving client:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 text-slate-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4">
                    <h2 className="text-xl font-bold">
                        {client ? "Mijozni Tahrirlash" : "Yangi Mijoz Qo'shish"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-200">To'liq ism *</Label>
                            <Input
                                id="fullName"
                                required
                                placeholder="Ism familiyani kiriting"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="bg-slate-800 border-slate-600 text-slate-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-slate-200">Kompaniya</Label>
                            <Input
                                id="company"
                                placeholder="Kompaniya nomini kiriting"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="bg-slate-800 border-slate-600 text-slate-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-200">Telefon</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+998 90 123 45 67"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-slate-800 border-slate-600 text-slate-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-slate-800 border-slate-600 text-slate-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="telegram_id" className="text-slate-200">Telegram</Label>
                            <Input
                                id="telegram_id"
                                placeholder="@username yoki ID"
                                value={formData.telegram_id}
                                onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                                className="bg-slate-800 border-slate-600 text-slate-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-200">Mijoz statusi</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-50">
                                    <SelectValue placeholder="Statusni tanlang" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-slate-50">
                                    <SelectItem value="new">Yangi</SelectItem>
                                    <SelectItem value="regular">Doimiy</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
                                    <SelectItem value="blacklist">Qora ro'yxat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-200">Manzil</Label>
                        <Input
                            id="address"
                            placeholder="Mijoz manzilini kiriting"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-slate-800 border-slate-600 text-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-slate-200">Izohlar</Label>
                        <Textarea
                            id="notes"
                            placeholder="Qo'shimcha ma'lumotlar..."
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-slate-800 border-slate-600 text-slate-50"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800"
                        >
                            Bekor qilish
                        </Button>
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                            {loading ? "Saqlanmoqda..." : "Saqlash"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
