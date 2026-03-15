"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { FileDown, Loader } from "lucide-react"

interface PDFGeneratorProps {
  workorderId: string
}

type DocumentType = "picklist" | "cutting-sheet" | "print-sheet"

export function PDFGenerator({ workorderId }: PDFGeneratorProps) {
  const [loading, setLoading] = useState<DocumentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function generatePDF(type: DocumentType) {
    setLoading(type)
    setError(null)

    try {
      // Determine endpoint based on type
      let endpoint = "/api/pdf/picklist"
      let fileName = `picklist-${workorderId}.pdf`

      if (type === "cutting-sheet") {
        endpoint = "/api/pdf/cutting-sheet"
        fileName = `cutting-sheet-${workorderId}.pdf`
      } else if (type === "print-sheet") {
        endpoint = "/api/pdf/print-sheet"
        fileName = `print-sheet-${workorderId}.pdf`
      }

      // Generate PDF HTML
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workorder_id: workorderId }),
      })

      if (!res.ok) throw new Error("Failed to generate PDF")

      const { html } = await res.json()

      // Create blob from HTML and download
      const element = document.createElement("div")
      element.innerHTML = html

      // Use simple print-to-PDF approach
      const printWindow = window.open("", "", "width=800,height=600")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()

        // Trigger print dialog
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Error generating PDF:", err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Shop Floor Documents</CardTitle>
        <CardDescription>Generate PDF documents for production</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => generatePDF("picklist")}
              disabled={loading !== null}
              variant="outline"
              className="flex flex-col items-center justify-center h-24"
            >
              {loading === "picklist" ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <FileDown className="w-5 h-5 mb-2" />
              )}
              <span className="text-sm">Pick List</span>
            </Button>

            <Button
              onClick={() => generatePDF("cutting-sheet")}
              disabled={loading !== null}
              variant="outline"
              className="flex flex-col items-center justify-center h-24"
            >
              {loading === "cutting-sheet" ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <FileDown className="w-5 h-5 mb-2" />
              )}
              <span className="text-sm">Cutting Sheet</span>
            </Button>

            <Button
              onClick={() => generatePDF("print-sheet")}
              disabled={loading !== null}
              variant="outline"
              className="flex flex-col items-center justify-center h-24"
            >
              {loading === "print-sheet" ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <FileDown className="w-5 h-5 mb-2" />
              )}
              <span className="text-sm">Print Sheet</span>
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <p className="text-xs text-muted-foreground">
            Click a button above to generate and preview the document. Use your browser's print feature to save as PDF.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
