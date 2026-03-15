"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface InventoryItem {
  id: string
  material: { code: string; name: string; unit: string; reorder_level: number }
  quantity: number
  reserved_quantity: number
  available_quantity: number
  warehouse_location: string
}

export function StockLevels() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [lowStock, setLowStock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [adjustAmount, setAdjustAmount] = useState("")

  useEffect(() => {
    loadInventory()
  }, [lowStock])

  async function loadInventory() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (lowStock) params.append("low_stock", "true")

      const res = await fetch(`/api/inventory?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInventory(data || [])
      }
    } catch (error) {
      console.error("[v0] Error loading inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  async function adjustStock(inventoryId: string, adjustment: number) {
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory_id: inventoryId,
          quantity_change: adjustment,
          reason: "Manual adjustment",
        }),
      })

      if (res.ok) {
        loadInventory()
        setAdjustId(null)
        setAdjustAmount("")
      }
    } catch (error) {
      console.error("[v0] Error adjusting stock:", error)
    }
  }

  const lowStockItems = inventory.filter((item) => item.available_quantity <= item.material?.reorder_level)

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-yellow-800">{lowStockItems.length} items need reordering</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant={lowStock ? "default" : "outline"} onClick={() => setLowStock(!lowStock)}>
          {lowStock ? "All Stock" : "Low Stock Only"}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Total Qty</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  Loading stock levels...
                </TableCell>
              </TableRow>
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No inventory records found
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => {
                const isLowStock = item.available_quantity <= item.material?.reorder_level
                return (
                  <TableRow key={item.id} className={isLowStock ? "bg-yellow-50" : ""}>
                    <TableCell className="font-mono text-sm">{item.material?.code}</TableCell>
                    <TableCell className="font-medium">{item.material?.name}</TableCell>
                    <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.reserved_quantity.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">{item.available_quantity.toFixed(2)}</TableCell>
                    <TableCell>{item.material?.unit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.warehouse_location || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setAdjustId(item.id)}>
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!adjustId} onOpenChange={(open) => !open && setAdjustId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>Enter the quantity to add or subtract</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adjust-amount">Adjustment</Label>
              <Input
                id="adjust-amount"
                type="number"
                step="0.01"
                placeholder="Positive or negative value"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setAdjustId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const adj = Number.parseFloat(adjustAmount)
                  if (adjustId && !isNaN(adj)) {
                    adjustStock(adjustId, adj)
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
