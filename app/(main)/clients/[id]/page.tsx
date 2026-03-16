"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Banknote, Landmark, Smartphone, Phone, Building2, User
} from "lucide-react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/api-client"
import { Client, Order } from "@/lib/types"
import { DebtPaymentModal } from "@/components/clients/DebtPaymentModal"
import { toast } from "sonner"
import Link from "next/link"


const paymentMethods = [
  { id: "cash", label: "Naqd", icon: Banknote, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "card", label: "Plastik", icon: CreditCard, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "transfer", label: "Pul o'tkazish", icon: Landmark, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "click", label: "Click", icon: Smartphone, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  { id: "payme", label: "Payme", icon: Smartphone, color: "text-teal-500", bgColor: "bg-teal-500/10" },
]

export default function ClientDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [client, setClient] = useState<Client | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState<Partial<Client>>({});

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [clientRes, ordersRes, transRes] = await Promise.all([
                fetchWithAuth(`/api/customers/${id}/`),
                fetchWithAuth(`/api/orders/?client=${id}`),
                fetchWithAuth(`/api/transactions/?client=${id}`)
            ]);

            if (clientRes.ok) {
                const data = await clientRes.json();
                setClient(data);
                setEditData(data);
            }
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(data.results || data);
            }
            if (transRes.ok) {
                const data = await transRes.json();
                setTransactions(data.results || data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateClient = async () => {
        try {
            const res = await fetchWithAuth(`/api/customers/${id}/`, {
                method: "PATCH",
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                toast.success("Ma'lumotlar yangilandi");
                setIsEditOpen(false);
                fetchData();
            }
        } catch (e) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleDeleteClient = async () => {
        if (!confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz? (Arxivlanadi)")) return;
        try {
            const res = await fetchWithAuth(`/api/customers/${id}/`, { method: "DELETE" });
            if (res.status === 204) {
                toast.success("Mijoz o'chirildi");
                router.push("/clients");
            }
        } catch (e) {
            toast.error("Xatolik yuz berdi");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Yuklanmoqda...</div>;
    if (!client) return (
        <div className="p-8 text-center space-y-4">
            <p className="text-red-500 flex items-center justify-center gap-2"><AlertCircle /> Mijoz topilmadi</p>
            <Button onClick={() => router.push("/clients")}>Ro'yxatga qaytish</Button>
        </div>
    );

    const balance = Number(client.balance || 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/clients")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{client.full_name}</h1>
                        </div>
                        <p className="text-muted-foreground">ID: {client.id} • {client.company || "Shaxsiy"}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        onClick={() => setIsPaymentOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold shadow-lg"
                    >
                        <Wallet className="h-4 w-4" /> To'lov qo'shish
                    </Button>
                    <DebtPaymentModal
                        isOpen={isPaymentOpen}
                        onClose={() => setIsPaymentOpen(false)}
                        client={client}
                        onSuccess={fetchData}
                    />

                    <Link href={`/orders/new?client=${client.id}`}>
                        <Button variant="outline" className="gap-2">
                            <Package className="h-4 w-4" /> Yangi buyurtma
                        </Button>
                    </Link>

                    <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={handleDeleteClient}><Trash2 className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Balans (Hozirgi qarz)</p>
                                <h3 className={`text-2xl font-black mt-2 font-mono ${balance < 0 ? 'text-red-500' : balance > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                                    {balance.toLocaleString()} <span className="text-sm opacity-40">UZS</span>
                                </h3>
                            </div>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Wallet className="h-5 w-5 text-slate-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Jami buyurtmalar</p>
                                <h3 className="text-2xl font-bold mt-2">{orders.length} ta</h3>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">To'langan summa</p>
                                <h3 className="text-2xl font-bold mt-2 text-green-600">
                                    {transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString()} so'm
                                </h3>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" /> Buyurtmalar</TabsTrigger>
                    <TabsTrigger value="finance" className="gap-2"><History className="h-4 w-4" /> To'lovlar Tarixi</TabsTrigger>
                    <TabsTrigger value="info" className="gap-2"><User className="h-4 w-4" /> Ma'lumotlar</TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader><CardTitle>Buyurtmalar tarixi</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Raqam</TableHead>
                                        <TableHead>Sana</TableHead>
                                        <TableHead>Mahsulot</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Summa</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length > 0 ? orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.order_number}</TableCell>
                                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>{order.box_type}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{order.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {Number(order.total_price).toLocaleString()} so'm
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/orders/${order.id}`}>
                                                    <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Buyurtmalar mavjud emas</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Finance Tab */}
                <TabsContent value="finance">
                    <Card>
                        <CardHeader><CardTitle>Kirim va Chiqim amallari</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sana</TableHead>
                                        <TableHead>Tur</TableHead>
                                        <TableHead>Usul</TableHead>
                                        <TableHead>Izoh</TableHead>
                                        <TableHead className="text-right">Summa</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length > 0 ? transactions.map((t) => {
                                        const method = paymentMethods.find(m => m.id === t.payment_method) || paymentMethods[0];
                                        const MethodIcon = method.icon;
                                        
                                        return (
                                            <TableRow key={t.id} className="hover:bg-muted/30">
                                                <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                                    {new Date(t.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={t.type === 'income' ? 'default' : 'destructive'} 
                                                           className={`${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border-0 font-bold`}>
                                                        {t.type === 'income' ? 'To\'lov' : 'Xarajat'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-md ${method.bgColor}`}>
                                                            <MethodIcon className={`h-3.5 w-3.5 ${method.color}`} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{method.label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{t.description || "-"}</TableCell>
                                                <TableCell className={`text-right font-black font-mono ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                                                    <span className="ml-1 text-[10px] font-bold opacity-50">UZS</span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }) : (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">To'lovlar tarixi bo'sh</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Info Tab */}
                <TabsContent value="info">
                    <Card>
                        <CardHeader><CardTitle>Bog'lanish ma'lumotlari</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-full"><Phone className="h-4 w-4" /></div>
                                    <div><p className="text-xs text-muted-foreground italic">Telefon</p><p className="font-medium">{client.phone || "-"}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-full"><Building2 className="h-4 w-4" /></div>
                                    <div><p className="text-xs text-muted-foreground italic">Kompaniya</p><p className="font-medium">{client.company || "-"}</p></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="border-t pt-4">
                                    <p className="text-xs text-muted-foreground italic">Ichki izohlar</p>
                                    <p className="text-sm mt-1">{client.notes || "Izoh yo'q"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Client Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Mijoz ma'lumotlarini tahrirlash</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>To'liq ism</Label>
                            <Input value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kompaniya</Label>
                            <Input value={editData.company} onChange={e => setEditData({ ...editData, company: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Telefon</Label>
                            <Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Izohlar</Label>
                            <Textarea value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleUpdateClient}>Saqlash</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
