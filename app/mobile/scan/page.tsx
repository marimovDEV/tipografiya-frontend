"use client"

import { QRScanner } from "@/components/mobile/QRScanner"
import { useRouter } from "next/navigation"

export default function MobileScanPage() {
    const router = useRouter()

    const handleScan = (result: string) => {
        console.log("Scanned:", result)
        // In a real app, verify ID via API then redirect to task details
        alert(`QR Kod topildi: ${result}`)
        // router.push(`/mobile/tasks/${result}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-white">
                    ← Orqaga
                </button>
                <h1 className="text-xl font-bold">QR Skaner</h1>
            </div>

            <div className="max-w-md mx-auto">
                <QRScanner onScan={handleScan} />
            </div>

            <div className="mt-8 text-center text-sm text-slate-500">
                <p>"Runner Paper" (yo'l xati) dagi QR kodni skanerlang.</p>
                <p>Bu tizim avtomatik ravishda buyurtmani ochadi.</p>
            </div>
        </div>
    )
}
