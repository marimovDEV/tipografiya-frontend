/**
 * Mode Configuration
 * Defines UI modes for different user roles
 */

export type UserMode = 'admin' | 'manager' | 'worker' | 'client'

export type UserRole =
    | 'admin'
    | 'project_manager'
    | 'warehouse'
    | 'printer'
    | 'cutter'
    | 'finishing'
    | 'qc'
    | 'client'
    | 'accountant'
    | 'sales_manager'
    | 'production_manager'
    | 'warehouse_manager'
    | 'operator_print'
    | 'operator_cutting'
    | 'operator_packing'
    | 'quality_controller'
    | 'finance_manager'
    | 'shop_floor_supervisor'
    | 'customer_service'

export interface ModeConfig {
    theme: 'dark' | 'light' | 'high-contrast' | 'minimal'
    features: string[]
    dashboard: 'comprehensive' | 'production-focused' | 'task-list' | 'order-status'
    touchOptimized?: boolean
    simplifiedUI?: boolean
}

export const MODE_CONFIGS: Record<UserMode, ModeConfig> = {
    admin: {
        theme: 'dark',
        features: [
            'all-orders',
            'all-clients',
            'analytics',
            'financial',
            'production',
            'warehouse',
            'settings',
            'users',
            'automation',
            'kpi',
            'accounting'
        ],
        dashboard: 'comprehensive'
    },

    manager: {
        theme: 'dark',
        features: [
            'orders',
            'production',
            'clients',
            'reports',
            'assign-workers',
            'bottleneck-monitor',
            'capacity-status'
        ],
        dashboard: 'production-focused'
    },

    worker: {
        theme: 'dark',
        features: [
            'my-tasks',
            'simple-status-update',
            'profile'
        ],
        dashboard: 'task-list',
        touchOptimized: true,
        simplifiedUI: true
    },

    client: {
        theme: 'dark',
        features: [
            'my-orders',
            'order-tracking',
            'new-order'
        ],
        dashboard: 'order-status',
        simplifiedUI: true
    }
}

/**
 * Map user role to UI mode
 */
export function getUserMode(role: UserRole): UserMode {
    const roleToMode: Record<UserRole, UserMode> = {
        'admin': 'admin',
        'project_manager': 'admin',
        'warehouse': 'worker',
        'printer': 'worker',
        'cutter': 'worker',
        'finishing': 'worker',
        'qc': 'worker',
        'client': 'client',
        'accountant': 'admin',
        'sales_manager': 'admin',
        'production_manager': 'admin',
        'warehouse_manager': 'admin',
        'finance_manager': 'admin',
        'shop_floor_supervisor': 'admin',
        'customer_service': 'admin',
        'operator_print': 'worker',
        'operator_cutting': 'worker',
        'operator_packing': 'worker',
        'quality_controller': 'worker'
    }

    return roleToMode[role] || 'worker'
}

/**
 * Get mode configuration
 */
export function getModeConfig(mode: UserMode): ModeConfig {
    return MODE_CONFIGS[mode]
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(mode: UserMode, feature: string): boolean {
    const config = getModeConfig(mode)
    return config.features.includes(feature) || config.features.includes('all-orders')
}

/**
 * Get theme class for mode
 */
export function getThemeClass(mode: UserMode): string {
    const config = getModeConfig(mode)
    const themeClasses = {
        'dark': 'dark',
        'light': 'theme-light',
        'high-contrast': 'theme-high-contrast',
        'minimal': 'theme-minimal'
    }
    return themeClasses[config.theme] || 'dark'
}
