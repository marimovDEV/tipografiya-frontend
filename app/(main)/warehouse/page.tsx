"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, Package, History, AlertTriangle, Clock, TrendingDown,
  Shield, Ban, CheckCircle, XCircle, Lock, Unlock, Eye, Trash2, Pencil,
  RotateCcw, Trash
} from "lucide-react"
import { Material, WarehouseLog, WarehouseStatusReport, WasteMaterial } from "@/lib/types"
import { fetchWithAuth } from "@/lib/api-client"
import {
  getWarehouseStatusReport,
  deleteMaterial
} from "@/lib/api/printery"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/data/mock-data"
import { MaterialReceiptDialog } from "@/components/warehouse/material-receipt-dialog"
import { NewMaterialDialog } from "@/components/warehouse/new-material-dialog"
import { EditMaterialDialog } from "@/components/warehouse/edit-material-dialog"
import { PlusCircle, Plus } from "lucide-react"
import { WasteMaterialDialog } from "@/components/warehouse/WasteMaterialDialog"

export default function EnhancedWarehousePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [inventory, setInventory] = useState<Material[]>([])
  const [logs, setLogs] = useState<WarehouseLog[]>([])
  const [statusReport, setStatusReport] = useState<WarehouseStatusReport | null>(null)
  const [wasteMaterials, setWasteMaterials] = useState<WasteMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [wasteDialogOpen, setWasteDialogOpen] = useState(false)
  const [selectedMaterialForWaste, setSelectedMaterialForWaste] = useState<Material | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null)

  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [newMaterialDialogOpen, setNewMaterialDialogOpen] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      await Promise.all([
        loadInventory(),
        loadLogs(),
        loadStatusReport(),
        loadWasteMaterials()
      ])
    } finally {
      setLoading(false)
    }
  }

  async function loadInventory() {
    const res = await fetchWithAuth("/api/inventory/")
    if (res.ok) setInventory(await res.json())
  }

  async function loadLogs() {
    const res = await fetchWithAuth("/api/warehouse-logs/")
    if (res.ok) {
      const data = await res.json()
      setLogs(data.results || data)
    }
  }

  async function loadStatusReport() {
    try {
      const report = await getWarehouseStatusReport()
      setStatusReport(report)
    } catch (error) {
      console.error("Failed to load status report:", error)
    }
  }

  async function loadWasteMaterials() {
    const res = await fetchWithAuth("/api/waste-materials/")
    if (res.ok) {
        const data = await res.json()
        setWasteMaterials(data.results || data)
    }
  }


  async function handleDeleteMaterial() {
    if (!materialToDelete) return
    try {
      await deleteMaterial(String(materialToDelete.id))
      toast.success("Material o'chirildi")
      setDeleteConfirmOpen(false)
      loadAllData()
    } catch (e) {
      toast.error("Materialni o'chirishda xatolik. Balki unda qoldiq bordir?")
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sklad Boshqaruvi</h1>
          <p className="text-muted-foreground mt-1">
            Material qoldig'i va yaroqsiz materiallar nazorati
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewMaterialDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi Material
          </Button>
          <Button onClick={() => setReceiptDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Material Qabul Qilish
          </Button>
        </div>
      </div>


      {/* Status Cards */}
      {statusReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami Materiallar</p>
                  <p className="text-2xl font-bold">{statusReport.summary.total_materials}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kam Qolgan</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statusReport.summary.low_stock_count}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="waste">Yaroqsiz material</TabsTrigger>
          <TabsTrigger value="history">Tarix</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Qidirish..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="relative group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge
                      className="px-2 py-1"
                      variant={item.current_stock <= item.min_stock ? "destructive" : "secondary"}
                    >
                      {item.current_stock.toLocaleString()} {item.unit}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. qoldiq:</span>
                      <span className="font-medium text-red-600">{item.min_stock} {item.unit}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => {
                        setSelectedMaterialForWaste(item)
                        setWasteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Brak
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setMaterialToEdit(item)
                        setEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Tahrir
                    </Button>
                  </div>
                </CardContent>
                
                {item.current_stock <= item.min_stock && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Waste Tab */}
        <TabsContent value="waste">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 text-left font-semibold text-muted-foreground">Vaqt</th>
                      <th className="p-4 text-left font-semibold text-muted-foreground">Material</th>
                      <th className="p-4 text-right font-semibold text-muted-foreground">Miqdor</th>
                      <th className="p-4 text-left font-semibold text-muted-foreground">Sabab</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {wasteMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                          Hozircha yaroqsiz materiallar qayd etilmagan
                        </td>
                      </tr>
                    ) : (
                      wasteMaterials.map((waste) => (
                        <tr key={waste.id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4 whitespace-nowrap text-muted-foreground">
                            {new Date(waste.date).toLocaleString("uz-UZ")}
                          </td>
                          <td className="p-4 font-medium text-base">{waste.material_name}</td>
                          <td className="p-4 text-right">
                            <span className="font-bold text-red-600 text-base">
                              {Number(waste.quantity).toLocaleString()} {waste.material_unit}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{waste.reason}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">Vaqt</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Material</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Turi</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">Miqdor</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("uz-UZ")}
                        </td>
                        <td className="p-3 font-medium">{log.material_name}</td>
                        <td className="p-3">
                          <Badge variant={log.type === 'in' ? "default" : "destructive"}>
                            {log.type === 'in' ? 'KIRIM' : 'CHIQIM'}
                          </Badge>
                        </td>
                        <td className={`p-3 text-right font-bold ${log.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.type === 'in' ? '+' : '-'}{Number(log.change_amount).toLocaleString()}
                        </td>
                        <td className="p-3 text-muted-foreground truncate max-w-xs">
                          {log.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Materialni o'chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham "{materialToDelete?.name}" ni o'chirmoqchimisiz?
              Bu amalni ortga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Bekor qilish</Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <MaterialReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        onSuccess={() => {
          loadAllData()
        }}
      />

      <NewMaterialDialog
        open={newMaterialDialogOpen}
        onOpenChange={setNewMaterialDialogOpen}
        onSuccess={() => {
          loadAllData()
          toast.success("Endi ushbu materialga kirim qilishingiz mumkin")
        }}
      />

      <EditMaterialDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        material={materialToEdit}
        onSuccess={() => {
          loadAllData()
        }}
      />

      <WasteMaterialDialog
        open={wasteDialogOpen}
        onOpenChange={setWasteDialogOpen}
        material={selectedMaterialForWaste}
        onSuccess={() => {
          loadAllData()
        }}
      />
    </div >
  )
}
