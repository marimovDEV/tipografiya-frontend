"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"
import { Client } from "@/lib/types"

const formSchema = z.object({
    full_name: z.string().min(2, "Ism kiritilishi shart"),
    company: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Noto'g'ri email formati").optional().or(z.literal("")),
    address: z.string().optional(),
    notes: z.string().optional(),
    status: z.string(),
    pricing_profile: z.string(),
})

export default function EditClientPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [client, setClient] = useState<Client | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            company: "",
            phone: "",
            email: "",
            address: "",
            notes: "",
            status: "new",
            pricing_profile: "Standard",
        },
    })

    useEffect(() => {
        loadClient()
    }, [params.id])

    async function loadClient() {
        try {
            const res = await fetchWithAuth(`/api/customers/${params.id}/`)
            if (res.ok) {
                const data = await res.json()
                setClient(data)
                form.reset({
                    full_name: data.full_name || "",
                    company: data.company || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    address: data.address || "",
                    notes: data.notes || "",
                    status: data.status || "new",
                    pricing_profile: data.pricing_profile || "Standard",
                })
            } else {
                toast.error("Mijoz topilmadi")
                router.push("/clients")
            }
        } catch (error) {
            console.error("Error loading client:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSaving(true)
        try {
            const res = await fetchWithAuth(`/api/customers/${params.id}/`, {
                method: "PATCH",
                body: JSON.stringify(values),
            })

            if (res.ok) {
                toast.success("Mijoz ma'lumotlari yangilandi")
                router.push(`/clients/${params.id}`)
            } else {
                toast.error("Xatolik yuz berdi")
            }
        } catch (error) {
            console.error("Error updating client:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href={`/clients/${params.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Mijozni Tahrirlash</h1>
                    <p className="text-muted-foreground">{client?.full_name}</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Asosiy Ma'lumotlar</CardTitle>
                    <CardDescription>Mijoz haqidagi ma'lumotlarni yangilang</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To'liq Ism *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ism Familiya" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kompaniya</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Kompaniya nomi (ixtiyoriy)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefon</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="+998 90 123 45 67" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="email@example.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manzil</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Manzil..." rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="new">Yangi</SelectItem>
                                                    <SelectItem value="regular">Doimiy</SelectItem>
                                                    <SelectItem value="vip">VIP</SelectItem>
                                                    <SelectItem value="blacklist">Qora ro'yxat</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pricing_profile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Narx Profili</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="VIP">VIP (15% margin)</SelectItem>
                                                    <SelectItem value="Standard">Standard (20% margin)</SelectItem>
                                                    <SelectItem value="Wholesale">Wholesale (10% margin)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Izohlar</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Qo'shimcha izohlar..." rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Saqlash
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
