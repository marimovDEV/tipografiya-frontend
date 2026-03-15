"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const mockWorkorders = [
  {
    id: 1,
    order_id: "ORD-2024-001",
    priority: "urgent",
    status: "in_progress",
    operations: [
      { id: 1, operation_type: "Kesish" },
      { id: 2, operation_type: "Bosma" },
    ],
  },
  {
    id: 2,
    order_id: "ORD-2024-002",
    priority: "high",
    status: "pending",
    operations: [{ id: 3, operation_type: "Yig'ish" }],
  },
  {
    id: 3,
    order_id: "ORD-2024-003",
    priority: "normal",
    status: "in_progress",
    operations: [
      { id: 4, operation_type: "Kesish" },
      { id: 5, operation_type: "Bosma" },
      { id: 6, operation_type: "Qadoqlash" },
    ],
  },
]

export default function ShopFloorPage() {
  const [workorders] = useState(mockWorkorders)

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-primary text-primary-foreground p-4 shadow">
        <h1 className="text-xl font-bold">Ishlab Chiqarish Operatsiyalari</h1>
        <p className="text-sm opacity-90">Operator</p>
      </header>

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button variant="outline" className="w-full bg-transparent">
            Mening Vazifalarim
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            Bajarilgan
          </Button>
        </div>

        <h2 className="text-lg font-semibold">Faol Buyurtmalar</h2>

        {workorders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Faol buyurtmalar yo'q</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workorders.map((wo) => (
              <Link key={wo.id} href={`/shop-floor/workorder/${wo.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Buyurtma #{wo.id}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{wo.order_id}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          wo.priority === "urgent"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : wo.priority === "high"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        }`}
                      >
                        {wo.priority === "urgent" ? "SHOSHILINCH" : wo.priority === "high" ? "YUQORI" : "ODDIY"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm">{wo.operations?.length || 0} ta operatsiya</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {wo.status === "in_progress" ? "Jarayonda" : "Kutilmoqda"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 flex gap-2">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Bosh sahifa
          </Button>
        </Link>
      </footer>
    </div>
  )
}
