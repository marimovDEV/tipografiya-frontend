"use client"

import { useState } from "react"
import { Order, ProductionStepItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format, addDays, differenceInDays, isSameDay, parseISO } from "date-fns"
import { AlertCircle } from "lucide-react"

interface ProductionGanttProps {
    orders: Order[]
}

export function ProductionGantt({ orders }: ProductionGanttProps) {
    // 1. Prepare Timeline
    const today = new Date()
    const timelineStart = addDays(today, -2) // Show 2 days past
    const timelineEnd = addDays(today, 14) // Show 2 weeks future
    const days: Date[] = []

    for (let d = timelineStart; d <= timelineEnd; d = addDays(d, 1)) {
        days.push(d)
    }

    // 2. Sort Orders: Urgent -> High -> Normal -> Deadline
    const sortedOrders = [...orders].sort((a, b) => {
        const priorityMap: Record<string, number> = { urgent: 0, high: 1, normal: 2 }
        const pA = priorityMap[a.priority || 'normal'] ?? 2
        const pB = priorityMap[b.priority || 'normal'] ?? 2

        if (pA !== pB) return pA - pB

        // If priority same, check deadline
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })

    // 3. Helper to position steps
    // Simplification: We spread steps across the "Order Duration" or use step estimates?
    // Since we don't have precise step "planned start/end", we visualize them sequentially 
    // starting from today or created_at, fitting within deadline.
    // Visual Trick: Just show the Order Bar with steps as segments?
    // Requirement: "Production Gantt Chart" - ideally steps.

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Production Schedule
                    <Badge variant="outline" className="text-xs font-normal">
                        Sorted by Priority
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full border rounded-md">
                    <div className="min-w-[800px]">
                        {/* Header Row: Days */}
                        <div className="flex border-b">
                            <div className="w-48 flex-shrink-0 p-2 border-r font-bold bg-muted/50 sticky left-0 z-10 backdrop-blur-sm">
                                Order
                            </div>
                            {days.map((day) => (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "flex-1 min-w-[50px] p-2 text-center text-xs border-r",
                                        isSameDay(day, today) && "bg-blue-50 font-bold text-blue-600"
                                    )}
                                >
                                    {format(day, "dd MMM")}
                                    <div className="text-[10px] text-muted-foreground">{format(day, "EEE")}</div>
                                </div>
                            ))}
                        </div>

                        {/* Rows: Orders */}
                        <div className="space-y-0">
                            {sortedOrders.map((order) => (
                                <div key={order.id} className="flex border-b hover:bg-muted/10 transition-colors group">
                                    {/* Order Info Column */}
                                    <div className="w-48 flex-shrink-0 p-3 border-r bg-background sticky left-0 z-10 group-hover:bg-muted/10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm">{order.order_number}</span>
                                            {order.priority === 'urgent' && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>Urgent: Priority Overdrive</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate" title={order.client?.full_name}>
                                            {order.client?.full_name || 'Noma\'lum'}
                                        </div>
                                        <div className="mt-1 flex gap-1 flex-wrap">
                                            <Badge variant="secondary" className="text-[10px] px-1 h-5">
                                                {order.box_type || 'Box'}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {order.quantity} dona
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline Columns */}
                                    <div className="flex-1 relative min-h-[60px] flex items-center p-1">
                                        {/* Background Grid */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {days.map((day) => (
                                                <div key={day.toISOString()} className={cn("flex-1 min-w-[50px] border-r border-dashed", isSameDay(day, today) && "bg-blue-50/30")} />
                                            ))}
                                        </div>

                                        {/* Order Bar (Simplistic for now: Starts CreatedAt/Now, Ends Deadline) */}
                                        {renderOrderBar(order, days, timelineStart)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

function renderOrderBar(order: Order, days: Date[], timelineStart: Date) {
    if (!order.deadline) return null;

    const start = order.created_at ? parseISO(order.created_at) : new Date()
    const end = parseISO(order.deadline)

    // Clamp visual range
    const visibleStart = start < timelineStart ? timelineStart : start

    // Calculate Position
    const totalDays = days.length
    const startIndex = differenceInDays(visibleStart, timelineStart)
    const duration = differenceInDays(end, visibleStart) + 1

    // Width Percentage (Since flex layout is tricky with exact days, we use style with calc)
    // Assuming each day column is equal width.
    // Let's use grid-cols style approach? Or simplify to absolute positioning based on index

    const leftPercent = (startIndex / totalDays) * 100
    const widthPercent = (duration / totalDays) * 100

    // Steps Visualization
    // We divide the bar into segments based on steps count?
    const steps = order.production_steps || []
    const stepCount = steps.length || 1

    return (
        <div
            className="absolute h-8 rounded-md flex overflow-hidden shadow-sm z-0 text-xs text-white"
            style={{
                left: `${Math.max(0, leftPercent)}%`,
                width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                minWidth: "40px"
            }}
        >
            {steps.length > 0 ? (
                steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed'
                    const isActive = step.status === 'in_progress'

                    let bg = "bg-gray-400"
                    if (isCompleted) bg = "bg-green-500"
                    if (isActive) bg = "bg-blue-500"

                    return (
                        <div
                            key={step.id}
                            className={cn("flex-1 flex items-center justify-center border-r last:border-0", bg)}
                            title={`${step.step}: ${step.status}`}
                        >
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        </div>
                    )
                })
            ) : (
                <div className={cn("w-full h-full flex items-center justify-center",
                    order.priority === 'urgent' ? "bg-red-500" :
                        order.priority === 'high' ? "bg-orange-500" : "bg-primary"
                )}>
                    {order.status}
                </div>
            )}
        </div>
    )
}
