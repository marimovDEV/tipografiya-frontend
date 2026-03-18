"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"

export default function EditOrderPage() {
    const { id } = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [formData, setFormData] = useState<any>({
        box_type: "",
        quantity: 0,
        total_price: 0,
        deadline: "",
        notes: "",
        book_name: "",
        page_count: 0
    })

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            const response = await fetchWithAuth(`/api/orders/${id}/`)
            if (!response.ok) throw new Error("Order not found")
            const data = await response.json()
            setFormData({
                box_type: data.box_type || "",
                quantity: data.quantity || 0,
                total_price: data.total_price || 0,
                deadline: data.deadline ? data.deadline.split('T')[0] : "",
                notes: data.notes || "",
                book_name: data.book_name || "",
                page_count: data.page_count || 0
            })
        } catch (error) {
            console.error("Error:", error)
            toast.error("Buyurtma ma'lumotlarini yuklab bo'lmadi")
            router.push("/orders")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        try {
            const res = await fetchWithAuth(`/api/orders/${id}/`, {
                method: "PATCH",
                body: JSON.stringify(formData)
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.non_field_errors?.[0] || "Saqlashda xatolik yuz berdi")
            }
            toast.success("Buyurtma muvaffaqiyatli yangilandi")
            router.push(`/orders/${id}`)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setUpdating(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Yuklanmoqda...</div>

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-slate-900 border-slate-800 rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">Buyurtmani Tahrirlash</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">ID: #{id}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="bg-slate-900/40 border-slate-800 rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-slate-800 p-8">
                        <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Asosiy ma'lumotlar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Mahsulot nomi</Label>
                            <Input 
                                value={formData.box_type} 
                                onChange={e => setFormData({...formData, box_type: e.target.value})}
                                className="bg-slate-950 border-slate-800 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Miqdori (ta)</Label>
                            <Input 
                                type="number"
                                value={formData.quantity} 
                                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                                className="bg-slate-950 border-slate-800 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Umumiy summa (so'm)</Label>
                            <Input 
                                type="number"
                                value={formData.total_price} 
                                onChange={e => setFormData({...formData, total_price: parseFloat(e.target.value)})}
                                className="bg-slate-950 border-slate-800 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Deadline (Muddat)</Label>
                            <Input 
                                type="date"
                                value={formData.deadline} 
                                onChange={e => setFormData({...formData, deadline: e.target.value})}
                                className="bg-slate-950 border-slate-800 focus:ring-blue-500 rounded-xl [color-scheme:dark]"
                            />
                        </div>

                        {formData.book_name !== undefined && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500">Kitob nomi</Label>
                                    <Input 
                                        value={formData.book_name} 
                                        onChange={e => setFormData({...formData, book_name: e.target.value})}
                                        className="bg-slate-950 border-slate-800 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-500">Betlar soni</Label>
                                    <Input 
                                        type="number"
                                        value={formData.page_count} 
                                        onChange={e => setFormData({...formData, page_count: parseInt(e.target.value)})}
                                        className="bg-slate-950 border-slate-800 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Ichki izohlar</Label>
                            <Textarea 
                                value={formData.notes} 
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                className="bg-slate-950 border-slate-800 focus:ring-blue-500 min-h-[120px] rounded-xl"
                                placeholder="Buyurtma bo'yicha qo'shimcha izohlar..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="bg-slate-900 border-slate-800 rounded-xl h-12 px-8 uppercase font-black text-xs">
                        Bekor qilish
                    </Button>
                    <Button type="submit" disabled={updating} className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest px-12 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Saqlash
                    </Button>
                </div>
            </form>
        </div>
    )
}
