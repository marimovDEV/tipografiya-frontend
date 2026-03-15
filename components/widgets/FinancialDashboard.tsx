/**
 * Financial Dashboard Widget
 * Real-time financial overview for admins
 */

'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FinancialData {
    period: string
    gross_margin: {
        total_revenue: number
        total_cost: number
        gross_profit: number
        gross_margin_percent: number
        order_count: number
    }
    balance_sheet_summary: {
        total_assets: number
        total_liabilities: number
        total_equity: number
    }
    cash_flow: {
        income: number
        expenses: number
        net: number
    }
    top_profitable_orders: Array<{
        order_number: string
        client: string
        revenue: number
        profit: number
    }>
}

export default function FinancialDashboard() {
    const [data, setData] = useState<FinancialData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchFinancialData()

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchFinancialData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchFinancialData = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/dashboard/financial/?days=30', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            })

            if (!response.ok) throw new Error('Failed to fetch financial data')

            const result = await response.json()
            setData(result)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-muted rounded"></div>
                        <div className="h-20 bg-muted rounded"></div>
                        <div className="h-20 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error || 'No data available'}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { gross_margin, balance_sheet_summary, cash_flow, top_profitable_orders } = data

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' UZS'
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Financial Dashboard</h2>
                <p className="text-muted-foreground">{data.period}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gross Margin */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Gross Margin</CardDescription>
                        <CardTitle className="text-3xl">
                            {gross_margin.gross_margin_percent.toFixed(1)}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Profit: {formatCurrency(gross_margin.gross_profit)}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            {gross_margin.gross_margin_percent > 35 ? (
                                <>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-xs text-green-500">Excellent</span>
                                </>
                            ) : gross_margin.gross_margin_percent > 25 ? (
                                <>
                                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs text-yellow-500">Good</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                    <span className="text-xs text-red-500">Low</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl">
                            {formatCurrency(gross_margin.total_revenue)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            {gross_margin.order_count} orders
                        </div>
                    </CardContent>
                </Card>

                {/* Cash Flow */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Net Cash Flow</CardDescription>
                        <CardTitle className={`text-2xl ${cash_flow.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(cash_flow.net)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            In: {formatCurrency(cash_flow.income)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Out: {formatCurrency(cash_flow.expenses)}
                        </div>
                    </CardContent>
                </Card>

                {/* Total Assets */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Assets</CardDescription>
                        <CardTitle className="text-2xl">
                            {formatCurrency(balance_sheet_summary.total_assets)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            Equity: {formatCurrency(balance_sheet_summary.total_equity)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Profitable Orders */}
            {top_profitable_orders && top_profitable_orders.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Profitable Orders</CardTitle>
                        <CardDescription>Most profitable orders this period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {top_profitable_orders.map((order, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">#{order.order_number}</div>
                                        <div className="text-sm text-muted-foreground">{order.client}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-green-500">
                                            +{formatCurrency(order.profit)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatCurrency(order.revenue)} revenue
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
