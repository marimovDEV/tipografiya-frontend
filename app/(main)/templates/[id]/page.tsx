"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Calculator } from "lucide-react"
import { getProductTemplate, calculateMaterials } from "@/lib/api/printery"
import type { ProductTemplate, ProductTemplateLayer, ProductTemplateRouting, MaterialNormative, MaterialConsumption } from "@/lib/types"

export default function TemplateDetailPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.id as string

    const [template, setTemplate] = useState<ProductTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"layers" | "routing" | "normatives" | "calculator">("layers")

    useEffect(() => {
        loadTemplate()
    }, [templateId])

    async function loadTemplate() {
        try {
            setLoading(true)
            const data = await getProductTemplate(templateId)
            setTemplate(data)
        } catch (error) {
            console.error("Failed to load template:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!template) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Shablon topilmadi</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{template.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        {template.category_display || template.category}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-sm ${template.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {template.is_active ? "Aktiv" : "Nofaol"}
                </span>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Qatlamlar</p>
                    <p className="text-2xl font-bold">{template.layer_count}</p>
                </div>
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Chiqindi %</p>
                    <p className="text-2xl font-bold">{template.default_waste_percent}%</p>
                </div>
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">O'lchamlar</p>
                    <p className="text-lg font-semibold">
                        {template.default_width}×{template.default_height}×{template.default_depth} cm
                    </p>
                </div>
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Yaratilgan</p>
                    <p className="text-sm font-medium">
                        {new Date(template.created_at).toLocaleDateString("uz-UZ")}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab("layers")}
                        className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === "layers"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Qatlamlar ({template.layers?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("routing")}
                        className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === "routing"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Yo'nalish ({template.routing_steps?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("normatives")}
                        className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === "normatives"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Normativlar ({template.normatives?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("calculator")}
                        className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === "calculator"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Calculator className="w-4 h-4 inline mr-2" />
                        Kalkulyator
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {activeTab === "layers" && <LayersTab template={template} onRefresh={loadTemplate} />}
                {activeTab === "routing" && <RoutingTab template={template} onRefresh={loadTemplate} />}
                {activeTab === "normatives" && <NormativesTab template={template} onRefresh={loadTemplate} />}
                {activeTab === "calculator" && <CalculatorTab template={template} />}
            </div>
        </div>
    )
}

function LayersTab({ template, onRefresh }: { template: ProductTemplate; onRefresh: () => void }) {
    const layers = template.layers || []

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Qatlam Konfiguratsiyasi</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    Qatlam Qo'shish
                </button>
            </div>

            {layers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Qatlamlar konfiguratsiya qilinmagan</p>
                    <button className="mt-4 text-primary hover:underline">
                        Birinchi qatlamni qo'shing
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {layers.map((layer) => (
                        <div key={layer.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                            Qatlam {layer.layer_number}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {layer.material_category}
                                        </span>
                                    </div>

                                    {(layer.min_density || layer.max_density) && (
                                        <p className="text-sm text-muted-foreground">
                                            Zichlik: {layer.min_density || 0} - {layer.max_density || 0} g/m²
                                        </p>
                                    )}

                                    {layer.waste_percent_override && (
                                        <p className="text-sm text-muted-foreground">
                                            Chiqindi override: {layer.waste_percent_override}%
                                        </p>
                                    )}

                                    <p className="text-sm text-muted-foreground mt-1">
                                        Mos materiallar: {layer.compatible_materials?.length || 0} ta
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 text-red-600 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function RoutingTab({ template, onRefresh }: { template: ProductTemplate; onRefresh: () => void }) {
    const routing = template.routing_steps || []
    const sortedRouting = [...routing].sort((a, b) => a.sequence - b.sequence)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ishlab Chiqarish Yo'nalishi</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    Bosqich Qo'shish
                </button>
            </div>

            {sortedRouting.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Yo'nalish belgilanmagan</p>
                    <button className="mt-4 text-primary hover:underline">
                        Birinchi bosqichni qo'shing
                    </button>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200" />

                    <div className="space-y-4">
                        {sortedRouting.map((step, index) => (
                            <div key={step.id} className="relative flex gap-4">
                                {/* Sequence number */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold z-10">
                                    {step.sequence}
                                </div>

                                {/* Step content */}
                                <div className="flex-1 border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold">{step.step_name}</h4>
                                            {step.required_machine_type && (
                                                <p className="text-sm text-muted-foreground">
                                                    Stanok: {step.required_machine_type}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {step.qc_checkpoint && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                                    QC
                                                </span>
                                            )}
                                            {step.is_optional && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    Ixtiyoriy
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Birlik vaqti:</span>
                                            <span className="ml-2 font-medium">{step.estimated_time_per_unit} min</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Sozlash:</span>
                                            <span className="ml-2 font-medium">{step.setup_time_minutes} min</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                                            <Edit className="w-3 h-3 inline mr-1" />
                                            Tahrirlash
                                        </button>
                                        <button className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50">
                                            <Trash2 className="w-3 h-3 inline mr-1" />
                                            O'chirish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function NormativesTab({ template, onRefresh }: { template: ProductTemplate; onRefresh: () => void }) {
    const normatives = template.normatives || []

    const materialTypeLabels: Record<string, string> = {
        paper: "Qog'oz",
        ink: "Siyoh",
        lacquer: "Lak",
        adhesive: "Yelim",
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Material Normativlari</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    Normativ Qo'shish
                </button>
            </div>

            {normatives.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Normativlar belgilanmagan</p>
                    <button className="mt-4 text-primary hover:underline">
                        Birinchi normativni qo'shing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {normatives.map((normative) => (
                        <div key={normative.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold">
                                        {materialTypeLabels[normative.material_type] || normative.material_type}
                                    </h4>
                                    {normative.color_count && (
                                        <p className="text-sm text-muted-foreground">
                                            {normative.color_count} rang
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 hover:bg-gray-100 rounded">
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1.5 hover:bg-red-50 text-red-600 rounded">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sarflanish:</span>
                                    <span className="font-medium">
                                        {normative.consumption_per_unit} {normative.unit_of_measure}
                                    </span>
                                </div>
                                {normative.waste_percent && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Chiqindi:</span>
                                        <span className="font-medium">{normative.waste_percent}%</span>
                                    </div>
                                )}
                                {normative.effective_from && (
                                    <div className="text-muted-foreground text-xs mt-2">
                                        Amal qiladi: {new Date(normative.effective_from).toLocaleDateString("uz-UZ")}
                                        {normative.effective_to && ` - ${new Date(normative.effective_to).toLocaleDateString("uz-UZ")}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function CalculatorTab({ template }: { template: ProductTemplate }) {
    const [params, setParams] = useState({
        width_cm: template.default_width || 20,
        height_cm: template.default_height || 15,
        quantity: 1000,
        color_count: 4,
        has_lacquer: false,
        has_gluing: false,
    })
    const [result, setResult] = useState<MaterialConsumption | null>(null)
    const [calculating, setCalculating] = useState(false)

    async function handleCalculate() {
        try {
            setCalculating(true)
            const response = await calculateMaterials(template.id, params)
            setResult(response.consumption)
        } catch (error) {
            console.error("Failed to calculate:", error)
        } finally {
            setCalculating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Material Sarfini Hisoblash</h3>

                {/* Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Kenglik (cm)</label>
                        <input
                            type="number"
                            value={params.width_cm}
                            onChange={(e) => setParams({ ...params, width_cm: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Balandlik (cm)</label>
                        <input
                            type="number"
                            value={params.height_cm}
                            onChange={(e) => setParams({ ...params, height_cm: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Miqdor</label>
                        <input
                            type="number"
                            value={params.quantity}
                            onChange={(e) => setParams({ ...params, quantity: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Ranglar soni</label>
                        <input
                            type="number"
                            value={params.color_count}
                            onChange={(e) => setParams({ ...params, color_count: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={params.has_lacquer}
                                onChange={(e) => setParams({ ...params, has_lacquer: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Lak</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={params.has_gluing}
                                onChange={(e) => setParams({ ...params, has_gluing: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Yelimlash</span>
                        </label>
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={handleCalculate}
                            disabled={calculating}
                            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {calculating ? "Hisoblanmoqda..." : "Hisoblash"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.paper && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="font-semibold text-blue-900 mb-2">Qog'oz</h4>
                            <p className="text-2xl font-bold text-blue-900">
                                {result.paper.total_consumption_m2.toFixed(2)} m²
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Chiqindi bilan (+{result.paper.waste_percent}%)
                            </p>
                        </div>
                    )}

                    {result.ink && (
                        <div className="border rounded-lg p-4 bg-purple-50">
                            <h4 className="font-semibold text-purple-900 mb-2">Siyoh</h4>
                            <p className="text-2xl font-bold text-purple-900">
                                {(result.ink.total_consumption_g / 1000).toFixed(2)} kg
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                                {result.ink.color_count} rang
                            </p>
                        </div>
                    )}

                    {result.lacquer && (
                        <div className="border rounded-lg p-4 bg-green-50">
                            <h4 className="font-semibold text-green-900 mb-2">Lak</h4>
                            <p className="text-2xl font-bold text-green-900">
                                {result.lacquer.total_consumption_L.toFixed(2)} L
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                                {result.lacquer.total_consumption_ml.toFixed(0)} ml
                            </p>
                        </div>
                    )}

                    {result.adhesive && (
                        <div className="border rounded-lg p-4 bg-orange-50">
                            <h4 className="font-semibold text-orange-900 mb-2">Yelim</h4>
                            <p className="text-2xl font-bold text-orange-900">
                                {(result.adhesive.total_consumption_g / 1000).toFixed(2)} kg
                            </p>
                            <p className="text-sm text-orange-700 mt-1">
                                {result.adhesive.gluing_length_per_unit_cm} cm/birlik
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
