"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Trash2, Copy, Eye } from "lucide-react"
import { getProductTemplates, createProductTemplate, updateProductTemplate, deleteProductTemplate } from "@/lib/api/printery"
import type { ProductTemplate, ProductCategory } from "@/lib/types"
import { TemplateFormModal, CATEGORY_LABELS } from "@/components/templates/TemplateFormModal"

export default function ProductTemplatesPage() {
    const [templates, setTemplates] = useState<ProductTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCategory, setFilterCategory] = useState<string>("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<ProductTemplate | null>(null)

    useEffect(() => {
        loadTemplates()
    }, [filterCategory])

    async function loadTemplates() {
        try {
            setLoading(true)
            const params: any = {}
            if (filterCategory) params.category = filterCategory

            const response = await getProductTemplates(params)
            console.log('Templates response:', response)

            // Handle both array and {results: []} response formats
            const templatesArray = Array.isArray(response) ? response : (response.results || [])
            setTemplates(templatesArray)
            console.log('Loaded templates:', templatesArray.length)
        } catch (error) {
            console.error("Failed to load templates:", error)
            setTemplates([])
        } finally {
            setLoading(false)
        }
    }

    const filteredTemplates = (templates || []).filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
        // The filterCategory is already applied in loadTemplates, so this client-side filter is redundant if server-side is active.
        // However, if the intent is to filter *additionally* client-side, or if filterCategory is not always passed to API:
        // const matchesCategory = filterCategory === "" || template.category === filterCategory
        return matchesSearch // && matchesCategory
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mahsulot Shablonlari</h1>
                    <p className="text-muted-foreground mt-1">
                        Turli xil mahsulot turlarini boshqarish va sozlash
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Yangi Shablon
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Shablon nomi bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Barcha kategoriyalar</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Shablonlar topilmadi</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 text-primary hover:underline"
                    >
                        Birinchi shablonni yarating
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onEdit={() => setEditingTemplate(template)}
                            onDelete={async () => {
                                if (confirm("Haqiqatan ham bu shablonni o'chirib tashlamoqchimisiz?")) {
                                    try {
                                        setLoading(true)
                                        await deleteProductTemplate(template.id)
                                        await loadTemplates()
                                    } catch (error) {
                                        console.error("Failed to delete template", error)
                                        alert("O'chirishda xatolik yuz berdi")
                                        setLoading(false)
                                    }
                                }
                            }}
                            onRefresh={loadTemplates}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingTemplate) && (
                <TemplateFormModal
                    template={editingTemplate}
                    onClose={() => {
                        setShowCreateModal(false)
                        setEditingTemplate(null)
                    }}
                    onSave={() => {
                        loadTemplates()
                        setShowCreateModal(false)
                        setEditingTemplate(null)
                    }}
                />
            )}
        </div>
    )
}

function TemplateCard({
    template,
    onEdit,
    onDelete,
    onRefresh,
}: {
    template: ProductTemplate
    onEdit: () => void
    onDelete: () => void
    onRefresh: () => void
}) {
    return (
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card relative group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-card-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {CATEGORY_LABELS[template.category] || template.category}
                    </p>
                </div>
                <span
                    className={`px-2 py-1 text-xs rounded-full ${template.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                >
                    {template.is_active ? "Aktiv" : "Nofaol"}
                </span>
            </div>

            {template.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {template.format && (
                    <div>
                        <span className="text-muted-foreground">Format:</span>
                        <p className="font-medium">{template.format}</p>
                    </div>
                )}
                {template.page_count ? (
                    <div>
                        <span className="text-muted-foreground">Sahifalar:</span>
                        <p className="font-medium">{template.page_count}</p>
                    </div>
                ) : (
                    <div>
                        <span className="text-muted-foreground">Qatlamlar:</span>
                        <p className="font-medium">{template.layer_count}</p>
                    </div>
                )}
                {template.binding_type && (
                    <div className="col-span-2">
                        <span className="text-muted-foreground">Bog&apos;lash:</span>
                        <p className="font-medium">{template.binding_type}</p>
                    </div>
                )}
                {!template.binding_type && (
                    <div>
                        <span className="text-muted-foreground">Chiqindi %:</span>
                        <p className="font-medium">{template.default_waste_percent}%</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
                >
                    <Edit className="w-4 h-4" />
                    Tahrirlash
                </button>
                <button
                    onClick={onDelete}
                    className="px-3 py-2 border rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
                    title="O'chirish"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

