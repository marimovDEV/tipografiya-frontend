// Pricing API client
import { fetchWithAuth } from "../api-client"

export interface PricingConfig {
    base_price_per_sqm: number
    color_markup_percent: number
    lacquer_markup_percent: number
    gluing_markup_percent: number
}

// For now, use local storage until backend adds fields
const DEFAULT_PRICING: PricingConfig = {
    base_price_per_sqm: 50,
    color_markup_percent: 10,
    lacquer_markup_percent: 15,
    gluing_markup_percent: 10,
}

export async function getPricingConfig(): Promise<PricingConfig> {
    try {
        // Try to get from localStorage first
        const stored = localStorage.getItem("pricing_config")
        if (stored) {
            return JSON.parse(stored)
        }

        // Return defaults
        return DEFAULT_PRICING
    } catch (error) {
        console.error("Error loading pricing config:", error)
        return DEFAULT_PRICING
    }
}

export async function savePricingConfig(config: PricingConfig): Promise<void> {
    try {
        // Save to localStorage
        localStorage.setItem("pricing_config", JSON.stringify(config))
    } catch (error) {
        console.error("Error saving pricing config:", error)
        throw error
    }
}

export function calculateOrderPrice(params: {
    width_cm: number
    height_cm: number
    quantity: number
    color_count: number
    has_lacquer: boolean
    has_gluing: boolean
    pricing?: PricingConfig
}) {
    const pricing = params.pricing || DEFAULT_PRICING

    const area = (params.width_cm * params.height_cm) / 10000 // m²
    const basePrice = area * params.quantity * pricing.base_price_per_sqm
    const colorMultiplier = 1 + (params.color_count * pricing.color_markup_percent / 100)
    const lacquerPrice = params.has_lacquer ? basePrice * (pricing.lacquer_markup_percent / 100) : 0
    const gluingPrice = params.has_gluing ? basePrice * (pricing.gluing_markup_percent / 100) : 0

    const subtotal = basePrice * colorMultiplier
    const total = subtotal + lacquerPrice + gluingPrice

    return {
        basePrice,
        colorMarkup: subtotal - basePrice,
        lacquerPrice,
        gluingPrice,
        subtotal,
        total,
        perUnit: total / params.quantity
    }
}
