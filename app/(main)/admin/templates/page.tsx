"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api-client"
import { Plus, GripVertical, Trash2, Edit2, Play, GitMerge, FileCheck } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

// Interfaces
interface TemplateStage {
  id: number
  stage_name: string
  sequence: number
  template?: number
}

interface ProductionTemplate {
  id: number
  name: string
  description: string
  stages: TemplateStage[]
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ProductionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI States
  const [activeTemplate, setActiveTemplate] = useState<ProductionTemplate | null>(null)
  
  // Form States
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDesc, setNewTemplateDesc] = useState("")
  const [newStageName, setNewStageName] = useState("")

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth("/api/production-templates/")
      if (!res.ok) throw new Error("Yuklashda xatolik")
      const data = await res.json()
      
      // Support paginated responses
      const finalData = Array.isArray(data) ? data : (data.results || [])
      setTemplates(finalData)
      
      if (finalData.length > 0 && !activeTemplate) {
        setActiveTemplate(finalData[0])
      } else if (activeTemplate) {
        // Refresh active template data
        const refreshActive = finalData.find((t: any) => t.id === activeTemplate.id)
        if (refreshActive) setActiveTemplate(refreshActive)
      }
    } catch (e: any) {
      toast.error("Ma'lumotlarni yuklashda xatolik: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return toast.error("Shablon nomini kiriting")
    try {
      const res = await fetchWithAuth("/api/production-templates/", {
        method: "POST",
        body: JSON.stringify({ name: newTemplateName, description: newTemplateDesc })
      })
      if (!res.ok) throw new Error("Yaratishda xatolik")
      const createdTemplate = await res.json()
      
      toast.success("Shablon yaratildi")
      setNewTemplateName("")
      setNewTemplateDesc("")
      loadTemplates()
      setActiveTemplate(createdTemplate)
    } catch (e: any) {
      toast.error("Xatolik: " + e.message)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Haqiqatan ham bu shablonni o'chirmoqchimisiz?")) return
    try {
      await fetchWithAuth(`/api/production-templates/${id}/`, { method: "DELETE" })
      toast.success("Shablon o'chirildi")
      if (activeTemplate?.id === id) setActiveTemplate(null)
      loadTemplates()
    } catch (e: any) {
      toast.error("Xatolik: " + e.message)
    }
  }

  const handleAddStage = async () => {
    if (!activeTemplate || !newStageName.trim()) return toast.error("Etap nomini kiriting")
    
    const newSequence = (activeTemplate.stages?.length || 0) + 1
    
    try {
      await fetchWithAuth("/api/template-stages/", {
        method: "POST",
        body: JSON.stringify({
          template: activeTemplate.id,
          stage_name: newStageName,
          sequence: newSequence
        })
      })
      toast.success("Yangi etap qo'shildi")
      setNewStageName("")
      loadTemplates()
    } catch (e: any) {
      toast.error("Xatolik: " + e.message)
    }
  }

  const handleDeleteStage = async (id: number) => {
    try {
      await fetchWithAuth(`/api/template-stages/${id}/`, { method: "DELETE" })
      toast.success("Etap olib tashlandi")
      // We should ideally re-sequence the remaining stages on the backend or here,
      // For simplicity let's reload, the backend's explicit sequence holds holes right now, 
      // but UI will sort by sequence.
      loadTemplates()
    } catch (e: any) {
      toast.error("Xatolik: " + e.message)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !activeTemplate || !activeTemplate.stages) return

    const items = Array.from(activeTemplate.stages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Optimistic UI update
    setActiveTemplate({ ...activeTemplate, stages: items.map((item, index) => ({...item, sequence: index + 1})) })

    // Save to backend: Update all sequences
    try {
        const promises = items.map((item, index) => 
            fetchWithAuth(`/api/template-stages/${item.id}/`, {
                method: "PATCH",
                body: JSON.stringify({ sequence: index + 1 })
            })
        )
        await Promise.all(promises)
        toast.success("Ketma-ketlik saqlandi")
        loadTemplates()
    } catch (e: any) {
        toast.error("Xatolik: " + e.message)
        loadTemplates() // Revert
    }
  }

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">🛠️ Jarayon Shablonlari</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 pl-1">Ishlab chiqarish zanjirlarini (workflow) sozlash</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* TEMPLATE LIST - LEFT (Span 4) */}
        <div className="col-span-4 space-y-4">
          <Card className="border border-slate-800 bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
             <CardHeader className="bg-slate-800/50 border-b border-slate-800 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yangi Shablon Qo&apos;shish</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                   <Input 
                     placeholder="Shablon nomi (masalan: Vizitka)" 
                     value={newTemplateName} 
                     onChange={e => setNewTemplateName(e.target.value)} 
                     className="h-11 bg-slate-950 border-slate-800 focus-visible:ring-primary/20 text-white font-medium rounded-xl"
                   />
                   <Input 
                     placeholder="Ta'rifi (ixtiyoriy)" 
                     value={newTemplateDesc} 
                     onChange={e => setNewTemplateDesc(e.target.value)} 
                     className="h-11 bg-slate-950 border-slate-800 focus-visible:ring-primary/20 text-white font-medium rounded-xl"
                   />
                </div>
                <Button onClick={handleCreateTemplate} className="w-full bg-primary text-white hover:opacity-90 rounded-xl h-11 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">
                   <Plus className="w-4 h-4 mr-2" /> Qo&apos;shish
                </Button>
             </CardContent>
          </Card>

          <Card className="border border-slate-800 bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
             <CardHeader className="pb-3 border-b border-slate-800 bg-slate-800/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mavjud Shablonlar</CardTitle>
             </CardHeader>
             <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                <div className="divide-y divide-slate-800">
                   {templates.length === 0 ? (
                      <div className="p-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Shablonlar yo&apos;q</div>
                   ) : templates.map(t => (
                      <div 
                        key={t.id}
                        className={`group w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-all cursor-pointer border-l-4 ${
                           activeTemplate?.id === t.id ? "bg-primary/5 border-primary shadow-inner" : "border-transparent"
                        }`}
                        onClick={() => setActiveTemplate(t)}
                      >
                         <div className="min-w-0 flex-1">
                            <h4 className={`font-black text-xs uppercase tracking-tight truncate ${activeTemplate?.id === t.id ? "text-primary" : "text-slate-300"}`}>{t.name}</h4>
                            <p className="text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest italic">{t.stages?.length || 0} ta etap</p>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id) }}
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* STAGE MANAGEMENT - RIGHT (Span 8) */}
        <div className="col-span-8">
           {activeTemplate ? (
              <Card className="border border-slate-800 bg-slate-900 shadow-2xl h-full max-h-[800px] flex flex-col rounded-[2rem] overflow-hidden">
                 <CardHeader className="bg-slate-800/30 border-b border-slate-800 pb-6 px-8">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl shadow-inner border border-primary/20">
                          <GitMerge className="w-7 h-7" />
                       </div>
                       <div>
                          <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">{activeTemplate.name}</CardTitle>
                          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-slate-500">
                             ETAPLAR KETMA-KETLIGI (WORKFLOW MONITORING)
                          </CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 
                 <CardContent className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Add new Stage */}
                    <div className="flex gap-4 mb-10 bg-slate-950/50 p-6 rounded-3xl border border-slate-800 items-end shadow-inner">
                       <div className="flex-1 space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Yangi Etap Nomi (Masalan: Kesish)</Label>
                          <Input 
                            placeholder="Etap nomini kiriting..." 
                            value={newStageName} 
                            onChange={e => setNewStageName(e.target.value)} 
                            className="h-12 bg-slate-900 border-slate-800 rounded-xl focus-visible:ring-primary/20 text-white font-medium"
                          />
                       </div>
                       <Button onClick={handleAddStage} className="bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl h-12 px-8 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all border-none">
                          <Plus className="w-4 h-4 mr-2" /> Qo&apos;shish
                       </Button>
                    </div>

                    {/* Draggable Stages */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 ml-1 italic">ETAPLAR ZANJIRI</h4>
                        {(!activeTemplate.stages || activeTemplate.stages.length === 0) ? (
                            <div className="p-20 text-center border-2 border-dashed rounded-[2rem] bg-slate-950/20 border-slate-800 shadow-inner">
                                <FileCheck className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-50" />
                                <p className="text-slate-400 font-black uppercase text-xs tracking-tight">Bu shablonda hali birorta ham etap yo&apos;q.</p>
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-3 italic">Iltimos, yuqoridagi maydondan etaplar qo&apos;shing.</p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="stages-list">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                            {activeTemplate.stages.map((stage, index) => (
                                                <Draggable key={stage.id.toString()} draggableId={stage.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <div 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className="flex items-center gap-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-primary/40 transition-all group relative z-10"
                                                        >
                                                            {/* Sequence Line (Visual only) */}
                                                            {index !== activeTemplate.stages.length - 1 && (
                                                                <div className="absolute left-[39px] top-full h-4 w-1 bg-slate-800/100 z-0 shadow-inner rounded-full"></div>
                                                            )}
                                                            
                                                            <div 
                                                                {...provided.dragHandleProps}
                                                                className="cursor-move p-2 -ml-2 text-slate-700 hover:text-primary hover:bg-primary/10 rounded-xl transition-all z-10"
                                                            >
                                                                <GripVertical className="w-5 h-5" />
                                                            </div>
                                                            
                                                            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-black flex items-center justify-center text-sm shadow-inner shrink-0 z-10 border border-slate-800">
                                                                {index + 1}
                                                            </div>
                                                            
                                                            <div className="flex-1">
                                                                <h4 className="font-black text-white text-lg uppercase tracking-tight italic group-hover:text-primary transition-colors">{stage.stage_name}</h4>
                                                            </div>
                                                            
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-9 w-9 rounded-xl text-slate-700 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                                                                onClick={() => handleDeleteStage(stage.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                 </CardContent>
              </Card>
           ) : (
              <div className="h-[600px] flex items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20 shadow-inner">
                 <div className="text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-xl">
                        <Play className="text-slate-700 w-10 h-10 ml-1 opacity-50" />
                    </div>
                    <p className="text-slate-600 font-black uppercase text-xs tracking-widest italic animate-pulse">Boshqarish uchun chap tomondan shablon tanlang</p>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
