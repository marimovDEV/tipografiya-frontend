"use client"

import { useState } from "react"
import { Search, Scan } from "lucide-react"

interface QRScannerProps {
    onScan: (result: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
    const [manualInput, setManualInput] = useState("")

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (manualInput.trim()) {
            onScan(manualInput)
            setManualInput("")
        }
    }

    // NOTE: True camera scanning requires HTTPS and integration with libraries like 'html5-qrcode'
    // For this MVP version, we provide a simulation interface.

    return (
        <div className="space-y-4">

            {/* Simulation / Camera Area */}
            <div className="bg-black rounded-xl aspect-square flex flex-col items-center justify-center relative overflow-hidden border-2 border-slate-700">
                <div className="absolute inset-0 opacity-20 bg-[url('https://media.istockphoto.com/id/503467644/vector/qr-code-seamless-pattern.jpg?s=612x612&w=0&k=20&c=S0JjCgM9XjJmH9rX1JjX5XjX5XjX5XjX5XjX5XjX5Xo=')] bg-cover"></div>
                <div className="z-10 text-center p-4">
                    <Scan className="w-16 h-16 text-blue-500 mx-auto animate-pulse mb-4" />
                    <p className="text-slate-300 font-medium">Kamerani QR kodga qarating</p>
                    <p className="text-xs text-slate-500 mt-2">(Simulator: ID ni pastga yozing)</p>
                </div>

                {/* Scanning Line Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_infinite_linear]"></div>
            </div>

            {/* Manual Input Fallback */}
            <form onSubmit={handleManualSubmit} className="relative">
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="ID raqamini qo'lda kiriting..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bg-blue-600 p-1.5 rounded-lg text-white disabled:opacity-50"
                    disabled={!manualInput}
                >
                    Go
                </button>
            </form>

            <style jsx global>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    )
}
