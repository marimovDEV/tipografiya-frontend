export type UserRole =
  | "admin"
  | "project_manager"
  | "warehouse"
  | "cutter"
  | "printer"
  | "finishing"
  | "qc"
  | "qc"
  | "qc"
  | "accountant"
  | "sales_manager"
  | "production_manager"
  | "warehouse_manager"
  | "operator_print"
  | "operator_cutting"
  | "operator_packing"
  | "quality_controller"
  | "finance_manager"
  | "shop_floor_supervisor"
  | "customer_service"

export type OrderStatus = "pending" | "approved" | "in_production" | "ready" | "delivered" | "completed" | "canceled"
export type PaymentStatus = "unpaid" | "partially_paid" | "fully_paid"

export type ProductionStep = "warehouse" | "cutting" | "printing" | "varnishing" | "finishing" | "assembly" | "qc"
export type StepStatus = "pending" | "in_progress" | "completed" | "problem"

export interface User {
  id: number | string
  username: string
  first_name?: string
  last_name?: string
  email: string
  role: UserRole
  avatar_url?: string
  mode?: 'admin' | 'manager' | 'worker' | 'client'
}

export interface Profile {
  id: number | string
  email: string
  full_name?: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Client {
  id: number | string
  full_name: string
  company?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  status?: 'new' | 'regular' | 'vip' | 'blacklist'
  balance?: number
  is_active?: boolean
  telegram_id?: string
  created_by?: number | string
  created_at: string
}

export interface Supplier {
  id: number | string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  created_at: string
}

export interface MaterialBatch {
  id: number | string
  material: number | string
  material_name?: string
  supplier?: number | string
  supplier_name?: string
  batch_number?: string
  initial_quantity: number
  current_quantity: number
  cost_per_unit: number
  received_date: string
  expiry_date?: string
  is_active: boolean
}

export interface Material {
  id: number | string
  name: string
  sku?: string
  category?: string
  unit?: string
  current_stock: number
  min_stock: number
  price_per_unit: number
  batches?: MaterialBatch[]
  created_at: string
}

export interface WasteMaterial {
  id: number | string
  material: number | string
  material_name?: string
  material_unit?: string
  quantity: number
  reason: string
  date: string
}

export interface Product {
  id: number | string
  name: string
  description?: string
  box_type?: string
  default_dimensions?: {
    length: number
    width: number
    height: number
  }
  created_at: string
}

export interface Order {
  id: number | string
  client_id: number | string
  order_number: string
  status: OrderStatus
  priority?: "urgent" | "high" | "normal" | "low"

  // Specs
  box_type?: string
  dimensions?: {
    length: number
    width: number
    height: number
  }
  paper_type?: string
  paper_density?: number
  print_colors?: string // Changed to string to support "4+4"
  print_type?: string
  lacquer_type?: string
  cutting_type?: string
  additional_processing?: string

  paper_width?: number
  paper_height?: number

  quantity: number
  price_per_unit?: number
  total_price?: number
  advance_payment?: number
  payment_status?: PaymentStatus
  initial_payment_method?: string
  total_cost?: number
  profit?: number
  deadline?: string

  // Book Specific
  book_name?: string
  page_count?: number
  cover_type?: string

  mockup_url?: string
  notes?: string
  responsible_designer?: number | string

  created_by?: number | string
  created_at: string
  updated_at?: string

  // Relations (joined)
  client?: Client
  production_steps?: ProductionStepItem[]
  overall_progress?: number
  is_delayed?: boolean
}

export interface ProductionStepItem {
  id: number | string
  order: number | string
  step: ProductionStep
  status: StepStatus
  assigned_to?: number | string
  assigned_to_name?: string
  started_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  progress_percent?: number
  produced_qty?: number
  defect_qty?: number
  input_qty?: number
}

export interface Invoice {
  id: number | string
  order_id: number | string
  invoice_number?: string
  amount: number
  status: string // unpaid, paid, etc.
  due_date?: string
  created_at: string

  client_name?: string
  order_number?: string
}

export interface WarehouseLog {
  id: number | string
  material?: number | string
  material_name?: string
  material_batch?: number | string
  batch_number?: string
  product?: number | string
  product_name?: string
  change_amount: number
  type: 'in' | 'out' | 'audit'
  order?: number | string
  user?: number | string
  user_name?: string
  notes?: string
  created_at: string
}


// Form Data Helpers
export interface OrderFormData {
  client_id?: number | string
  newClient?: Partial<Client>
  box_type: string
  dimensions: { length: number; width: number; height: number }
  paper_type: string
  paper_density: number
  print_colors: number
  print_type: string
  lacquer_type: string
  cutting_type: string
  additional_processing: string
  quantity: number
  deadline?: Date
  book_name?: string
  page_count?: number
  cover_type?: string
}

export interface PricingSettings {
  paper_price_per_kg: number
  ink_price_per_kg: number
  lacquer_price_per_kg: number
  plate_cost: number
  setup_cost: number
  run_cost_per_box: number
  profit_margin_percent: number
  exchange_rate: number

