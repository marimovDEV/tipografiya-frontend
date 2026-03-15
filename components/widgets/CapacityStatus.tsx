/**
 * Capacity Status Widget
 * Shows production capacity and bottleneck warnings
 */

'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface CapacityData {
    active_orders: number
    capacity_percentage: number
    status: 'low' | 'medium' | 'high'
    estimated_queue_days: number
    recommendation: string
}

interface Bottleneck {
    stage: string
    severity: number
    queue_length: number
    avg_wait_time: number
    workers_assigned: number
    recommendation: string
}

export default function CapacityStatus() {
    const [capacity, setCapacity] = useState<CapacityData | null>(null)
    const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()

        // Auto-refresh every 2 minutes
        const interval = setInterval(fetchData, 2 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token')

            // Fetch capacity
            const capacityRes = await fetch('http://localhost:8000/api/production/capacity/', {
                headers: { 'Authorization': `Token ${token}` }
            })
            const capacityData = await capacityRes.json()
            setCapacity(capacityData)

            // Fetch bottlenecks
            const bottleneckRes = await fetch('http://localhost:8000/api/production/bottlenecks/', {
                headers: { 'Authorization': `Token ${token}` }
            })
            const bottleneckData = await bottleneckRes.json()
            setBottlenecks(bottleneckData.bottlenecks || [])

        } catch (error) {
            console.error('Failed to fetch capacity data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Production Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!capacity) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'high': return 'text-red-500'
            case 'medium': return 'text-yellow-500'
            case 'low': return 'text-green-500'
            default: return 'text-gray-500'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />
            case 'medium': return <Activity className="w-5 h-5 text-yellow-500" />
            case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />
            default: return null
        }
    }

    return (
        <div className="space-y-4">
            {/* Capacity Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Production Capacity</CardTitle>
                            <CardDescription>Current workload status</CardDescription>
                        </div>
                        {getStatusIcon(capacity.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Capacity Usage</span>
                            <span className={`text-sm font-bold ${getStatusColor(capacity.status)}`}>
                                {capacity.capacity_percentage}%
                            </span>
                        </div>
                        <Progress value={capacity.capacity_percentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Active Orders</div>
                            <div className="text-2xl font-bold">{capacity.active_orders}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Queue Days</div>
                            <div className="text-2xl font-bold">{capacity.estimated_queue_days}</div>
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-1">💡 Recommendation</div>
                        <div className="text-sm text-muted-foreground">
                            {capacity.recommendation}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottlenecks */}
            {bottlenecks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Production Bottlenecks ({bottlenecks.length})
                        </CardTitle>
                        <CardDescription>Stages requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bottlenecks.map((bottleneck, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium capitalize">{bottleneck.stage}</div>
                                        <div className={`text-sm font-bold ${bottleneck.severity > 0.8 ? 'text-red-500' :
                                                bottleneck.severity > 0.6 ? 'text-yellow-500' :
                                                    'text-orange-500'
                                            }`}>
                                            {(bottleneck.severity * 100).toFixed(0)}% severity
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Queue</div>
                                            <div className="font-medium">{bottleneck.queue_length} orders</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Wait Time</div>
                                            <div className="font-medium">{bottleneck.avg_wait_time.toFixed(1)}h</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Workers</div>
                                            <div className="font-medium">{bottleneck.workers_assigned}</div>
                                        </div>
                                    </div>

                                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                                        <strong>Action:</strong> {bottleneck.recommendation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {bottlenecks.length === 0 && (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <div className="font-medium">No Bottlenecks Detected</div>
                            <div className="text-sm text-muted-foreground">Production is running smoothly</div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
