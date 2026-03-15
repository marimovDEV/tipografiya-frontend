"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"

interface Inspection {
  id: string
  workorder: { workorder_number: string }
  inspector: { first_name: string; last_name: string }
  status: string
  inspection_date: string
  notes: string
}

export function InspectionList({ workorderId }: { workorderId?: string }) {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInspections()
  }, [])

  async function loadInspections() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (workorderId) params.append("workorder_id", workorderId)

      const res = await fetch(`/api/qc/inspections?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInspections(data || [])
      }
    } catch (error) {
      console.error("[v0] Error loading inspections:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WorkOrder #</TableHead>
            <TableHead>Inspector</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                Loading inspections...
              </TableCell>
            </TableRow>
          ) : inspections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No inspections found
              </TableCell>
            </TableRow>
          ) : (
            inspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell className="font-mono text-sm">{inspection.workorder?.workorder_number}</TableCell>
                <TableCell>{`${inspection.inspector?.first_name} ${inspection.inspector?.last_name}`}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      inspection.status === "pass"
                        ? "default"
                        : inspection.status === "fail"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {inspection.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(inspection.inspection_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/quality/inspections/${inspection.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
