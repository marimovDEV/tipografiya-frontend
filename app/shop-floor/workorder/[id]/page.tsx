"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from "lucide-react"

const mockWorkorders: Record<string, any> = {
  "1": {
    id: 1,
    order_id: "ORD-2024-001",
    priority: "urgent",
    status: "in_progress",
    assigned_to: "Ali Valiyev",
    operations: [
      { id: 1, operation_type: "Kesish", material_quantity: 100, estimated_hours: 2 },
      { id: 2, operation_type: "Bosma", material_quantity: 100, estimated_hours: 3 },
    ],
  },
  "2": {
    id: 2,
    order_id: "ORD-2024-002",
    priority: "high",
    status: "pending",
    assigned_to: "Vali Aliyev",
    operations: [{ id: 3, operation_type: "Yig'ish", material_quantity: 50, estimated_hours: 1.5 }],
  },
  "3": {
    id: 3,
    order_id: "ORD-2024-003",
    priority: "normal",
    status: "in_progress",
    assigned_to: "Sardor Karimov",
    operations: [
      { id: 4, operation_type: "Kesish", material_quantity: 200, estimated_hours: 3 },
      { id: 5, operation_type: "Bosma", material_quantity: 200, estimated_hours: 4 },
      { id: 6, operation_type: "Qadoqlash", material_quantity: 200, estimated_hours: 2 },
    ],
  },
}

export default function WorkorderDetailPage() {
  const params = useParams()
  const [workorder, setWorkorder] = useState(mockWorkorders[params.id as string])
  const [operations] = useState(workorder?.operations || [])

  const handleCompleteWorkorder = () => {
    setWorkorder({ ...workorder, status: "completed" })
  }

  if (!workorder) return <div className="p-4">Buyurtma topilmadi</div>

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
        <Link href="/shop-floor">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-bold">Buyurtma #{workorder?.id}</h1>
          <p className="text-sm opacity-90">
            {workorder?.status === "completed"
              ? "Bajarilgan"
              : workorder?.status === "in_progress"
                ? "Jarayonda"
                : "Kutilmoqda"}
          </p>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tafsilotlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Buyurtma ID</p>
              <p className="font-medium">{workorder?.order_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Muhimlik</p>
              <p className="font-medium">
                {workorder?.priority === "urgent" ? "Shoshilinch" : workorder?.priority === "high" ? "Yuqori" : "Oddiy"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mas'ul xodim</p>
              <p className="font-medium">{workorder?.assigned_to || "Tayinlanmagan"}</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="font-semibold mb-2">Operatsiyalar ({operations.length})</h2>
          <div className="space-y-2">
            {operations.map((op: any) => (
              <Card key={op.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{op.operation_type}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {op.material_quantity || 0} dona • {op.estimated_hours || 0} soat
                      </p>
                    </div>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {workorder?.status !== "completed" && (
          <Button onClick={handleCompleteWorkorder} className="w-full" size="lg">
            Bajarilgan deb belgilash
          </Button>
        )}
      </main>
    </div>
  )
}
