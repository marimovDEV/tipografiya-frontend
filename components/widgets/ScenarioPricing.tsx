/**
 * Scenario Pricing Component
 * Allows users to select pricing scenario and see real-time price calculation
 */

'use client'

import { useEffect, useState } from 'react'
import { Check, Clock, Zap, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface Scenario {
    name: string
    multiplier: number
    delivery_days: string
    description: string
}

interface ScenarioPricingProps {
    basePrice?: number
    onScenarioChange?: (scenario: string, multiplier: number, finalPrice: number) => void
}

export default function ScenarioPricing({ basePrice = 0, onScenarioChange }: ScenarioPricingProps) {
    const [scenarios, setScenarios] = useState<Scenario[]>([])
    const [selectedScenario, setSelectedScenario] = useState<string>('Standard')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchScenarios()
    }, [])

    useEffect(() => {
        if (selectedScenario && scenarios.length > 0) {
            const scenario = scenarios.find(s => s.name === selectedScenario)
            if (scenario && onScenarioChange) {
                const finalPrice = basePrice * scenario.multiplier
                onScenarioChange(selectedScenario, scenario.multiplier, finalPrice)
            }
        }
    }, [selectedScenario, basePrice, scenarios, onScenarioChange])

    const fetchScenarios = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/pricing/scenarios/', {
                headers: { 'Authorization': `Token ${token}` }
            })

            const data = await response.json()
            setScenarios(data.scenarios || [])

        } catch (error) {
            console.error('Failed to fetch scenarios:', error)
            // Fallback to default scenarios
            setScenarios([
                { name: 'Standard', multiplier: 1.0, delivery_days: '5-7 kun', description: 'Normal yetkazib berish' },
                { name: 'Express', multiplier: 1.5, delivery_days: '2-3 kun', description: 'Tezkor ishlab chiqarish' },
                { name: 'Night', multiplier: 1.3, delivery_days: '3-4 kun', description: 'Tungi smena' },
                { name: 'Economy', multiplier: 0.9, delivery_days: '10+ kun', description: 'Uzoqroq muddat' }
            ])
        } finally {
            setLoading(false)
        }
    }

    const getScenarioIcon = (name: string) => {
        switch (name) {
            case 'Express': return <Zap className="w-5 h-5 text-orange-500" />
            case 'Night': return <Clock className="w-5 h-5 text-blue-500" />
            case 'Economy': return <TrendingDown className="w-5 h-5 text-green-500" />
            default: return <Check className="w-5 h-5 text-gray-500" />
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' UZS'
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Select Pricing Scenario</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const selectedScenarioData = scenarios.find(s => s.name === selectedScenario)
    const finalPrice = selectedScenarioData ? basePrice * selectedScenarioData.multiplier : basePrice

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pricing Scenario</CardTitle>
                <CardDescription>Choose delivery speed and pricing</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedScenario} onValueChange={setSelectedScenario}>
                    <div className="space-y-3">
                        {scenarios.map((scenario) => {
                            const scenarioPrice = basePrice * scenario.multiplier
                            const isSelected = selectedScenario === scenario.name

                            return (
                                <Label
                                    key={scenario.name}
                                    htmlFor={scenario.name}
                                    className={`
                    flex items-center gap-4 p-4 border rounded-lg cursor-pointer
                    transition-colors
                    ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'}
                  `}
                                >
                                    <RadioGroupItem value={scenario.name} id={scenario.name} />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getScenarioIcon(scenario.name)}
                                            <span className="font-semibold">{scenario.name}</span>
                                            {scenario.multiplier !== 1 && (
                                                <span className={`text-xs px-2 py-0.5 rounded ${scenario.multiplier > 1
                                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                                    }`}>
                                                    {scenario.multiplier > 1 ? '+' : ''}{((scenario.multiplier - 1) * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-sm text-muted-foreground mb-1">
                                            {scenario.description}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{scenario.delivery_days}</span>
                                            </div>
                                            {basePrice > 0 && (
                                                <div className="font-semibold text-primary">
                                                    {formatCurrency(scenarioPrice)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Label>
                            )
                        })}
                    </div>
                </RadioGroup>

                {/* Price Summary */}
                {basePrice > 0 && selectedScenarioData && (
                    <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Base Price:</span>
                            <span>{formatCurrency(basePrice)}</span>
                        </div>
                        {selectedScenarioData.multiplier !== 1 && (
                            <div className="flex justify-between text-sm">
                                <span>Multiplier:</span>
                                <span>{selectedScenarioData.multiplier}x</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Final Price:</span>
                            <span className="text-primary">{formatCurrency(finalPrice)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
