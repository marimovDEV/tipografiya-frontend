"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Edit2 } from "lucide-react"

interface Material {
  id: string
  code: string
  name: string
  category: string
  unit: string
  unit_cost: number
  reorder_level: number
  is_active: boolean
}

export function MaterialList() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadMaterials()
  }, [search])

  async function loadMaterials() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const res = await fetch(`/api/materials?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data || [])
      }
    } catch (error) {
      console.error("[v0] Error loading materials:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <Input
          placeholder="Search materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/dashboard/inventory/materials/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Material
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  Loading materials...
                </TableCell>
              </TableRow>
            ) : materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No materials found
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-mono text-sm">{material.code}</TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.category || "-"}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell className="text-right">{material.unit_cost?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{material.reorder_level}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm ${material.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {material.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/inventory/materials/${material.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
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
