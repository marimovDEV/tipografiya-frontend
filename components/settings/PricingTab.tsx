"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"

interface PricingTabProps {
    settings: any
    setSettings: (settings: any) => void
    onSave: () => Promise<void>
    saving: boolean
}

export function PricingTab({ settings, setSettings, onSave, saving }: PricingTabProps) {
    const [pricingProfiles, setPricingProfiles] = useState(
        settings.pricing_profiles || { VIP: 15, Standard: 20, Wholesale: 10 }
    )

    const handleProfileChange = (profile: string, value: number) => {
        const newProfiles = { ...pricingProfiles, [profile]: value }
        setPricingProfiles(newProfiles)
        setSettings({ ...settings, pricing_profiles: newProfiles })
    }

    return (
        <div className="space-y-6">
            {/* Material Prices */}
            <Card>
                <CardHeader>
                    <CardTitle>📦 Xomashyo Narxlari (so'm)</CardTitle>
                    <CardDescription>
                        Kalkulyatsiya uchun asosiy material narxlari
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paper" className="flex items-center gap-2">
                                📄 Qog'oz (1 kg)
                            </Label>
                            <Input
                                id="paper"
                                type="number"
                                value={settings.paper_price_per_kg || 0}
                                onChange={(e) => setSettings({ ...settings, paper_price_per_kg: parseFloat(e.target.value) })}
                            />
                                onChange={(e) => setSettings({ ...settings, paper_price_per_kg: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ink" className="flex items-center gap-2">
                                🎨 Bo&apos;yoq (1 kg)
                            </Label>
                            <Input
                                id="ink"
                                type="number"
                                value={settings.ink_price_per_kg || 0}
                                onChange={(e) => setSettings({ ...settings, ink_price_per_kg: parseFloat(e.target.value) })}
                            />
                                onChange={(e) => setSettings({ ...settings, ink_price_per_kg: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lacquer" className="flex items-center gap-2">
                                ✨ Lak (1 kg)
                            </Label>
                            <Input
                                id="lacquer"
                                type="number"
                                value={settings.lacquer_price_per_kg || 0}
                                onChange={(e) => setSettings({ ...settings, lacquer_price_per_kg: parseFloat(e.target.value) })}
                            />
                                onChange={(e) => setSettings({ ...settings, lacquer_price_per_kg: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                            💰 Tannarx = (Qog'oz + Bo'yoq + Lak) narxlari × Kerakli miqdor
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Bu narxlar asosida har bir buyurtmaga qancha xomashyo ketishini va tannarxni avtomatik hisoblaymiz.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Waste Percentages */}
            <Card>
                <CardHeader>
                    <CardTitle>♻️ Chiqindi Foizlari (%)</CardTitle>
                    <CardDescription>
                        Ishlab chiqarish jarayonida yo'qotiladigan materiallar
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="waste-paper">📄 Qog'oz chiqindisi (%)</Label>
                            <Input
                                id="waste-paper"
                                type="number"
                                min="0"
                                max="100"
                                value={settings.waste_percentage_paper || 5}
                                onChange={(e) => setSettings({ ...settings, waste_percentage_paper: parseInt(e.target.value) })}
                            />
                                onChange={(e) => setSettings({ ...settings, waste_percentage_paper: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="waste-ink">🎨 Bo&apos;yoq chiqindisi (%)</Label>
                            <Input
                                id="waste-ink"
                                type="number"
                                min="0"
                                max="100"
                                value={settings.waste_percentage_ink || 10}
                                onChange={(e) => setSettings({ ...settings, waste_percentage_ink: parseInt(e.target.value) })}
                            />
                                onChange={(e) => setSettings({ ...settings, waste_percentage_ink: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="waste-lacquer">✨ Lak chiqindisi (%)</Label>
                            <Input
                                id="waste-lacquer"
                                type="number"
                                min="0"
                                max="100"
                                value={settings.waste_percentage_lacquer || 8}
                                onChange={(e) => setSettings({ ...settings, waste_percentage_lacquer: parseInt(e.target.value) })}
                            />
                                onChange={(e) => setSettings({ ...settings, waste_percentage_lacquer: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                            ⚠️ Chiqindi kam bo'lsa yaxshi, lekin juda kam (0-1%) qilmang!
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Agar chiqindini juda kam belgilasangiz, material yetmay qolishi mumkin va ishni to'xtatishga to'g'ri keladi.
                            Optimal qiymat: Qog'oz 5%, Bo'yoq 10%, Lak 8%
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Order Pricing Configuration - NEW! */}
            <Card className="border-blue-700 bg-blue-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        💰 Buyurtma Narxlash Sozlamalari
                        <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">YANGI</span>
                    </CardTitle>
                    <CardDescription>Buyurtmalar uchun avtomatik narx hisoblash parametrlari</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="base-price">Asosiy narx (so'm/m²)</Label>
                            <Input
                                id="base-price"
                                type="number"
                                step="0.01"
                                value={settings.base_price_per_sqm || 50}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 50
                                    setSettings({ ...settings, base_price_per_sqm: value })
                                    // Save to localStorage for quick access
                                    const config = {
                                        base_price_per_sqm: value,
                                        color_markup_percent: settings.color_markup_percent || 10,
                                        lacquer_markup_percent: settings.lacquer_markup_percent || 15,
                                        gluing_markup_percent: settings.gluing_markup_percent || 10
                                    }
                                    localStorage.setItem('pricing_config', JSON.stringify(config))
                                }}
                                className="font-mono"
                            />
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color-markup">Rang qo'shimcha (%)</Label>
                            <Input
                                id="color-markup"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={settings.color_markup_percent || 10}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 10
                                    setSettings({ ...settings, color_markup_percent: value })
                                    const config = {
                                        base_price_per_sqm: settings.base_price_per_sqm || 50,
                                        color_markup_percent: value,
                                        lacquer_markup_percent: settings.lacquer_markup_percent || 15,
                                        gluing_markup_percent: settings.gluing_markup_percent || 10
                                    }
                                    localStorage.setItem('pricing_config', JSON.stringify(config))
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Har bir rang uchun qoβshiluvchi foiz (masalan: 4 rang = +40%)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lacquer-markup">Lak qo'shimcha (%)</Label>
                            <Input
                                id="lacquer-markup"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={settings.lacquer_markup_percent || 15}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 15
                                    setSettings({ ...settings, lacquer_markup_percent: value })
                                    const config = {
                                        base_price_per_sqm: settings.base_price_per_sqm || 50,
                                        color_markup_percent: settings.color_markup_percent || 10,
                                        lacquer_markup_percent: value,
                                        gluing_markup_percent: settings.gluing_markup_percent || 10
                                    }
                                    localStorage.setItem('pricing_config', JSON.stringify(config))
                                }}
                            />
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 15
                                    setSettings({ ...settings, lacquer_markup_percent: value })
                                    const config = {
                                        base_price_per_sqm: settings.base_price_per_sqm || 50,
                                        color_markup_percent: settings.color_markup_percent || 10,
                                        lacquer_markup_percent: value,
                                        gluing_markup_percent: settings.gluing_markup_percent || 10
                                    }
                                    localStorage.setItem('pricing_config', JSON.stringify(config))
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gluing-markup">Yelimlash qo'shimcha (%)</Label>
                            <Input
                                id="gluing-markup"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={settings.gluing_markup_percent || 10}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 10
                                    setSettings({ ...settings, gluing_markup_percent: value })
                                    const config = {
                                        base_price_per_sqm: settings.base_price_per_sqm || 50,
                                        color_markup_percent: settings.color_markup_percent || 10,
                                        lacquer_markup_percent: settings.lacquer_markup_percent || 15,
                                        gluing_markup_percent: value
                                    }
                                    localStorage.setItem('pricing_config', JSON.stringify(config))
                                }}
                            />
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 10
                                    setSettings({ ...settings, gluing_markup_percent: value })
                                    const config = {
                                        base_price_per_sqm: settings.base_price_per_sqm || 50,
                                        color_markup_percent: settings.color_markup_percent || 10,
                                        lacquer_markup_percent: settings.lacquer_markup_percent || 15,
                                        gluing_markup_percent: value
                                    }
                                    localStorage.setItem('pricing_config', JSON.stringify(config))
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                        <p className="text-sm font-medium text-blue-300"> Misol hisob-kitob:</p>
                        <p className="text-xs text-blue-200 mt-1">
                            20×15 cm, 1000 dona, 4 rang, lak bor:
                        </p>
                        <p className="text-xs text-blue-100 font-mono mt-1">
                            Asosiy: 0.03 m² × 1000 × {settings.base_price_per_sqm || 50} = {((0.03 * 1000 * (settings.base_price_per_sqm || 50))).toLocaleString()} so'm<br />
                            Ranglar (+{(settings.color_markup_percent || 10) * 4}%): +{((0.03 * 1000 * (settings.base_price_per_sqm || 50)) * (settings.color_markup_percent || 10) * 4 / 100).toLocaleString()} so'm<br />
                            Lak (+{settings.lacquer_markup_percent || 15}%): +{((0.03 * 1000 * (settings.base_price_per_sqm || 50)) * (settings.lacquer_markup_percent || 15) / 100).toLocaleString()} so'm<br />
                            <strong>JAMI: {((0.03 * 1000 * (settings.base_price_per_sqm || 50)) * (1 + (settings.color_markup_percent || 10) * 4 / 100) + (0.03 * 1000 * (settings.base_price_per_sqm || 50)) * (settings.lacquer_markup_percent || 15) / 100).toLocaleString()} so'm</strong>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Pricing Profiles */}
            <Card>
                <CardHeader>
                    <CardTitle>💎 Narx Profillari (Foyda Foizlari)</CardTitle>
                    <CardDescription>
                        Turli mijozlar uchun foyda foizlari
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vip" className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded font-semibold">VIP</span>
                                Foyda (%)
                            </Label>
                            <Input
                                id="vip"
                                type="number"
                                value={pricingProfiles.VIP || 15}
                                onChange={(e) => handleProfileChange('VIP', parseInt(e.target.value))}
                            />
                                onChange={(e) => handleProfileChange('VIP', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="standard" className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-semibold">Standart</span>
                                Foyda (%)
                            </Label>
                            <Input
                                id="standard"
                                type="number"
                                value={pricingProfiles.Standard || 20}
                                onChange={(e) => handleProfileChange('Standard', parseInt(e.target.value))}
                            />
                                onChange={(e) => handleProfileChange('Standard', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wholesale" className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-semibold">Ulgurji</span>
                                Foyda (%)
                            </Label>
                            <Input
                                id="wholesale"
                                type="number"
                                value={pricingProfiles.Wholesale || 10}
                                onChange={(e) => handleProfileChange('Wholesale', parseInt(e.target.value))}
                            />
                                onChange={(e) => handleProfileChange('Wholesale', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                            ✅ Sotuv narxi = Tannarx + (Tannarx × Foyda %)
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            Mijozni tanlashda avtomatik kerakli profilni tanlab, to'g'ri narxni hisoblaydi.
                            Bu profit marginlaringizni nazoratda tutishga yordam beradi.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Currency */}
            <Card>
                <CardHeader>
                    <CardTitle>Valyuta</CardTitle>
                    <CardDescription>Markaziy Bank kursidan avtomatik yangilash</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exchange">Valyuta kursi (1 USD)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="exchange"
                                    type="number"
                                    value={settings.exchange_rate || 12800}
                                    onChange={(e) => setSettings({ ...settings, exchange_rate: parseFloat(e.target.value) })}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            const res = await fetchWithAuth("/api/settings/update-currency/", {
                                                method: "POST"
                                            })

                                            if (!res.ok) {
                                                const error = await res.json()
                                                throw new Error(error.error || "Yangilab bo'lmadi")
                                            }

                                            const data = await res.json()
                                            setSettings({ ...settings, exchange_rate: data.new_rate })
                                            toast.success(`Kurs yangilandi: ${data.new_rate} so'm`)
                                        } catch (error: any) {
                                            console.error(error)
                                            toast.error(error.message || "Xatolik yuz berdi")
                                        }
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                    </svg>
                                    Yangilash
                                </Button>
                            </div>
                                    Yangilash
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={onSave} disabled={saving} size="lg" className="w-full md:w-auto">
                {saving ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
            </Button>
        </div>
    )
}
