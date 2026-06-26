import { useMemo } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  BUKHAK_ARCH_BAY_X,
  BUKHAK_BUILDING_SIZE,
  BUKHAK_COLORS as COLORS,
  BUKHAK_DORMER_X,
  BUKHAK_FLOOR_Y,
  BUKHAK_WINDOW_X,
} from '../config/bukhakHallDesign'

const BUILDING = BUKHAK_BUILDING_SIZE
const FRONT_Z = BUILDING.depth / 2
const PODIUM_HEIGHT = 0.9

export default function BukhakHallBuilding({ building }) {
  const position = building?.position ?? [0, 0, 0]
  const roofGeo = useMemo(() => {
    const shape = new THREE.Shape()
    const halfD = BUILDING.depth / 2 + 0.36
    shape.moveTo(-halfD, 0)
    shape.lineTo(halfD, 0)
    shape.lineTo(halfD - 0.22, 0.36)
    shape.lineTo(0, 0.62)
    shape.lineTo(-halfD + 0.22, 0.36)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: BUILDING.width + 0.8, bevelEnabled: false })
    geo.rotateY(Math.PI / 2)
    geo.translate(-(BUILDING.width + 0.8) / 2, 0, 0)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group position={position}>
      {/* elevated first floor podium */}
      <RoundedBox
        args={[BUILDING.width + 0.48, PODIUM_HEIGHT, BUILDING.depth + 0.42]}
        radius={0.1}
        smoothness={3}
        position={[0, PODIUM_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.stoneShade} roughness={0.94} />
      </RoundedBox>
      {/* 북악관 스타일 건물 */}
      <RoundedBox
        args={[BUILDING.width, BUILDING.height, BUILDING.depth]}
        radius={0.12}
        smoothness={4}
        position={[0, PODIUM_HEIGHT + BUILDING.height / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.wall} roughness={0.88} />
      </RoundedBox>

      <mesh position={[0, PODIUM_HEIGHT + BUILDING.height + 0.02, 0]} geometry={roofGeo} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.roof} roughness={0.86} flatShading />
      </mesh>

      <mesh position={[0, PODIUM_HEIGHT + BUILDING.height + 0.02, FRONT_Z + 0.1]} castShadow>
        <boxGeometry args={[BUILDING.width + 1.05, 0.32, 0.42]} />
        <meshStandardMaterial color={COLORS.roofDark} roughness={0.9} />
      </mesh>

      {BUKHAK_DORMER_X.map((x) => (
        <RoofDormer key={x} position={[x, PODIUM_HEIGHT + BUILDING.height + 0.54, FRONT_Z + 0.13]} />
      ))}

      <SkuFacadePanels />
      <WindowGrid />
      <FacadeRhythm />
      <BackWindowGrid />
      <CentralEntrance />
      <AuxiliaryEntrances />
      <FrontBanner />
      <BasementStairsLeft />
      <SideWindows side={-1} />
      <SideWindows side={1} />
    </group>
  )
}

function FrontBanner() {
  return (
    <group position={[0, PODIUM_HEIGHT + 2.46, FRONT_Z + 0.48]}>
      <RoundedBox args={[4.72, 0.42, 0.06]} radius={0.035} smoothness={2} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#F8F5EC" roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, 0.18, 0.036]}>
        <boxGeometry args={[4.42, 0.035, 0.018]} />
        <meshStandardMaterial color="#2F5D8C" roughness={0.72} />
      </mesh>
      <mesh position={[0, -0.18, 0.036]}>
        <boxGeometry args={[4.42, 0.035, 0.018]} />
        <meshStandardMaterial color="#2F5D8C" roughness={0.72} />
      </mesh>
      <Text position={[0, 0, 0.055]} fontSize={0.19} color="#1F2A36" anchorX="center" anchorY="middle" maxWidth={4.3}>
        대학 기업 협업 SW 아카데미사업
      </Text>
    </group>
  )
}

