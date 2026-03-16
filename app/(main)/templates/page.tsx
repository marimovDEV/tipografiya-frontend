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
}: {
    template: ProductTemplate
    onEdit: () => void
    onDelete: () => void
}) {
    const isBook = ["book", "magazine", "brochure", "catalog", "booklet"].includes(template.category)

    return (
        <div className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-primary transition-colors line-clamp-1">{template.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {CATEGORY_LABELS[template.category] || template.category}
                        </span>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${template.is_active
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}>
                    {template.is_active ? "Aktiv" : "Nofaol"}
                </div>
            </div>

            {template.description && (
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10 leading-relaxed italic">
                    &quot;{template.description}&quot;
                </p>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 pt-4 border-t border-slate-800">
                {isBook ? (
                    <>
                        {template.format && (
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Format</span>
                                <p className="text-sm font-semibold text-slate-200">{template.format}</p>
                            </div>
                        )}
                        {template.page_count && (
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sahifalar</span>
                                <p className="text-sm font-semibold text-slate-200">{template.page_count}</p>
                            </div>
                        )}
                        {template.binding_type && (
                            <div className="space-y-1 col-span-2">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Bog&apos;lash</span>
                                <p className="text-sm font-semibold text-slate-200">{template.binding_type}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {(template.default_width || template.default_height) && (
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">O&apos;lcham</span>
                                <p className="text-sm font-semibold text-slate-200 font-mono">
                                    {template.default_width}x{template.default_height}x{template.default_depth}
                                </p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Qatlamlar</span>
                            <p className="text-sm font-semibold text-slate-200">{template.layer_count}</p>
                        </div>
                    </>
                )}
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Chiqindi</span>
                    <p className="text-sm font-semibold text-slate-200">{template.default_waste_percent}%</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 relative z-10">
                <button
                    onClick={onEdit}
                    className="flex-1 h-10 flex items-center justify-center gap-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:border-primary shadow-lg hover:shadow-primary/20"
                >
                    <Edit className="w-3.5 h-3.5" />
                    Tahrirlash
                </button>
                <button
                    onClick={onDelete}
                    className="w-10 h-10 flex items-center justify-center border border-slate-800 rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all group/del"
                    title="O'chirish"
                >
                    <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    )
}

