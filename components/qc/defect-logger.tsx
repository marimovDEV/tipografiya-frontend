"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface DefectLoggerProps {
  inspectionId: string
}

export function DefectLogger({ inspectionId }: DefectLoggerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    defect_type: "",
    defect_category: "minor" as const,
    location: "",
    description: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/qc/inspections/${inspectionId}/defects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to log defect")

      router.refresh()
      setFormData({
        defect_type: "",
        defect_category: "minor",
        location: "",
        description: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-900">Log Quality Defect</CardTitle>
        <CardDescription className="text-yellow-800">Document any defects or quality issues found</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defect_type">Defect Type *</Label>
              <Input
                id="defect_type"
                placeholder="e.g., Color mismatch, Dimension error"
                value={formData.defect_type}
                onChange={(e) => setFormData({ ...formData, defect_type: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defect_category">Severity *</Label>
              <select
                id="defect_category"
                value={formData.defect_category}
                onChange={(e) => setFormData({ ...formData, defect_category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where on the product was defect found?"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the defect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} variant="destructive">
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Logging..." : "Log Defect"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
