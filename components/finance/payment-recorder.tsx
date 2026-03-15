"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface PaymentRecorderProps {
  invoiceId: string
  outstandingAmount: number
}

export function PaymentRecorder({ invoiceId, outstandingAmount }: PaymentRecorderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: outstandingAmount.toString(),
    payment_method: "bank_transfer" as const,
    reference_number: "",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const amount = Number.parseFloat(formData.amount)

      if (amount <= 0) {
        throw new Error("Payment amount must be greater than 0")
      }

      if (amount > outstandingAmount) {
        throw new Error(`Payment cannot exceed outstanding amount of ${outstandingAmount.toFixed(2)}`)
      }

      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payment_method: formData.payment_method,
          reference_number: formData.reference_number,
          notes: formData.notes,
        }),
      })

      if (!res.ok) throw new Error("Failed to record payment")

      router.refresh()
      setFormData({
        amount: outstandingAmount.toString(),
        payment_method: "bank_transfer",
        reference_number: "",
        notes: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-900">Record Payment</CardTitle>
        <CardDescription className="text-green-800">Log a customer payment for this invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={outstandingAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Outstanding: {outstandingAmount.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference #</Label>
              <Input
                id="reference_number"
                placeholder="Check #, Transaction ID, etc"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              placeholder="Additional payment details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} variant="default">
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
