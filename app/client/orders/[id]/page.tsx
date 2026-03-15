"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, CheckCircle, Clock, Package } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ClientOrderDetailPage() {
    const params = useParams()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            loadOrder()
        }
    }, [params.id])

    async function loadOrder() {
        try {
            const response = await fetchWithAuth(`/api/orders/${params.id}/`)
            const data = await response.json()
            setOrder(data)
        } catch (error) {
            console.error("Failed to load order:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <p>Buyurtma topilmadi</p>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-500"
            case "in_progress": return "bg-blue-500"
            case "pending": return "bg-gray-300"
            default: return "bg-gray-300"
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Back Button */}
            <Link href="/client/orders">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ortga
                </Button>
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Buyurtma #{order.order_number}</p>
                    <h1 className="text-3xl font-bold mt-1">{order.box_type}</h1>
                </div>
                <Badge className="text-lg px-4 py-2">
                    {order.status === "ready" ? "Tayyor" :
                        order.status === "in_production" ? "Jarayonda" : "Kutilmoqda"}
                </Badge>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <Package className="w-10 h-10 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Miqdor</p>
                                <p className="text-2xl font-bold">{order.quantity.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <Clock className="w-10 h-10 text-orange-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Muddat</p>
                                <p className="text-xl font-bold">
                                    {order.deadline ? new Date(order.deadline).toLocaleDateString('uz-UZ') : '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Progress</p>
                                <p className="text-2xl font-bold">{order.progress || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Specifications */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Spetsifikatsiyalar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">O'lcham</p>
                            <p className="font-medium">{order.paper_width} × {order.paper_height} sm</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Material</p>
                            <p className="font-medium">{order.paper_type} {order.paper_density}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pechat</p>
                            <p className="font-medium">{order.print_colors || "4+0"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Lak</p>
                            <p className="font-medium">{order.lacquer_type || "Yo'q"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Yelim</p>
                            <p className="font-medium">{order.gluing_type || "Yo'q"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Narx</p>
                            <p className="font-medium text-lg">{parseFloat(order.total_price).toLocaleString()} so'm</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Production Timeline */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Ishlab Chiqarish Jarayoni</h3>

                    {order.production_steps && order.production_steps.length > 0 ? (
                        <div className="space-y-3">
                            {order.production_steps.map((step: any, index: number) => (
                                <div key={step.id} className="flex items-center gap-4">
                                    {/* Step Number */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step.status === 'completed' ? 'bg-green-500 text-white' :
                                            step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                                                'bg-gray-200 text-gray-600'
                                        }`}>
                                        {step.status === 'completed' ? '✓' : index + 1}
                                    </div>

                                    {/* Connector Line */}
                                    {index < order.production_steps.length - 1 && (
                                        <div className={`absolute left-[1.9rem] h-6 w-0.5 mt-10 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                    )}

                                    {/* Step Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{step.step}</p>
                                            <Badge variant={
                                                step.status === 'completed' ? 'default' :
                                                    step.status === 'in_progress' ? 'secondary' : 'outline'
                                            }>
                                                {step.status === 'completed' ? 'Tugallandi' :
                                                    step.status === 'in_progress' ? 'Jarayonda' : 'Kutilmoqda'}
                                            </Badge>
                                        </div>
                                        {step.assigned_to_name && (
                                            <p className="text-sm text-muted-foreground">Mas'ul: {step.assigned_to_name}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Ishlab chiqarish bosqichlari hali yaratilmagan</p>
                    )}
                </CardContent>
            </Card>

            {/* Notes */}
            {order.notes && (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Izohlar</h3>
                        <p className="text-muted-foreground">{order.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            {order.status === "ready" && (
                <div className="flex gap-3">
                    <Button className="flex-1" size="lg">
                        <Download className="w-5 h-5 mr-2" />
                        Faktura Yuklab Olish
                    </Button>
                </div>
            )}
        </div>
    )
}
