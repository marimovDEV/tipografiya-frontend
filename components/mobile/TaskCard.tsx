"use client"

import { CheckCircle, Clock, Play } from "lucide-react"

interface TaskCardProps {
    orderNumber: string
    productName: string
    stepName: string
    status: 'pending' | 'in_progress' | 'completed'
    quantity: number
    onStart?: () => void
    onFinish?: () => void
}

export function TaskCard({
    orderNumber,
    productName,
    stepName,
    status,
    quantity,
    onStart,
    onFinish
}: TaskCardProps) {

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">#{orderNumber}</span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1">{productName}</h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase
            ${status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' : ''}
            ${status === 'in_progress' ? 'bg-blue-900/30 text-blue-500' : ''}
            ${status === 'completed' ? 'bg-green-900/30 text-green-500' : ''}
        `}>
                    {status.replace('_', ' ')}
                </div>
            </div>

            <div className="flex gap-4 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-200">{stepName}</span>
                </div>
                <div>•</div>
                <div>{quantity.toLocaleString()} dona</div>
            </div>

            {status === 'pending' && (
                <button
                    onClick={onStart}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Play className="w-5 h-5" />
                    Ishni Boshlash
                </button>
            )}

            {status === 'in_progress' && (
                <button
                    onClick={onFinish}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <CheckCircle className="w-5 h-5" />
                    Yakunlash
                </button>
            )}

            {status === 'completed' && (
                <div className="w-full bg-slate-800 text-slate-400 font-medium py-3 rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Bajarildi
                </div>
            )}
        </div>
    )
}