function SkuFacadePanels() {
  const panelXs = [-3.05, -1.85, 1.85, 3.05]
  const stripeYs = [1.15, 2.45, 3.75, 5.05]

  return (
    <group position={[0, PODIUM_HEIGHT, FRONT_Z + 0.052]}>
      {panelXs.map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <RoundedBox args={[0.76, 5.62, 0.045]} radius={0.035} smoothness={2} position={[0, 2.94, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={index % 2 ? COLORS.skuGold : COLORS.skuOrange} roughness={0.88} />
          </RoundedBox>
          {stripeYs.map((y, stripeIndex) => (
            <mesh key={y} position={[0, y, 0.034]} rotation={[0, 0, -0.48]}>
              <boxGeometry args={[1.06, 0.08, 0.018]} />
              <meshStandardMaterial color={stripeIndex % 2 ? COLORS.skuOrange : COLORS.skuGold} roughness={0.82} />
            </mesh>
          ))}
          {[1.7, 3.24, 4.78].map((y) => (
            <Text key={y} position={[0, y, 0.052]} rotation={[0, 0, -0.5]} fontSize={0.27} color={COLORS.skuDark} anchorX="center" anchorY="middle">
              SKU
            </Text>
          ))}
        </group>
      ))}
    </group>
  )
}

function FacadeRhythm() {
  const beltYs = [1.28, 2.68, 4.08]

  return (
    <group position={[0, PODIUM_HEIGHT, FRONT_Z + 0.035]}>
      <mesh position={[0, BUILDING.height - 0.42, 0]}>
        <boxGeometry args={[BUILDING.width + 0.05, 0.3, 0.16]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.18, 0.08]}>
        <boxGeometry args={[BUILDING.width + 0.16, 0.18, 0.18]} />
        <meshStandardMaterial color={COLORS.wallShade} roughness={0.92} />
      </mesh>
      {beltYs.map((y) => (
        <mesh key={y} position={[0, y, 0.102]}>
          <boxGeometry args={[BUILDING.width - 0.34, 0.055, 0.06]} />
          <meshStandardMaterial color={COLORS.wallCool} roughness={0.9} />
        </mesh>
      ))}

      {BUKHAK_ARCH_BAY_X.map((x) => (
        <group key={x}>
          <RoundedBox
            args={[0.18, BUILDING.height - 0.84, 0.22]}
            radius={0.06}
            smoothness={3}
            position={[x, (BUILDING.height - 0.84) / 2 + 0.1, 0.09]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
          </RoundedBox>
          <FacadeArch position={[x, 0.5, 0.18]} scale={[1.16, 1.0, 1]} />
        </group>
      ))}
      {[-6.05, 6.05].map((x) => (
        <RoundedBox key={x} args={[0.24, BUILDING.height - 0.48, 0.2]} radius={0.055} smoothness={3} position={[x, BUILDING.height / 2, 0.08]} castShadow receiveShadow>
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
        </RoundedBox>
      ))}
    </group>
  )
}

function WindowGrid() {
  return (
    <group position={[0, PODIUM_HEIGHT, FRONT_Z + 0.08]}>
      {BUKHAK_FLOOR_Y.flatMap((y, row) =>
        BUKHAK_WINDOW_X.map((x) => <Window key={`${row}-${x}`} position={[x, y, 0.03]} />),
      )}
      {[-0.72, 0.72].map((x) =>
        BUKHAK_FLOOR_Y.slice(1).map((y) => <Window key={`center-${x}-${y}`} position={[x, y, 0.03]} />),
      )}
    </group>
  )
}

function BackWindowGrid() {
  return (
    <group rotation={[0, Math.PI, 0]} position={[0, PODIUM_HEIGHT, -FRONT_Z - 0.08]}>
      {BUKHAK_FLOOR_Y.flatMap((y, row) =>
        BUKHAK_WINDOW_X.map((x) => <Window key={`back-${row}-${x}`} position={[-x, y, 0.03]} />),
      )}
      {[-0.72, 0.72].map((x) =>
        BUKHAK_FLOOR_Y.map((y) => <Window key={`back-center-${x}-${y}`} position={[-x, y, 0.03]} />),
      )}
    </group>
  )
}

