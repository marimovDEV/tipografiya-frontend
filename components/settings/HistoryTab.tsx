"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { format } from "date-fns"
import { Loader2, RotateCcw, Filter } from "lucide-react"

interface SettingsLog {
    id: number
    user_name: string
    setting_type: string
    old_value: string
    new_value: string
    created_at: string
}

export function HistoryTab() {
    const [logs, setLogs] = useState<SettingsLog[]>([])
    const [loading, setLoading] = useState(true)
    const [restoring, setRestoring] = useState<number | null>(null)
    const [filters, setFilters] = useState({
        type: "",
        date_from: "",
        date_to: ""
    })

    const fetchLogs = async () => {
        setLoading(true)
        try {
            let url = "/api/settings/logs/"
            const params = new URLSearchParams()

            if (filters.type) params.append("type", filters.type)
            if (filters.date_from) params.append("date_from", filters.date_from)
            if (filters.date_to) params.append("date_to", filters.date_to)

            if (params.toString()) url += `?${params.toString()}`

            const res = await fetchWithAuth(url)
            if (res.ok) {
                const data = await res.json()
                setLogs(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Tarixni yuklab bo'lmadi")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const handleRestore = async (logId: number) => {
        if (!confirm("Ushbu sozlamani tiklashni xohlaysizmi?")) return

        setRestoring(logId)
        try {
            const res = await fetchWithAuth(`/api/settings/logs/${logId}/restore/`, {
                method: "POST"
            })

            if (!res.ok) throw new Error("Tiklash xatosi")

            toast.success("Sozlama tiklandi!")
            fetchLogs()
        } catch (error) {
            console.error(error)
            toast.error("Tiklashda xatolik")
        } finally {
            setRestoring(null)
        }
    }

    const settingTypeLabels: Record<string, string> = {
        paper_price_per_kg: "Qog'oz narxi",
        ink_price_per_kg: "Bo'yoq narxi",
        lacquer_price_per_kg: "Lak narxi",
        plate_cost: "Qolip narxi",
        setup_cost: "Sozlash xarajati",
        run_cost_per_box: "Ish haqi (quti)",
        profit_margin_percent: "Foyda foizi",
        tax_percent: "Soliq foizi",
        exchange_rate: "Valyuta kursi",
        waste_percentage_paper: "Qog'oz chiqindisi %",
        waste_percentage_ink: "Bo'yoq chiqindisi %",
        waste_percentage_lacquer: "Lak chiqindisi %",
        show_profit_to_client: "Mijozga foyda ko'rsatish"
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtrlash
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="filter-type">Sozlama turi</Label>
                            <Select
                                value={filters.type || "all"}
                                onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? "" : v })}
                            >
                                <SelectTrigger id="filter-type">
                                    <SelectValue placeholder="Hammasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Hammasi</SelectItem>
                                    <SelectItem value="paper_price_per_kg">Qog&apos;oz narxi</SelectItem>
                                    <SelectItem value="ink_price_per_kg">Bo&apos;yoq narxi</SelectItem>
                                    <SelectItem value="profit_margin_percent">Foyda foizi</SelectItem>
                                    <SelectItem value="tax_percent">Soliq foizi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date-from">Boshlanish sanasi</Label>
                            <Input
                                id="date-from"
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date-to">Tugash sanasi</Label>
                            <Input
                                id="date-to"
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button onClick={fetchLogs} variant="default">
                            Qo&apos;llash
                        </Button>
                        <Button
                            onClick={() => {
                                setFilters({ type: "", date_from: "", date_to: "" })
                                fetchLogs()
                            }}
                            variant="outline"
                        >
                            Tozalash
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle>O&apos;zgarishlar tarixi</CardTitle>
                    <CardDescription>Barcha sozlamalar o&apos;zgarishlari</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Hech qanday o&apos;zgarish topilmadi
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold">
                                                    {settingTypeLabels[log.setting_type] || log.setting_type}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(log.created_at), "dd.MM.yyyy HH:mm")}
                                                </span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Eski qiymat:</span>
                                                    <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded">
                                                        {log.old_value}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">Yangi qiymat:</span>
                                                    <span className="font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                                        {log.new_value}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    O&apos;zgartirdi: <span className="font-semibold">{log.user_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRestore(log.id)}
                                            disabled={restoring === log.id}
                                            className="ml-4"
                                        >
                                            {restoring === log.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Tiklash
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
