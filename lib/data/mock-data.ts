import type { Client, Order, Material, OrderStatus, ProductionStep } from "@/lib/types"

export const mockClients: Client[] = [
  {
    id: "1",
    full_name: "Akmal Karimov",
    company: "Toshkent Oziq-ovqat",
    phone: "+998901234567",
    email: "akmal@example.uz",
    created_at: "2024-01-15",
    notes: "Yaxshi mijoz",
  },
  {
    id: "2",
    full_name: "Dilnoza Raxmonova",
    company: "Samarqand Non",
    phone: "+998901234568",
    created_at: "2024-01-10",
  },
  {
    id: "3",
    full_name: "Bobur Tursunov",
    company: "Buxoro Qadoqlash",
    phone: "+998901234569",
    created_at: "2024-01-20",
  },
]

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    client_id: "1",
    client: mockClients[0],
    box_type: "Standart quti",
    dimensions: { length: 300, width: 200, height: 150 },
    paper_type: "Karton",
    paper_density: 350,
    print_colors: "4",
    print_type: "Ofset",
    lacquer_type: "Yaltiroq",
    cutting_type: "Die-cut",
    quantity: 1000,
    total_price: 5500000,
    deadline: "2024-02-01",
    status: "in_production",
    created_at: "2024-01-15",
    production_steps: [
      { id: "1", order: "ORD-001", step: "warehouse", status: "completed", completed_at: "2024-01-15", created_at: "2024-01-01" },
      { id: "2", order: "ORD-001", step: "cutting", status: "completed", completed_at: "2024-01-16", created_at: "2024-01-01" },
      { id: "3", order: "ORD-001", step: "printing", status: "in_progress", created_at: "2024-01-01" },
      { id: "4", order: "ORD-001", step: "finishing", status: "pending", created_at: "2024-01-01" },
      { id: "5", order: "ORD-001", step: "assembly", status: "pending", created_at: "2024-01-01" },
      { id: "6", order: "ORD-001", step: "qc", status: "pending", created_at: "2024-01-01" },
    ],
    order_number: "ORD-001"
  },
  {
    id: "ORD-002",
    client_id: "2",
    client: mockClients[1],
    box_type: "Non qadoqlash qutisi",
    dimensions: { length: 250, width: 180, height: 100 },
    paper_type: "Mikrogofra",
    paper_density: 300,
    print_colors: "2",
    print_type: "Fleksografiya",
    lacquer_type: "Yo'q",
    cutting_type: "Standart",
    quantity: 2000,
    total_price: 8000000,
    deadline: "2024-02-05",
    status: "approved",
    created_at: "2024-01-16",
    production_steps: [
      { id: "7", order: "ORD-002", step: "warehouse", status: "pending", created_at: "2024-01-01" },
      { id: "8", order: "ORD-002", step: "cutting", status: "pending", created_at: "2024-01-01" },
      { id: "9", order: "ORD-002", step: "printing", status: "pending", created_at: "2024-01-01" },
      { id: "10", order: "ORD-002", step: "finishing", status: "pending", created_at: "2024-01-01" },
      { id: "11", order: "ORD-002", step: "assembly", status: "pending", created_at: "2024-01-01" },
      { id: "12", order: "ORD-002", step: "qc", status: "pending", created_at: "2024-01-01" },
    ],
    order_number: "ORD-002"
  },
  {
    id: "ORD-003",
    client_id: "3",
    client: mockClients[2],
    box_type: "Premium qadoqlash",
    dimensions: { length: 400, width: 300, height: 200 },
    paper_type: "Karton",
    paper_density: 400,
    print_colors: "5",
    print_type: "Ofset",
    lacquer_type: "UV lak",
    cutting_type: "Die-cut",
    quantity: 500,
    total_price: 4500000,
    deadline: "2024-01-28",
    status: "completed",
    created_at: "2024-01-10",
    production_steps: [
      { id: "13", order: "ORD-003", step: "warehouse", status: "completed", completed_at: "2024-01-10", created_at: "2024-01-01" },
      { id: "14", order: "ORD-003", step: "cutting", status: "completed", completed_at: "2024-01-11", created_at: "2024-01-01" },
      { id: "15", order: "ORD-003", step: "printing", status: "completed", completed_at: "2024-01-13", created_at: "2024-01-01" },
      { id: "16", order: "ORD-003", step: "finishing", status: "completed", completed_at: "2024-01-14", created_at: "2024-01-01" },
      { id: "17", order: "ORD-003", step: "assembly", status: "completed", completed_at: "2024-01-15", created_at: "2024-01-01" },
      { id: "18", order: "ORD-003", step: "qc", status: "completed", completed_at: "2024-01-15", created_at: "2024-01-01" },
    ],
    order_number: "ORD-003"
  },
]

