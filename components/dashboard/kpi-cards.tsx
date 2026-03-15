"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, CheckCircle } from "lucide-react"

interface KPICardsProps {
  data: {
    totalRevenue: number
    revenueChange: number
    outstandingAmount: number
    outstandingChange: number
    inventoryValue: number
    inventoryChange: number
    openOrders: number
    ordersChange: number
    defectRate: number
    defectChange: number
    onTimeDelivery: number
    deliveryChange: number
  }
}

export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <KPICard
        title="Total Revenue"
        value={`$${(data.totalRevenue / 1000).toFixed(1)}K`}
        change={data.revenueChange}
        icon={DollarSign}
        positive
      />
      <KPICard
        title="Outstanding Amount"
        value={`$${(data.outstandingAmount / 1000).toFixed(1)}K`}
        change={data.outstandingChange}
        icon={AlertCircle}
        positive={false}
      />
      <KPICard
        title="Inventory Value"
        value={`$${(data.inventoryValue / 1000).toFixed(1)}K`}
        change={data.inventoryChange}
        icon={Package}
        positive
      />
      <KPICard title="Open Orders" value={data.openOrders} change={data.ordersChange} icon={Package} positive={false} />
      <KPICard
        title="Defect Rate"
        value={`${data.defectRate.toFixed(1)}%`}
        change={data.defectChange}
        icon={AlertCircle}
        positive={false}
      />
      <KPICard
        title="On-Time Delivery"
        value={`${data.onTimeDelivery.toFixed(1)}%`}
        change={data.deliveryChange}
        icon={CheckCircle}
        positive
      />
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  icon: Icon,
  positive,
}: {
  title: string
  value: string | number
  change: number
  icon: React.ComponentType<{ className?: string }>
  positive: boolean
}) {
  const isPositiveChange = (positive && change > 0) || (!positive && change < 0)
  const trendIcon = isPositiveChange ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
          <TrendingUp className={`h-3 w-3 ${isPositiveChange ? "text-green-600" : "text-red-600"}`} />
          <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
            {Math.abs(change).toFixed(1)}% from last month
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
