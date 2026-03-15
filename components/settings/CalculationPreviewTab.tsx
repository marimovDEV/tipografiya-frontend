"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CalculationPreviewTab() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        box_type: "Standart quti",
        quantity: 1000,
        paper_type: "Karton",
        paper_density: 300,
        paper_width: 50,
        paper_height: 40,
        print_colors: "4+0",
        lacquer_type: "Yo'q",
        pricing_profile: "Standard"
    })
    const [breakdown, setBreakdown] = useState<any>(null)

    const calculatePreview = async () => {
        setLoading(true)
        try {
            const res = await fetchWithAuth("/api/settings/calculation-preview/", {
                method: "POST",
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error("Hisoblash xatosi")

            const data = await res.json()
            setBreakdown(data)
            toast.success("Hisoblash muvaffaqiyatli!")
        } catch (error) {
            console.error(error)
            toast.error("Hisoblashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Buyurtma parametrlari</CardTitle>
                    <CardDescription>Test hisob-kitob uchun buyurtma ma&apos;lumotlarini kiriting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Miqdor (dona)</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paper-density">Qog&apos;oz qalinligi (g/m²)</Label>
                            <Input
                                id="paper-density"
                                type="number"
                                value={formData.paper_density}
                                onChange={(e) => setFormData({ ...formData, paper_density: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="colors">Ranglar</Label>
                            <Select
                                value={formData.print_colors}
                                onValueChange={(v) => setFormData({ ...formData, print_colors: v })}
                            >
                                <SelectTrigger id="colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1+0">1+0</SelectItem>
                                    <SelectItem value="1+1">1+1</SelectItem>
                                    <SelectItem value="4+0">4+0 (CMYK)</SelectItem>
                                    <SelectItem value="4+4">4+4 (CMYK ikki tomon)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="width">Kenglik (sm)</Label>
                            <Input
                                id="width"
                                type="number"
                                value={formData.paper_width}
                                onChange={(e) => setFormData({ ...formData, paper_width: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Balandlik (sm)</Label>
                            <Input
                                id="height"
                                type="number"
                                value={formData.paper_height}
                                onChange={(e) => setFormData({ ...formData, paper_height: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile">Narx profili</Label>
                            <Select
                                value={formData.pricing_profile}
                                onValueChange={(v) => setFormData({ ...formData, pricing_profile: v })}
                            >
                                <SelectTrigger id="profile">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VIP">VIP (15% foyda)</SelectItem>
                                    <SelectItem value="Standard">Standart (20% foyda)</SelectItem>
                                    <SelectItem value="Wholesale">Ulgurji (10% foyda)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={calculatePreview} disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Hisoblanmoqda..." : "Hisoblash"}
                    </Button>
                </CardContent>
            </Card>

            {/* Breakdown Display */}
            {breakdown && (
                <Card>
                    <CardHeader>
                        <CardTitle>Batafsil hisob-kitob</CardTitle>
                        <CardDescription>Material, xarajat va foyda taqsimoti</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Materials */}
                        <div>
                            <h3 className="font-semibold mb-3">📦 Materiallar</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Qog&apos;oz ({breakdown.materials.paper.quantity_kg} kg + {breakdown.materials.paper.waste_percent}% chiqindi)</span>
                                    <span className="font-semibold">{breakdown.materials.paper.total_cost.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Bo&apos;yoq ({breakdown.materials.ink.quantity_kg} kg + {breakdown.materials.ink.waste_percent}% chiqindi)</span>
                                    <span className="font-semibold">{breakdown.materials.ink.total_cost.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Lak ({breakdown.materials.lacquer.quantity_kg} kg + {breakdown.materials.lacquer.waste_percent}% chiqindi)</span>
                                    <span className="font-semibold">{breakdown.materials.lacquer.total_cost.toLocaleString()} so&apos;m</span>
                                </div>
                            </div>
                        </div>

                        {/* Operational */}
                        <div>
                            <h3 className="font-semibold mb-3">⚙️ Ishlab chiqarish xarajatlari</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Qolip ({breakdown.operational.plate_cost.num_colors} rang)</span>
                                    <span className="font-semibold">{breakdown.operational.plate_cost.total_cost.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Stanok sozlash</span>
                                    <span className="font-semibold">{breakdown.operational.setup_cost.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Ish haqi ({formData.quantity} dona)</span>
                                    <span className="font-semibold">{breakdown.operational.run_cost.total_cost.toLocaleString()} so&apos;m</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">💰 Jami</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Material xarajatlari:</span>
                                    <span>{breakdown.summary.material_cost.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Ishlab chiqarish xarajatlari:</span>
                                    <span>{breakdown.summary.operational_cost.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Tannarx:</span>
                                    <span>{breakdown.summary.subtotal.toLocaleString()} so&apos;m</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Foyda ({breakdown.summary.profit_margin_percent}% - {breakdown.summary.pricing_profile}):</span>
                                    <span className="font-semibold">+{breakdown.summary.profit_amount.toLocaleString()} so&apos;m</span>
                                </div>
                                {breakdown.summary.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Soliq ({breakdown.summary.tax_percent}%):</span>
                                        <span>+{breakdown.summary.tax_amount.toLocaleString()} so&apos;m</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                                    <span>JAMI NARX:</span>
                                    <span>{breakdown.summary.total_price.toLocaleString()} so&apos;m</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
