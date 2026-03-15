"use client"

import Link from "next/link"
import { Camera, ClipboardList, Package, User } from "lucide-react"

export default function MobileDashboard() {
    return (
        <div className="space-y-6">

            {/* Welcome Section */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Salom, Ishchi!</h2>
                        <p className="text-slate-400 text-sm">Bugungi vazifalar: 4 ta</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">

                {/* Scan QR */}
                <Link href="/mobile/scan" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors aspect-square">
                    <Camera className="w-10 h-10 text-white" />
                    <span className="font-bold text-white text-lg">QR Skaner</span>
                </Link>

                {/* My Tasks */}
                <Link href="/mobile/tasks" className="bg-slate-800 hover:bg-slate-700 active:bg-slate-750 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors aspect-square border border-slate-700">
                    <ClipboardList className="w-10 h-10 text-blue-400" />
                    <span className="font-bold text-slate-200 text-lg">Vazifalarim</span>
                </Link>

                {/* Warehouse */}
                <Link href="/mobile/materials" className="bg-slate-800 hover:bg-slate-700 active:bg-slate-750 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors aspect-square border border-slate-700">
                    <Package className="w-10 h-10 text-emerald-400" />
                    <span className="font-bold text-slate-200 text-lg">Ombor</span>
                </Link>

                {/* Profile/Settings */}
                <button className="bg-slate-800 hover:bg-slate-700 active:bg-slate-750 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors aspect-square border border-slate-700">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-600 flex items-center justify-center">
                        <span className="text-slate-400 font-bold">?</span>
                    </div>
                    <span className="font-bold text-slate-200 text-lg">Yordam</span>
                </button>

            </div>

            {/* Recent Activity (Placeholder) */}
            <div>
                <h3 className="text-lg font-semibold mb-3 px-1">So'nggi faollik</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-200">Buyurtma #{1000 + i}</p>
                                <p className="text-xs text-slate-500">Kesish • 2 soat oldin</p>
                            </div>
                            <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">Yakunlandi</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
