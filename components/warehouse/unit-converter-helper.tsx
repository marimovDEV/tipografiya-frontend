"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, X } from "lucide-react"

interface UnitConverterHelperProps {
  onCalculate: (total: number) => void
  baseUnit: string
}

export function UnitConverterHelper({ onCalculate, baseUnit }: UnitConverterHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [boxes, setBoxes] = useState<string>("")
  const [packsPerBox, setPacksPerBox] = useState<string>("")
  const [unitsPerPack, setUnitsPerPack] = useState<string>("")

  useEffect(() => {
    const b = parseFloat(boxes) || 0
    const p = parseFloat(packsPerBox) || 0
    const u = parseFloat(unitsPerPack) || 0
    
    // Only calculate if at least one factor is provided
    if (b > 0 || p > 0 || u > 0) {
        // Multi-level: Boxes * (Packs/Box) * (Units/Pack)
        // If they only provide one (e.g. just units per box) it still works if others are 1
        const total = (b || 1) * (p || 1) * (u || 1)
        if (total > 0 && total !== 1) {
            onCalculate(total)
        }
    }
  }, [boxes, packsPerBox, unitsPerPack])

  if (!isOpen) {
    return (
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="text-[10px] h-7 px-2"
        onClick={() => setIsOpen(true)}
      >
        <Calculator className="w-3 h-3 mr-1" />
        Kalkulyator
      </Button>
    )
  }

  return (
    <div className="mt-2 p-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 shadow-sm transition-all">
      <div className="flex-1 flex items-center gap-1">
        <Input 
          type="number" 
          placeholder="Yashik" 
          value={boxes} 
          onChange={(e) => setBoxes(e.target.value)}
          className="h-8 text-[11px] w-14 px-1 text-center bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus-visible:ring-1"
        />
        <span className="text-slate-400 text-[10px] font-bold">×</span>
        <Input 
          type="number" 
          placeholder="Pachka" 
          value={packsPerBox} 
          onChange={(e) => setPacksPerBox(e.target.value)}
          className="h-8 text-[11px] w-14 px-1 text-center bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus-visible:ring-1"
        />
        <span className="text-slate-400 text-[10px] font-bold">×</span>
        <Input 
          type="number" 
          placeholder={baseUnit} 
          value={unitsPerPack} 
          onChange={(e) => setUnitsPerPack(e.target.value)}
          className="h-8 text-[11px] w-16 px-1 text-center bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus-visible:ring-1"
        />
      </div>
      
      <div className="flex items-center gap-2 border-l pl-2 border-slate-300 dark:border-slate-600">
        <div className="flex flex-col items-end min-w-[40px]">
            <span className="text-[8px] text-blue-500 dark:text-blue-400 font-bold uppercase leading-none">Jami</span>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                {((parseFloat(boxes) || 1) * (parseFloat(packsPerBox) || 1) * (parseFloat(unitsPerPack) || 1)).toLocaleString()}
            </span>
        </div>
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-400 hover:text-red-500 dark:hover:text-red-400" 
            onClick={() => {
                setIsOpen(false)
                setBoxes("")
                setPacksPerBox("")
                unitsPerPack !== "" && setUnitsPerPack("")
            }}
        >
            <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}
