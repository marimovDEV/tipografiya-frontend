"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, X } from "lucide-react"

interface UnitConverterHelperProps {
  onCalculate: (total: number) => void
  baseUnit: string
  units_per_pack?: number
  packs_per_box?: number
}

type ConversionUnit = 'pcs' | 'pachka' | 'yashik'

const UNIT_LABELS: Record<ConversionUnit, string> = {
  pcs: 'Dona',
  pachka: 'Pachka',
  yashik: 'Yashik'
}

export function UnitConverterHelper({ 
  onCalculate, 
  baseUnit, 
  units_per_pack = 500, 
  packs_per_box = 5 
}: UnitConverterHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState<string>("")
  const [inputUnit, setInputUnit] = useState<ConversionUnit>('yashik')

  // Calculate base units whenever input changes
  useEffect(() => {
    const val = parseFloat(inputValue) || 0
    if (val <= 0) return

    let totalPcs = 0
    if (inputUnit === 'pcs') {
      totalPcs = val
    } else if (inputUnit === 'pachka') {
      totalPcs = val * units_per_pack
    } else if (inputUnit === 'yashik') {
      totalPcs = val * packs_per_box * units_per_pack
    }

    if (totalPcs > 0) {
      onCalculate(totalPcs)
    }
  }, [inputValue, inputUnit, units_per_pack, packs_per_box])

  const currentTotalPcs = (() => {
    const val = parseFloat(inputValue) || 0
    if (inputUnit === 'pcs') return val
    if (inputUnit === 'pachka') return val * units_per_pack
    if (inputUnit === 'yashik') return val * packs_per_box * units_per_pack
    return 0
  })()

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
        Kalkulyator (Birliklar bog'langan)
      </Button>
    )
  }

  return (
    <div className="mt-2 p-3 bg-slate-100/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl animate-in fade-in zoom-in-95 duration-200 shadow-lg">
      <div className="flex flex-col gap-3">
        {/* Input Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Miqdor kiritish</label>
            <div className="flex items-center gap-1 group">
              <Input 
                type="number" 
                placeholder="0" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                className="h-10 text-lg font-bold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-500"
              />
              <select 
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value as ConversionUnit)}
                className="h-10 px-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-semibold outline-none cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                <option value="pcs">Dona</option>
                <option value="pachka">Pachka</option>
                <option value="yashik">Yashik</option>
              </select>
            </div>
          </div>
          
          <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="mt-5 h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" 
              onClick={() => {
                  setIsOpen(false)
                  setInputValue("")
              }}
          >
              <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
           <div className="flex flex-col items-center">
             <span className="text-[9px] text-slate-500 font-bold uppercase">Dona</span>
             <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentTotalPcs.toLocaleString()}</span>
           </div>
           <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-700">
             <span className="text-[9px] text-slate-500 font-bold uppercase">Pachka</span>
             <span className="text-sm font-bold text-green-600 dark:text-green-400">{(currentTotalPcs / units_per_pack).toLocaleString()}</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[9px] text-slate-500 font-bold uppercase">Yashik</span>
             <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{(currentTotalPcs / (units_per_pack * packs_per_box)).toLocaleString()}</span>
           </div>
        </div>
        
        <div className="text-[10px] text-slate-400 italic text-center">
          Format: 1 yashik = {packs_per_box} pachka = {packs_per_box * units_per_pack} dona
        </div>
      </div>
    </div>
  )
}
