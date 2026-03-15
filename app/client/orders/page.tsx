"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Clock, CheckCircle, XCircle, Download, Eye } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import Link from "next/link"

interface Order {
    id: string
    order_number: string
    box_type: string
    status: string
    quantity: number
    total_price: string
    deadline: string
    created_date: string
    progress: number
}

export default function ClientOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "pending" | "in_production" | "ready">("all")

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        try {
            setLoading(true)
            const response = await fetchWithAuth("/api/client/my-orders/")
            const data = await response.json()
            setOrders(data.results || data || [])
        } catch (error) {
            console.error("Failed to load orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700"
            case "ready": return "bg-blue-100 text-blue-700"
            case "in_production": return "bg-yellow-100 text-yellow-700"
            case "approved": return "bg-purple-100 text-purple-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "Kutilmoqda",
            approved: "Tasdiqlandi",
            in_production: "Ishlab chiqarilmoqda",
            ready: "Tayyor",
            completed: "Tugallandi",
            cancelled: "Bekor qilindi"
        }
        return labels[status] || status
    }

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(o => o.status === filter)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Mening Buyurtmalarim</h1>
                <p className="text-muted-foreground mt-1">
                    Barcha buyurtmalaringizni kuzatishingiz mumkin
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    Barchasi
                </Button>
                <Button
                    variant={filter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("pending")}
                >
                    Kutilmoqda
                </Button>
                <Button
                    variant={filter === "in_production" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("in_production")}
                >
                    Jarayonda
                </Button>
                <Button
                    variant={filter === "ready" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("ready")}
                >
                    Tayyor
                </Button>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-lg font-medium text-muted-foreground">
                            Buyurtmalar topilmadi
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-mono text-muted-foreground">
                                            #{order.order_number?.split('-').pop()}
                                        </p>
                                        <h3 className="font-semibold text-lg mt-1">{order.box_type}</h3>
                                    </div>
                                    <Badge className={getStatusColor(order.status)}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-semibold">{order.progress || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${order.progress || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Miqdor</p>
                                        <p className="font-medium">{order.quantity.toLocaleString()} dona</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Narx</p>
                                        <p className="font-medium">{parseFloat(order.total_price).toLocaleString()} so'm</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Muddat</p>
                                        <p className="font-medium">
                                            {order.deadline ? new Date(order.deadline).toLocaleDateString('uz-UZ') : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Sana</p>
                                        <p className="font-medium">
                                            {new Date(order.created_date).toLocaleDateString('uz-UZ')}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <Link href={`/client/orders/${order.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            Ko'rish
                                        </Button>
                                    </Link>
                                    {order.status === "ready" && (
                                        <Button variant="default" size="sm">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
