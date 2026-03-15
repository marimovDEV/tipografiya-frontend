"use client"

import { useState, useRef } from "react"
import { Camera, X, UploadCloud } from "lucide-react"

interface PhotoUploaderProps {
    onUpload: (file: File) => void
    label?: string
}

export function PhotoUploader({ onUpload, label = "Rasm yuklash" }: PhotoUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Callback
            onUpload(file)
        }
    }

    const clearPhoto = () => {
        setPreview(null)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">{label}</label>

            {!preview ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all h-48"
                >
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <span className="text-slate-400 font-medium">Kamerani ochish</span>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 h-48 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={clearPhoto}
                        className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded-full text-white hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex items-center justify-center gap-2 text-green-400 text-sm font-medium backdrop-blur-sm">
                        <UploadCloud className="w-4 h-4" />
                        Tayyor
                    </div>
                </div>
            )}
        </div>
    )
}
