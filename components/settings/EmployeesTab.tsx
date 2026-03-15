"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, KeyRound } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"
import { toast } from "sonner"

interface EmployeesTabProps {
    settings: any
    setSettings: (settings: any) => void
    users: any[]
}

export function EmployeesTab({ settings, setSettings, users }: EmployeesTabProps) {
    const [editingUser, setEditingUser] = useState<any>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // Form states for adding
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [createForm, setCreateForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
        role: "worker",
        password: ""
    })

    // Form states for editing
    const [editForm, setEditForm] = useState({
        username: "",
        first_name: "",
        last_name: "",
        role: "",
        password: "" // Optional: leave empty to keep unchanged
    })

    const handleEditClick = (user: any) => {
        setEditingUser(user)
        setEditForm({
            username: user.username,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role: user.role,
            password: ""
        })
        setEditDialogOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!editingUser) return
        setLoading(true)

        try {
            const payload: any = {
                username: editForm.username,
                first_name: editForm.first_name,
                last_name: editForm.last_name,
                role: editForm.role,
            }

            if (editForm.password.trim()) {
                payload.password = editForm.password
            }

            const res = await fetchWithAuth(`/api/users/${editingUser.id}/`, {
                method: "PATCH",
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || "Xatolik yuz berdi")
            }

            toast.success("Xodim ma'lumotlari yangilandi")
            setEditDialogOpen(false)
            // Trigger parent refresh if possible, or just wait for next page load
            // Ideally we'd callback to parent to refresh `users`, but showing toast is OK for now.
            // But wait, the list won't update automatically. We should probably force a reload or use a callback.
            // Since we can't easily refresh parent state without a callback, we'll ask user to refresh or rely on parent's interval.
            // Better: Trigger a full page refresh of settings data? 
            // For now, let's just close dialog. In a real app we'd refetch.
            window.location.reload() // Quick fix to refresh list
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return
        setLoading(true)

        try {
            const res = await fetchWithAuth(`/api/users/${userToDelete.id}/`, {
                method: "DELETE"
            })

            if (!res.ok) throw new Error("O'chirib bo'lmadi")

            toast.success("Xodim tizimdan o'chirildi")
            setDeleteDialogOpen(false)
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }
    const handleCreateUser = async () => {
        if (!createForm.username || !createForm.password) {
            toast.error("Login va parolni kiritish majburiy")
            return
        }
        setLoading(true)

        try {
            const res = await fetchWithAuth("/api/users/", {
                method: "POST",
                body: JSON.stringify(createForm)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.detail || err.username?.[0] || "Xatolik yuz berdi")
            }

            toast.success("Yangi xodim muvaffaqiyatli qo'shildi")
            setCreateDialogOpen(false)
            setCreateForm({ username: "", first_name: "", last_name: "", role: "warehouse", password: "" })
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Employee List Section (New) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                        <CardTitle>Xodimlar Ro&apos;yxati</CardTitle>
                        <CardDescription>Barcha xodimlarni boshqarish (Qo'shish/Tahrirlash/O&apos;chirish)</CardDescription>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>+ Yangi Xodim</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ism/Familiya</TableHead>
                                <TableHead>Login</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Amallar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.first_name || user.last_name
                                            ? `${user.first_name} ${user.last_name}`.trim()
                                            : user.username}
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <Pencil className="h-4 w-4 mr-1" />
                                                Tahrirlash
                                            </Button>

                                            {user.role !== 'admin' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        setUserToDelete(user)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xodim ma&apos;lumotlarini tahrirlash</DialogTitle>
                        <DialogDescription>
                            Pastdagi maydonlarni o&apos;zgartiring. Parol maydonini bo&apos;sh qoldirsangiz, u o&apos;zgarmaydi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-first-name">Ism</Label>
                                <Input
                                    id="edit-first-name"
                                    value={editForm.first_name}
                                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-last-name">Familiya</Label>
                                <Input
                                    id="edit-last-name"
                                    value={editForm.last_name}
                                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">Login (Foydalanuvchi nomi)</Label>
                            <Input
                                id="edit-username"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Yangi Parol (ixtiyoriy)</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="edit-password"
                                    type="password"
                                    className="pl-9"
                                    placeholder="Faqat o'zgartirish uchun kiriting"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Rol</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                            >
                                <SelectTrigger id="edit-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="worker">Ishchi</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleUpdateUser} disabled={loading}>
                            {loading ? "Saqlanmoqda..." : "Saqlash"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Yangi xodim qo&apos;shish</DialogTitle>
                        <DialogDescription>
                            Tizimga yangi foydalanuvchi qo&apos;shish uchun ma&apos;lumotlarni to&apos;ldiring.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-first-name">Ism</Label>
                                <Input
                                    id="create-first-name"
                                    value={createForm.first_name}
                                    onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-last-name">Familiya</Label>
                                <Input
                                    id="create-last-name"
                                    value={createForm.last_name}
                                    onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-username">Login (Foydalanuvchi nomi)</Label>
                            <Input
                                id="create-username"
                                value={createForm.username}
                                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-password">Parol *</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="create-password"
                                    type="password"
                                    className="pl-9"
                                    placeholder="Yangi parol"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-role">Rol</Label>
                            <Select
                                value={createForm.role}
                                onValueChange={(v) => setCreateForm({ ...createForm, role: v })}
                            >
                                <SelectTrigger id="create-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="worker">Ishchi</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleCreateUser} disabled={loading}>
                            {loading ? "Yaratilmoqda..." : "Qo'shish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Haqiqatan ham o&apos;chirmoqchimisiz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu amalni ortga qaytarib bo&apos;lmaydi. Xodim <b>{userToDelete?.username}</b> tizimdan butunlay o&apos;chiriladi va endi kira olmaydi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                            Hao, o&apos;chirish
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
