"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Package, Calendar, AlertTriangle } from "lucide-react"
import { PhotoUploader } from "@/components/mobile/PhotoUploader"

export default function MobileTaskDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('in_progress')
    const [photo, setPhoto] = useState<File | null>(null)

    // Mock data
    const task = {
        id: params.id,
        orderNumber: "ORD-2024-003",
        productName: "Pizza Qutisi 30cm",
        client: "Evos Fast Food",
        stepName: "Chop etish (Printing)",
        quantity: 1200,
        deadline: "2024-02-25",
        description: "4 rangli chop etish (CMYK). Material: Karton 300g.",
        priority: "high"
    }

    const handleFinish = () => {
        if (!photo) {
            alert("Iltimos, ishni yakunlashdan oldin QC uchun rasm yuklang!")
            return
        }
        // API call to finish task with photo
        setStatus('completed')
        alert("Vazifa yakunlandi!")
        router.push('/mobile/tasks')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold truncate">{task.productName}</h1>
                    <p className="text-xs text-slate-400">#{task.orderNumber}</p>
                </div>
                {task.priority === 'high' && (
                    <div className="bg-red-900/40 text-red-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        TEZKOR
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Jarayon</span>
                        <span className="font-semibold text-blue-400">{task.stepName}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Miqdor</span>
                        <span className="font-semibold text-slate-200">{task.quantity} dona</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Mijoz</span>
                        <span className="font-semibold text-slate-200">{task.client}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Muddat</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.deadline}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-500 block mb-1">Izoh</span>
                    <p className="text-sm text-slate-300">{task.description}</p>
                </div>
            </div>

            {/* Action Section */}
            <div className="space-y-6">
                {status === 'in_progress' && (
                    <>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Sifat Nazorati (QC)
                            </h3>
                            <PhotoUploader
                                label="Mahsulot rasmini yuklang (Majburiy)"
                                onUpload={setPhoto}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                * Ishni yakunlash uchun kamida 1 ta sifatli rasm yuklanishi shart.
                            </p>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                        >
                            <Package className="w-6 h-6" />
                            Vazifani Yakunlash
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
