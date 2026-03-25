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
    Truck, Box, XCircle, ChevronRight, AlertCircle, Play, Book, Edit,
    Download, Trash2, Layers, MoreHorizontal, UploadCloud, Save, History, Info
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { getStatusLabel, getStatusBadgeColor, formatCurrency } from "@/lib/data/mock-data"
import { fetchWithAuth } from "@/lib/api-client"
import { Order, OrderStatus } from "@/lib/types"
import { useRole } from "@/lib/context/role-context"
import Link from "next/link"
import { toast } from "sonner"
import { getStepLabelUz } from "@/lib/utils"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"



export default function OrderDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { currentRole } = useRole()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editFormData, setEditFormData] = useState<any>({})

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

    const handleUpdateOrder = async () => {
        setUpdating(true)
        try {
            const res = await fetchWithAuth(`/api/orders/${id}/`, {
                method: "PATCH",
                body: JSON.stringify(editFormData)
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.non_field_errors?.[0] || "Update failed")
            }
            toast.success("Buyurtma muvaffaqiyatli tahrirlandi")
            setIsEditDialogOpen(false)
            fetchOrder()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setUpdating(false)
        }
    }

    const openEditModal = () => {
        if (!order) return
        setEditFormData({
            box_type: order.box_type,
            quantity: order.quantity,
            total_price: order.total_price,
            deadline: order.deadline ? order.deadline.split('T')[0] : '',
            notes: order.notes,
            book_name: order.book_name,
            page_count: order.page_count,
            cover_type: order.cover_type,
            binding_type: order.binding_type
        })
        setIsEditDialogOpen(true)
    }

    const handleDeleteOrder = async () => {
        if (!confirm("Ushbu buyurtmani o'chirib yuborishni xohlaysizmi?")) return
        
        try {
            const res = await fetchWithAuth(`/api/orders/${id}/`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success("Buyurtma o'chirildi")
                router.push("/orders")
            } else {
                toast.error("O'chirishda xatolik yuz berdi")
            }
        } catch (error) {
            console.error(error)
            toast.error("Aloqa xatosi")
        }
    }

    // Granular Progress calculation
    const calculateProgress = () => {
        if (!order?.production_steps?.length) return 0;
        
        let totalProgress = 0;
        order.production_steps.forEach(step => {
            if (step.status === 'completed') {
                totalProgress += 1;
            } else if (step.status === 'in_progress' && (step.input_qty || 0) > 0) {
                const currentStepProgress = ((step.produced_qty || 0) + (step.defect_qty || 0)) / (step.input_qty || 1);
                totalProgress += Math.min(1, currentStepProgress);
            }
        });
        
        return Math.round((totalProgress / order.production_steps.length) * 100);
    };
    const progressPercent = calculateProgress();

    const renderAdditionalProcessing = (raw: string | null) => {
        if (!raw) return null
        
        try {
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
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Texnik ishlov</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                            {Object.entries(data).map(([key, value]) => {
                                const label = labels[key] || key
                                const displayValue = value === true ? 'Ha' : value === false ? 'Yo\'q' : (valueMap[String(value)] || String(value))
                                if (value === 'none' || value === false) return null
                                
                                return (
                                    <div key={key} className="flex flex-col border-l-2 border-slate-800 pl-3">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{label}</span>
                                        <span className="text-sm font-semibold text-slate-200">{displayValue}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            }
        } catch (e) {
            console.error("JSON parse error", e)
        }

        return (
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-sm">
                <span className="text-slate-500 mr-2">Qo'shimcha ishlov:</span>
                <span className="text-slate-200">{raw}</span>
            </div>
        )
    }

    if (loading) return <div className="p-8 text-center text-slate-400 font-medium">Baza bilan aloqa o'rnatilmoqda...</div>
    if (!order) return <div className="p-8 text-center text-red-400">Malumotlar topilmadi</div>

    return (
        <div className="max-w-[1600px] mx-auto text-slate-200">
            {/* STICKY HEADER - Industrial ERP Style */}
            <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 -mx-6 px-6 py-4 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => router.back()}
                            className="bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 rounded-xl"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                                    #{order.order_number ? order.order_number.split('-').pop() : '...'}
                                </h1>
                                <Badge className={`${getStatusBadgeColor(order.status)} px-3 py-1 font-black text-[10px] tracking-tighter uppercase italic rounded-lg`}>
                                    {getStatusLabel(order.status)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase">
                                    <Calendar className="h-3 w-3" />
                                    <span>Deadline: {order.deadline ? new Date(order.deadline).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long' }) : "Belgilanmagan"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase">
                                    <Package className="h-3 w-3" />
                                    <span>{Math.round(order.quantity).toLocaleString()} ta</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-cyan-500 font-bold uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Progress: {progressPercent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {order.status === 'pending' && (
                            <Button onClick={handleApprove} disabled={updating} className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                                <Play className="h-4 w-4 mr-2" /> Ishni boshlash
                            </Button>
                        )}
                        <Button 
                            variant="outline" 
                            onClick={openEditModal}
                            className="h-10 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 font-bold text-xs uppercase rounded-xl"
                        >
                            <Edit className="h-4 w-4 mr-2" /> Tahrirlash
                        </Button>

                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-200">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Buyurtmani Tahrirlash</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Buyurtma parametrlarini o'zgartirish. Ba'zi o'zgarishlar ishlab chiqarish bosqichlariga ta'sir qilishi mumkin.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Mahsulot nomi</Label>
                                        <Input 
                                            value={editFormData.box_type || ''} 
                                            onChange={e => setEditFormData({...editFormData, box_type: e.target.value})}
                                            className="bg-slate-950 border-slate-800 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Miqdori (ta)</Label>
                                        <Input 
                                            type="number"
                                            value={editFormData.quantity || ''} 
                                            onChange={e => setEditFormData({...editFormData, quantity: parseInt(e.target.value)})}
                                            className="bg-slate-950 border-slate-800 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Umumiy summa (so'm)</Label>
                                        <Input 
                                            type="number"
                                            value={editFormData.total_price || ''} 
                                            onChange={e => setEditFormData({...editFormData, total_price: parseFloat(e.target.value)})}
                                            className="bg-slate-950 border-slate-800 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Deadline (Muddat)</Label>
                                        <Input 
                                            type="date"
                                            value={editFormData.deadline || ''} 
                                            onChange={e => setEditFormData({...editFormData, deadline: e.target.value})}
                                            className="bg-slate-950 border-slate-800 focus:ring-blue-500 [color-scheme:dark]"
                                        />
                                    </div>

                                    {order.book_name && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500">Kitob nomi</Label>
                                                <Input 
                                                    value={editFormData.book_name || ''} 
                                                    onChange={e => setEditFormData({...editFormData, book_name: e.target.value})}
                                                    className="bg-slate-950 border-slate-800 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500">Betlar soni</Label>
                                                <Input 
                                                    type="number"
                                                    value={editFormData.page_count || ''} 
                                                    onChange={e => setEditFormData({...editFormData, page_count: parseInt(e.target.value)})}
                                                    className="bg-slate-950 border-slate-800 focus:ring-blue-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-500">Ichki izohlar</Label>
                                        <Textarea 
                                            value={editFormData.notes || ''} 
                                            onChange={e => setEditFormData({...editFormData, notes: e.target.value})}
                                            className="bg-slate-950 border-slate-800 focus:ring-blue-500 min-h-[100px]"
                                            placeholder="Buyurtma bo'yicha qo'shimcha izohlar..."
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2">
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-slate-800 border-slate-700 hover:bg-slate-700">Bekor qilish</Button>
                                    <Button onClick={handleUpdateOrder} disabled={updating} className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest px-8">
                                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Saqlash
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 w-10 p-0 bg-slate-900 border-slate-800 hover:bg-slate-800 rounded-xl">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-500">Amallar</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem 
                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                                    onClick={handleDeleteOrder}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> O'chirish
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* VISUAL PROGRESS BAR */}
                <div className="mt-6 w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Advance Payment Warning */}
            {order.advance_payment === 0 && (order.status === 'pending' || order.status === 'approved') && (
                <div className="mb-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest italic">Avans kutilmoqda!</h4>
                        <p className="text-xs text-slate-500 font-medium">Ushbu buyurtma uchun hali to'lov kiritilmagan. Ishni boshlash xavfli bo'lishi mumkin.</p>
                    </div>
                </div>
            )}

            {/* CELEBRATORY BANNER (PrintERP TZ Fix) */}
            {order.status === 'ready' && (
                <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group transition-all hover:bg-emerald-500/15">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-black uppercase text-lg tracking-widest italic leading-none mb-1">Buyurtma Tayyor!</h3>
                            <p className="text-emerald-500/70 text-xs font-bold uppercase tracking-widest">Barcha ishlab chiqarish bosqichlari (100%) yakunlandi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <Button 
                            className="bg-emerald-500 text-emerald-950 font-black border-none hover:bg-emerald-400 uppercase text-xs tracking-widest px-8 h-12 rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group-hover:scale-105"
                            onClick={async () => {
                                setUpdating(true);
                                try {
                                    const res = await fetchWithAuth(`/api/orders/${order.id}/deliver/`, { method: "POST" });
                                    if (res.ok) {
                                        toast.success("Buyurtma muvaffaqiyatli topshirildi");
                                        fetchOrder();
                                    } else {
                                        toast.error("Xatolik yuz berdi");
                                    }
                                } catch (e) {
                                    toast.error("Aloqa xatosi");
                                } finally {
                                    setUpdating(false);
                                }
                            }}
                        >
                            <Truck className="h-5 w-5 mr-3" /> Mijozga topshirish
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: SPECS & DETAILS (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* PRODUCT CARD */}
                    <Card className="bg-slate-900/40 border-slate-800/60 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                        <CardHeader className="p-8 border-b border-slate-800/50">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <Box className="h-6 w-6 text-blue-500" />
                                Mahsulot Xarakteristikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <DetailItem label="Nomi" value={order.box_type} icon={<Package className="h-4 w-4" />} />
                                <DetailItem label="O'lcham" value={`${order.paper_width || '-'} x ${order.paper_height || '-'} sm`} icon={<Settings className="h-4 w-4" />} />
                                <DetailItem label="Qog'oz" value={`${order.paper_type} (${order.paper_density} gr)`} icon={<FileText className="h-4 w-4" />} />
                                <DetailItem label="Pechat" value={order.print_type} icon={<TrendingUp className="h-4 w-4" />} />
                            </div>

                            {/* Book specific specs inside a themed sub-section */}
                            {order.book_name && (
                                <div className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Book className="h-24 w-24" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                        Kitob Loyihasi
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <DetailItem label="Nomi" value={order.book_name} light />
                                        <DetailItem label="Betlar" value={`${order.page_count} bet`} light />
                                        <DetailItem label="Muqova" value={order.cover_type === 'hard' ? 'Qattiq' : order.cover_type === 'soft' ? 'Yumshoq' : 'Standart'} light />
                                    </div>
                                </div>
                            )}

                            {renderAdditionalProcessing(order.additional_processing)}
                        </CardContent>
                    </Card>

                    {/* CLIENT & NOTES (Integrated Bottom) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-slate-900/40 border-slate-800/60 rounded-[2rem]">
                            <CardContent className="p-8">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Buyurtmachi</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center font-black text-lg text-white">
                                        {order.client?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-white">{order.client?.full_name}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">{order.client?.company}</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <Link href={`/clients/${order.client?.id}`} className="flex-1">
                                        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl">Profilni ko'rish</Button>
                                    </Link>
                                    <Button variant="outline" className="flex-1 border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl">Muloqot</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/40 border-slate-800/60 rounded-[2rem]">
                            <CardContent className="p-8">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Ichki izohlar</h4>
                                <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                                    {order.notes || "Hech qanday maxsus izoh yo'q."}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* RIGHT COLUMN: PRODUCTION TIMELINE (4 cols) */}
                <div className="lg:col-span-4 space-y-8 h-full">
                    <Card className="bg-slate-900/40 border-slate-800/60 rounded-[2rem] overflow-hidden sticky top-32 shadow-2xl backdrop-blur-sm h-fit">
                        <CardHeader className="p-8 border-b border-slate-800/50">
                            <CardTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                                Jarayon Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="relative">
                                {/* The vertical central line */}
                                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-800" />
                                
                                <div className="space-y-12">
                                    {order.production_steps?.map((step, idx) => (
                                        <div key={step.id} className="relative pl-16 group">
                                            {/* Status Icon Pillar */}
                                            <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                                                step.status === 'completed' ? 'bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                                                step.status === 'in_progress' ? 'bg-blue-600 border-blue-600 text-white animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.4)]' :
                                                'bg-slate-900 border-slate-800 text-slate-600'
                                            }`}>
                                                {step.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : 
                                                 step.status === 'in_progress' ? <Play className="h-5 w-5 fill-current" /> : (idx + 1)}
                                            </div>

                                            <div>
                                                <h4 className={`text-sm font-black uppercase tracking-widest transition-colors ${
                                                    step.status === 'completed' ? 'text-green-400' : 
                                                    step.status === 'in_progress' ? 'text-blue-400' : 'text-slate-500'
                                                }`}>
                                                    {getStepLabelUz(step.step)}
                                                </h4>
                                                
                                                {step.status === 'completed' ? (
                                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{new Date(step.completed_at || '').toLocaleDateString("uz-UZ")} • {new Date(step.completed_at || '').toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                ) : step.status === 'in_progress' ? (
                                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-orange-400 font-black uppercase animate-pulse italic">
                                                        <Clock className="h-3 w-3" />
                                                        <span>Hozir bajarilmoqda...</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-700 uppercase">Kutilmoqda</span>
                                                )}

                                                {(step.produced_qty > 0 || step.defect_qty > 0) && (
                                                    <div className="mt-3 flex items-center gap-3">
                                                       <div className="flex items-center gap-4 p-2 bg-slate-950/30 rounded-lg border border-slate-800/50 w-fit">
                                                          <div className="flex flex-col">
                                                              <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Bajarildi</span>
                                                              <span className="text-[10px] font-black text-emerald-500">{Math.round(step.produced_qty)} ta</span>
                                                          </div>
                                                          <div className="w-px h-4 bg-slate-800" />
                                                          <div className="flex flex-col">
                                                              <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Brak</span>
                                                              <span className="text-[10px] font-black text-rose-500">{Math.round(step.defect_qty)} dona</span>
                                                          </div>
                                                       </div>

                                                       {step.production_logs && step.production_logs.length > 0 && (
                                                         <Popover>
                                                            <PopoverTrigger asChild>
                                                               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-800 text-slate-400">
                                                                  <History className="h-4 w-4" />
                                                               </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80 bg-slate-900 border-slate-800 p-0 shadow-2xl" side="left">
                                                               <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                                                                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                                     <History className="h-3 w-3 text-blue-500" />
                                                                     ISHLAB CHIQARISH TARIXI
                                                                  </h4>
                                                               </div>
                                                               <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                                                                  {step.production_logs.map((log) => (
                                                                     <div key={log.id} className="p-3 bg-slate-950/40 rounded-xl border border-transparent hover:border-slate-800 transition-all">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                           <p className="text-[11px] font-black text-emerald-400">+{Math.round(log.produced_qty)} ta</p>
                                                                           <p className="text-[9px] font-bold text-slate-600">
                                                                              {new Date(log.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                                           </p>
                                                                        </div>
                                                                        <div className="flex items-center justify-between">
                                                                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                                              {log.worker_name}
                                                                           </p>
                                                                           {log.defect_qty > 0 && (
                                                                             <span className="text-[9px] font-bold text-rose-500/70">-{Math.round(log.defect_qty)} brak</span>
                                                                           )}
                                                                        </div>
                                                                     </div>
                                                                  ))}
                                                               </div>
                                                            </PopoverContent>
                                                         </Popover>
                                                       )}
                                                    </div>
                                                )}

                                                {step.notes && (
                                                    <p className="mt-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-medium">
                                                        {step.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {!order.production_steps?.length && (
                                        <div className="text-center py-20 text-slate-700 italic font-black uppercase text-xs tracking-[0.2em]">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            Jarayonlar topilmadi
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* RECENT FINANCE (Sub-sidebar) */}
                    {isAdmin && (
                        <Card className="bg-slate-900/40 border-slate-800/60 rounded-[2rem] overflow-hidden border-l-4 border-l-blue-600">
                             <CardContent className="p-8">
                                <div className="flex justify-between items-end mb-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To'lov Holati</h4>
                                    <Badge className="bg-blue-600/10 text-blue-400 border-blue-600/20 text-[10px] font-black italic">
                                        {formatCurrency(order.total_price)}
                                    </Badge>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold uppercase text-[10px]">To'landi</span>
                                        <span className="font-black text-green-400">{formatCurrency(order.advance_payment)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold uppercase text-[10px]">Qarz</span>
                                        <span className="font-black text-red-400">
                                            {formatCurrency(Math.max(0, (order.total_price || 0) - (order.advance_payment || 0)))}
                                        </span>
                                    </div>
                                </div>
                             </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============= HELPER COMPONENTS =============

function DetailItem({ label, value, icon, light = false }: { label: string, value: any, icon?: React.ReactNode, light?: boolean }) {
    return (
        <div className={`p-4 rounded-2xl transition-all ${light ? 'bg-slate-950/40' : 'bg-slate-950/20'} border border-slate-800/40 hover:border-slate-700 group cursor-default`}>
            <div className="flex items-center gap-2 mb-2">
                <div className="text-slate-600 group-hover:text-blue-500 transition-colors">
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-black text-slate-200 tracking-tight">{value || '-'}</p>
        </div>
    )
}

function FileCard({ name, size, url, type }: { name: string, size: string, url: string, type: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-2xl hover:bg-slate-800/50 transition-all group">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                    type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                    {type.toUpperCase()}
                </div>
                <div>
                    <p className="text-xs font-black text-slate-200">{name}</p>
                    <p className="text-[10px] font-bold text-slate-600">{size}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <a href={url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-700">
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-700">
                    <Download className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}



