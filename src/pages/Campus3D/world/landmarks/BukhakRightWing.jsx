import { useEffect, useMemo, useState } from 'react'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = {
  wall: '#D4C5AA',
  wallLight: '#ECE1CE',
  wallShade: '#B6A283',
  mortar: '#9E8F78',
  roof: '#787064',
  roofDark: '#51493F',
  glass: '#58BFD0',
  glassDark: '#1B6777',
  column: '#EFE4CF',
  planter: '#B8AA94',
  soil: '#6F5A3D',
  benchWood: '#8A6A45',
  benchWoodDark: '#5C422A',
  pine: '#465F2B',
  pineDark: '#31451F',
}

const WING = {
  width: 3.25,
  depth: 6.25,
  height: 5.25,
  roofHeight: 0.72,
}

export default function BukhakRightWing({ rightWing, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [])

  const handleClick = (event) => {
    event.stopPropagation()
    onClick?.()
  }

  return (
    <group
      position={rightWing.position}
      rotation={rightWing.rotation}
      scale={isHovered ? rightWing.scale.map((value) => value * 1.025) : rightWing.scale}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation()
        setIsHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setIsHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {isHovered && (
        <>
          <RoundedBox
            args={[WING.width + 0.22, WING.height + 0.22, WING.depth + 0.22]}
            radius={0.14}
            smoothness={3}
            position={[0, WING.height / 2, 0]}
            raycast={() => null}
          >
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.16} wireframe depthWrite={false} />
          </RoundedBox>
          <Html
            position={[0, WING.height + 1, 0]}
            center
            zIndexRange={[100, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                padding: '8px 13px',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 6px 18px rgba(255, 255, 255, 0.2)',
                color: '#172033',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              연결 건물 둘러보기
            </div>
          </Html>
        </>
      )}

      <StoneWing />
      <FrontColumns />
      <Eaves />
      <SparseWindows />
      <WallDetails />
      <WingPlanter />
    </group>
  )
}

function StoneWing() {
  return (
    <group>
      <RoundedBox args={[WING.width, WING.height, WING.depth]} radius={0.1} smoothness={3} position={[0, WING.height / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.wall} roughness={0.92} />
      </RoundedBox>

      <StonePattern side="front" z={WING.depth / 2 + 0.03} />
      <StonePattern side="back" z={-WING.depth / 2 - 0.03} />
      <StonePattern side="right" x={WING.width / 2 + 0.03} />
    </group>
  )
}

function StonePattern({ side, x = 0, z = 0 }) {
  const rows = [0.75, 1.25, 1.75, 2.25, 2.75, 3.25, 3.75, 4.25, 4.75]
  const frontCols = [-1.05, -0.35, 0.35, 1.05]
  const sideCols = [-2.35, -1.55, -0.75, 0.05, 0.85, 1.65, 2.45]
  const isSide = side === 'right'
  const cols = isSide ? sideCols : frontCols

  return (
    <group position={[x, 0, z]} rotation={[0, isSide ? Math.PI / 2 : 0, 0]}>
      {rows.map((y) => (
        <mesh key={`row-${y}`} position={[0, y, 0]}>
          <boxGeometry args={[isSide ? WING.depth - 0.35 : WING.width - 0.38, 0.025, 0.025]} />
          <meshStandardMaterial color={COLORS.mortar} roughness={0.95} />
        </mesh>
      ))}
      {cols.map((col, i) => (
        <mesh key={`col-${col}`} position={[col, 2.72, 0.01]}>
          <boxGeometry args={[0.026, 4.2, 0.026]} />
          <meshStandardMaterial color={i % 2 ? COLORS.wallShade : COLORS.wallLight} roughness={0.94} />
        </mesh>
      ))}
    </group>
  )
}

function Eaves() {
  const roofGeo = useMemo(() => {
    const halfD = WING.depth / 2 + 0.62
    const shape = new THREE.Shape()
    shape.moveTo(-halfD, 0)
    shape.lineTo(halfD, 0)
    shape.lineTo(halfD - 0.35, WING.roofHeight * 0.55)
    shape.lineTo(0, WING.roofHeight)
    shape.lineTo(-halfD + 0.35, WING.roofHeight * 0.55)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: WING.width + 1.1, bevelEnabled: false })
    geo.rotateY(Math.PI / 2)
    geo.translate(-(WING.width + 1.1) / 2, 0, 0)
    geo.computeVertexNormals()
    return geo
  }, [])

  const beamZ = [-3.05, -2.45, -1.85, -1.25, -0.65, -0.05, 0.55, 1.15, 1.75, 2.35, 2.95]

  return (
    <group>
      <mesh geometry={roofGeo} position={[0, WING.height + 0.04, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.roof} roughness={0.88} flatShading />
      </mesh>
      <RoundedBox args={[WING.width + 1.25, 0.24, WING.depth + 1.28]} radius={0.04} smoothness={2} position={[0, WING.height + 0.02, 0]} castShadow>
        <meshStandardMaterial color={COLORS.roofDark} roughness={0.92} />
      </RoundedBox>
      {beamZ.map((z) => (
        <mesh key={z} position={[WING.width / 2 + 0.38, WING.height - 0.18, z]} castShadow>
          <boxGeometry args={[0.58, 0.12, 0.16]} />
          <meshStandardMaterial color={COLORS.roofDark} roughness={0.9} />
        </mesh>
      ))}
      {beamZ.map((z) => (
        <RoofRib key={`rib-${z}`} position={[0, WING.height + 0.64, z]} />
      ))}
    </group>
  )
}

function RoofRib({ position }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.045, 0.045, WING.width + 0.8, 5]} />
      <meshStandardMaterial color={COLORS.roofDark} roughness={0.9} flatShading />
    </mesh>
  )
}

