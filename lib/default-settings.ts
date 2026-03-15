/**
 * Default settings configuration for PrintERP
 * Industry-standard values for printing business
 */

export const DEFAULT_SETTINGS = {
    // Material prices (so'm per kg)
    paper_price_per_kg: 15000,
    ink_price_per_kg: 120000,
    lacquer_price_per_kg: 80000,

    // Waste percentages (%)
    waste_percentage_paper: 5,
    waste_percentage_ink: 10,
    waste_percentage_lacquer: 8,

    // Order pricing configuration
    base_price_per_sqm: 50,
    color_markup_percent: 10,
    lacquer_markup_percent: 15,
    gluing_markup_percent: 10,

    // Profit margins by customer type (%)
    pricing_profiles: {
        VIP: 15,
        Standard: 20,
        Wholesale: 10,
    },

    // Currency
    exchange_rate: 12800,
} as const

export type SettingsConfig = typeof DEFAULT_SETTINGS
