"use client"

import { useRole, type UserRole } from "@/lib/context/role-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { uz } from "@/lib/i18n/uz"

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "admin", label: uz.common.admin, description: "Barcha tizimga kirish" },
  { value: "sales_manager", label: uz.common.sales_manager, description: "CRM va Kosmeta" },
  {
    value: "production_manager",
    label: uz.common.production_manager,
    description: "Ish Buyurtmalari va Operatsiyalar",
  },
  { value: "warehouse_manager", label: uz.common.warehouse_manager, description: "Ombor Boshqaruvi" },
  { value: "operator_print", label: uz.common.operator_print, description: "Chop Operatsiyalari" },
  { value: "operator_cutting", label: uz.common.operator_cutting, description: "Kesish Operatsiyalari" },
  { value: "operator_packing", label: uz.common.operator_packing, description: "Qadoqlash Operatsiyalari" },
  { value: "quality_controller", label: uz.common.quality_controller, description: "Sifat Nazorati" },
  { value: "finance_manager", label: uz.common.finance_manager, description: "Schyotlar va To'lovlar" },
  { value: "shop_floor_supervisor", label: uz.common.shop_floor_supervisor, description: "Цех Boshqaruvi" },
  { value: "customer_service", label: uz.common.customer_service, description: "Mijozlarga Xizmat" },
]

export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useRole()
  const currentRoleInfo = ROLES.find((r) => r.value === currentRole)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent border-border hover:bg-sidebar-accent">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          {currentRoleInfo?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Rolni O'zgartirish</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => setCurrentRole(role.value)}
            className="flex flex-col gap-1 cursor-pointer"
          >
            <div className="font-medium text-sm">{role.label}</div>
            <div className="text-xs text-muted-foreground">{role.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
