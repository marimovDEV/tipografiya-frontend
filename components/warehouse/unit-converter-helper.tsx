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
    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative animate-in fade-in duration-200">
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-6 w-6" 
        onClick={() => {
            setIsOpen(false)
            setBoxes("")
            setPacksPerBox("")
            setUnitsPerPack("")
        }}
      >
        <X className="w-3 h-3" />
      </Button>
      
      <p className="text-[11px] font-bold text-slate-600 uppercase mb-2">Konvertatsiya (Helper)</p>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-[9px] uppercase">Yashik</Label>
          <Input 
            type="number" 
            placeholder="Soni" 
            value={boxes} 
            onChange={(e) => setBoxes(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] uppercase">Pachka/Yash</Label>
          <Input 
            type="number" 
            placeholder="5" 
            value={packsPerBox} 
            onChange={(e) => setPacksPerBox(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] uppercase">{baseUnit}/Pachka</Label>
          <Input 
            type="number" 
            placeholder="500" 
            value={unitsPerPack} 
            onChange={(e) => setUnitsPerPack(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
      
      <div className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center">
        <span className="text-[10px] font-medium text-slate-500">Jami ({baseUnit}): </span>
        <span className="text-xs font-bold text-blue-600">
          {((parseFloat(boxes) || 1) * (parseFloat(packsPerBox) || 1) * (parseFloat(unitsPerPack) || 1)).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
