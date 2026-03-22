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
    <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
      <div className="flex-1 flex items-center gap-1.5">
        <Input 
          type="number" 
          placeholder="Yashik" 
          value={boxes} 
          onChange={(e) => setBoxes(e.target.value)}
          className="h-8 text-xs w-16 px-1 text-center"
        />
        <span className="text-slate-400 text-xs text-bold">×</span>
        <Input 
          type="number" 
          placeholder="Pachka" 
          value={packsPerBox} 
          onChange={(e) => setPacksPerBox(e.target.value)}
          className="h-8 text-xs w-16 px-1 text-center"
        />
        <span className="text-slate-400 text-xs text-bold">×</span>
        <Input 
          type="number" 
          placeholder={baseUnit} 
          value={unitsPerPack} 
          onChange={(e) => setUnitsPerPack(e.target.value)}
          className="h-8 text-xs w-20 px-1 text-center"
        />
      </div>
      
      <div className="flex items-center gap-2 border-l pl-2 border-blue-200">
        <div className="flex flex-col items-end">
            <span className="text-[9px] text-blue-500 font-bold uppercase leading-none">Jami</span>
            <span className="text-xs font-bold text-blue-700">
                {((parseFloat(boxes) || 1) * (parseFloat(packsPerBox) || 1) * (parseFloat(unitsPerPack) || 1)).toLocaleString()}
            </span>
        </div>
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-400 hover:text-red-500" 
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
