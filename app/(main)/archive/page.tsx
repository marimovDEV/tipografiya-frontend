"use client"

import { useState, useEffect } from "react"
import {
    CheckCircle2, Search, History,
    Calendar, Package, Layers
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/data/mock-data"

export default function ArchivePage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    useEffect(() => {
        fetchArchive()
    }, [])

    const fetchArchive = async () => {
        setLoading(true)
        try {
            const res = await fetchWithAuth("/api/orders/?status=completed")
            if (res.ok) setOrders(await res.json())
        } catch (e) {
            toast.error("Ma'lumotlar yuklanmadi")
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.box_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Arxiv</h1>
                    <p className="text-xs text-muted-foreground">Tugagan ishlar</p>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Qidirish..."
                        className="h-9 pl-9 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-sm">Yuklanmoqda...</div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden hover:border-slate-300 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setIsDetailOpen(true) }}>
                            <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] px-1.5">#{order.order_number.split('-').pop()}</Badge>
                                            <span className="text-[10px] text-muted-foreground">{new Date(order.completed_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-sm mt-1">{order.box_type}</h3>
                                        <p className="text-xs text-muted-foreground">{order.client?.full_name}</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">
                                        TAYYOR
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2 rounded">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Tiraj</p>
                                        <p className="font-semibold">{order.quantity.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground">Narx</p>
                                        <p className="font-semibold">{formatCurrency(order.total_price)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center text-muted-foreground text-sm">
                        Topilmadi
                    </div>
                )}
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Buyurtma #{selectedOrder?.order_number}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Mahsulot</p>
                                <p className="font-medium">{selectedOrder?.box_type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Mijoz</p>
                                <p className="font-medium">{selectedOrder?.client?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Material</p>
                                <p className="font-medium">{selectedOrder?.paper_type} {selectedOrder?.paper_density}g</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div>
                                <p className="text-xs text-muted-foreground">Sana</p>
                                <p className="font-medium">{selectedOrder && new Date(selectedOrder.completed_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Summa</p>
                                <p className="font-bold text-lg">{selectedOrder && formatCurrency(selectedOrder.total_price)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Sof foyda</p>
                                <p className="font-bold text-green-600">{selectedOrder && formatCurrency(selectedOrder.profit)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-xs font-bold mb-2">Ishlab chiqarish tarixi</h4>
                        <div className="space-y-2">
                            {selectedOrder?.production_steps?.map((step: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-xs p-2 bg-muted/50 rounded">
                                    <span>{idx + 1}. {step.step}</span>
                                    <span className="text-muted-foreground">{new Date(step.completed_at).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>Yopish</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
