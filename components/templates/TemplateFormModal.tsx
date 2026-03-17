import { useState, useEffect } from "react"
import { updateProductTemplate, createProductTemplate } from "@/lib/api/printery"
import type { ProductTemplate, ProductCategory, ProductTemplateRouting } from "@/lib/types"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { GripVertical, Plus, Trash2, Settings2, Clock, Factory, UserCheck, Zap } from "lucide-react"

export const CATEGORY_LABELS: Partial<Record<ProductCategory, string>> = {
    book: "Kitob",
    magazine: "Jurnal",
    brochure: "Broshyura",
    catalog: "Katalog",
    booklet: "Buklet",
    custom: "Maxsus",
}

const BOOK_CATEGORIES: ProductCategory[] = ["book", "magazine", "brochure", "catalog", "booklet"];

interface TemplateFormModalProps {
    template: ProductTemplate | null
    onClose: () => void
    onSave: () => void
}

export function TemplateFormModal({
    template,
    onClose,
    onSave,
}: TemplateFormModalProps) {
    const [formData, setFormData] = useState({
        name: template?.name || "",
        category: template?.category || "book",
        layer_count: template?.layer_count || 1,
        default_waste_percent: template?.default_waste_percent || 5,
        description: template?.description || "",
        default_width: template?.default_width || 0,
        default_height: template?.default_height || 0,
        default_depth: template?.default_depth || 0,
        is_active: template?.is_active ?? true,
        
        // Book specific
        page_count: template?.page_count || 0,
        format: template?.format || "",
        binding_type: template?.binding_type || "",
        paper_type: template?.paper_type || "",
        paper_weight: template?.paper_weight || 0,
        cover_weight: template?.cover_weight || 0,
        print_type: template?.print_type || "",
        lamination: template?.lamination || "",
        bleed_mm: template?.bleed_mm || 3.0,
        margin_top_mm: template?.margin_top_mm || 15.0,
        margin_bottom_mm: template?.margin_bottom_mm || 15.0,
        margin_inner_mm: template?.margin_inner_mm || 20.0,
        margin_outer_mm: template?.margin_outer_mm || 15.0,
        column_count: template?.column_count || 1,
        safe_area_padding_mm: template?.safe_area_padding_mm || 5.0,
    })
    
    // Workflow Stages State
    const [stages, setStages] = useState<Partial<ProductTemplateRouting>[]>(
        template?.stages || [
            { stage_name: "Sklad", sequence: 1, department: "Omborxona", requires_operator: true },
            { stage_name: "Tayyor (Sklad)", sequence: 2, department: "Omborxona", requires_operator: true }
        ]
    )

    const [saving, setSaving] = useState(false)

    // Sync sequences when stages change
    useEffect(() => {
        setStages(prev => prev.map((s, i) => ({ ...s, sequence: i + 1 })))
    }, [stages.length])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            setSaving(true)
            const payload = {
                ...formData,
                stages: stages.map((s, i) => ({ ...s, sequence: i + 1 }))
            }

            if (template) {
                await updateProductTemplate(template.id, payload)
            } else {
                await createProductTemplate(payload)
            }
            onSave()
        } catch (error) {
            console.error("Failed to save template:", error)
            alert("Xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(stages)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        // Update sequences immediately for better UX
        const updatedItems = items.map((item, index) => ({
            ...item,
            sequence: index + 1
        }))

        setStages(updatedItems)
    }

    const addStage = () => {
        const newStage: Partial<ProductTemplateRouting> = {
            stage_name: "Yangi bosqich",
            sequence: stages.length + 1,
            department: "",
            requires_operator: true,
            auto_start: false
        }
        setStages([...stages, newStage])
    }

    const removeStage = (index: number) => {
        const newStages = stages.filter((_, i) => i !== index)
        setStages(newStages)
    }

    const updateStage = (index: number, field: keyof ProductTemplateRouting, value: any) => {
        const newStages = [...stages]
        newStages[index] = { ...newStages[index], [field]: value }
        setStages(newStages)
    }

    const isBook = BOOK_CATEGORIES.includes(formData.category as ProductCategory);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-50">
                        {template ? "Shablonni Tahrirlash" : "Yangi Shablon"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Info - Industrial Style */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                            <div className="w-2 h-6 bg-primary rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Asosiy ma&apos;lumotlar</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                                    Shablon nomi <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-sm"
                                    placeholder="Standart Kitob A5..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                                    Kategoriya <span className="text-primary">*</span>
                                </label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                                        className="w-full h-12 px-4 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-sm appearance-none"
                                    >
                                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value} className="bg-slate-900 py-2">
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 transition-colors group-hover:text-primary">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Book Specific Fields - Only for Book categories */}
                    {isBook ? (
                        <>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                    <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Kitob va Jurnal Parametrlari</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Format (A4/A5)</label>
                                        <input
                                            type="text"
                                            value={formData.format}
                                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Format"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Sahifalar</label>
                                        <input
                                            type="number"
                                            value={formData.page_count}
                                            onChange={(e) => setFormData({ ...formData, page_count: parseInt(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Bog&apos;lash</label>
                                        <input
                                            type="text"
                                            value={formData.binding_type}
                                            onChange={(e) => setFormData({ ...formData, binding_type: e.target.value })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Yelim/Skoba"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Qog&apos;oz turi</label>
                                        <input
                                            type="text"
                                            value={formData.paper_type}
                                            onChange={(e) => setFormData({ ...formData, paper_type: e.target.value })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Ofset..."
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Qog&apos;oz gsm</label>
                                        <input
                                            type="number"
                                            value={formData.paper_weight}
                                            onChange={(e) => setFormData({ ...formData, paper_weight: parseInt(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Muqova gsm</label>
                                        <input
                                            type="number"
                                            value={formData.cover_weight}
                                            onChange={(e) => setFormData({ ...formData, cover_weight: parseInt(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Chop turi</label>
                                        <input
                                            type="text"
                                            value={formData.print_type}
                                            onChange={(e) => setFormData({ ...formData, print_type: e.target.value })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                            placeholder="4+4"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Laminatsiya</label>
                                        <input
                                            type="text"
                                            value={formData.lamination}
                                            onChange={(e) => setFormData({ ...formData, lamination: e.target.value })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Mat..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Technical Layout Specs */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                    <div className="w-2 h-6 bg-purple-500 rounded-full" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Texnik Loyiha (Layout)</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Bleed (mm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.bleed_mm}
                                            onChange={(e) => setFormData({ ...formData, bleed_mm: parseFloat(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Safe Area (mm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.safe_area_padding_mm}
                                            onChange={(e) => setFormData({ ...formData, safe_area_padding_mm: parseFloat(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Ustunlar (Grid)</label>
                                        <input
                                            type="number"
                                            value={formData.column_count}
                                            onChange={(e) => setFormData({ ...formData, column_count: parseInt(e.target.value) || 1 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Gutter / Inner (mm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.margin_inner_mm}
                                            onChange={(e) => setFormData({ ...formData, margin_inner_mm: parseFloat(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Margin Top (mm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.margin_top_mm}
                                            onChange={(e) => setFormData({ ...formData, margin_top_mm: parseFloat(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Margin Bottom (mm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.margin_bottom_mm}
                                            onChange={(e) => setFormData({ ...formData, margin_bottom_mm: parseFloat(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Margin Outer (mm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.margin_outer_mm}
                                            onChange={(e) => setFormData({ ...formData, margin_outer_mm: parseFloat(e.target.value) || 0 })}
                                            className="h-10 px-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Box Specific Dimensions - Only for NON-Book categories */
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                <div className="w-2 h-6 bg-amber-500 rounded-full" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Quti o&apos;lchamlari</h3>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Kenglik (cm)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.default_width}
                                        onChange={(e) => setFormData({ ...formData, default_width: parseFloat(e.target.value) || 0 })}
                                        className="w-full h-11 px-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Balandlik (cm)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.default_height}
                                        onChange={(e) => setFormData({ ...formData, default_height: parseFloat(e.target.value) || 0 })}
                                        className="w-full h-11 px-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Chuqurlik (cm)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.default_depth}
                                        onChange={(e) => setFormData({ ...formData, default_depth: parseFloat(e.target.value) || 0 })}
                                        className="w-full h-11 px-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Production Setup - Conditional display of layer count */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                            <div className="w-2 h-6 bg-blue-500 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Ishlab chiqarish sozlamalari</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            {!isBook && (
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Qatlamlar soni</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="5"
                                        value={formData.layer_count}
                                        onChange={(e) => setFormData({ ...formData, layer_count: parseInt(e.target.value) || 1 })}
                                        className="w-full h-11 px-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Chiqindi %</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.default_waste_percent}
                                    onChange={(e) => setFormData({ ...formData, default_waste_percent: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-11 px-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Workflow Stages Builder - Drag & Drop */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-rose-500 rounded-full" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Ishlab chiqarish etaplari (Workflow)</h3>
                            </div>
                            <button
                                type="button"
                                onClick={addStage}
                                className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Etap qo&apos;shish
                            </button>
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="stages">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {stages.map((stage, index) => (
                                            <Draggable key={`stage-${index}`} draggableId={`stage-${index}`} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`
                                                            group bg-slate-950/50 border border-slate-800 rounded-xl p-4 transition-all
                                                            ${snapshot.isDragging ? "border-rose-500/50 shadow-2xl shadow-rose-500/10 scale-[1.02] z-[110]" : "hover:border-slate-700"}
                                                        `}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Drag Handle */}
                                                            <div {...provided.dragHandleProps} className="mt-2 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>

                                                            {/* Stage Number */}
                                                            <div className="mt-1.5 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                                {index + 1}
                                                            </div>

                                                            {/* Stage Form fields */}
                                                            <div className="flex-1 space-y-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Etap nomi</label>
                                                                        <input
                                                                            type="text"
                                                                            value={stage.stage_name}
                                                                            onChange={(e) => updateStage(index, "stage_name", e.target.value)}
                                                                            className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:border-rose-500 outline-none transition-all"
                                                                            placeholder="Masalan: Bosma"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Bo&apos;lim</label>
                                                                        <input
                                                                            type="text"
                                                                            value={stage.department || ""}
                                                                            onChange={(e) => updateStage(index, "department", e.target.value)}
                                                                            className="w-full h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 focus:border-rose-500 outline-none transition-all"
                                                                            placeholder="Masalan: Bosmaxona"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                                    <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800/50">
                                                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                                        <input
                                                                            type="number"
                                                                            value={stage.estimated_time_minutes || ""}
                                                                            onChange={(e) => updateStage(index, "estimated_time_minutes", parseInt(e.target.value) || 0)}
                                                                            className="w-full bg-transparent text-[11px] outline-none text-slate-300 font-bold"
                                                                            placeholder="Min"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800/50">
                                                                        <Factory className="w-3.5 h-3.5 text-slate-500" />
                                                                        <input
                                                                            type="text"
                                                                            value={stage.machine || ""}
                                                                            onChange={(e) => updateStage(index, "machine", e.target.value)}
                                                                            className="w-full bg-transparent text-[11px] outline-none text-slate-300 font-bold"
                                                                            placeholder="Stanok"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-4 col-span-2">
                                                                        <label className="flex items-center gap-2 cursor-pointer group/check">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={stage.requires_operator}
                                                                                onChange={(e) => updateStage(index, "requires_operator", e.target.checked)}
                                                                                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-rose-500 focus:ring-rose-500/20"
                                                                            />
                                                                            <span className="text-[10px] font-black uppercase text-slate-500 group-hover/check:text-slate-300 transition-colors">Operator</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer group/check">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={stage.auto_start}
                                                                                onChange={(e) => updateStage(index, "auto_start", e.target.checked)}
                                                                                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-rose-500 focus:ring-rose-500/20"
                                                                            />
                                                                            <span className="text-[10px] font-black uppercase text-slate-500 group-hover/check:text-slate-300 transition-colors">Auto</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeStage(index)}
                                                                className="mt-2 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {stages.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                                <Settings2 className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hozircha etaplar yo&apos;q</p>
                                <button
                                    type="button"
                                    onClick={addStage}
                                    className="mt-3 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                                >
                                    Birinchi bosqichni qo&apos;shish
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Description & Status */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Tavsif</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full p-4 bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
                                placeholder="Shablon haqida qo'shimcha ma'lumotlar..."
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-950/30 rounded-xl border border-slate-800/50 w-fit">
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                            <label htmlFor="is_active" className="text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer select-none">
                                Aktiv holatda
                            </label>
                        </div>
                    </div>

                    {/* Actions - Industrial Buttons */}
                    <div className="flex gap-4 pt-8 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 border border-slate-800 bg-slate-950 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-all"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 h-12 bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:opacity-90 disabled:opacity-50 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            {saving ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
