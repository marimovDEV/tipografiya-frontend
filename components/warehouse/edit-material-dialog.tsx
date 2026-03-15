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
import { Loader2 } from "lucide-react"
import { updateMaterial } from "@/lib/api/printery"
import { Material } from "@/lib/types"
import { toast } from "sonner"

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
    unit: z.string().min(1, "O'lchov birligini tanlang"),
    min_stock: z.string().min(1, "Minimal qoldiq kiritilishi shart"),
})

interface EditMaterialDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    material: Material | null
    onSuccess: () => void
}

export function EditMaterialDialog({ open, onOpenChange, material, onSuccess }: EditMaterialDialogProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "",
            unit: "kg",
            min_stock: "100",
        },
    })

    // Populate form when material changes
    useEffect(() => {
        if (material && open) {
            form.reset({
                name: material.name || "",
                category: material.category || "",
                unit: material.unit || "kg",
                min_stock: String(material.min_stock || 100),
            })
        }
    }, [material, open])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!material) return

        setLoading(true)
        try {
            const payload = {
                name: values.name,
                category: values.category,
                unit: values.unit,
                min_stock: parseFloat(values.min_stock),
            }

            await updateMaterial(String(material.id), payload)
            toast.success("Material yangilandi")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error("Update error:", error)
            toast.error("Yangilashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Materialni Tahrirlash</DialogTitle>
                    <DialogDescription>
                        Material ma'lumotlarini o'zgartiring.
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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

                        <div className="pt-2 text-sm text-muted-foreground">
                            <strong>Joriy qoldiq:</strong> {material?.current_stock?.toLocaleString() || 0} {material?.unit}
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Bekor qilish
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Saqlash
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
