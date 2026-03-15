"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { createMaterial, createMaterialBatch } from "@/lib/api/printery"
import { fetchWithAuth } from "@/lib/api-client"
import { Supplier, Material } from "@/lib/types"
import { toast } from "sonner"
import { format } from "date-fns"

// Predefined categories and units
const CATEGORIES = [
    { value: "paper", label: "Qog'oz" },
    { value: "ink", label: "Bo'yoq" },
    { value: "lacquer", label: "Lak" },
    { value: "glue", label: "Yelim" },
    { value: "consumable", label: "Sarflanuvchi" },
    { value: "other", label: "Boshqa" }
]

const UNITS = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "pcs", label: "Dona (pcs)" },
    { value: "m2", label: "Metr kvadrat (m²)" },
    { value: "l", label: "Litr (l)" },
    { value: "m", label: "Metr (m)" }
]

const formSchema = z.object({
    name: z.string().min(2, "Nom kiritilishi shart"),
    category: z.string().min(1, "Kategoriya tanlang"),
    new_category: z.string().optional(),
    unit: z.string().min(1, "O'lchov birligini tanlang"),
    min_stock: z.string().min(1, "Minimal qoldiq kiritilishi shart"),
    initial_quantity: z.string().optional(),
    supplier_id: z.string().optional(),
})

interface NewMaterialDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function NewMaterialDialog({ open, onOpenChange, onSuccess }: NewMaterialDialogProps) {
    const [loading, setLoading] = useState(false)
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [existingMaterials, setExistingMaterials] = useState<Material[]>([])

    // Load data when dialog opens
    useState(() => {
        if (open) {
            loadData()
        }
    })

    async function loadData() {
        try {
            const [suppliersRes, materialsRes] = await Promise.all([
                fetchWithAuth("/api/suppliers/"),
                fetchWithAuth("/api/inventory/")
            ])

            if (suppliersRes.ok) {
                const data = await suppliersRes.json()
                setSuppliers(data.results || data)
            }
            if (materialsRes.ok) {
                const data = await materialsRes.json()
                setExistingMaterials(data.results || data)
            }
        } catch (e) {
            console.error("Failed to load data", e)
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "",
            new_category: "",
            unit: "kg",
            min_stock: "100",
            initial_quantity: "0",
            supplier_id: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            // 1. Check for duplicates
            const normalize = (str: string) => str.toLowerCase().trim()
            const isDuplicate = existingMaterials.some(
                m => normalize(m.name) === normalize(values.name) &&
                    normalize(m.category || "") === normalize(isCustomCategory ? values.new_category || "" : values.category)
            )

            if (isDuplicate) {
                toast.error("Bunday nomli va kategoriyali material allaqachon mavjud!")
                setLoading(false)
                return
            }

            // 2. Validate Supplier if Initial Quantity is set
            const initQty = parseFloat(values.initial_quantity || "0")
            // Removed mandatory supplier check as per user request
            // if (initQty > 0 && !values.supplier_id) ...

            const payload = {
                name: values.name,
                category: isCustomCategory ? values.new_category : values.category,
                unit: values.unit,
                min_stock: parseFloat(values.min_stock),
                current_stock: 0,
                is_active: true
            }

            const newMaterial = await createMaterial(payload)

            // If initial quantity is set, create a batch automatically
            if (initQty > 0) {
                try {
                    await createMaterialBatch({
                        material: newMaterial.id,
                        supplier: values.supplier_id || null, // Allow null if not selected
                        batch_number: `INIT-${new Date().getTime().toString().slice(-6)}`,
                        initial_quantity: initQty,
                        current_quantity: initQty,
                        cost_per_unit: 0,
                        received_date: format(new Date(), "yyyy-MM-dd"),
                        is_active: true
                    })
                    toast.success("Boshlang'ich qoldiq qo'shildi")
                } catch (batchError) {
                    console.error(batchError)
                    toast.error("Material yaratildi, lekin qoldiq qo'shishda xatolik bo'ldi")
                }
            } else {
                toast.success("Yangi material yaratildi")
            }

            onSuccess()
            onOpenChange(false)
            form.reset()
            setIsCustomCategory(false)
        } catch (error) {
            console.error("Creation error:", error)
            toast.error("Yaratishda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Yangi Material Yaratish</DialogTitle>
                    <DialogDescription>
                        Omborga yangi turdagi material qo'shish (masalan: Yangi qog'oz navi).
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Material Nomi</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Masalan: Qog'oz A4 80g" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategoriya</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                if (val === "custom") {
                                                    setIsCustomCategory(true)
                                                    field.onChange("")
                                                } else {
                                                    setIsCustomCategory(false)
                                                    field.onChange(val)
                                                }
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tanlang" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>
                                                        {c.label}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="custom" className="font-semibold text-blue-600">
                                                    + Yangi Kategoriya
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>O'lchov Birligi</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tanlang" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {UNITS.map((u) => (
                                                    <SelectItem key={u.value} value={u.value}>
                                                        {u.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {isCustomCategory && (
                            <FormField
                                control={form.control}
                                name="new_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yangi Kategoriya Nomi</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Kategoriya nomini kiriting" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="min_stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min. Chegara</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="initial_quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-blue-600">Boshlang'ich Qoldiq</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supplier_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yetkazib Beruvchi (Ixtiyoriy)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tanlang (shart emas)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yaratish
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