function FrontColumns() {
  const zPositions = [-2.3, -0.85, 0.6, 2.05]

  return (
    <group position={[WING.width / 2 + 0.46, 0, 0]}>
      {zPositions.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 2.48, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.19, 0.24, 4.96, 14]} />
            <meshStandardMaterial color={COLORS.column} roughness={0.86} />
          </mesh>
          <RoundedBox args={[0.62, 0.22, 0.62]} radius={0.05} smoothness={2} position={[0, 0.11, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={COLORS.wallShade} roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.54, 0.2, 0.54]} radius={0.04} smoothness={2} position={[0, 4.92, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={COLORS.column} roughness={0.86} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

function SparseWindows() {
  const archGeo = useMemo(() => makeArchFillGeometry(0.5, 0.74, 0.04), [])
  
  
  const frontWindows = [
    [-0.62, 1.45, WING.depth / 2 + 0.05],
    [0.62, 2.85, WING.depth / 2 + 0.05],
    [-0.2, 4.05, WING.depth / 2 + 0.05],
  ]
  const sideWindows = [
    [WING.width / 2 + 0.05, 1.45, -1.6],
    [WING.width / 2 + 0.05, 2.85, 0.2],
    [WING.width / 2 + 0.05, 4.05, 1.8],
  ]

  return (
    <group>
      {frontWindows.map(([x, y, z]) => (
        <ArchedWindow key={`${x}-${y}-${z}`} geometry={archGeo} position={[x, y, z]} />
      ))}
      {sideWindows.map(([x, y, z]) => (
        <ArchedWindow key={`${x}-${y}-${z}`} geometry={archGeo} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]} />
      ))}
    </group>
  )
}

function ArchedWindow({ geometry, position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#1C2527" emissive={COLORS.glassDark} emissiveIntensity={0.16} roughness={0.42} />
      </mesh>
      <RoundedBox args={[0.66, 0.1, 0.06]} radius={0.03} smoothness={2} position={[0, -0.36, 0]} castShadow>
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
      </RoundedBox>
    </group>
  )
}

function WallDetails() {
  const cornerZ = [-WING.depth / 2 + 0.32, WING.depth / 2 - 0.32]
  const leftWallWindows = [-1.75, 0, 1.75]

  return (
    <group>
      <RoundedBox
        args={[WING.width + 0.18, 0.48, WING.depth + 0.12]}
        radius={0.06}
        smoothness={2}
        position={[0, 0.24, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.wallShade} roughness={0.94} />
      </RoundedBox>

      {cornerZ.map((z) => (
        <RoundedBox
          key={z}
          args={[0.24, WING.height - 0.55, 0.24]}
          radius={0.05}
          smoothness={3}
          position={[-WING.width / 2 - 0.03, WING.height / 2 + 0.18, z]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} />
        </RoundedBox>
      ))}

      <mesh position={[-WING.width / 2 - 0.04, WING.height - 0.82, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[WING.depth - 0.62, 0.18, 0.12]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} />
      </mesh>

      {leftWallWindows.map((z) => (
        <group key={z} position={[-WING.width / 2 - 0.055, 3.2, z]} rotation={[0, -Math.PI / 2, 0]}>
          <RoundedBox args={[0.46, 0.72, 0.06]} radius={0.06} smoothness={3} castShadow>
            <meshStandardMaterial color="#1C2527" emissive={COLORS.glassDark} emissiveIntensity={0.14} roughness={0.42} />
          </RoundedBox>
          <mesh position={[0, -0.45, 0.035]}>
            <boxGeometry args={[0.62, 0.08, 0.035]} />
            <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
          </mesh>
        </group>
      ))}

      <SideEntranceDoor position={[-WING.width / 2 - 0.065, 0.95, 0]} />
    </group>
  )
}

function SideEntranceDoor({ position }) {
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      <RoundedBox args={[1.98, 1.92, 0.08]} radius={0.04} smoothness={2} position={[0, -0.02, 0.025]} receiveShadow>
        <meshStandardMaterial color="#15110E" emissive="#080605" emissiveIntensity={0.22} roughness={0.8} />
      </RoundedBox>

      <RoundedBox args={[0.16, 2.05, 0.14]} radius={0.04} smoothness={3} position={[-1.08, 0, 0.075]} castShadow>
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.86} />
      </RoundedBox>
      <RoundedBox args={[0.16, 2.05, 0.14]} radius={0.04} smoothness={3} position={[1.08, 0, 0.075]} castShadow>
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.86} />
      </RoundedBox>
      <RoundedBox args={[2.3, 0.18, 0.16]} radius={0.04} smoothness={3} position={[0, 1.02, 0.08]} castShadow>
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.86} />
      </RoundedBox>

      <LargeEntrancePlanter position={[-1.92, -0.95, 0.9]} />
      <PlanterSideBench position={[-0.92, -0.68, 0.9]} />
    </group>
  )
}

