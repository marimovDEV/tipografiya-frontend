'use client'
import React, { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center, useTexture, Decal } from '@react-three/drei'
import * as THREE from 'three'

export interface ThreeDViewerProps {
    dimensions: { L: number; W: number; H: number }
    style?: string
    foldAngle?: number // 0 to 100
    logoUrl?: string | null
    materialType?: 'craft' | 'white' | 'glossy'
    // New Props
    sides?: number // 4, 6, 8, etc.
    lidType?: 'hinged' | 'separate' | 'flat'
    handleType?: 'none' | 'rope' | 'ribbon' | 'cutout'
}

type MaterialType = 'craft' | 'white' | 'glossy'

const MATERIAL_PRESETS = {
    craft: { color: "#d4b483", roughness: 0.9, metalness: 0 },
    white: { color: "#f5f5f5", roughness: 0.5, metalness: 0 },
    glossy: { color: "#ffffff", roughness: 0.2, metalness: 0.1 }
}

const LogoDecal = ({ url, position, rotation, scale }: { url: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number] }) => {
    const texture = useTexture(url)
    return (
        <Decal
            position={position}
            rotation={rotation}
            scale={scale}
            map={texture}
            debug={false}
        />
    )
}

/**
 * Creates a regular polygon prism (base box or lid).
 * dimensions: L (depth/diameter approx), W (width/diameter approx), H (height)
 * sides: number of sides
 * thickness: wall thickness
 */
const PolygonMesh = ({
    dimensions,
    sides = 4,
    isLid = false,
    thickness = 0.2,
    matProps,
    foldAngle = 0
}: {
    dimensions: { R: number, H: number },
    sides: number,
    isLid?: boolean,
    thickness?: number,
    matProps: any,
    foldAngle?: number
}) => {
    const { R, H } = dimensions // R = circumradius roughly

    // We create a custom shape for the polygon base
    const shape = useMemo(() => {
        const s = new THREE.Shape()
        const angleStep = (Math.PI * 2) / sides
        // Start angle to align flat side with X axis if 4 sides
        const offset = sides === 4 ? Math.PI / 4 : 0

        for (let i = 0; i <= sides; i++) {
            const theta = i * angleStep + offset
            const x = R * Math.cos(theta)
            const y = R * Math.sin(theta)
            if (i === 0) s.moveTo(x, y)
            else s.lineTo(x, y)
        }
        return s
    }, [sides, R])

    // Geometry settings
    const extrudeSettings = useMemo(() => ({
        depth: H,
        bevelEnabled: false
    }), [H])

    // 0 = Assembled/Closed, 100 = Flat/Open
    const progress = (foldAngle || 0) / 100
    // Angle: 0 (Closed/Up) -> 90 (Open/Flat)
    const hingeAngle = (Math.PI / 2) * progress

    return (
        <group>
            {/* FLOOR */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, isLid ? H : 0, 0]}>
                <shapeGeometry args={[shape]} />
                <meshStandardMaterial {...matProps} side={THREE.DoubleSide} />
            </mesh>

            {/* WALLS - built from individual planes with Hinge Logic */}
            {Array.from({ length: sides }).map((_, i) => {
                const angleStep = (Math.PI * 2) / sides
                const offset = sides === 4 ? Math.PI / 4 : 0
                const theta = i * angleStep + offset + (angleStep / 2)

                // Calculate midpoint of the side (apothem distance)
                const apothem = R * Math.cos(Math.PI / sides)
                const sideLength = 2 * R * Math.sin(Math.PI / sides)

                const x = apothem * Math.cos(theta)
                const z = apothem * Math.sin(theta)

                // Rotation: Local Z aligns with Radial Outward vector
                // We want the wall normal (+Z) to point outwards (Away from center).
                // Formula: -theta - PI/2 aligns Box Z (+Z) to Outward Normal (-theta).
                const rotY = -theta - Math.PI / 2

                return (

                    // Pivot Group at the base edge
                    <group
                        key={i}
                        position={[x, 0, -z]} // Fixed: Wall pivot is always at 0 relative to group base (Rim)
                        rotation={[0, rotY, 0]}
                    >
                        {/* Hinge Rotation (X-axis) */}
                        <group rotation={[hingeAngle, 0, 0]}>
                            {/* Wall Mesh (Lifted up by H/2 so base is at pivot) */}
                            <mesh position={[0, H / 2, 0]}>
                                <boxGeometry args={[sideLength, H, thickness]} />
                                <meshStandardMaterial {...matProps} />
                            </mesh>
                        </group>
                    </group>
                )
            })}
        </group>
    )
}

