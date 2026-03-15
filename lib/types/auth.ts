export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role_id: string | null
  role?: {
    id: string
    name: string
    description: string
  }
  is_active: boolean
  language: string
  created_at: string
  updated_at: string
  username?: string
}

export type UserRole =
  | "admin"
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

export interface PermissionCheck {
  canViewCustomers: boolean
  canCreateOrders: boolean
  canManageInventory: boolean
  canManageProduction: boolean
  canQualityControl: boolean
  canManageFinance: boolean
  canViewReports: boolean
}
