"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

interface InspectionFormProps {
  workorderId: string
}

export function InspectionForm({ workorderId }: InspectionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    status: "pass" as const,
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/qc/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workorder_id: workorderId,
          status: formData.status,
          notes: formData.notes,
        }),
      })

      if (!res.ok) throw new Error("Failed to create inspection")

      router.refresh()
      setFormData({ status: "pass", notes: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New QC Inspection</CardTitle>
        <CardDescription>Create a quality control inspection record</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Inspection Result *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="rework_required">Rework Required</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Inspection Notes</Label>
            <Textarea
              id="notes"
              placeholder="Document findings and observations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Inspection"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
