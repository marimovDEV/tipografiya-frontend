import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusPillProps {
    status: string;
    className?: string;
    children?: React.ReactNode;
}

const statusStyles: Record<string, string> = {
    // Positive / Completed
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    ready: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    delivered: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    paid: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",

    // In Progress / Active
    in_production: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    approved: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",

    // Warning / Pending
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",

    // Error / Cancelled
    canceled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    error: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",

    // Neutral
    default: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, className, children }) => {
    const normalizedStatus = status.toLowerCase().replace(" ", "_");
    const style = statusStyles[normalizedStatus] || statusStyles.default;

    return (
        <Badge
            variant="outline"
            className={cn("px-3 py-1 text-[10px] uppercase font-black tracking-wider border rounded-full shadow-none", style, className)}
        >
            {children || status}
        </Badge>
    )
}
