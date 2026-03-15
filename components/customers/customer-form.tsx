"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomerFormProps {
  initialData?: any
  customerId?: string
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        type: formData.get("type"),
        address: formData.get("address"),
        city: formData.get("city"),
        postal_code: formData.get("postal_code"),
        country: formData.get("country"),
        tax_id: formData.get("tax_id"),
        payment_terms: formData.get("payment_terms"),
        currency: formData.get("currency"),
        is_active: formData.get("is_active") === "on",
        notes: formData.get("notes"),
      }

      const method = customerId ? "PUT" : "POST"
      const url = customerId ? `/api/customers/${customerId}` : "/api/customers"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Failed to save customer")

      router.push("/dashboard/customers")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customerId ? "Edit Customer" : "New Customer"}</CardTitle>
        <CardDescription>Enter customer information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required defaultValue={initialData?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                name="type"
                required
                defaultValue={initialData?.type || "business"}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required defaultValue={initialData?.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={initialData?.phone} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={initialData?.address} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={initialData?.city} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" name="postal_code" defaultValue={initialData?.postal_code} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={initialData?.country} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input id="tax_id" name="tax_id" defaultValue={initialData?.tax_id} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <select
                id="payment_terms"
                name="payment_terms"
                defaultValue={initialData?.payment_terms || "cash"}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="cash">Cash</option>
                <option value="net30">Net 30</option>
                <option value="net60">Net 60</option>
                <option value="net90">Net 90</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue={initialData?.currency || "UZS"} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={initialData?.notes}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked={initialData?.is_active !== false} />
            <Label htmlFor="is_active" className="font-normal">
              Active
            </Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Customer"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