function CentralEntrance() {
  const stepRows = Array.from({ length: 15 }, (_, i) => i)
  const archX = [-0.72, 0.72]

  return (
    <group position={[0, 0, FRONT_Z + 0.22]}>
      {/* 북악관 스타일 입구 */}
      <RoundedBox
        args={[3.45, 2.05, 0.62]}
        radius={0.08}
        smoothness={3}
        position={[0, PODIUM_HEIGHT + 1.02, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.stone} roughness={0.92} />
      </RoundedBox>

      {/* roof over porch platform */}
      <mesh position={[0, PODIUM_HEIGHT + 1.98, 0.78]} castShadow>
        <boxGeometry args={[4.15, 0.22, 1.55]} />
        <meshStandardMaterial color={COLORS.porticoRoof} roughness={0.9} />
      </mesh>
      <mesh position={[0, PODIUM_HEIGHT + 1.82, 0.9]} castShadow>
        <boxGeometry args={[4.35, 0.16, 1.85]} />
        <meshStandardMaterial color={COLORS.porticoRoofDark} roughness={0.92} />
      </mesh>
      <mesh position={[0, PODIUM_HEIGHT + 2.13, -0.04]} castShadow>
        <boxGeometry args={[3.35, 0.16, 0.5]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.88} />
      </mesh>

      {/* columns supporting the porch roof */}
      {[-1.72, 1.72].flatMap((x) =>
        [0.55, 1.35].map((z) => (
          <RoundedBox
            key={`${x}-${z}`}
            args={[0.18, 1.78, 0.18]}
            radius={0.05}
            smoothness={3}
            position={[x, PODIUM_HEIGHT + 0.98, z]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
          </RoundedBox>
        )),
      )}

      {[-1.78, 0, 1.78].map((x) => (
        <RoundedBox
          key={x}
          args={[0.16, 1.88, 0.18]}
          radius={0.04}
          smoothness={3}
          position={[x, PODIUM_HEIGHT + 0.96, 0.34]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
        </RoundedBox>
      ))}

      {archX.map((x) => (
        <EntranceBay key={x} position={[x, PODIUM_HEIGHT + 0.34, 0.36]} />
      ))}

      {[0.58, 1.28].map((x) => (
        <mesh key={x} position={[x, PODIUM_HEIGHT + 0.82, 0.47]}>
          <boxGeometry args={[0.035, 0.72, 0.035]} />
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.75} />
        </mesh>
      ))}
      {[-0.58, -1.28].map((x) => (
        <mesh key={x} position={[x, PODIUM_HEIGHT + 0.82, 0.47]}>
          <boxGeometry args={[0.035, 0.72, 0.035]} />
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.75} />
        </mesh>
      ))}

      {/* porch platform before the arched doors */}
      <RoundedBox
        args={[3.85, 0.16, 1.05]}
        radius={0.08}
        smoothness={3}
        position={[0, PODIUM_HEIGHT + 0.02, 0.95]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.stone} roughness={0.94} />
      </RoundedBox>

      <FrontArchPortico position={[0, PODIUM_HEIGHT - 0.4, 1.42]} />

      {/* main stairs to elevated first floor */}
      {stepRows.map((i) => {
        const t = i / (stepRows.length - 1)
        return (
          <RoundedBox
            key={i}
            args={[4.35 - t * 0.72, 0.09, 0.28]}
            radius={0.04}
            smoothness={2}
            position={[0, 0.05 + t * (PODIUM_HEIGHT - 0.05), 3.28 - t * 1.82]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={i % 2 ? COLORS.stoneShade : COLORS.stone} roughness={0.94} />
          </RoundedBox>
        )
      })}

    </group>
  )
}

function AuxiliaryEntrances() {
  return (
    <group position={[0, 0, FRONT_Z + 0.2]}>
      {[-4.95, 4.95].map((x) => (
        <AuxiliaryEntrance key={x} position={[x, 0, 0]} />
      ))}
    </group>
  )
}

function AuxiliaryEntrance({ position }) {
  const steps = [0, 1, 2, 3, 4, 5]

  return (
    <group position={position}>
      <RoundedBox args={[0.86, 1.28, 0.14]} radius={0.045} smoothness={3} position={[0, PODIUM_HEIGHT + 0.62, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
      </RoundedBox>
      <RoundedBox args={[0.58, 1.02, 0.06]} radius={0.035} smoothness={2} position={[0, PODIUM_HEIGHT + 0.52, 0.08]} castShadow>
        <meshStandardMaterial color={COLORS.door} emissive="#1B120D" emissiveIntensity={0.14} roughness={0.72} />
      </RoundedBox>
      <mesh position={[0, PODIUM_HEIGHT + 0.54, 0.12]}>
        <boxGeometry args={[0.03, 0.82, 0.025]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.82} />
      </mesh>
      <RoundedBox args={[0.98, 0.12, 0.18]} radius={0.035} smoothness={2} position={[0, PODIUM_HEIGHT + 1.25, 0.04]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.stone} roughness={0.94} />
      </RoundedBox>
      {steps.map((i) => {
        const t = i / (steps.length - 1)
        return (
          <RoundedBox
            key={i}
            args={[1.08 - t * 0.12, 0.075, 0.22]}
            radius={0.025}
            smoothness={2}
            position={[0, 0.04 + t * (PODIUM_HEIGHT - 0.08), 1.2 - t * 0.76]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={i % 2 ? COLORS.stoneShade : COLORS.stone} roughness={0.94} />
          </RoundedBox>
        )
      })}
    </group>
  )
}

function FrontArchPortico({ position }) {
  const archX = [-0.78, 0.78]

  return (
    <group position={position}>
      <RoundedBox
        args={[3.72, 0.18, 0.34]}
        radius={0.06}
        smoothness={3}
        position={[0, 1.92, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.porticoRoofDark} roughness={0.9} />
      </RoundedBox>
      <RoundedBox
        args={[3.42, 0.2, 0.28]}
        radius={0.04}
        smoothness={3}
        position={[0, 1.73, 0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.stoneShade} roughness={0.92} />
      </RoundedBox>

      {[-1.72, 0, 1.72].map((x) => (
        <RoundedBox
          key={x}
          args={[0.22, 1.54, 0.28]}
          radius={0.05}
          smoothness={3}
          position={[x, 0.76, 0.02]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
        </RoundedBox>
      ))}

      {archX.map((x) => (
        <EntranceArch key={x} position={[x, 0.34, 0.17]} />
      ))}

      <RoundedBox
        args={[4.04, 0.12, 0.52]}
        radius={0.05}
        smoothness={3}
        position={[0, -0.02, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.stone} roughness={0.94} />
      </RoundedBox>
    </group>
  )
}

function BasementStairsLeft() {
  const steps = [0, 1, 2, 3, 4, 5]

  return (
    <group position={[-BUILDING.width / 2 - 0.34, 0, 0.45]}>
      {/* basement stairs(left) */}
      <mesh position={[0, -0.22, 0.2]} receiveShadow>
        <boxGeometry args={[0.9, 0.08, 1.9]} />
        <meshStandardMaterial color="#3B322A" roughness={0.95} />
      </mesh>

      <mesh position={[0.32, 0.12, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.6, 2.0]} />
        <meshStandardMaterial color={COLORS.stoneShade} roughness={0.92} />
      </mesh>
      <mesh position={[-0.32, 0.06, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.48, 2.0]} />
        <meshStandardMaterial color={COLORS.stoneShade} roughness={0.92} />
      </mesh>

      {steps.map((i) => {
        const t = i / (steps.length - 1)
        return (
          <RoundedBox
            key={i}
            args={[0.68, 0.08, 0.24]}
            radius={0.025}
            smoothness={2}
            position={[0, 0.04 - t * 0.42, 1.05 - t * 1.35]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={i % 2 ? COLORS.stone : COLORS.stoneShade} roughness={0.94} />
          </RoundedBox>
        )
      })}

      <mesh position={[0.42, 0.42, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.55, 7]} />
        <meshStandardMaterial color={COLORS.porticoRoofDark} roughness={0.85} />
      </mesh>

      <mesh position={[0.16, 0.28, -0.68]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.42, 0.62, 0.06]} />
        <meshStandardMaterial color="#2C221C" emissive="#170E09" emissiveIntensity={0.18} roughness={0.7} />
      </mesh>
    </group>
  )
}

function EntranceBay({ position }) {
  const archFillGeo = useMemo(() => makeArchFillGeometry(1.18, 1.48, 0.035), [])

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0.005]} geometry={archFillGeo}>
        <meshStandardMaterial color="#261D18" emissive="#1C100A" emissiveIntensity={0.35} roughness={0.55} />
      </mesh>
      <EntranceArch position={[0, 0.08, 0.07]} />
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.52, 0.105]}>
          <boxGeometry args={[0.27, 0.78, 0.035]} />
          <meshStandardMaterial
            color={COLORS.glassDark}
            emissive={COLORS.glass}
            emissiveIntensity={0.22}
            transparent
            opacity={0.78}
            roughness={0.2}
            metalness={0.08}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.94, 0.11]}>
        <boxGeometry args={[0.7, 0.05, 0.035]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.52, 0.13]}>
        <boxGeometry args={[0.035, 0.78, 0.035]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.8} />
      </mesh>
    </group>
  )
}

function SideWindows({ side }) {
  const x = side * (BUILDING.width / 2 + 0.03)
  return (
    <group rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]} position={[x, PODIUM_HEIGHT, -0.25]}>
      {BUKHAK_FLOOR_Y.map((y) =>
        [-0.52, 0.12].map((z) => <Window key={`${side}-${y}-${z}`} position={[z, y, 0.02]} />),
      )}
    </group>
  )
}

