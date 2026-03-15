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

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
  sort_order?: number
  product_id?: string | null
}

interface QuoteBuilderProps {
  customerId?: string
  initialData?: any
  quoteId?: string
}

export function QuoteBuilder({ customerId, initialData, quoteId }: QuoteBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [])
  const [formData, setFormData] = useState({
    customer_id: customerId || initialData?.customer_id || "",
    valid_until: initialData?.valid_until || "",
    notes: initialData?.notes || "",
  })

  const subtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)
  const tax = subtotal * 0.15
  const total = subtotal + tax

  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const quantity = Number.parseFloat(formData.get("quantity") as string) || 0
    const unitPrice = Number.parseFloat(formData.get("unit_price") as string) || 0
    const lineTotal = quantity * unitPrice

    const newItem: QuoteItem = {
      id: `temp-${Date.now()}`,
      description: formData.get("description") as string,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      sort_order: items.length,
    }

    setItems([...items, newItem])
      ; (e.target as HTMLFormElement).reset()
  }

  function removeItem(itemId: string) {
    setItems(items.filter((item) => item.id !== itemId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const quoteData = {
        customer_id: formData.customer_id,
        valid_until: formData.valid_until,
        notes: formData.notes,
        subtotal,
        tax_amount: tax,
        total_amount: total,
      }

      const method = quoteId ? "PUT" : "POST"
      const url = quoteId ? `/api/quotes/${quoteId}` : "/api/quotes"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      })

      if (!res.ok) throw new Error("Failed to save quote")

      const quote = await res.json()

      // Save line items
      for (const item of items) {
        if (item.id.startsWith("temp-")) {
          const itemRes = await fetch(`/api/quotes/${quote.id}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              product_id: item.product_id || null,
            }),
          })

          if (!itemRes.ok) throw new Error("Failed to save quote items")
        }
      }

      router.push("/dashboard/quotes")
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
          <CardTitle>{quoteId ? "Edit Quote" : "New Quote"}</CardTitle>
          <CardDescription>Create or update a sales quote</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer *</Label>
                <select
                  id="customer_id"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">Select a customer</option>
                  {/* Options would be populated from API */}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
              <Button type="submit" disabled={loading || items.length === 0}>
                {loading ? "Saving..." : "Save Quote"}
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
          <CardTitle>Quote Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addItem} className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-5 gap-4">
              <div>
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Input id="description" name="description" required />
              </div>
              <div>
                <Label htmlFor="quantity" className="text-xs">
                  Qty
                </Label>
                <Input id="quantity" name="quantity" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="unit_price" className="text-xs">
                  Unit Price
                </Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" required />
              </div>
              <div>
                <Label className="text-xs">Line Total</Label>
                <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted">
                  <span className="text-sm">Auto</span>
                </div>
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
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.line_total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-end gap-8 text-sm">
              <div>Subtotal:</div>
              <div className="font-semibold w-24 text-right">{subtotal.toFixed(2)}</div>
            </div>
            <div className="flex justify-end gap-8 text-sm">
              <div>Tax (15%):</div>
              <div className="font-semibold w-24 text-right">{tax.toFixed(2)}</div>
            </div>
            <div className="flex justify-end gap-8 text-lg font-bold">
              <div>Total:</div>
              <div className="w-24 text-right">{total.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