const DynamicBox = ({
    dimensions,
    sides = 4,
    lidType = 'hinged',
    handleType = 'none',
    foldAngle = 0,
    logoUrl,
    materialType = 'craft',
    style
}: ThreeDViewerProps) => {

    const { L, W, H } = dimensions

    // Material props
    const matProps = MATERIAL_PRESETS[materialType] || MATERIAL_PRESETS['craft']

    if (style === 'book') {
        return <BookMesh dimensions={dimensions} matProps={matProps} logoUrl={logoUrl} foldAngle={foldAngle} />
    }

    const isRect = sides === 4
    const thickness = 0.3

    // 0 = Assembled/Closed, 100 = Flat/Open
    const progress = foldAngle / 100

    // Angles for animation (Rectangular logic)
    const sideAngle = (Math.PI / 2) * (1 - progress)
    const lidAngle = (Math.PI / 2) * (1 - progress)
    const flapAngle = (Math.PI / 2) * (1 - progress)

    if (isRect) {
        return (
            <group>
                {/* BASE (Static Center) */}
                <mesh position={[0, thickness / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[W, L]} />
                    <meshStandardMaterial {...matProps} side={THREE.DoubleSide} />
                </mesh>

                {/* BACK PANEL GROUP */}
                <group position={[0, 0, -L / 2]} rotation={[sideAngle, 0, 0]}>
                    <mesh position={[0, 0, -H / 2]}>
                        <boxGeometry args={[W, thickness, H]} />
                        <meshStandardMaterial {...matProps} />
                    </mesh>
                    <group position={[0, 0, -H]} rotation={[lidAngle, 0, 0]}>
                        <mesh position={[0, 0, -L / 2]}>
                            <boxGeometry args={[W + 0.4, thickness, L + 0.4]} />
                            <meshStandardMaterial {...matProps} />
                            {logoUrl && <LogoDecal url={logoUrl} position={[0, thickness / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI]} scale={[Math.min(W, L) / 1.5, Math.min(W, L) / 1.5, 1]} />}
                        </mesh>
                        <group position={[0, 0, -L]} rotation={[flapAngle, 0, 0]}>
                            <mesh position={[0, 0, -H / 4]}>
                                <boxGeometry args={[W - 0.5, thickness, H / 2]} />
                                <meshStandardMaterial {...matProps} />
                            </mesh>
                        </group>
                        <group position={[-W / 2, 0, -L / 2]} rotation={[0, 0, -flapAngle]}>
                            <mesh position={[-H / 4, 0, 0]}>
                                <boxGeometry args={[H / 2, thickness, L]} />
                                <meshStandardMaterial {...matProps} />
                            </mesh>
                        </group>
                        <group position={[W / 2, 0, -L / 2]} rotation={[0, 0, flapAngle]}>
                            <mesh position={[H / 4, 0, 0]}>
                                <boxGeometry args={[H / 2, thickness, L]} />
                                <meshStandardMaterial {...matProps} />
                            </mesh>
                        </group>
                    </group>
                </group>

                {/* FRONT PANEL */}
                <group position={[0, 0, L / 2]} rotation={[-sideAngle, 0, 0]}>
                    <mesh position={[0, 0, H / 2]}>
                        <boxGeometry args={[W, thickness, H]} />
                        <meshStandardMaterial {...matProps} />
                    </mesh>
                </group>

                {/* RIGHT PANEL */}
                <group position={[W / 2, 0, 0]} rotation={[0, 0, sideAngle]}>
                    <mesh position={[H / 2, 0, 0]}>
                        <boxGeometry args={[H, thickness, L]} />
                        <meshStandardMaterial {...matProps} />
                    </mesh>
                    {handleType !== 'none' && (
                        <group position={[H / 2, thickness, 0]} rotation={[0, 0, -Math.PI / 2]}>
                            <HandleMesh type={handleType} width={L} matProps={matProps} />
                        </group>
                    )}
                </group>

                {/* LEFT PANEL */}
                <group position={[-W / 2, 0, 0]} rotation={[0, 0, -sideAngle]}>
                    <mesh position={[-H / 2, 0, 0]}>
                        <boxGeometry args={[H, thickness, L]} />
                        <meshStandardMaterial {...matProps} />
                    </mesh>
                    {handleType !== 'none' && (
                        <group position={[-H / 2, thickness, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <HandleMesh type={handleType} width={L} matProps={matProps} />
                        </group>
                    )}
                </group>

            </group>
        )
    }

    // POLYGON LOGIC (Hexagon, Octagon)
    const R = Math.max(W, L) / 2

    return (
        <group position={[0, -H / 2, 0]}>
            <PolygonMesh
                dimensions={{ R, H }}
                sides={sides}
                thickness={thickness}
                matProps={matProps}
                foldAngle={foldAngle}
            />

            {/* Handles */}
            {handleType !== 'none' && (
                <group position={[R, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <HandleMesh type={handleType} width={5} matProps={matProps} />
                </group>
            )}

            {/* LID */}
            <group position={[0, H + (lidType === 'separate' ? foldAngle / 5 : 0), 0]}>
                {lidType !== 'flat' && (
                    <group position={[0, thickness, 0]}>
                        <PolygonMesh dimensions={{ R: R + 0.5, H: 2 }} sides={sides} thickness={thickness} isLid={true} matProps={matProps} foldAngle={0} />

                        {/* Cap Top Cover */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
                            <cylinderGeometry args={[R + 0.5, R + 0.5, thickness, sides]} />
                            <meshStandardMaterial {...matProps} />
                            {logoUrl && <LogoDecal url={logoUrl} position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[R, R, 1]} />}
                        </mesh>
                    </group>
                )}
            </group>
        </group>
    )
}

const HandleMesh = ({ type, width, matProps }: { type: string, width: number, matProps: any }) => {
    if (type === 'none') return null

    if (type === 'rope') {
        return (
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[1.5, 0.1, 8, 20, Math.PI]} />
                <meshStandardMaterial color="#8d6e63" />
            </mesh>
        )
    }

    if (type === 'ribbon') {
        return (
            <mesh position={[0, -1, 0]}>
                <boxGeometry args={[0.2, 3, 0.05]} />
                <meshStandardMaterial color="#d81b60" />
            </mesh>
        )
    }

    return null
}

const BookMesh = ({
    dimensions,
    matProps,
    logoUrl,
    foldAngle = 0
}: {
    dimensions: { L: number, W: number, H: number },
    matProps: any,
    logoUrl?: string | null,
    foldAngle?: number
}) => {
    const { L, W, H } = dimensions // L=Height, W=Width, H=Thickness (Spine)
    const thickness = 0.2
    const progress = (foldAngle || 0) / 100
    const openAngle = (Math.PI / 1.1) * progress

    return (
        <group rotation={[0, 0, 0]}>
            {/* BACK COVER */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[W, L, thickness]} />
                <meshStandardMaterial {...matProps} />
            </mesh>

            {/* PAGES (The block) */}
            <mesh position={[0, 0, H / 2]}>
                <boxGeometry args={[W - 0.2, L - 0.2, H]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>

            {/* HINGE / SPINE */}
            <group position={[-W / 2, 0, H]}>
                <mesh position={[0, 0, -H / 2]} rotation={[0, 0, 0]}>
                    <boxGeometry args={[thickness, L, H]} />
                    <meshStandardMaterial {...matProps} />
                </mesh>

                {/* FRONT COVER WITH HINGE */}
                <group rotation={[0, -openAngle, 0]}>
                    <mesh position={[W / 2, 0, 0]}>
                        <boxGeometry args={[W, L, thickness]} />
                        <meshStandardMaterial {...matProps} />
                        {logoUrl && (
                            <LogoDecal
                                url={logoUrl}
                                position={[0, 0, thickness / 2 + 0.01]}
                                rotation={[0, 0, 0]}
                                scale={[W * 0.6, W * 0.6, 1]}
                            />
                        )}
                    </mesh>
                </group>
            </group>
        </group>
    )
}


export default function ThreeDViewer(props: ThreeDViewerProps) {
    const {
        dimensions = { L: 20, W: 15, H: 5 },
        foldAngle = 0,
        logoUrl
    } = props

    // Internal state for interactivity
    const [internalFoldAngle, setInternalFoldAngle] = React.useState(foldAngle)

    // Sync if prop changes
    React.useEffect(() => {
        setInternalFoldAngle(foldAngle)
    }, [foldAngle])

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-50 border rounded-lg overflow-hidden relative group">
            <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: true }} camera={{ position: [30, 30, 30], fov: 40 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[20, 30, 20]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
                <directionalLight position={[-20, 10, -20]} intensity={0.5} />
                <spotLight position={[0, 50, 0]} intensity={0.5} />

                <group position={[0, 0, 0]}>
                    <Center top>
                        <React.Suspense fallback={null}>
                            <DynamicBox {...props} foldAngle={internalFoldAngle} />
                        </React.Suspense>
                    </Center>
                </group>

                <OrbitControls makeDefault minDistance={10} maxDistance={200} />
                <Environment preset="city" />

                <gridHelper args={[200, 200, 0xdddddd, 0xffffff]} position={[0, -dimensions.H / 2 - 0.1, 0]} />
            </Canvas>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg flex items-center gap-4 transition-all opacity-100 hover:opacity-100">
                <span className="text-xs font-medium text-slate-600">
                    {props.style === 'book' ? "Yopiq" : "Close"}
                </span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={internalFoldAngle}
                    onChange={(e) => setInternalFoldAngle(Number(e.target.value))}
                    className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-medium text-slate-600">
                    {props.style === 'book' ? "Ochiq" : "Open"}
                </span>
            </div>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded shadow-sm text-xs text-slate-500 pointer-events-none">
                Drag to Rotate • Scroll to Zoom
                {logoUrl && <span> • Logo Applied</span>}
            </div>
        </div>
    )
}