function Window({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.38, 0.34, 0.07]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.27, 0.22, 0.035]} />
        <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassDark} emissiveIntensity={0.12} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.068]}>
        <boxGeometry args={[0.29, 0.025, 0.02]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.025, 0.23, 0.02]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.8} />
      </mesh>
    </group>
  )
}

function FacadeArch({ position, scale }) {
  const archGeo = useMemo(() => makeArchGeometry(0.92, 5.58, 0.13, 0.12), [])
  return (
    <mesh position={position} scale={scale} geometry={archGeo} castShadow>
      <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} flatShading />
    </mesh>
  )
}

function EntranceArch({ position }) {
  const archGeo = useMemo(() => makeArchGeometry(1.28, 1.58, 0.18, 0.12), [])
  return (
    <mesh position={position} geometry={archGeo} castShadow>
      <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} flatShading />
    </mesh>
  )
}

function RoofDormer({ position }) {
  const dormerGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.24, 0)
    shape.lineTo(0.24, 0)
    shape.lineTo(0, 0.34)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: false })
    geo.translate(0, 0, -0.12)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group position={position}>
      <RoundedBox args={[0.58, 0.08, 0.32]} radius={0.025} smoothness={2} position={[0, -0.02, 0]} castShadow>
        <meshStandardMaterial color={COLORS.roofDark} roughness={0.9} />
      </RoundedBox>
      <mesh geometry={dormerGeo} castShadow>
        <meshStandardMaterial color={COLORS.roof} roughness={0.86} flatShading />
      </mesh>
      <mesh position={[0, 0.29, 0]} castShadow>
        <boxGeometry args={[0.42, 0.055, 0.3]} />
        <meshStandardMaterial color={COLORS.roofDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0.13]}>
        <boxGeometry args={[0.18, 0.14, 0.035]} />
        <meshStandardMaterial color={COLORS.glassDark} roughness={0.45} />
      </mesh>
    </group>
  )
}

function makeArchGeometry(width, height, thickness, depth) {
  const outerR = width / 2
  const innerR = Math.max(0.01, outerR - thickness)
  const legH = height - outerR
  const innerLegH = Math.max(0.01, legH)
  const shape = new THREE.Shape()

  shape.moveTo(-outerR, 0)
  shape.lineTo(-outerR, legH)
  shape.absarc(0, legH, outerR, Math.PI, 0, true)
  shape.lineTo(outerR, 0)
  shape.lineTo(outerR - thickness, 0)
  shape.lineTo(outerR - thickness, innerLegH)
  shape.absarc(0, innerLegH, innerR, 0, Math.PI, false)
  shape.lineTo(-outerR + thickness, 0)
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
  geo.translate(0, 0, -depth / 2)
  geo.computeVertexNormals()
  return geo
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
  geo.translate(0, 0, -depth / 2)
  geo.computeVertexNormals()
  return geo
}
