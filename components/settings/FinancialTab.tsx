"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface FinancialTabProps {
    settings: any
    setSettings: (settings: any) => void
    onSave: () => Promise<void>
    saving: boolean
}

export function FinancialTab({ settings, setSettings, onSave, saving }: FinancialTabProps) {
    return (
        <div className="space-y-6">
            {/* General Financial Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Moliyaviy Sozlamalar</CardTitle>
                    <CardDescription>Soliq, foyda va to&apos;lov turlari</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="profit">Standart foyda foizi (%)</Label>
                            <Input
                                id="profit"
                                type="number"
                                value={settings.profit_margin_percent || 20}
                                onChange={(e) => setSettings({ ...settings, profit_margin_percent: parseInt(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Bu profil tanlanmagan buyurtmalar uchun ishlatiladi
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tax">Soliq foizi - QQS (%)</Label>
                            <Input
                                id="tax"
                                type="number"
                                value={settings.tax_percent || 0}
                                onChange={(e) => setSettings({ ...settings, tax_percent: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Receipt Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Chek sozlamalari</CardTitle>
                    <CardDescription>Mijozga beriladigan chek formati</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="show-profit">Mijozga foydani ko&apos;rsatish</Label>
                            <p className="text-sm text-muted-foreground">
                                Agar yoqilsa, chekda tannarx va foyda ko&apos;rinadi
                            </p>
                        </div>
                        <Switch
                            id="show-profit"
                            checked={settings.show_profit_to_client || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, show_profit_to_client: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Payment Types */}
            <Card>
                <CardHeader>
                    <CardTitle>To&apos;lov turlari</CardTitle>
                    <CardDescription>Qo&apos;llab-quvvatlanadigan to&apos;lov usullari</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Mavjud to&apos;lov turlari:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">💵 Naqd</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">💳 Karta</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm">🏦 Pul o&apos;tkazish</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            To&apos;lov turlarini boshqarish keyingi versiyada qo&apos;shiladi
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={onSave} disabled={saving} size="lg" className="w-full md:w-auto">
                {saving ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
            </Button>
        </div>
    )
}
