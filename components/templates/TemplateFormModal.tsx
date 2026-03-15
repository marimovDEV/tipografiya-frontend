"use client"

import { useState } from "react"
import { updateProductTemplate, createProductTemplate } from "@/lib/api/printery"
import type { ProductTemplate, ProductCategory } from "@/lib/types"

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
    medicine_box_1layer: "Dori qutilari (1 qatlam)",
    pizza_box: "Pizza qutilari",
    box_2layer: "2 qatlamli karobka",
    box_3layer: "3 qatlamli karobka",
    cookie_box: "Pecheniye karobkalari",
    gift_bag: "Sovg'a sumkalari",
    food_box: "Oziqa karobkalari",
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
        category: template?.category || "custom",
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
    })
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            setSaving(true)
            if (template) {
                await updateProductTemplate(template.id, formData)
            } else {
                await createProductTemplate(formData)
            }
            onSave()
        } catch (error) {
            console.error("Failed to save template:", error)
            alert("Xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
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

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-slate-800 pb-2">Asosiy ma&apos;lumotlar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                    Shablon nomi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Masalan: Standart Kitob A5"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                    Kategoriya *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value} className="bg-slate-800">
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Book Specific Fields */}
                    {isBook && (
                        <div className="space-y-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Kitob/Jurnal parametrlari</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Format
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.format}
                                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="A5 / A4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Sahifalar soni
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.page_count}
                                        onChange={(e) => setFormData({ ...formData, page_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Bog&apos;lash turi
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.binding_type}
                                        onChange={(e) => setFormData({ ...formData, binding_type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Yelim / Skoba"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Qog&apos;oz turi
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.paper_type}
                                        onChange={(e) => setFormData({ ...formData, paper_type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Ofset / Melovka"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Qog&apos;oz (gsm)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.paper_weight}
                                        onChange={(e) => setFormData({ ...formData, paper_weight: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Muqova (gsm)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.cover_weight}
                                        onChange={(e) => setFormData({ ...formData, cover_weight: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Bosma turi
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.print_type}
                                        onChange={(e) => setFormData({ ...formData, print_type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="1+1 / 4+4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Laminatsiya
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lamination}
                                        onChange={(e) => setFormData({ ...formData, lamination: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Mat / Gloss"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Box Specific Dimensions */}
                    {!isBook && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Quti o&apos;lchamlari</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Kenglik (cm)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.default_width}
                                        onChange={(e) => setFormData({ ...formData, default_width: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Balandlik (cm)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.default_height}
                                        onChange={(e) => setFormData({ ...formData, default_height: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                        Chuqurlik (cm)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={formData.default_depth}
                                        onChange={(e) => setFormData({ ...formData, default_depth: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Production Setup */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Ishlab chiqarish sozlamalari</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                    Qatlamlar soni *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="5"
                                    value={formData.layer_count}
                                    onChange={(e) => setFormData({ ...formData, layer_count: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                    Chiqindi % *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.default_waste_percent}
                                    onChange={(e) => setFormData({ ...formData, default_waste_percent: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description & Status */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                Tavsif
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Qo'shimcha ma'lumot..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
                                Aktiv holatda
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-700 bg-slate-800 text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                        >
                            {saving ? "Saqlanmoqda..." : "Shablonni Saqlash"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