  // Default Assignees
  default_warehouse_user?: number | string
  default_printer_user?: number | string
  default_cutter_user?: number | string
  default_finisher_user?: number | string
  default_qc_user?: number | string
}

// PrintERP Phase 1-3 Types

export type ProductCategory =
  | "medicine_box_1layer"
  | "pizza_box"
  | "box_2layer"
  | "box_3layer"
  | "cookie_box"
  | "gift_bag"
  | "food_box"
  | "book"
  | "magazine"
  | "brochure"
  | "catalog"
  | "booklet"
  | "custom"

export type MaterialType = "paper" | "ink" | "lacquer" | "adhesive"
export type QualityStatus = "ok" | "blocked" | "quarantine"
export type WorkerAction = "start" | "pause" | "resume" | "finish"

export interface ProductTemplate {
  id: string
  name: string
  category: ProductCategory
  category_display?: string
  layer_count: number
  default_waste_percent: number
  description?: string
  default_width?: number
  default_height?: number
  default_depth?: number
  
  // Book/Magazine specific
  page_count?: number
  format?: string
  binding_type?: string
  paper_type?: string
  paper_weight?: number
  cover_weight?: number
  print_type?: string
  lamination?: string
  
  // Professional Layout Specs
  bleed_mm?: number
  margin_top_mm?: number
  margin_bottom_mm?: number
  margin_inner_mm?: number
  margin_outer_mm?: number
  column_count?: number
  safe_area_padding_mm?: number
  
  is_active: boolean
  created_at: string
  updated_at: string

  // Relations
  layers?: ProductTemplateLayer[]
  routing_steps?: ProductTemplateRouting[]
  normatives?: MaterialNormative[]
}

export interface ProductTemplateLayer {
  id: string
  template: string
  layer_number: number
  material_category?: string
  min_density?: number
  max_density?: number
  waste_percent_override?: number
  compatible_materials: string[] // Material IDs
  created_at: string
}

export interface ProductTemplateRouting {
  id: string
  template: string
  sequence: number
  step_name: string
  required_machine_type?: string
  estimated_time_per_unit: number
  setup_time_minutes: number
  qc_checkpoint: boolean
  is_optional: boolean
  created_at: string
}

export interface MaterialNormative {
  id: string
  product_template: string
  material_type: MaterialType
  color_count?: number
  consumption_per_unit: number
  unit_of_measure: string
  waste_percent?: number
  effective_from?: string
  effective_to?: string
  notes?: string
  created_at: string
}

export interface WorkerTimeLog {
  id: string
  production_step: string
  worker: string
  worker_name?: string
  action: WorkerAction
  timestamp: string
  pause_reason?: string
  notes?: string
  location?: string
  created_at: string
}

export interface MaterialBatchEnhanced extends MaterialBatch {
  quality_status: QualityStatus
  block_reason?: string
  blocked_at?: string
  blocked_by?: string

  blocked_by_name?: string
  days_until_expiry?: number
  unit?: string
}

export interface ProductionStepEnhanced extends ProductionStepItem {
  machine?: string
  machine_name?: string
  depends_on_step?: string
  estimated_start?: string
  estimated_end?: string
  estimated_duration_minutes?: number
  actual_duration_minutes?: number
  priority: number
  queue_position?: number
}

// API Response Types

export interface MaterialConsumption {
  paper?: {
    area_per_unit_m2: number
    base_consumption_m2: number
    waste_percent: number
    waste_amount_m2: number
    total_consumption_m2: number
  }
  ink?: {
    color_count: number
    consumption_per_unit_g: number
    base_consumption_g: number
    waste_percent: number
    total_consumption_g: number
  }
  lacquer?: {
    coverage_area_per_unit_m2: number
    total_area_m2: number
    consumption_per_m2_ml: number
    total_consumption_ml: number
    total_consumption_L: number
  }
  adhesive?: {
    gluing_length_per_unit_cm: number
    total_length_cm: number
    consumption_per_cm_g: number
    total_consumption_g: number
  }
}

export interface MaterialValidationResult {
  is_valid: boolean
  missing_materials: Array<{
    type: string
    needed: number
    available: number
    shortage: number
    unit: string
  }>
  available_materials: Array<{
    type: string
    needed: number
    available: number
    unit: string
  }>
  suggestions: Record<string, any[]>
  consumption: MaterialConsumption
  message: string
}

export interface MachineQueue {
  id: string
  order_number: string
  client_name: string
  step: string
  status: string
  priority: number
  queue_position?: number
  assigned_to?: string
  estimated_start?: string
  estimated_end?: string
  estimated_duration_minutes?: number
  is_ready: boolean
  depends_on?: string
}

export interface WarehouseStatusReport {
  summary: {
    total_materials: number
    total_batches: number
    low_stock_count: number
    expiring_soon_count: number
    blocked_count: number
    quarantine_count: number
    total_stock_value: number
  }
  alerts: {
    critical: number
    warning: number
  }
  generated_at: string
}

export interface ProductionAnalytics {
  total_pending: number
  total_in_progress: number
  total_completed_today: number
  late_steps_count: number
  average_duration_minutes: number
  timestamp: string
}
