"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ProductionTabProps {
    settings: any
    setSettings: (settings: any) => void
    onSave: () => Promise<void>
    saving: boolean
}

export function ProductionTab({ settings, setSettings, onSave, saving }: ProductionTabProps) {
    return (
        <div className="space-y-6">
            {/* Production Costs */}
            <Card>
                <CardHeader>
                    <CardTitle>Ishlab chiqarish xarajatlari</CardTitle>
                    <CardDescription>Qolip, stanok va ish haqi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plate">Qolip (bitta rang uchun)</Label>
                            <Input
                                id="plate"
                                type="number"
                                value={settings.plate_cost || 0}
                                onChange={(e) => setSettings({ ...settings, plate_cost: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="setup">Stanokni sozlash (Priladka)</Label>
                            <Input
                                id="setup"
                                type="number"
                                value={settings.setup_cost || 0}
                                onChange={(e) => setSettings({ ...settings, setup_cost: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="run">Ish haqi (1 quti uchun)</Label>
                            <Input
                                id="run"
                                type="number"
                                value={settings.run_cost_per_box || 0}
                                onChange={(e) => setSettings({ ...settings, run_cost_per_box: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Machine Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Stanok sozlamalari</CardTitle>
                    <CardDescription>Soatlik narx va minimal vaqt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="machine-rate">Stanok soatlik narxi</Label>
                            <Input
                                id="machine-rate"
                                type="number"
                                value={settings.machine_hourly_rate || 0}
                                onChange={(e) => setSettings({ ...settings, machine_hourly_rate: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        💡 Yanada detalli stanok sozlamalari uchun keyingi versiyada alohida bo&apos;lim qo&apos;shiladi
                    </p>
                </CardContent>
            </Card>

            <Button onClick={onSave} disabled={saving} size="lg" className="w-full md:w-auto">
                {saving ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
            </Button>
        </div>
    )
}