export const mockMaterials: Material[] = [
  { id: "1", name: "Karton 350g/m²", category: "Qog'oz", unit: "kg", current_stock: 2500, min_stock: 500, price_per_unit: 12000, created_at: "2024-01-01" },
  { id: "2", name: "Karton 400g/m²", category: "Qog'oz", unit: "kg", current_stock: 1800, min_stock: 500, price_per_unit: 15000, created_at: "2024-01-01" },
  { id: "3", name: "Mikrogofra E", category: "Gofra", unit: "kg", current_stock: 3200, min_stock: 1000, price_per_unit: 10000, created_at: "2024-01-01" },
  { id: "4", name: "Bo'yoq - CMYK", category: "Bo'yoq", unit: "kg", current_stock: 450, min_stock: 100, price_per_unit: 85000, created_at: "2024-01-01" },
  { id: "5", name: "UV lak", category: "Lak", unit: "litr", current_stock: 80, min_stock: 50, price_per_unit: 120000, created_at: "2024-01-01" },
  { id: "6", name: "Mat lak", category: "Lak", unit: "litr", current_stock: 120, min_stock: 50, price_per_unit: 95000, created_at: "2024-01-01" },
  { id: "7", name: "Yelim", category: "Yordamchi", unit: "kg", current_stock: 200, min_stock: 50, price_per_unit: 35000, created_at: "2024-01-01" },
]

export function getStatusBadgeColor(status: OrderStatus | string) {
  switch (status) {
    case "pending":
      return "bg-yellow-500/20 text-yellow-500"
    case "approved":
      return "bg-blue-400/20 text-blue-400"
    case "in_production":
      return "bg-blue-600/20 text-blue-600"
    case "ready":
      return "bg-green-400/20 text-green-400"
    case "delivered":
      return "bg-green-500/20 text-green-500"
    case "completed":
      return "bg-green-600/20 text-green-600"
    case "canceled":
      return "bg-red-500/20 text-red-500"
    case "problem":
      return "bg-red-600/30 text-red-600 border border-red-500/50"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

export function getStatusLabel(status: OrderStatus | string) {
  switch (status) {
    case "pending":
      return "Yangi"
    case "approved":
      return "Tasdiqlandi"
    case "in_production":
      return "Ishlab chiqarishda"
    case "ready":
      return "Tayyor (Sklad)"
    case "delivered":
      return "Topshirildi"
    case "completed":
      return "Tugallandi"
    case "canceled":
      return "Bekor qilindi"
    case "problem":
      return "Muammo / To'xtatilgan"
    default:
      return status
  }
}

export function getStepLabel(step: ProductionStep | string) {
  switch (step) {
    case "warehouse":
      return "Sklad"
    case "cutting":
      return "Kesish"
    case "printing":
      return "Chop etish"
    case "finishing":
      return "Lak qoplash"
    case "assembly":
      return "Yig'ish"
    case "qc":
      return "Sifat nazorati"
    default:
      return step
  }
}

export function formatCurrency(amount: number) {
  return (
    new Intl.NumberFormat("uz-UZ", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount) + " so'm"
  )
}
