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
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createMaterialBatch } from "@/lib/api/printery"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { Material, Supplier } from "@/lib/types"

const formSchema = z.object({
    material_id: z.string().min(1, "Materialni tanlang"),
    supplier_id: z.string().optional(), // Now optional
    batch_number: z.string().min(1, "Partiya raqami kiritilishi shart"),
    initial_quantity: z.string().refine(val => val !== "" && parseFloat(val) > 0, {
        message: "Miqdor 0 dan katta bo'lishi shart"
    }),
    cost_per_unit: z.string().refine(val => val !== "" && parseFloat(val) > 0, {
        message: "Narx 0 dan katta bo'lishi shart"
    }),
    expiry_date: z.date().optional(),
    received_date: z.date(),
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
            batch_number: "",
            initial_quantity: "",
            cost_per_unit: "",
            received_date: new Date(),
        },
    })

    useEffect(() => {
        if (open) {
            loadData()
            // Generate partial random batch number
            const randomBatch = `BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
            form.setValue("batch_number", randomBatch)
        }
    }, [open])

    // Watch material_id and auto-fill price
    const selectedMaterialId = form.watch("material_id")
    useEffect(() => {
        if (selectedMaterialId) {
            const selectedMaterial = materials.find(m => String(m.id) === selectedMaterialId)
            if (selectedMaterial && selectedMaterial.price_per_unit) {
                form.setValue("cost_per_unit", String(selectedMaterial.price_per_unit))
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
                supplier: values.supplier_id || null, // Allow null
                batch_number: values.batch_number,
                initial_quantity: parseFloat(values.initial_quantity),
                current_quantity: parseFloat(values.initial_quantity),
                cost_per_unit: parseFloat(values.cost_per_unit),
                received_date: format(values.received_date, "yyyy-MM-dd"),
                expiry_date: values.expiry_date ? format(values.expiry_date, "yyyy-MM-dd") : null,
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
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Material Qabul Qilish</DialogTitle>
                    <DialogDescription>
                        Yangi partiya (batch) ma'lumotlarini kiriting. Omborga kirim qilinadi.
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

                        <FormField
                            control={form.control}
                            name="batch_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Partiya Raqami (Batch No) *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="BATCH-2024-XXX" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="initial_quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Miqdor *</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" placeholder="100" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cost_per_unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bir dona narxi (so'm) *</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" placeholder="25000" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="received_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Qabul Sanasi *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Sanani tanlang</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expiry_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Yaroqlilik muddati (Optional)</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Sanani tanlang</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
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
                                Qabul qilish
                            </Button>
                        </DialogFooter>
                    </form>
                </Form >
            </DialogContent >
        </Dialog >
    )
}
