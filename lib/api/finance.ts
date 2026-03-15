import { fetchWithAuth } from "../api-client"

const API_BASE = "/api/finance"

export interface MonthlyPlan {
    month: number
    year: number
    plan_amount: number
    completed: number
    remaining: number
    progress: number
}

export async function getMonthlyPlan(month?: number, year?: number): Promise<MonthlyPlan> {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    
    const queryString = params.toString() ? `?${params.toString()}` : ""
    const response = await fetchWithAuth(`${API_BASE}/monthly-plan/${queryString}`)
    
    if (!response.ok) {
        throw new Error("Failed to fetch monthly plan")
    }
    
    return response.json()
}

export async function updateMonthlyPlan(planAmount: number, month?: number, year?: number): Promise<{
    status: string
    plan_amount: number
    month: number
    year: number
}> {
    const response = await fetchWithAuth(`${API_BASE}/monthly-plan/`, {
        method: "POST",
        body: JSON.stringify({
            plan_amount: planAmount,
            month,
            year
        })
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Failed to update monthly plan")
    }

    return response.json()
}
