"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TaskCard } from "@/components/mobile/TaskCard"
import { ArrowLeft, Loader2 } from "lucide-react"
import { fetchWithAuth } from "@/lib/api-client"

export default function MobileTasksPage() {
    const router = useRouter()
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress'>('all')

    useEffect(() => {
        loadTasks()
    }, [])

    async function loadTasks() {
        try {
            // Fetch production steps assigned to current user
            // We assume a new endpoint or using query params on production-steps
            // For now, let's assume we can filter by assigned_to=me
            const response = await fetchWithAuth('/api/production-steps/?assigned_to=me')
            if (response.ok) {
                const data = await response.json()
                const results = Array.isArray(data) ? data : data.results || []

                // Map API data to TaskCard format
                const formattedTasks = results.map((step: any) => ({
                    id: step.id,
                    orderNumber: step.order_number || `STEP-${step.id}`, // Fallback if serializer doesn't send order_number
                    productName: step.product_name || "Mahsulot", // Should be enriched in serializer
                    stepName: step.step_name_display || step.step_name,
                    status: step.status,
                    quantity: step.quantity, // Should be quantity_in or order quantity
                    deadline: step.deadline
                }))

                setTasks(formattedTasks)
            }
        } catch (error) {
            console.error("Failed to load tasks", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        if (filter === 'pending') return task.status === 'pending'
        if (filter === 'in_progress') return task.status === 'in_progress'
        return true
    })

    const counts = {
        all: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length
    }

    if (loading) {
        return <div className="flex justify-center py-12 text-slate-400 font-medium">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Yuklanmoqda...
        </div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold">Vazifalarim</h1>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Hammasi ({counts.all})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Kutilmoqda ({counts.pending})
                </button>
                <button
                    onClick={() => setFilter('in_progress')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    Jarayonda ({counts.in_progress})
                </button>
            </div>

            <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        Vazifalar topilmadi
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} onClick={() => router.push(`/mobile/tasks/${task.id}`)}>
                            <TaskCard
                                {...task}
                                onStart={() => { }} // Propagation handled by router push usually, or preventDefault if button clicked
                                onFinish={() => { }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
