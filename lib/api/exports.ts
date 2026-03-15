// frontend/lib/api/exports.ts
/**
 * Excel Export API Client
 * Functions for downloading Excel reports
 */

export async function downloadDailyProductionExcel(date: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exports/daily-production/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ date })
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kunlik_ishlab_chiqarish_${date}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

export async function downloadWorkerEfficiencyExcel(startDate: string, endDate: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exports/worker-efficiency/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xodimlar_samaradorligi_${startDate}_to_${endDate}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

export async function downloadWarehouseStatusExcel() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exports/warehouse-status/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
        }
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().split('T')[0]
    a.download = `sklad_holati_${date}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

export async function downloadQCStatisticsExcel(startDate: string, endDate: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exports/qc-statistics/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
    })

    if (!response.ok) {
        throw new Error('Export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qc_statistikasi_${startDate}_to_${endDate}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}
