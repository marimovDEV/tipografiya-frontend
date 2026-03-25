import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStepLabelUz(step: string) {
    const map: Record<string, string> = {
        'sklad': 'Omborxona (Kirim)',
        'queue': 'Navbatda',
        'prepress': 'Pre-press (Dizayn)',
        'printing_internal': 'Bosma (Vkladka)',
        'printing_cover': 'Bosma (Muqova)',
        'folding': 'Taxlash (Faltsovka)',
        'assembly': "Yig'ish (Sbor)",
        'binding': 'Bog\'lash (Termokley/Sim)',
        'trimming': 'Kesish (Obrezka)',
        'printing': 'Chop etish',
        'gluing': 'Yelimlash',
        'drying': 'Quritish',
        'packaging': 'Sifat nazorati',
        'packing': 'Qadoqlash',
        'ready': 'Tayyor (Ombor)',
        'tayyor_sklad': 'Tayyor (Sklad)'
    }
    if (!step) return 'Noma\'lum'
    const key = step.toLowerCase()
    return map[key] || step.charAt(0).toUpperCase() + step.slice(1)
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
