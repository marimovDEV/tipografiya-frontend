"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Plus } from "lucide-react"

interface WorkOrder {
  id: string
  workorder_number: string
  order: {
    order_number: string
    customer: { name: string }
  }
  status: string
  priority: string
  assigned_user: { first_name: string; last_name: string } | null
  start_date: string
  created_at: string
}

export function WorkOrderList() {
  const [workorders, setWorkorders] = useState<WorkOrder[]>([])
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkorders()
  }, [status, priority])

  async function loadWorkorders() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (status !== "all") params.append("status", status)
      if (priority !== "all") params.append("priority", priority)

      const res = await fetch(`/api/workorders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setWorkorders(data || [])
      }
    } catch (error) {
      console.error("[v0] Error loading workorders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "paused":
        return "outline"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "secondary"
      case "normal":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <Link href="/dashboard/production/workorders/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New WorkOrder
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WorkOrder #</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  Loading workorders...
                </TableCell>
              </TableRow>
            ) : workorders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No workorders found
                </TableCell>
              </TableRow>
            ) : (
              workorders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-mono text-sm">{wo.workorder_number}</TableCell>
                  <TableCell className="font-mono text-sm">{wo.order?.order_number}</TableCell>
                  <TableCell>{wo.order?.customer?.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(wo.status)}>{wo.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(wo.priority)} className="capitalize">
                      {wo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {wo.assigned_user ? `${wo.assigned_user.first_name} ${wo.assigned_user.last_name}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {wo.start_date ? new Date(wo.start_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/production/workorders/${wo.id}`}>
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
    </div>
  )
}
