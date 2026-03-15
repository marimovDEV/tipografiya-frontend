"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Eye, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Quote {
  id: string
  quote_number: string
  customer: { name: string; email: string }
  status: string
  total_amount: number
  created_at: string
}

export function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadQuotes()
  }, [status])

  async function loadQuotes() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (status !== "all") params.append("status", status)

      const res = await fetch(`/api/quotes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setQuotes(data || [])
      }
    } catch (error) {
      console.error("[v0] Error loading quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteQuote(id: string) {
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" })
      if (res.ok) {
        setQuotes(quotes.filter((q) => q.id !== id))
        setDeleteId(null)
      }
    } catch (error) {
      console.error("[v0] Error deleting quote:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <Link href="/dashboard/quotes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Loading quotes...
                </TableCell>
              </TableRow>
            ) : quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No quotes found
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-mono text-sm">{quote.quote_number}</TableCell>
                  <TableCell>{quote.customer?.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quote.status === "accepted"
                          ? "default"
                          : quote.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{quote.total_amount?.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(quote.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deleteQuote(deleteId)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
