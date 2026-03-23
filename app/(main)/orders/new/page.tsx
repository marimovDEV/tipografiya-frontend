"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, AlertTriangle, CheckCircle, XCircle, Loader2, AlertCircle, Clock, FileText, Plus, DollarSign } from "lucide-react"
import { getProductTemplates, validateOrderMaterials, getCompatibleMaterials } from "@/lib/api/printery"
import { fetchWithAuth, fetchDielinePreview, fetchNestingOptimization, fetchPricingCalculation } from "@/lib/api-client"
import type { ProductTemplate, Client, MaterialValidationResult } from "@/lib/types"
import { VisualCanvas } from "@/components/visual-engine/VisualCanvas"
import ThreeDViewer from "@/components/ThreeDViewer"
import { TemplateFormModal } from "@/components/templates/TemplateFormModal"
import { ClientFormModal } from "@/components/clients/ClientFormModal"

type WizardStep = "template" | "client" | "specifications" | "validation" | "confirmation"

export default function NewOrderWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>("template")
  const [loading, setLoading] = useState(false)

  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [specifications, setSpecifications] = useState({
    width_cm: 20,
    height_cm: 15,
    quantity: 1000,
    deadline: "",
    notes: "",
    // Typography specific
    book_name: "",
    page_count: 0,
    cover_type: "soft", // soft, hard, integral
    internal_colors: "1+1", // 1+1, 4+4, 1+0, 4+0
    cover_colors: "4+0", // 4+0, 4+4, 1+0
    internal_paper_type: "80g Offset",
    cover_paper_type: "250g Melovka",
    cover_lamination: "none", // none, matte, glossy, soft-touch
    binding_type: "termokley", // termokley, thread, staple
    has_lacquer: false,
    has_gluing: false,
    manual_price: 0,
    advance_payment: 0,
    initial_payment_method: "cash",
    show_advance_input: false,
    // Keep for potential legacy/3D use if needed briefly
    sides: 4,
  })
  const [validationResult, setValidationResult] = useState<MaterialValidationResult | null>(null)

  const steps: { key: WizardStep; label: string }[] = [
    { key: "template", label: "Shablon" },
    { key: "client", label: "Mijoz" },
    { key: "specifications", label: "Spetsifikatsiya" },
    { key: "validation", label: "Tekshirish" },
    { key: "confirmation", label: "Tasdiqlash" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  async function handleNext() {
    if (currentStep === "template" && selectedTemplate) {
      setSpecifications({
        ...specifications,
        width_cm: selectedTemplate.default_width || 20,
        height_cm: selectedTemplate.default_height || 15,
      })
      setCurrentStep("client")
    } else if (currentStep === "client" && selectedClient) {
      setCurrentStep("specifications")
    } else if (currentStep === "specifications") {
      // Skip validation, go directly to confirmation
      setCurrentStep("confirmation")
    } else if (currentStep === "validation") {
      // Allow proceeding even if validation failed
      setCurrentStep("confirmation")
    }
  }

  async function validateMaterials() {
    if (!selectedTemplate) return

    try {
      setLoading(true)
      const result = await validateOrderMaterials({
        product_template_id: selectedTemplate.id,
        width_cm: specifications.width_cm,
        height_cm: specifications.height_cm,
        quantity: specifications.quantity,
        has_lacquer: specifications.has_lacquer,
        has_gluing: specifications.has_gluing,
        internal_colors: specifications.internal_colors,
        cover_colors: specifications.cover_colors,
        binding_type: specifications.binding_type,
      })

      setValidationResult(result.validation)
      setCurrentStep("validation")
    } catch (error) {
      console.error("Validation failed:", error)
      // Don't stop - allow user to proceed anyway
      setCurrentStep("confirmation")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true)

      const finalPrice = specifications.manual_price || 0

      const orderData = {
        client_id: selectedClient!.id,
        product_template: selectedTemplate!.id,
        box_type: selectedTemplate!.name,
        paper_width: specifications.width_cm,
        paper_height: specifications.height_cm,
        quantity: specifications.quantity,
        print_colors: `Internal: ${specifications.internal_colors}, Cover: ${specifications.cover_colors}`,
        lacquer_type: specifications.has_lacquer ? "matt" : "none",
        additional_processing: JSON.stringify({
          binding: specifications.binding_type,
          lamination: specifications.cover_lamination,
          internal_paper: specifications.internal_paper_type,
          cover_paper: specifications.cover_paper_type,
          gluing: specifications.has_gluing
        }),
        deadline: specifications.deadline || undefined,
        notes: specifications.notes,
        total_price: Math.round(finalPrice),
        advance_payment: specifications.show_advance_input ? (specifications.advance_payment || 0) : 0,
        initial_payment_method: specifications.initial_payment_method || "cash",
        book_name: specifications.book_name,
        page_count: specifications.page_count,
        cover_type: specifications.cover_type,
      }

      const response = await fetchWithAuth("/api/orders/", {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error("Failed to create order")

      const order = await response.json()
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Failed to create order:", error)
      alert("Buyurtma yaratishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Yangi Buyurtma</h1>
          <p className="text-slate-400 mt-1">
            Material tekshiruvi bilan aqlli buyurtma yaratish
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${index < currentStepIndex
                    ? "bg-green-500 text-white"
                    : index === currentStepIndex
                      ? "bg-primary text-white"
                      : "bg-slate-700 text-slate-400"
                    }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm mt-2 font-medium text-slate-300">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${index < currentStepIndex ? "bg-green-500" : "bg-slate-700"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 min-h-[400px]">
        {currentStep === "template" && (
          <TemplateStep
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        )}
        {currentStep === "client" && (
          <ClientStep
            selectedClient={selectedClient}
            onSelect={setSelectedClient}
          />
        )}
        {currentStep === "specifications" && (
          <SpecificationsStep
            template={selectedTemplate!}
            specifications={specifications}
            onChange={setSpecifications}
          />
        )}
        {currentStep === "validation" && validationResult && (
          <ValidationStep
            result={validationResult}
            onRetry={() => setCurrentStep("specifications")}
          />
        )}
        {currentStep === "confirmation" && (
          <ConfirmationStep
            template={selectedTemplate!}
            client={selectedClient!}
            specifications={specifications}
            validation={validationResult}
            onChange={setSpecifications}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            const prevIndex = currentStepIndex - 1
            if (prevIndex >= 0) {
              setCurrentStep(steps[prevIndex].key)
            }
          }}
          disabled={currentStepIndex === 0}
          className="px-6 py-2 border border-slate-700 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Orqaga
        </button>

        {currentStep === "confirmation" ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yaratilmoqda...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Buyurtma Yaratish
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === "template" && !selectedTemplate) ||
              (currentStep === "client" && !selectedClient) ||
              (currentStep === "validation" && !validationResult?.is_valid) ||
              loading
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                Keyingi
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function TemplateStep({
  selectedTemplate,
  onSelect,
}: {
  selectedTemplate: ProductTemplate | null
  onSelect: (template: ProductTemplate) => void
}) {
  const [templates, setTemplates] = useState<ProductTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const response = await getProductTemplates({ is_active: true, category: 'book' })
      console.log('Order wizard templates:', response)

      // Handle both array and {results: []} response formats
      const templatesArray = Array.isArray(response) ? response : (response.results || [])
      setTemplates(templatesArray)
      console.log('Loaded templates in wizard:', templatesArray.length)
    } catch (error) {
      console.error("Failed to load templates:", error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-50">Mahsulot Shablonini Tanlang</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Shablon
        </button>
      </div>

      {!templates || templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Faol shablonlar topilmadi</p>
          <p className="text-sm text-slate-500">
            Shablonlar yaratish uchun <a href="/templates" className="text-blue-400 underline" onClick={(e) => {
              // Stay on page and open modal instead of navigating away if user prefers
              e.preventDefault();
              setShowCreateModal(true);
            }}>bu yerga</a> bosing
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template)
              }}
              className={`text-left border rounded-lg p-4 transition-all ${selectedTemplate?.id === template.id
                ? "border-blue-500 bg-blue-950/50 ring-2 ring-blue-500"
                : "border-slate-700 bg-slate-800 hover:border-blue-500/50 hover:bg-slate-750"
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-50">{template.name}</h4>
                {selectedTemplate?.id === template.id && (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}</div>
              <p className="text-sm text-slate-400 mb-2">
                {template.category_display}
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>{template.layer_count} qatlam</span>
                <span>{template.default_waste_percent}% chiqindi</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreateModal && (
        <TemplateFormModal
          template={null}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false)
            loadTemplates()
          }}
        />
      )}
    </div>
  )
}

function ClientStep({
  selectedClient,
  onSelect,
}: {
  selectedClient: Client | null
  onSelect: (client: Client) => void
}) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      const response = await fetchWithAuth("/api/customers/")
      const data = await response.json()
      console.log('Clients response:', data)

      // Handle both array and {results: []} response formats
      const clientsArray = Array.isArray(data) ? data : (data.results || [])
      setClients(clientsArray)
      console.log('Loaded clients:', clientsArray.length)
    } catch (error) {
      console.error("Failed to load clients:", error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Yuklanmoqda...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-50">Mijozni Tanlang</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Mijoz
        </button>
      </div>

      <input
        type="text"
        placeholder="Mijoz ismi bo'yicha qidirish..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {!clients || clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Mijozlar topilmadi</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Birinchi mijozni qo'shing
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          Qidiruv natijasi topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelect(client)}
              className={`text-left border rounded-lg p-4 transition-all ${selectedClient?.id === client.id
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "border-slate-700 bg-slate-800 hover:border-primary/50 hover:bg-slate-750"
                }`}
            >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-50">{client.full_name}</h4>
                      {client.company && (
                        <p className="text-sm text-slate-400">{client.company}</p>
                      )}
                      {client.phone && (
                        <p className="text-xs text-slate-500 mt-1">{client.phone}</p>
                      )}
                      {Number(client.balance || 0) < 0 && (
                        <div className="mt-2 text-[10px] font-black text-red-500 flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-md border border-red-500/20">
                            <AlertCircle className="h-3 w-3" /> MIJOZ QARZDOR: {Math.abs(Number(client.balance)).toLocaleString()} so'm
                        </div>
                      )}
                    </div>
                    {selectedClient?.id === client.id && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
            </button>
          ))}
        </div>
      )}

      {showCreateModal && (
        <ClientFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={(newClient) => {
            setShowCreateModal(false)
            loadClients()
            if (newClient) onSelect(newClient)
          }}
        />
      )}
    </div>
  )
}




function SpecificationsStep({
  template,
  specifications,
  onChange,
}: {
  template: ProductTemplate
  specifications: any
  onChange: (specs: any) => void
}) {
  const [dielineData, setDielineData] = useState<{ path: string, viewBox: string } | null>(null)
  const [nestingData, setNestingData] = useState<any>(null)
  const [priceData, setPriceData] = useState<any>(null)
  const [foldAngle, setFoldAngle] = useState(0) // 0 - 100
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [materialType, setMaterialType] = useState<'craft' | 'white' | 'glossy'>('craft')

  // Phase 7: Nesting State
  const [viewMode, setViewMode] = useState<'product' | 'sheet' | 'flat'>('product')

  // Auto-generate Dieline and Nesting
  useEffect(() => {
    if (specifications.width_cm && specifications.height_cm) {
      const timer = setTimeout(async () => {
        try {
          // 1. Dieline Preview
          // Use template category as style (mapped in backend or defaulted)
          const style = template.category || 'mailer_box'
          const response = await fetchDielinePreview({
            style: style,
            W: specifications.width_cm,
            L: specifications.height_cm,
            H: specifications.depth_cm || 5
          })

          if (response.ok) {
            const data = await response.json()
            setDielineData({
              path: data.svg_path,
              viewBox: data.viewbox
            })
          }

          // 2. Nesting Optimization (Phase 3)
          const nestingRes = await fetchNestingOptimization({
            style: style,
            L: specifications.height_cm,
            W: specifications.width_cm,
            H: specifications.depth_cm || 5,
            quantity: specifications.quantity,
            sheet_w: 100, // Standard Sheet
            sheet_h: 70,
            material_type: materialType
          })

          if (nestingRes.ok) {
            const nData = await nestingRes.json()
            setNestingData(nData.result)

          // Price calculation removed
          }

        } catch (e) {
          console.error("Gen failed", e)
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [specifications.width_cm, specifications.height_cm, specifications.depth_cm])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Spetsifikatsiya & Chizma</h3>
        <p className="text-sm text-muted-foreground">
          Shablon: <span className="font-medium">{template.name}</span>
        </p>
      </div>

      <div className="space-y-8">
        {/* Form Fields Section */}
        <div className="space-y-8 max-w-4xl">
          {/* 1. Asosiy Ma'lumotlar */}          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary rounded-full"></div>
              Asosiy Ma'lumotlar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Kitob Nomi *</label>
                <input
                  type="text"
                  required
                  value={specifications.book_name || ''}
                  onChange={(e) => onChange({ ...specifications, book_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder:text-slate-600"
                  placeholder="Masalan: O'tkan Kunlar (Yangi nashr)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Miqdor (Adad) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={specifications.quantity || ''}
                  onChange={(e) => onChange({ ...specifications, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Tayyor bo'lish muddati</label>
                <input
                  type="date"
                  value={specifications.deadline}
                  onChange={(e) => onChange({ ...specifications, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition [color-scheme:dark]"
                />
              </div>
            </div>
          </section>

          {/* 2. Format */}
          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
              Format (O'lcham)
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Kenglik (cm) *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={specifications.width_cm || ''}
                  onChange={(e) => onChange({ ...specifications, width_cm: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Balandlik (cm) *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={specifications.height_cm || ''}
                  onChange={(e) => onChange({ ...specifications, height_cm: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 italic">* Qalinlik (spine) betlar soni va qog'oz turiga qarab avtomatik hisoblanadi.</p>
          </section>

          {/* 3. Ichki Sahifalar */}
          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
              Ichki Sahifalar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Betlar Soni *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={specifications.page_count || ''}
                  onChange={(e) => onChange({ ...specifications, page_count: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Qog'oz Turi</label>
                <select
                  value={specifications.internal_paper_type}
                  onChange={(e) => onChange({ ...specifications, internal_paper_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="80g Offset">80g Offset</option>
                  <option value="90g Offset">90g Offset</option>
                  <option value="115g Melovka">115g Melovka</option>
                  <option value="130g Melovka">130g Melovka</option>
                  <option value="65g Gazeta">65g Gazeta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Ranglar (Ichki)</label>
                <select
                  value={specifications.internal_colors}
                  onChange={(e) => onChange({ ...specifications, internal_colors: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="1+1">1+1 (Qora-oq)</option>
                  <option value="4+4">4+4 (To'liq rangli)</option>
                  <option value="1+0">1+0</option>
                  <option value="4+0">4+0</option>
                </select>
              </div>
            </div>
          </section>

          {/* 4. Muqova */}
          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
              Muqova
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Muqova Turi</label>
                <select
                  value={specifications.cover_type}
                  onChange={(e) => onChange({ ...specifications, cover_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="soft">Yumshoq (Soft cover)</option>
                  <option value="hard">Qattiq (Hard cover)</option>
                  <option value="integral">Integral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Muqova Qog'ozi</label>
                <select
                  value={specifications.cover_paper_type}
                  onChange={(e) => onChange({ ...specifications, cover_paper_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="250g Melovka">250g Melovka</option>
                  <option value="300g Melovka">300g Melovka</option>
                  <option value="Karton">Karton</option>
                  <option value="Linen texture">Linen texture</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Ranglar (Muqova)</label>
                <select
                  value={specifications.cover_colors}
                  onChange={(e) => onChange({ ...specifications, cover_colors: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="4+0">4+0</option>
                  <option value="4+4">4+4</option>
                  <option value="1+0">1+0</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Laminatsiya</label>
                <select
                  value={specifications.cover_lamination}
                  onChange={(e) => onChange({ ...specifications, cover_lamination: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="none">Yo'q</option>
                  <option value="matte">Matoviy (Matte)</option>
                  <option value="glossy">Yaltiroq (Glossy)</option>
                  <option value="soft-touch">Soft touch</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={specifications.has_lacquer}
                  onChange={(e) => onChange({ ...specifications, has_lacquer: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-400 group-hover:text-primary transition">UV Lak qo'llash</span>
              </label>
            </div>
          </section>

          {/* 5. Bog'lash va Qo'shimcha */}
          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-sm">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
              Bog'lash va Qo'shimcha
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Bog'lash Turi</label>
                <select
                  value={specifications.binding_type}
                  onChange={(e) => onChange({ ...specifications, binding_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition"
                >
                  <option value="termokley">Termokley (Perfect binding)</option>
                  <option value="thread">Ip bilan tikish (Thread sewing)</option>
                  <option value="staple">Skrepka (Staple)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-400">Izohlar</label>
                <textarea
                  value={specifications.notes}
                  onChange={(e) => onChange({ ...specifications, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary transition placeholder:text-slate-600"
                  placeholder="Qo'shimcha talablar..."
                />
              </div>

            </div>
          </section>
        </div>

        {/* Analysis & Pricing Section (Remaining info without visual preview) */}
        <div className="space-y-4 pt-6 mt-6 border-t border-slate-700 max-w-2xl">
          {nestingData?.inventory_analysis && (
            <div className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-3 border ${nestingData.inventory_analysis.is_low_stock
                ? 'bg-red-900/20 border-red-900/50 text-red-400'
                : 'bg-green-900/20 border-green-900/50 text-green-400'
              }`}>
              {nestingData.inventory_analysis.is_low_stock ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span>{nestingData.inventory_analysis.message}</span>
                  {nestingData.inventory_analysis.is_low_stock && (
                    <span className="text-xs font-normal opacity-80">
                      (Mavjud: {nestingData.inventory_analysis.available_quantity}, Kerak: {nestingData.inventory_analysis.required_quantity})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {nestingData?.machine_analysis && (
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between font-bold text-slate-100 border-b border-slate-700 pb-2 mb-2">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Taxminiy Ish Vaqti
                </span>
                <span>{nestingData.machine_analysis.total_minutes || nestingData.machine_analysis.total_time_min} min</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
                <div>Setup: <span className="font-semibold text-slate-200">{nestingData.machine_analysis.setup_min}m</span></div>
                <div>Yuklash: <span className="font-semibold text-slate-200">{nestingData.machine_analysis.loading_min}m</span></div>
                <div>Kesish: <span className="font-semibold text-slate-200">{nestingData.machine_analysis.cutting_min}m</span></div>
                <div>Boshqa: <span className="font-semibold text-slate-200">{nestingData.machine_analysis.creasing_min}m</span></div>
              </div>

              {nestingData.predicted_deadline && (
                <div className="mt-4 p-3 bg-indigo-950/20 rounded-md border border-indigo-900/50">
                  <div className="flex flex-col">
                    <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Tahminiy Bitish Vaqti:
                    </span>
                    <span className="text-base font-bold text-indigo-200">
                      {new Date(nestingData.predicted_deadline).toLocaleString('uz-UZ', {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {priceData && (
            <div className="border border-emerald-200 rounded-lg overflow-hidden">
              <div className="bg-emerald-500 p-4 text-white flex justify-between items-center">
                <h4 className="font-bold">Hisoblangan Narx</h4>
                <div className="text-right">
                  <div className="text-2xl font-black">{(priceData.total_price).toLocaleString()} so'm</div>
                  <div className="text-xs opacity-90">{(priceData.price_per_unit).toLocaleString()} so'm / dona</div>
                </div>
              </div>
              <div className="p-4 bg-slate-900/50 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Material ({priceData.breakdown.sheets_used} list)</span>
                  <span className="font-medium text-slate-200">{(priceData.breakdown.material_cost).toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Ishlab chiqarish ({priceData.breakdown.machine_hours} soat)</span>
                  <span className="font-medium text-slate-200">{(priceData.breakdown.production_cost).toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between">
                  <span>Ustama ({priceData.breakdown.margin_percent}%)</span>
                  <span className="font-medium text-emerald-400">Kiritingan</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 pt-4">
            <div className="flex-1 text-xs text-slate-400 font-mono italic">
              * Narxlar avtomatik hisoblandi va taxminiy hisoblanadi.
            </div>
          </div>

          {/* PDF Quote Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (!priceData) return;

                const date = new Date().toLocaleDateString('uz-UZ');
                const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('uz-UZ');

                // Professional Typography HTML generation
                const htmlContent = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Tijorat Taklifi - ${specifications.book_name}</title>
                                <style>
                                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                                    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                                    .logo { font-size: 28px; font-weight: 800; color: #1e40af; letter-spacing: -1px; }
                                    .meta { text-align: right; font-size: 14px; color: #64748b; }
                                    .title { text-align: center; font-size: 24px; font-weight: 900; margin-bottom: 40px; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; }
                                    .grid { display: flex; gap: 40px; margin-bottom: 30px; }
                                    .col { flex: 1; }
                                    .section-title { font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
                                    .value { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #1e293b; }
                                    .price-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-top: 20px; }
                                    .price-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; color: #1e40af; }
                                    .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px dashed #93c5fd; font-weight: 800; font-size: 22px; color: #1e3a8a; }
                                    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
                                    .specs-table { width: 100%; border-collapse: collapse; }
                                    .specs-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                                    .specs-table td:first-child { color: #64748b; width: 45%; font-weight: 500; }
                                    .specs-table td:last-child { color: #1e293b; font-weight: 600; }
                                </style>
                            </head>
                            <body>
                                <div class="header">
                                    <div class="logo">Typography PRO</div>
                                    <div class="meta">
                                        Sana: ${date}<br>
                                        Taqdim etuvchi: Smart ERP System
                                    </div>
                                </div>
                                
                                <div class="title">Tijorat Taklifi</div>
                                
                                <div class="grid">
                                    <div class="col">
                                        <div class="section-title">Mahsulot ma'lumotlari</div>
                                        <div class="value">${specifications.book_name || 'Kitob nashri'}</div>
                                        
                                        <div class="section-title">Format va Adad</div>
                                        <div class="value">${specifications.width_cm} x ${specifications.height_cm} sm | ${specifications.quantity.toLocaleString()} dona</div>
                                        
                                        <div class="section-title">Ichki Sahifalar</div>
                                        <table class="specs-table">
                                            <tr><td>Betlar soni</td><td>${specifications.page_count} bet</td></tr>
                                            <tr><td>Qog'oz turi</td><td>${specifications.internal_paper_type}</td></tr>
                                            <tr><td>Ranglar</td><td>${specifications.internal_colors}</td></tr>
                                        </table>
                                    </div>
                                    <div class="col">
                                        <div class="section-title">Muqova va Bog'lash</div>
                                        <table class="specs-table">
                                            <tr><td>Muqova turi</td><td>${specifications.cover_type === 'soft' ? 'Yumshoq' : specifications.cover_type === 'hard' ? 'Qattiq' : 'Integral'}</td></tr>
                                            <tr><td>Muqova qog'ozi</td><td>${specifications.cover_paper_type}</td></tr>
                                            <tr><td>Muqova rangi</td><td>${specifications.cover_colors}</td></tr>
                                            <tr><td>Laminatsiya</td><td>${specifications.cover_lamination}</td></tr>
                                            <tr><td>Bog'lash usuli</td><td>${specifications.binding_type === 'termokley' ? 'Termokley' : specifications.binding_type === 'thread' ? 'Ip bilan tikish' : 'Skrepka'}</td></tr>
                                        </table>
                                        
                                        <div class="price-box">
                                            <div class="price-row">
                                                <span>Dona narxi:</span>
                                                <span>${Math.round(priceData.total_price / specifications.quantity).toLocaleString()} so'm</span>
                                            </div>
                                            <div class="price-row">
                                                <span>QQS (0%):</span>
                                                <span>Imtiyozli</span>
                                            </div>
                                            <div class="total-row">
                                                <span>JAMI:</span>
                                                <span>${priceData.total_price.toLocaleString()} so'm</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="footer">
                                    Ushbu taklif 10 kun davomida o'z kuchini yo'qotmaydi.<br>
                                    Typography Smart ERP tizimi orqali yaratildi.
                                </div>
                                
                                <script>
                                    window.onload = function() { window.print(); }
                                </script>
                            </body>
                            </html>
                        `;

                const win = window.open('', '_blank');
                win?.document.write(htmlContent);
                win?.document.close();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs rounded hover:bg-slate-700 transition"
            >
              <FileText className="w-4 h-4" />
              Download Offer (PDF)
            </button>
          </div>
        </div>
      </div>

    </div>

  )
}


function ValidationStep({
  result,
  onRetry,
}: {
  result: MaterialValidationResult
  onRetry: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {result.is_valid ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center border border-green-800">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400">
                Materiallar Mavjud!
              </h3>
              <p className="text-sm text-slate-400">{result.message}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center border border-red-800">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400">
                Materiallar Yetarli Emas
              </h3>
              <p className="text-sm text-slate-400">{result.message}</p>
            </div>
          </>
        )}
      </div>

      {/* Missing Materials */}
      {result.missing_materials.length > 0 && (
        <div className="border border-red-900/50 rounded-lg p-4 bg-red-950/20">
          <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Yetarli Emas ({result.missing_materials.length})
          </h4>
          <div className="space-y-2">
            {result.missing_materials.map((material, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="font-medium">{material.type}</span>
                <span className="text-red-700">
                  Kerak: {material.needed.toFixed(2)} {material.unit} |
                  Mavjud: {material.available.toFixed(2)} {material.unit} |
                  Yetishmaydi: {material.shortage.toFixed(2)} {material.unit}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onRetry}
            className="mt-4 w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100"
          >
            Spetsifikatsiyani O'zgartirish
          </button>
        </div>
      )}

      {/* Available Materials */}
      {result.available_materials.length > 0 && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-3">
            ✓ Mavjud Materiallar ({result.available_materials.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {result.available_materials.map((material, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{material.type}</div>
                <div className="text-green-700">
                  {material.needed.toFixed(2)} / {material.available.toFixed(2)} {material.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ConfirmationStep({
  template,
  client,
  specifications,
  validation,
  onChange,
}: {
  template: ProductTemplate
  client: Client
  specifications: any
  validation: MaterialValidationResult | null
  onChange: (specs: any) => void
}) {
  return (
    <div className="space-y-6">
      <div className="border-t border-slate-700 pt-4 mt-6">
        <div className="bg-slate-900/80 p-0 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-6 space-y-6">
            {/* 1. Final Price Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-2">💰 YAKUNIY NARX (KELISHILGAN)</span>
                {specifications.quantity > 0 && (
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                    Dona uchun: {((specifications.manual_price || 0) / specifications.quantity).toLocaleString()} so'm
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={specifications.manual_price || ''}
                  onChange={(e) => onChange({ ...specifications, manual_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-3xl font-black text-green-400 focus:ring-2 focus:ring-primary focus:border-transparent transition text-center"
                  placeholder="0"
                  required
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">SO'M</div>
              </div>
            </div>

            {/* 2. Advance Payment Toggle & Input */}
            <div className="pt-4 border-t border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={specifications.show_advance_input}
                    onChange={(e) => onChange({ 
                      ...specifications, 
                      show_advance_input: e.target.checked,
                      advance_payment: e.target.checked ? specifications.advance_payment : 0
                    })}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-yellow-500 transition flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> AVANS OLINDI?
                  </span>
                </label>
                
                {specifications.show_advance_input && specifications.advance_payment > 0 && (
                  <div className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {Math.round((specifications.advance_payment / (specifications.manual_price || 1)) * 100)}% To'landi
                  </div>
                )}
              </div>

              {specifications.show_advance_input && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avans Summasi</label>
                    <div className="relative">
                      <input
                        type="number"
                        autoFocus
                        value={specifications.advance_payment || ''}
                        onChange={(e) => {
                          let val = parseFloat(e.target.value) || 0;
                          const maxVal = specifications.manual_price || 0;
                          if (val > maxVal) val = maxVal;
                          onChange({ ...specifications, advance_payment: val });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-lg font-bold text-yellow-500 focus:ring-2 focus:ring-yellow-500 transition"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">SO'M</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To'lov Usuli</label>
                    <div className="flex gap-2">
                      {['cash', 'card', 'transfer'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => onChange({ ...specifications, initial_payment_method: method })}
                          className={`flex-1 py-2.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-wider ${
                            specifications.initial_payment_method === method
                              ? "bg-yellow-500 border-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                          }`}
                        >
                          {method === 'cash' ? '💸 NAQD' : method === 'card' ? '💳 PLASTIK' : '🏛 O\'TKAZMA'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Summary Footer */}
          <div className="bg-slate-950 p-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Jami To'lanishi Kerak:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-100 italic">
                  {(specifications.manual_price || 0).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-500">SO'M</span>
              </div>
            </div>

            <div className="flex gap-8 items-center">
              <div className="text-center md:text-right">
                <span className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 opacity-60">To'landi (Avans):</span>
                <span className="text-xl font-bold text-yellow-500/80">
                  {(specifications.advance_payment || 0).toLocaleString()} <span className="text-xs">so'm</span>
                </span>
              </div>
              
              <div className="h-10 w-px bg-slate-800 hidden md:block" />

              <div className="text-center md:text-right">
                <span className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Qolgan Summa:</span>
                <span className="text-2xl font-black text-primary animate-pulse-slow">
                  {(Math.max(0, (specifications.manual_price || 0) - (specifications.advance_payment || 0))).toLocaleString()} <span className="text-xs">so'm</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {validation && (
        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Material tekshiruvi amalga oshirildi</span>
          </div>
        </div>
      )}
    </div>
  )
}