function LargeEntrancePlanter({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.56, 1.14, 2.01]} radius={0.045} smoothness={3} position={[0, 0.57, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.planter} roughness={0.94} />
      </RoundedBox>
      <RoundedBox args={[1.72, 0.16, 2.25]} radius={0.04} smoothness={2} position={[0, 1.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.wallShade} roughness={0.94} />
      </RoundedBox>
      <mesh position={[0, 1.28, 0.05]}>
        <boxGeometry args={[1.28, 0.08, 1.62]} />
        <meshStandardMaterial color={COLORS.soil} roughness={0.98} flatShading />
      </mesh>
    </group>
  )
}

function PlanterSideBench({ position }) {
  const benchLength = 2.25
  const legs = [
    [-0.02, -0.22, -0.9],
    [-0.02, -0.22, 0.9],
  ]

  return (
    <group position={position}>
      <RoundedBox args={[0.28, 0.12, benchLength]} radius={0.035} smoothness={2} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.benchWood} roughness={0.86} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.44, benchLength]} radius={0.03} smoothness={2} position={[-0.13, 0.23, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.benchWoodDark} roughness={0.88} />
      </RoundedBox>
      {legs.map(([x, y, z]) => (
        <mesh key={z} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color={COLORS.benchWoodDark} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function WingPlanter() {
  return (
    <group position={[0, 0.04, WING.depth / 2 + 0.56]}>
      <RoundedBox args={[WING.width + 1.1, 0.18, 0.62]} radius={0.06} smoothness={2} position={[0, 0.08, 0]} receiveShadow>
        <meshStandardMaterial color={COLORS.planter} roughness={0.94} />
      </RoundedBox>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[WING.width + 0.75, 0.06, 0.42]} />
        <meshStandardMaterial color={COLORS.soil} roughness={0.98} />
      </mesh>
    </group>
  )
}

function makeArchFillGeometry(width, height, depth) {
  const radius = width / 2
  const legH = height - radius
  const shape = new THREE.Shape()

  shape.moveTo(-radius, 0)
  shape.lineTo(-radius, legH)
  shape.absarc(0, legH, radius, Math.PI, 0, true)
  shape.lineTo(radius, 0)
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
  geo.translate(0, -height / 2, -depth / 2)
  geo.computeVertexNormals()
  return geo
}
