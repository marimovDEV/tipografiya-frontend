"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar, TrendingUp, Users, Package, Clock, DollarSign,
    FileText, Download, Filter, CheckCircle, XCircle, AlertTriangle
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { getProductionAnalytics, getWarehouseStatusReport, getProductionLogStats } from "@/lib/api/printery"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/data/mock-data"

interface DailyProductionReport {
    date: string
    total_orders: number
    completed_orders: number
    in_progress_orders: number
    late_orders: number
    total_revenue: number
    total_cost: number
    profit: number
}

interface WorkerReport {
    worker_name: string
    total_steps: number
    completed_steps: number
    total_work_minutes: number
    efficiency_score: number
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const [dateFilter, setDateFilter] = useState("today")
    const [loading, setLoading] = useState(true)
    const [dailyReport, setDailyReport] = useState<DailyProductionReport | null>(null)
    const [workerReports, setWorkerReports] = useState<WorkerReport[]>([])
    const [productionAnalytics, setProductionAnalytics] = useState<any>(null)
    const [warehouseStatus, setWarehouseStatus] = useState<any>(null)
    const [productionLogStats, setProductionLogStats] = useState<any[]>([])

    useEffect(() => {
        loadAllReports()
    }, [dateFilter])

    async function loadAllReports() {
        setLoading(true)
        try {
            await Promise.all([
                loadDailyProduction(),
                loadWorkerReports(),
                loadProductionAnalytics(),
                loadWarehouseStatus(),
                loadProductionLogStats()
            ])
        } finally {
            setLoading(false)
        }
    }

