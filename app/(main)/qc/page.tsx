"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    CheckCircle, XCircle, Clock, AlertTriangle, Eye,
    ThumbsUp, ThumbsDown, FileText, TrendingUp
} from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface QCCheckpoint {
    id: string
    checkpoint_name: string
    checkpoint_type: string
    order_number: string
    status: string
    created_at: string
    inspected_at: string | null
    failure_reason?: string
    defect_type?: string
    defect_severity?: string
}

interface QCStats {
    total_checkpoints: number
    passed: number
    failed: number
    pending: number
    pass_rate: number
    rework_triggered: number
}

export default function QCPage() {
    const [activeTab, setActiveTab] = useState("pending")
    const [checkpoints, setCheckpoints] = useState<QCCheckpoint[]>([])
    const [stats, setStats] = useState<QCStats | null>(null)
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<QCCheckpoint | null>(null)
    const [inspectDialogOpen, setInspectDialogOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    // Form state
    const [result, setResult] = useState<"pass" | "fail">("pass")
    const [failureReason, setFailureReason] = useState("")
    const [defectType, setDefectType] = useState("other")
    const [severity, setSeverity] = useState("major")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        loadData()
    }, [activeTab])

    async function loadData() {
        setLoading(true)
        try {
            await Promise.all([
                loadCheckpoints(),
                loadStats()
            ])
        } finally {
            setLoading(false)
        }
    }

    async function loadCheckpoints() {
        try {
            const response = await fetchWithAuth(`/api/qc/checkpoints/?status=${activeTab}`)
            const data = await response.json()
            setCheckpoints(data.results || data || [])
        } catch (error) {
            console.error("Failed to load checkpoints:", error)
        }
    }

    async function loadStats() {
        try {
            const response = await fetchWithAuth("/api/qc/statistics/")
            const data = await response.json()
            setStats(data.summary)
        } catch (error) {
            console.error("Failed to load stats:", error)
        }
    }

    async function handleInspect() {
        if (!selectedCheckpoint) return

        if (result === "fail" && !failureReason.trim()) {
            toast.error("O'tmaganlik sababini kiriting")
            return
        }

        try {
            const response = await fetchWithAuth(
                `/api/qc/checkpoints/${selectedCheckpoint.id}/inspect/`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        result,
                        failure_reason: result === "fail" ? failureReason : undefined,
                        defect_type: result === "fail" ? defectType : undefined,
                        severity: result === "fail" ? severity : undefined,
                        notes
                    })
                }
            )

            if (response.ok) {
                toast.success(result === "pass" ? "✅ O'tdi!" : "❌ O'tmadi")
                setInspectDialogOpen(false)
                resetForm()
                loadData()
            } else {
                toast.error("Xatolik yuz berdi")
            }
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    function resetForm() {
        setResult("pass")
        setFailureReason("")
        setDefectType("other")
        setSeverity("major")
        setNotes("")
    }

    function openInspectDialog(checkpoint: QCCheckpoint) {
        setSelectedCheckpoint(checkpoint)
        resetForm()
        setInspectDialogOpen(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pass": return "bg-green-100 text-green-700"
            case "fail": return "bg-red-100 text-red-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "critical": return "bg-red-100 text-red-700"
            case "major": return "bg-orange-100 text-orange-700"
            case "minor": return "bg-yellow-100 text-yellow-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Sifat Nazorati (QC)</h1>
                <p className="text-muted-foreground mt-1">
                    Checkpointlar va tekshiruvlar
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Jami</p>
                                    <p className="text-2xl font-bold">{stats.total_checkpoints}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">O'tdi</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">O'tmadi</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                </div>
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.pass_rate.toFixed(1)}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                        Kutilmoqda
                        {stats && stats.pending > 0 && (
                            <Badge className="ml-2" variant="secondary">{stats.pending}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="pass">
                        O'tganlar
                        {stats && stats.passed > 0 && (
                            <Badge className="ml-2 bg-green-100 text-green-700">{stats.passed}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="fail">
                        O'tmaganlar
                        {stats && stats.failed > 0 && (
                            <Badge className="ml-2" variant="destructive">{stats.failed}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : checkpoints.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">Checkpointlar yo'q</p>
                            </CardContent>
                        </Card>
                    ) : (
                        checkpoints.map((checkpoint) => (
                            <Card key={checkpoint.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold">{checkpoint.checkpoint_name}</h4>
                                                <Badge variant="outline">{checkpoint.checkpoint_type}</Badge>
                                                <Badge className={getStatusColor(checkpoint.status)}>
                                                    {checkpoint.status === "pass" && "O'tdi"}
                                                    {checkpoint.status === "fail" && "O'tmadi"}
                                                    {checkpoint.status === "pending" && "Kutilmoqda"}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Buyurtma:</span>
                                                    <p className="font-medium">{checkpoint.order_number}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Yaratildi:</span>
                                                    <p className="font-medium">
                                                        {new Date(checkpoint.created_at).toLocaleDateString("uz-UZ")}
                                                    </p>
                                                </div>
                                                {checkpoint.inspected_at && (
                                                    <div>
                                                        <span className="text-muted-foreground">Tekshirildi:</span>
                                                        <p className="font-medium">
                                                            {new Date(checkpoint.inspected_at).toLocaleDateString("uz-UZ")}
                                                        </p>
                                                    </div>
                                                )}
                                                {checkpoint.defect_severity && (
                                                    <div>
                                                        <span className="text-muted-foreground">Jiddiylik:</span>
                                                        <Badge className={getSeverityColor(checkpoint.defect_severity)}>
                                                            {checkpoint.defect_severity === "critical" && "Kritik"}
                                                            {checkpoint.defect_severity === "major" && "Katta"}
                                                            {checkpoint.defect_severity === "minor" && "Kichik"}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {checkpoint.failure_reason && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                    <p className="text-sm font-medium text-red-900">Sabab:</p>
                                                    <p className="text-sm text-red-700">{checkpoint.failure_reason}</p>
                                                </div>
                                            )}
                                        </div>

                                        {checkpoint.status === "pending" && (
                                            <Button
                                                onClick={() => openInspectDialog(checkpoint)}
                                                className="ml-4"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Tekshirish
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Inspect Dialog */}
            <Dialog open={inspectDialogOpen} onOpenChange={setInspectDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Checkpoint Tekshiruvi</DialogTitle>
                    </DialogHeader>

                    {selectedCheckpoint && (
                        <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-semibold">{selectedCheckpoint.checkpoint_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedCheckpoint.order_number}
                                </p>
                            </div>

                            {/* Result */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Natija *</label>
                                <div className="flex gap-3">
                                    <Button
                                        variant={result === "pass" ? "default" : "outline"}
                                        className={result === "pass" ? "bg-green-600 hover:bg-green-700" : ""}
                                        onClick={() => setResult("pass")}
                                    >
                                        <ThumbsUp className="w-4 h-4 mr-2" />
                                        O'tdi
                                    </Button>
                                    <Button
                                        variant={result === "fail" ? "destructive" : "outline"}
                                        onClick={() => setResult("fail")}
                                    >
                                        <ThumbsDown className="w-4 h-4 mr-2" />
                                        O'tmadi
                                    </Button>
                                </div>
                            </div>

                            {/* Failure Details */}
                            {result === "fail" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Sabab *</label>
                                        <textarea
                                            value={failureReason}
                                            onChange={(e) => setFailureReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="O'tmaganlik sababini yozing..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Nuqson Turi</label>
                                            <select
                                                value={defectType}
                                                onChange={(e) => setDefectType(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            >
                                                <option value="dimension">O'lcham xato</option>
                                                <option value="color">Rang xato</option>
                                                <option value="damage">Shikastlangan</option>
                                                <option value="alignment">Noto'g'ri joylashish</option>
                                                <option value="quality">Sifat past</option>
                                                <option value="other">Boshqa</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Jiddiylik</label>
                                            <select
                                                value={severity}
                                                onChange={(e) => setSeverity(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            >
                                                <option value="critical">Kritik</option>
                                                <option value="major">Katta</option>
                                                <option value="minor">Kichik</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Izohlar</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Qo'shimcha izohlar..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setInspectDialogOpen(false)}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleInspect}
                                >
                                    Saqlash
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
