"use client"

import { useEffect, useRef } from "react"
import { type ProductTemplate } from "@/lib/types"

interface VisualCanvasProps {
    widthCm: number // cm
    heightCm: number // cm
    // Phase 5: Vector Support
    svgPath?: string | null
    svgViewBox?: string | null

    // Phase 7: Nesting
    nestingData?: {
        total_items: number
        cols: number
        rows: number
        waste_percent: number
        sheet_w: number
        sheet_h: number
        rotated: boolean
    } | null
    // The following props were not in the provided snippet but were in the original code or implied by the instruction's destructuring.
    // Assuming they should be kept or added to the interface if they are not always defaulted.
    template?: ProductTemplate | null // Original code had this, keeping it as optional now
    className?: string
    lengthCm?: number
    safeZoneMargin?: number
    bleedMargin?: number
    showDimensions?: boolean
}

export function VisualCanvas({
    widthCm,
    heightCm,
    lengthCm = 0,
    safeZoneMargin = 0.3,
    bleedMargin = 0.3,
    showDimensions = true,
    svgPath,
    svgViewBox,
    nestingData,
    template, // Kept from original, assuming it's still relevant
    className = ""
}: VisualCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Canvas Drawing Logic (Fallback or Simple Items)
    useEffect(() => {
        if (svgPath || nestingData) return; // Skip canvas drawing if SVG or Nesting is present

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!widthCm || !heightCm) return

        // Configuration
        const padding = 60 // px padding around the drawing
        const bleedMm = 3 // 3mm bleed
        const safeZoneMm = 3 // 3mm safe zone

        // Calculate scale to fit
        // Available space
        const availW = canvas.width - (padding * 2)
        const availH = canvas.height - (padding * 2)

        // Scale factor (px per cm)
        const scaleW = availW / widthCm
        const scaleH = availH / heightCm
        const scale = Math.min(scaleW, scaleH)

        // Center the drawing
        const drawW = widthCm * scale
        const drawH = heightCm * scale
        const startX = (canvas.width - drawW) / 2
        const startY = (canvas.height - drawH) / 2

        // Helper to convert mm to px
        const mmToPx = (mm: number) => (mm / 10) * scale

        // 1. Draw Bleed Area (Red Dotted)
        // Bleed adds extra size outside the cut line
        const bleedPx = mmToPx(bleedMm)
        ctx.beginPath()
        ctx.strokeStyle = "#ef4444" // red-500
        ctx.setLineDash([5, 5])
        ctx.lineWidth = 1
        ctx.rect(
            startX - bleedPx,
            startY - bleedPx,
            drawW + (bleedPx * 2),
            drawH + (bleedPx * 2)
        )
        ctx.stroke()

        // 2. Draw Cut Line (Solid Black)
        ctx.beginPath()
        ctx.strokeStyle = "#000000"
        ctx.setLineDash([])
        ctx.lineWidth = 2
        ctx.rect(startX, startY, drawW, drawH)
        ctx.stroke()

        // 3. Draw Safe Zone (Green Dotted)
        // Safe zone is inside the cut line
        const safePx = mmToPx(safeZoneMm)
        ctx.beginPath()
        ctx.strokeStyle = "#22c55e" // green-500
        ctx.setLineDash([3, 3])
        ctx.lineWidth = 1
        ctx.rect(
            startX + safePx,
            startY + safePx,
            drawW - (safePx * 2),
            drawH - (safePx * 2)
        )
        ctx.stroke()

        // 4. Draw Dimensions
        ctx.fillStyle = "#64748b" // slate-500
        ctx.font = "12px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Width Label
        ctx.fillText(`${widthCm} cm`, startX + (drawW / 2), startY - 20)

        // Height Label
        // Save context to rotate text
        ctx.save()
        ctx.translate(startX - 20, startY + (drawH / 2))
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${heightCm} cm`, 0, 0)
        ctx.restore()

        // 5. Draw Legend
        const legendY = canvas.height - 30
        ctx.font = "10px Inter, sans-serif"

        // Cut Line Legend
        ctx.beginPath()
        ctx.strokeStyle = "#000000"
        ctx.setLineDash([])
        ctx.moveTo(20, legendY)
        ctx.lineTo(40, legendY)
        ctx.stroke()
        ctx.textAlign = "left"
        ctx.fillStyle = "#94a3b8"
        ctx.fillText("Cut Line", 45, legendY)

        // Bleed Legend
        ctx.beginPath()
        ctx.strokeStyle = "#ef4444"
        ctx.setLineDash([5, 5])
        ctx.moveTo(100, legendY)
        ctx.lineTo(120, legendY)
        ctx.stroke()
        ctx.fillText("Bleed (+3mm)", 125, legendY)

        // Safe Zone Legend
        ctx.beginPath()
        ctx.strokeStyle = "#22c55e"
        ctx.setLineDash([3, 3])
        ctx.moveTo(200, legendY)
        ctx.lineTo(220, legendY)
        ctx.stroke()
        ctx.fillText("Safe Zone (-3mm)", 225, legendY)

    }, [widthCm, heightCm, template, svgPath, nestingData]) // Added svgPath and nestingData to dependencies

    return (
        <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
            <div className="flex-1 flex items-center justify-center p-8 relative">

                {nestingData ? (
                    // Phase 7: Nesting Layout Visualization (Detailed SVG)
                    <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-100/50">
                        {(() => {
                            // Constants matching Backend (nesting_service.py)
                            const MG_SIDE = 0.5
                            const MG_GRIPPER = 1.5
                            const GAP = 0.3

                            // Dimensions
                            const sheetW = nestingData.sheet_w
                            const sheetH = nestingData.sheet_h
                            const cols = nestingData.cols
                            const rows = nestingData.rows

                            // Item Effective Dims (after rotation if needed)
                            const itemW = nestingData.rotated ? heightCm : widthCm
                            const itemH = nestingData.rotated ? widthCm : heightCm

                            // Calculate available rendering space to keep aspect ratio
                            // We use a predefined coordinate system matching the Sheet CM directly for SVG viewBox
                            // viewBox = `0 0 ${sheetW} ${sheetH}`
                            // But we need to add padding for external dimension lines
                            const pad = 10 // cm visual padding for dimensions

                            // Render Helpers
                            const DimArrow = ({ x1, y1, x2, y2, label, vertical = false, offset = 1 }: any) => {
                                const fontSize = 0.8
                                const color = "#64748b"
                                return (
                                    <g>
                                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.1" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead)" />
                                        {/* Label Background for readability */}
                                        <rect
                                            x={vertical ? (x1 + x2) / 2 - 0.5 : (x1 + x2) / 2 - 1.5}
                                            y={vertical ? (y1 + y2) / 2 - 1 : (y1 + y2) / 2 - 0.5}
                                            width={vertical ? 1 : 3}
                                            height={vertical ? 2 : 1}
                                            fill="rgba(255,255,255,0.8)"
                                        />
                                        <text
                                            x={(x1 + x2) / 2}
                                            y={(y1 + y2) / 2}
                                            dy={0.3}
                                            fill={color}
                                            fontSize={fontSize}
                                            textAnchor="middle"
                                            fontWeight="bold"
                                            transform={vertical ? `rotate(-90 ${(x1 + x2) / 2} ${(y1 + y2) / 2})` : ""}
                                        >
                                            {label}
                                        </text>
                                    </g>
                                )
                            }

                            return (
                                <svg
                                    viewBox={`-${pad} -${pad} ${sheetW + pad * 2} ${sheetH + pad * 2}`}
                                    className="max-w-full max-h-full drop-shadow-xl"
                                >
                                    <defs>
                                        <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                                            <path d="M0,0 L0,4 L4,2 z" fill="#64748b" />
                                        </marker>
                                        {/* Define Item Pattern from svgPath? No, complexity. Just render directly or use <g> */}
                                    </defs>

                                    {/* 1. Paper Sheet */}
                                    <rect x="0" y="0" width={sheetW} height={sheetH} fill="white" stroke="#334155" strokeWidth="0.1" />

                                    {/* 2. Margins (Visual Guide) */}
                                    {/* Gripper (Bottom usually? or Top. Let's assume Bottom for Gripper in offset press, but backend subtracts from printable H. 
                                        Let's assume Gripper is at Y=0 for viz or Y=H-1.5. 
                                        Let's put Gripper at Top (Y=0) or Bottom. Standard is often bottom.
                                        Visual: Red dashed area for Gripper.
                                    */}
                                    <rect x="0" y={sheetH - MG_GRIPPER} width={sheetW} height={MG_GRIPPER} fill="url(#diagonalHatch)" opacity="0.1" />
                                    <text x={sheetW / 2} y={sheetH - MG_GRIPPER / 2 + 0.2} fontSize="0.8" fill="red" textAnchor="middle" opacity="0.5">GRIPPER (1.5cm)</text>

                                    {/* Side Margins */}
                                    <rect x="0" y="0" width={MG_SIDE} height={sheetH} fill="red" opacity="0.05" />
                                    <rect x={sheetW - MG_SIDE} y="0" width={MG_SIDE} height={sheetH} fill="red" opacity="0.05" />

                                    {/* 3. Items Grid */}
                                    {Array.from({ length: nestingData.total_items }).map((_, i) => {
                                        const colIndex = i % cols
                                        const rowIndex = Math.floor(i / cols)

                                        // Position Calc: Start after Side Margin + Gaps
                                        // X = MG_SIDE + col * (itemW + GAP)
                                        // Y = MG_SIDE (Top margin? Backend says printable H = H - Grip - Side. So Top Side margin too?)
                                        // Let's assume Top Margin is also MG_SIDE
                                        const x = MG_SIDE + colIndex * (itemW + GAP)
                                        const y = MG_SIDE + rowIndex * (itemH + GAP)

                                        return (
                                            <g key={i} transform={`translate(${x}, ${y})`}>
                                                {/* Item Box Border */}
                                                <rect width={itemW} height={itemH} fill="none" stroke="#3b82f6" strokeWidth="0.05" strokeDasharray="0.3, 0.3" />

                                                {/* The Actual Dieline */}
                                                <g transform={`scale(${itemW / (nestingData.rotated ? heightCm : widthCm)}, ${itemH / (nestingData.rotated ? widthCm : heightCm)})`}>
                                                    {/* If rotated, we need to rotate the inner SVG content? 
                                                        Actually itemW/itemH already matches the slot. 
                                                        If nestingData.rotated=true, itemW=heightCm (e.g. 50cm).
                                                        The original Dieline is widthCm x heightCm.
                                                        If we just putting it in, it will be squeezed if we don't rotate.
                                                        We must Rotate the content 90deg.
                                                    */}
                                                    {nestingData.rotated ? (
                                                        <g transform={`rotate(90) translate(0, -${widthCm})`}>
                                                            {/* Rotate 90: X->Y, Y->-X. Need to shift back to positive space.
                                                             After rot 90: (W, H) becomes (-H, W) in coords? No.
                                                             (x,y) -> (-y, x). 
                                                             0,0 -> 0,0.
                                                             W,0 -> 0,W.
                                                             It rotates around origin.
                                                             New bounding box is height x width.
                                                             We need to translate Y by -width? No.
                                                             Let's just use CSS transform on parent div? This is SVG.
                                                             Adjust transform: translate(itemW, 0) rotate(90)?
                                                         */}
                                                            <g transform={`translate(${itemW}, 0) rotate(90)`} dangerouslySetInnerHTML={{ __html: svgPath || '' }} />
                                                        </g>
                                                    ) : (
                                                        <g dangerouslySetInnerHTML={{ __html: svgPath || '' }} />
                                                    )}
                                                </g>
                                            </g>
                                        )
                                    })}

                                    {/* 4. Dimensions (Outer) */}
                                    {/* Sheet Width */}
                                    <DimArrow x1={0} y1={-2} x2={sheetW} y2={-2} label={`${sheetW} cm`} />
                                    {/* Sheet Height */}
                                    <DimArrow x1={-2} y1={0} x2={-2} y2={sheetH} label={`${sheetH} cm`} vertical={true} />

                                    {/* 5. Detail Dimensions (Inner - on first item) */}
                                    {nestingData.total_items > 0 && (
                                        <>
                                            {/* Item Width */}
                                            <DimArrow x1={MG_SIDE} y1={MG_SIDE + itemH + 1} x2={MG_SIDE + itemW} y2={MG_SIDE + itemH + 1} label={`${itemW} cm`} />
                                            {/* Item Height */}
                                            <DimArrow x1={MG_SIDE + itemW + 1} y1={MG_SIDE} x2={MG_SIDE + itemW + 1} y2={MG_SIDE + itemH} label={`${itemH} cm`} vertical={true} />

                                            {/* Gap */}
                                            {cols > 1 && (
                                                <g>
                                                    <text x={MG_SIDE + itemW + GAP / 2} y={MG_SIDE + itemH / 2} fontSize="0.4" fill="red" textAnchor="middle" transform={`rotate(-90 ${MG_SIDE + itemW + GAP / 2} ${MG_SIDE + itemH / 2})`}>GAP {GAP}</text>
                                                </g>
                                            )}
                                        </>
                                    )}

                                </svg>
                            )
                        })()}
                    </div>
                ) : svgPath ? (
                    // Vector Rendering (Phase 5) - Single Item Flat View
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                        {(() => {
                            // Single Item Dimensions
                            const itemW = widthCm
                            const itemH = heightCm
                            const pad = 2

                            // Render Helpers (Duplicate from Nesting logic for isolation)
                            const DimArrow = ({ x1, y1, x2, y2, label, vertical = false, offset = 1 }: any) => {
                                const fontSize = 0.6
                                const color = "#3b82f6" // blue-500 for single item
                                return (
                                    <g>
                                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.05" markerEnd="url(#arrowheadBlue)" markerStart="url(#arrowheadBlue)" />
                                        <rect
                                            x={vertical ? (x1 + x2) / 2 - 0.4 : (x1 + x2) / 2 - 1.2}
                                            y={vertical ? (y1 + y2) / 2 - 0.8 : (y1 + y2) / 2 - 0.4}
                                            width={vertical ? 0.8 : 2.4}
                                            height={vertical ? 1.6 : 0.8}
                                            fill="rgba(255,255,255,0.9)"
                                        />
                                        <text
                                            x={(x1 + x2) / 2}
                                            y={(y1 + y2) / 2}
                                            dy={0.2}
                                            fill={color}
                                            fontSize={fontSize}
                                            textAnchor="middle"
                                            fontWeight="bold"
                                            transform={vertical ? `rotate(-90 ${(x1 + x2) / 2} ${(y1 + y2) / 2})` : ""}
                                        >
                                            {label}
                                        </text>
                                    </g>
                                )
                            }

                            return (
                                <svg
                                    viewBox={`-${pad} -${pad} ${itemW + pad * 2} ${itemH + pad * 2}`}
                                    className="max-w-full max-h-full drop-shadow-lg"
                                >
                                    <defs>
                                        <marker id="arrowheadBlue" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                                            <path d="M0,0 L0,4 L4,2 z" fill="#3b82f6" />
                                        </marker>
                                    </defs>

                                    {/* The Dieline */}
                                    <g dangerouslySetInnerHTML={{ __html: svgPath }} />

                                    {/* Dimensions */}
                                    {/* Width (Bottom) */}
                                    <DimArrow x1={0} y1={itemH + 1} x2={itemW} y2={itemH + 1} label={`${itemW} cm`} />

                                    {/* Height (Left) */}
                                    <DimArrow x1={-1} y1={0} x2={-1} y2={itemH} label={`${itemH} cm`} vertical={true} />

                                    {/* Panel hints? (Approximations based on sides=4) 
                                        We don't know internal creases from backend yet, so just outer dims.
                                    */}
                                </svg>
                            )
                        })()}
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={400} // Standard canvas size
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
        </div>
    )
}
