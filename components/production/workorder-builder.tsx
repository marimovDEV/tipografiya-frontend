"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Trash2, Plus } from "lucide-react"

interface WorkOrderOperation {
  id: string
  operation_type: string
  operation_name: string
  material_quantity: number
  sort_order: number
  status: string
}

interface WorkOrderBuilderProps {
  orderId?: string
  initialData?: any
  workorderId?: string
}

export function WorkOrderBuilder({ orderId, initialData, workorderId }: WorkOrderBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operations, setOperations] = useState<WorkOrderOperation[]>(initialData?.operations || [])
  const [formData, setFormData] = useState({
    order_id: orderId || initialData?.order_id || "",
    assigned_to: initialData?.assigned_to || "",
    priority: initialData?.priority || "normal",
    estimated_hours: initialData?.estimated_hours || "",
    notes: initialData?.notes || "",
  })

  async function addOperation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newOperation = {
      id: `temp-${Date.now()}`,
      operation_type: formData.get("operation_type") as string,
      operation_name: formData.get("operation_name") as string,
      material_quantity: Number.parseFloat(formData.get("material_quantity") as string) || 0,
      sort_order: operations.length,
      status: "pending",
    }

    setOperations([...operations, newOperation])
      ; (e.target as HTMLFormElement).reset()
  }

  function removeOperation(opId: string) {
    setOperations(operations.filter((op) => op.id !== opId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const woData = {
        order_id: formData.order_id,
        assigned_to: formData.assigned_to || null,
        priority: formData.priority,
        estimated_hours: Number.parseInt(formData.estimated_hours) || null,
        notes: formData.notes,
      }

      const method = workorderId ? "PUT" : "POST"
      const url = workorderId ? `/api/workorders/${workorderId}` : "/api/workorders"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(woData),
      })

      if (!res.ok) throw new Error("Failed to save workorder")

      const workorder = await res.json()

      // Save operations
      for (const op of operations) {
        if (op.id.startsWith("temp-")) {
          const opRes = await fetch(`/api/workorders/${workorder.id}/operations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation_type: op.operation_type,
              operation_name: op.operation_name,
              material_quantity: op.material_quantity,
              sort_order: op.sort_order,
            }),
          })

          if (!opRes.ok) throw new Error("Failed to save operations")
        }
      }

      router.push("/dashboard/production/workorders")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{workorderId ? "Edit WorkOrder" : "New WorkOrder"}</CardTitle>
          <CardDescription>Create or update a production workorder</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || operations.length === 0}>
                {loading ? "Saving..." : "Save WorkOrder"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Operations</CardTitle>
          <CardDescription>Define the operations required for this workorder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addOperation} className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="operation_type" className="text-xs">
                  Operation Type
                </Label>
                <select
                  id="operation_type"
                  name="operation_type"
                  required
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">Select type</option>
                  <option value="cutting">Cutting</option>
                  <option value="printing">Printing</option>
                  <option value="packing">Packing</option>
                  <option value="assembly">Assembly</option>
                </select>
              </div>
              <div>
                <Label htmlFor="operation_name" className="text-xs">
                  Operation Name
                </Label>
                <Input id="operation_name" name="operation_name" required />
              </div>
              <div>
                <Label htmlFor="material_quantity" className="text-xs">
                  Material Qty
                </Label>
                <Input id="material_quantity" name="material_quantity" type="number" step="0.01" />
              </div>
              <div className="flex items-end">
                <Button type="submit" size="sm" className="w-full">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation Type</TableHead>
                <TableHead>Operation Name</TableHead>
                <TableHead className="text-right">Material Qty</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="capitalize">{op.operation_type}</TableCell>
                  <TableCell>{op.operation_name}</TableCell>
                  <TableCell className="text-right">{op.material_quantity}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeOperation(op.id)} className="h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