    async function loadDailyProduction() {
        try {
            const today = new Date().toISOString().split('T')[0]
            const response = await fetchWithAuth(`/api/orders/?created_date=${today}`)
            const data = await response.json()
            const orders = data.results || data

            const report = {
                date: today,
                total_orders: orders.length,
                completed_orders: orders.filter((o: any) => o.status === 'completed').length,
                in_progress_orders: orders.filter((o: any) => o.status === 'in_production').length,
                late_orders: orders.filter((o: any) => {
                    if (!o.deadline) return false
                    return new Date(o.deadline) < new Date() && o.status !== 'completed'
                }).length,
                total_revenue: orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0),
                total_cost: orders.reduce((sum: number, o: any) => sum + parseFloat(o.calculated_material_cost || 0), 0),
                profit: 0
            }
            report.profit = report.total_revenue - report.total_cost

            setDailyReport(report)
        } catch (error) {
            console.error("Failed to load daily production:", error)
        }
    }

    async function loadWorkerReports() {
        try {
            const response = await fetchWithAuth("/api/users/")
            const data = await response.json()
            const users = data.results || data

            // Get production steps for each worker
            const stepsResponse = await fetchWithAuth("/api/production/")
            const stepsData = await stepsResponse.json()
            const allSteps = stepsData.results || stepsData

            const reports = users.map((user: any) => {
                const userSteps = allSteps.filter((step: any) => step.assigned_to === user.id)
                const completed = userSteps.filter((step: any) => step.status === 'completed')

                return {
                    worker_name: user.username,
                    total_steps: userSteps.length,
                    completed_steps: completed.length,
                    total_work_minutes: completed.reduce((sum: number, step: any) =>
                        sum + (step.actual_duration_minutes || 0), 0),
                    efficiency_score: userSteps.length > 0
                        ? Math.round((completed.length / userSteps.length) * 100)
                        : 0
                }
            }).filter((r: any) => r.total_steps > 0)

            setWorkerReports(reports)
        } catch (error) {
            console.error("Failed to load worker reports:", error)
        }
    }

    async function loadProductionAnalytics() {
        try {
            const analytics = await getProductionAnalytics()
            setProductionAnalytics(analytics)
        } catch (error) {
            console.error("Failed to load production analytics:", error)
        }
    }

    async function loadWarehouseStatus() {
        try {
            const status = await getWarehouseStatusReport()
            setWarehouseStatus(status)
        } catch (error) {
            console.error("Failed to load warehouse status:", error)
        }
    }

    async function loadProductionLogStats() {
        try {
            const days = dateFilter === 'today' ? 1 : dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 365
            const stats = await getProductionLogStats(days)
            setProductionLogStats(stats)
        } catch (error) {
            console.error("Failed to load production log stats:", error)
        }
    }


    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) return `${hours}s ${mins} d`
        return `${mins} d`
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Hisobotlar</h1>
                    <p className="text-muted-foreground mt-1">
                        Ishlab chiqarish, xodimlar va moliyaviy analitika
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="today">Bugun</option>
                        <option value="week">Shu hafta</option>
                        <option value="month">Shu oy</option>
                        <option value="year">Shu yil</option>
                    </select>
                </div>
            </div>

            {/* Overview Cards */}
            {dailyReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Jami Buyurtmalar</p>
                                    <p className="text-2xl font-bold">{dailyReport.total_orders}</p>
                                </div>
                                <Package className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tugallangan</p>
                                    <p className="text-2xl font-bold text-green-600">{dailyReport.completed_orders}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Daromad</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(dailyReport.total_revenue)}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Foyda</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(dailyReport.profit)}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Umumiy</TabsTrigger>
                    <TabsTrigger value="production">Ishlab Chiqarish</TabsTrigger>
                    <TabsTrigger value="workers">Xodimlar</TabsTrigger>
                    <TabsTrigger value="warehouse">Sklad</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Kunlik Jadvali</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {dailyReport && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Jami:</span>
                                            <span className="font-medium">{dailyReport.total_orders} ta</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tugallangan:</span>
                                            <span className="font-medium text-green-600">{dailyReport.completed_orders} ta</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Jarayonda:</span>
                                            <span className="font-medium text-blue-600">{dailyReport.in_progress_orders} ta</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Kechikkan:</span>
                                            <span className="font-medium text-red-600">{dailyReport.late_orders} ta</span>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Daromad:</span>
                                                <span className="font-medium">{formatCurrency(dailyReport.total_revenue)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Xarajat:</span>
                                                <span className="font-medium">{formatCurrency(dailyReport.total_cost)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold">
                                                <span>Foyda:</span>
                                                <span className="text-green-600">{formatCurrency(dailyReport.profit)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sklad Holati</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {warehouseStatus && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Jami materiallar:</span>
                                            <span className="font-medium">{warehouseStatus.summary.total_materials}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Kam qolgan:</span>
                                            <span className="font-medium text-orange-600">
                                                {warehouseStatus.summary.low_stock_count}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Muddati o'tmoqda:</span>
                                            <span className="font-medium text-yellow-600">
                                                {warehouseStatus.summary.expiring_soon_count}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Bloklangan:</span>
                                            <span className="font-medium text-red-600">
                                                {warehouseStatus.summary.blocked_count}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Production Tab */}
                <TabsContent value="production" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Ishlab Chiqarish Analitikasi</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {productionAnalytics && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-2xl font-bold text-gray-600">{productionAnalytics.total_pending}</p>
                                        <p className="text-sm text-muted-foreground">Kutilmoqda</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{productionAnalytics.total_in_progress}</p>
                                        <p className="text-sm text-muted-foreground">Jarayonda</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{productionAnalytics.total_completed_today}</p>
                                        <p className="text-sm text-muted-foreground">Bugun Tugadi</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">{productionAnalytics.late_steps_count}</p>
                                        <p className="text-sm text-muted-foreground">Kechikkan</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workers Tab */}
                <TabsContent value="workers" className="space-y-4">
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Ishlab chiqarish unumdorligi (Batafsil)</span>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/5 text-indigo-400 border-indigo-500/20">
                                    Haqiqiy Loglar Bo'yicha
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-3 text-left font-medium text-muted-foreground uppercase text-[10px]">Xodim</th>
                                            <th className="p-3 text-center font-medium text-muted-foreground uppercase text-[10px]">Jami Sahifa</th>
                                            <th className="p-3 text-center font-medium text-muted-foreground uppercase text-[10px]">Brak (Sahifa)</th>
                                            <th className="p-3 text-center font-medium text-muted-foreground uppercase text-[10px]">Brak %</th>
                                            <th className="p-3 text-center font-medium text-muted-foreground uppercase text-[10px]">Harakatlar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {productionLogStats.length > 0 ? (
                                            productionLogStats.map((stat, idx) => {
                                                const defectPercent = stat.total_pages > 0 
                                                    ? (stat.defect_pages / stat.total_pages) * 100 
                                                    : 0;
                                                
                                                return (
                                                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                                        <td className="p-3">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900">
                                                                    {stat.worker__first_name && stat.worker__last_name 
                                                                        ? `${stat.worker__first_name} ${stat.worker__last_name}`
                                                                        : stat.worker__username}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-tighter">@{stat.worker__username}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-center font-black text-indigo-600">
                                                            {Math.round(stat.total_pages || 0).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-rose-500">
                                                            {Math.round(stat.defect_pages || 0).toLocaleString()}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Badge className={
                                                                defectPercent < 1 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                                                defectPercent < 3 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                "bg-rose-100 text-rose-700 border-rose-200"
                                                            }>
                                                                {defectPercent.toFixed(1)}%
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-center text-slate-400 font-mono text-[10px]">
                                                            {stat.log_count} ta update
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                                    Bu muddat uchun ma'lumotlar topilmadi
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Warehouse Tab */}
                <TabsContent value="warehouse" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Sklad Hisoboti</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {warehouseStatus?.summary.total_materials || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Jami</p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {warehouseStatus?.summary.low_stock_count || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Kam Qolgan</p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {warehouseStatus?.summary.expiring_soon_count || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Muddati O'tmoqda</p>
                                    </div>
                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">
                                            {warehouseStatus?.summary.blocked_count || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Bloklangan</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
