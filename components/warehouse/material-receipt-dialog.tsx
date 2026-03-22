"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { UnitConverterHelper } from "./unit-converter-helper"
import { createMaterialBatch } from "@/lib/api/printery"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { Material, Supplier } from "@/lib/types"

const formSchema = z.object({
    material_id: z.string().min(1, "Materialni tanlang"),
    supplier_id: z.string().optional(),
    initial_quantity: z.string().refine(val => val !== "" && parseFloat(val) > 0, {
        message: "Miqdor 0 dan katta bo'lishi shart"
    }),
})

interface MaterialReceiptDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function MaterialReceiptDialog({ open, onOpenChange, onSuccess }: MaterialReceiptDialogProps) {
    const [materials, setMaterials] = useState<Material[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            material_id: "",
            supplier_id: "",
            initial_quantity: "",
        },
    })

    useEffect(() => {
        if (open) {
            loadData()
        }
    }, [open])

    // Watch material_id and auto-fill unit
    const selectedMaterialId = form.watch("material_id")
    const [selectedMaterialUnit, setSelectedMaterialUnit] = useState<string>("pcs")
    
    useEffect(() => {
        if (selectedMaterialId) {
            const selectedMaterial = materials.find(m => String(m.id) === selectedMaterialId)
            if (selectedMaterial) {
                setSelectedMaterialUnit(selectedMaterial.unit)
            }
        }
    }, [selectedMaterialId, materials])

    async function loadData() {
        try {
            const [matRes, supRes] = await Promise.all([
                fetchWithAuth("/api/inventory/"),
                fetchWithAuth("/api/suppliers/")
            ])

            if (matRes.ok) setMaterials(await matRes.json())
            if (supRes.ok) {
                const supData = await supRes.json()
                setSuppliers(supData.results || supData)
            }
        } catch (error) {
            console.error("Failed to load data:", error)
            toast.error("Ma'lumotlarni yuklashda xatolik")
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const payload = {
                material: values.material_id,
                supplier: values.supplier_id || null,
                batch_number: `RCV-${new Date().getTime().toString().slice(-6)}`, // Automatic batch id
                initial_quantity: parseFloat(values.initial_quantity),
                current_quantity: parseFloat(values.initial_quantity),
                is_active: true
            }

            await createMaterialBatch(payload)
            toast.success("Material muvaffaqiyatli qabul qilindi")
            onSuccess()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error("Receipt error:", error)
            toast.error("Qabul qilishda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Material Qabul Qilish</DialogTitle>
                    <DialogDescription>
                        Omborga kirim qilish uchun material va miqdorni kiriting.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="material_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Material *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tanlang" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {materials.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.name} ({m.unit})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                                    <SelectValue placeholder="Tanlang" />
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

                        <FormField
                            control={form.control}
                            name="initial_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-blue-600 font-bold block mb-1">Miqdor *</FormLabel>
                                    <UnitConverterHelper 
                                        baseUnit={selectedMaterialUnit} 
                                        onCalculate={(val) => form.setValue("initial_quantity", String(val))} 
                                    />
                                    <FormControl>
                                        <Input {...field} type="number" step="0.01" placeholder="Masalan: 2500" className="text-lg h-12 font-bold" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Qabul qilish
                            </Button>
                        </DialogFooter>
                    </form>
                </Form >
            </DialogContent >
        </Dialog >
    )
}
