"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesChartProps {
  data: Array<{
    month: string
    revenue: number
    orders: number
  }>
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Revenue & Orders Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} yAxisId="right" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
