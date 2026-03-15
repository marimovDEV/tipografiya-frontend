"use client"

import React from "react"
import { Order, ProductionStepItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusBadgeColor, getStatusLabel } from "@/lib/data/mock-data"
import { Clock, User, Package, AlertCircle, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface KanbanBoardProps {
    orders: Order[]
}

const STEP_COLUMNS = [
    { id: "prepress", title: "Pre-press" },
    { id: "printing", title: "Chop etish" },
    { id: "drying", title: "Quritish" },
    { id: "cutting", title: "Kesish" },
    { id: "gluing", title: "Yelim/Yig'ish" },
    { id: "qc", title: "Sifat Nazorat" },
    { id: "packaging", title: "Qadoq" },
]

export function KanbanBoard({ orders }: KanbanBoardProps) {
    // Group active steps by their step type
    const stepsByColumn: Record<string, { order: Order; step: ProductionStepItem }[]> = {}
    
    STEP_COLUMNS.forEach(col => {
        stepsByColumn[col.id] = []
    })

    orders.forEach(order => {
        // Find the "current" step (the first one that isn't completed)
        const activeStep = order.production_steps?.find(s => s.status === 'in_progress' || s.status === 'pending' || s.status === 'problem')
        if (activeStep) {
            // Map sub-steps to main columns if necessary (e.g. die_cutting -> cutting)
            let colId = activeStep.step
            if (colId === 'die_cutting') colId = 'cutting'
            if (colId === 'lamination') colId = 'printing'
            
            if (stepsByColumn[colId]) {
                stepsByColumn[colId].push({ order, step: activeStep })
            }
        }
    })

    const calculateProgress = (steps: ProductionStepItem[] = []) => {
        if (steps.length === 0) return 0
        const completed = steps.filter((s) => s.status === "completed").length
        return Math.round((completed / steps.length) * 100)
    }

    const isLate = (deadline?: string) => {
        if (!deadline) return false
        return new Date(deadline) < new Date()
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 min-h-[70vh] no-scrollbar">
            {STEP_COLUMNS.map(column => (
                <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-3">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                           {column.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400 bg-slate-900/50">
                            {stepsByColumn[column.id].length}
                        </Badge>
                    </div>

                    <div className="flex-1 bg-slate-900/40 rounded-[2rem] border border-slate-800 p-3 space-y-4 shadow-inner">
                        {stepsByColumn[column.id].map(({ order, step }) => {
                            const progress = calculateProgress(order.production_steps)
                            const late = isLate(order.deadline)
                            
                            return (
                                <Card key={`${order.id}-${step.id}`} className="bg-slate-900 border-slate-800 hover:border-primary/50 transition-all cursor-pointer group shadow-xl hover:shadow-primary/5 rounded-2xl relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 h-1 bg-primary transition-all duration-500`} style={{ width: `${progress}%` }} />
                                    
                                    <CardContent className="p-4 pt-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                                #{order.order_number?.split('-').pop()}
                                            </span>
                                            <Badge className={`${getStatusBadgeColor(step.status)} text-[8px] font-black px-1.5 py-0 border-none`}>
                                                {step.status === 'problem' ? 'MUAMMO' : step.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        
                                        <h4 className="text-sm font-black text-white italic uppercase truncate mb-1 group-hover:text-primary transition-colors pr-4">
                                            {order.book_name || order.box_type}
                                        </h4>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4 truncate">{order.client?.full_name}</p>

                                        <div className="space-y-2 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                                            <div className="flex items-center justify-between text-[10px]">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Package className="w-3 h-3" />
                                                    <span className="font-mono">{order.quantity.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <User className="w-3 h-3" />
                                                    <span className="truncate max-w-[80px]">{step.assigned_to_name || "—"}</span>
                                                </div>
                                            </div>
                                            {order.deadline && (
                                                <div className={`flex items-center gap-2 text-[10px] pt-1 border-t border-slate-800/50 ${late ? 'text-rose-500' : 'text-slate-500'}`}>
                                                    <Clock className="w-3 h-3" />
                                                    <span className="font-black uppercase">{new Date(order.deadline).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 flex flex-col gap-1">
                                               <div className="flex justify-between text-[8px] font-black uppercase text-slate-600 tracking-widest">
                                                  <span>Progress</span>
                                                  <span className="text-primary">{progress}%</span>
                                               </div>
                                               <Progress value={progress} className="h-1 bg-slate-950" />
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-primary transition-colors" />
                                        </div>

                                        {step.status === 'problem' && (
                                            <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-[9px] text-rose-500 font-black uppercase italic">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span className="truncate">{step.notes || "Bloklangan"}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                        
                        {stepsByColumn[column.id].length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center gap-2 opacity-20 group-hover:opacity-30 transition-opacity">
                                <Package className="w-6 h-6 text-slate-600" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Bo'sh</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
