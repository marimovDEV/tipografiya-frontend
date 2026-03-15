"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowLeft, Package,
    User, Calendar, Clock, FileText, ExternalLink,
    Settings, DollarSign, TrendingUp, CheckCircle2,
    Truck, Box, XCircle, ChevronRight, AlertCircle, Play, Book, Edit
} from "lucide-react"
import { getStatusLabel, getStatusBadgeColor, formatCurrency } from "@/lib/data/mock-data"
import { fetchWithAuth } from "@/lib/api-client"
import { Order, OrderStatus } from "@/lib/types"
import { useRole } from "@/lib/context/role-context"
import Link from "next/link"
import { toast } from "sonner"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function OrderDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { currentRole } = useRole()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    const isAdmin = currentRole === "admin" || currentRole === "accountant"

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            const response = await fetchWithAuth(`/api/orders/${id}/`)
            if (!response.ok) throw new Error("Order not found")
            const data = await response.json()
            setOrder(data)
        } catch (error) {
            console.error("Error:", error)
            toast.error("Buyurtma topilmadi")
        } finally {
            setLoading(false)
        }
    }


    const handleApprove = async () => {
        setUpdating(true)
        try {
            const res = await fetchWithAuth(`/api/orders/${id}/approve/`, { method: "POST" })
            if (!res.ok) throw new Error("Orderni tasdiqlab bo'lmadi")
            toast.success("Buyurtma tasdiqlandi va ishlab chiqarishga yuborildi")
            fetchOrder()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setUpdating(false)
        }
    }

    const renderAdditionalProcessing = (raw: string | null) => {
        if (!raw) return null
        
        try {
            // Check if it's a JSON string
            if (raw.startsWith('{')) {
                const data = JSON.parse(raw)
                
                const labels: Record<string, string> = {
                    binding: 'Bog\'lash',
                    lamination: 'Laminatsiya',
                    internal_paper: 'Ichki qog\'oz',
                    cover_paper: 'Muqova qog\'ozi',
                    gluing: 'Qo\'shimcha yelim',
                    cover_lamination: 'Muqova laminatsiyasi',
                    binding_type: 'Muqova bog\'lash'
                }

                const valueMap: Record<string, string> = {
                    termokley: 'Termokley',
                    thread: 'Ip bilan tikish',
                    staple: 'Skoba',
                    none: 'Yo\'q',
                    matte: 'Mat laminatsiya',
                    glossy: 'Yaltiroq (Glossy)',
                    soft_touch: 'Soft touch',
                    true: 'Ha',
                    false: 'Yo\'q'
                }

                return (
                    <div className="md:col-span-2 mt-4 space-y-2 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Qo'shimcha ishlov</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            {Object.entries(data).map(([key, value]) => {
                                const label = labels[key] || key
                                const displayValue = value === true ? 'Ha' : value === false ? 'Yo\'q' : (valueMap[String(value)] || String(value))
                                if (value === 'none' || value === false) return null // Skip 'none' to keep it clean
                                
                                return (
                                    <div key={key} className="flex justify-between border-b border-slate-800/50 pb-1">
                                        <span className="text-sm text-slate-400">{label}:</span>
                                        <span className="text-sm font-medium text-slate-200">{displayValue}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            }
        } catch (e) {
            console.error("JSON parse error for additional_processing", e)
        }

        return (
            <div className="md:col-span-2 mt-2 p-3 bg-muted rounded-md text-sm italic">
                <strong>Qo'shimcha ishlov:</strong> {raw}
            </div>
        )
    }

    if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>
    if (!order) return <div className="p-8 text-center">Buyurtma topilmadi</div>

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">Buyurtma #{order.order_number?.split('-').pop()}</h1>
                            <Badge className={getStatusBadgeColor(order.status)}>
                                {getStatusLabel(order.status)}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Yaratilgan sana: {new Date(order.created_at).toLocaleString("uz-UZ")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'pending' && (
                        <Button onClick={handleApprove} disabled={updating} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            <Play className="h-4 w-4" /> Ishlab chiqarishga yuborish
                        </Button>
                    )}
                </div>
            </div>

            {/* Advance Payment Warning */}
            {order.advance_payment === 0 && (order.status === 'pending' || order.status === 'approved') && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">⚠ Avans kutilmoqda</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            Ushbu buyurtma uchun hali avans to'lovi kiritilmagan. Ishlab chiqarishni boshlashdan oldin avans olish tavsiya etiladi.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Main Info & Specs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Mahsulot Tafsiloti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Mahsulot nomi:</span>
                                    <span className="font-semibold">{order.box_type}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Miqdori:</span>
                                    <span className="font-semibold">{order.quantity.toLocaleString()} dona</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">O'lchamlari:</span>
                                    <span className="font-semibold">
                                        {order.paper_width || '-'} x {order.paper_height || '-'} sm
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Qog'oz:</span>
                                    <span className="font-semibold">{order.paper_type} ({order.paper_density} gr/m²)</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Pechat turi:</span>
                                    <span className="font-semibold">{order.print_type}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Ranglar:</span>
                                    <span className="font-semibold">{order.print_colors}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Laklash:</span>
                                    <span className="font-semibold">{order.lacquer_type || "Yo'q"}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Kesish:</span>
                                    <span className="font-semibold">{order.cutting_type}</span>
                                </div>
                            </div>

                            {order.book_name && (
                                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                        <Book className="h-4 w-4" /> Kitob Tafsilotlari
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        <div className="flex justify-between border-b border-primary/10 pb-2">
                                            <span className="text-muted-foreground">Kitob Nomi:</span>
                                            <span className="font-bold text-slate-100">{order.book_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-primary/10 pb-2">
                                            <span className="text-muted-foreground">Betlar Soni:</span>
                                            <span className="font-bold text-slate-100">{order.page_count} bet</span>
                                        </div>
                                        <div className="flex justify-between border-b border-primary/10 pb-2">
                                            <span className="text-muted-foreground">Muqova Turi:</span>
                                            <span className="font-bold text-slate-100">
                                                {order.cover_type === 'hard' ? 'Qattiq' :
                                                    order.cover_type === 'soft' ? 'Yumshoq' :
                                                        order.cover_type === 'integral' ? 'Integral' : order.cover_type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {renderAdditionalProcessing(order.additional_processing)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Maket va Fayllar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.mockup_url ? (
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded text-blue-600">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-blue-900">Dizayn maketi</p>
                                            <p className="text-xs text-blue-600">PDF / Raster formatda</p>
                                        </div>
                                    </div>
                                    <a href={order.mockup_url} target="_blank" rel="noreferrer">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <ExternalLink className="h-4 w-4" /> Ochish
                                        </Button>
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground">
                                    <p>Maket yuklanmagan</p>
                                    <Button variant="link" size="sm">Hozir yuklash</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline / Production Steps */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ishlab chiqarish jarayoni</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative space-y-0 pb-4">
                                {order.production_steps && order.production_steps.length > 0 ? (
                                    order.production_steps.map((step, idx) => (
                                        <div key={step.id} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white ${step.status === 'completed' ? 'border-green-500 text-green-500' :
                                                    step.status === 'in_progress' ? 'border-blue-500 text-blue-500 animate-pulse' :
                                                        'border-gray-200 text-gray-300'
                                                    }`}>
                                                    {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                                </div>
                                                {idx < (order.production_steps?.length || 0) - 1 && (
                                                    <div className={`w-0.5 flex-1 bg-gray-200 ${step.status === 'completed' ? 'bg-green-200' : ''}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-8">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={`font-semibold ${step.status === 'completed' ? 'text-green-700' : ''}`}>
                                                        {(() => {
                                                            const map: Record<string, string> = {
                                                                'queue': 'Navbatda',
                                                                'prepress': 'Prepress (maket)',
                                                                'printing_internal': 'Bosma (ichki)',
                                                                'printing_cover': 'Bosma (muqova)',
                                                                'folding': 'Faltsovka',
                                                                'assembly': "Yig'ish",
                                                                'binding': 'Termokley / Tikish',
                                                                'trimming': 'Uch tomondan kesish',
                                                                'printing': 'Chop etish',
                                                                'gluing': 'Yelimlash',
                                                                'drying': 'Quritish',
                                                                'packaging': 'Qadoqlash',
                                                                'packing': 'Qadoqlash',
                                                                'ready': 'Tayyor'
                                                            }
                                                            const key = step.step.toLowerCase()
                                                            return map[key] || step.step.charAt(0).toUpperCase() + step.step.slice(1)
                                                        })()}
                                                    </h4>
                                                    <Badge variant="secondary" className="text-[10px] h-5">
                                                        {(() => {
                                                            const statusMap: Record<string, string> = {
                                                                'pending': 'Kutilmoqda',
                                                                'in_progress': 'Jarayonda',
                                                                'completed': 'Bajarildi',
                                                                'failed': 'Xatolik',
                                                                'cancelled': 'Bekor qilindi'
                                                            }
                                                            return statusMap[step.status] || step.status
                                                        })()}
                                                    </Badge>
                                                </div>
                                                {step.completed_at && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Bajarildi: {new Date(step.completed_at).toLocaleString("uz-UZ")}
                                                    </p>
                                                )}
                                                {step.notes && <p className="text-sm text-muted-foreground mt-2 px-2 border-l-2">{step.notes}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-muted-foreground text-center py-4 italic">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        Jarayonlar hali boshlanmagan
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column: Sidebar Cards */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Mijoz Ma'lumoti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-50">{order.client?.full_name}</p>
                                <p className="text-xs text-slate-400">{order.client?.company}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>Topshirish: {order.deadline ? new Date(order.deadline).toLocaleDateString("uz-UZ") : "Noma'lum"}</span>
                            </div>
                            {(order.client?.id || order.client_id) && (
                                <div className="pt-2 border-t border-slate-700">
                                    <Link href={`/customers/${order.client?.id || order.client_id}`}>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-blue-400 hover:text-blue-300">Mijoz profiliga o'tish</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* FINANCIAL CARD - ADMIN ONLY */}
                    {isAdmin && (
                        <Card className="border-blue-700/50 bg-blue-950/20 overflow-hidden">
                            <CardHeader className="border-b border-blue-700/30 bg-blue-900/10">
                                <CardTitle className="text-lg flex items-center gap-2 text-slate-50 font-outfit">
                                    <DollarSign className="h-5 w-5 text-blue-400" />
                                    Moliyaviy Xulosa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-5 space-y-4">
                                    {/* Order Price */}
                                    <div className="flex justify-between items-center group">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buyurtma narxi:</span>
                                        <span className="font-black text-xl text-slate-100 italic">{formatCurrency(order.total_price || 0)}</span>
                                    </div>

                                    {/* Advance & Balance Block */}
                                    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Olingan Avans:</span>
                                            </div>
                                            <span className="font-bold text-sm text-yellow-500">{formatCurrency(order.advance_payment || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qolgan Summa (Qoldiq):</span>
                                            </div>
                                            <span className="font-black text-base text-red-100">
                                                {formatCurrency(Math.max(0, (order.total_price || 0) - (order.advance_payment || 0)))}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Details Pill */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">To'lov holati:</span>
                                            <Badge className={`text-[10px] font-black italic rounded-full px-3 h-5 ${
                                                order.payment_status === 'fully_paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                order.payment_status === 'partially_paid' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}>
                                                {order.payment_status === 'fully_paid' ? 'TO\'LIQ TO\'LANGAN' :
                                                 order.payment_status === 'partially_paid' ? 'AVANS OLINGAN' : 'TO\'LANMAGAN'}
                                            </Badge>
                                        </div>
                                        {order.initial_payment_method && (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">To'lov turi:</span>
                                                <span className="text-[11px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                                                    {order.initial_payment_method === 'cash' ? '💸 Naqd' : 
                                                     order.initial_payment_method === 'card' ? '💳 Plastik' : 
                                                     order.initial_payment_method === 'transfer' ? '🏛 O\'tkazma' : order.initial_payment_method}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ichki Izohlar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-3 bg-muted/30 rounded text-sm text-muted-foreground min-h-[100px]">
                                    {order.notes || "Hozircha hech qanday ichki izoh yo'q."}
                                </div>
                                <Button variant="outline" size="sm" className="w-full gap-2">
                                    <Edit className="h-3 w-3" /> Tahrirlash
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
