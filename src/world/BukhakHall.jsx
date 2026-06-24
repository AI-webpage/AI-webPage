import { useMemo } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

const BUILDING = {
  x: 0,
  y: 0,
  z: -10,
  width: 8.6,
  height: 4.45,
  depth: 2.6,
}

const COLORS = {
  wall: '#D7B888',
  wallLight: '#F0E5CC',
  wallShade: '#B98F62',
  roof: '#BBA985',
  roofDark: '#8D7655',
  glass: '#A9CBD2',
  glassDark: '#6F8D95',
  door: '#4B362A',
  stone: '#D8CDB7',
  stoneShade: '#B8AA94',
  porticoRoof: '#6F665A',
  porticoRoofDark: '#51493F',
  entranceGlow: '#F6D39A',
  asphalt: '#575A5D',
  asphaltDark: '#45494C',
  roadLine: '#F3F1E7',
  bus: '#41A85F',
  busDark: '#2F7D46',
  busLight: '#6CC97E',
  tire: '#1B1B1B',
  soil: '#6F5A3D',
  planterGrass: '#566B38',
  grassLight: '#6F8345',
  pine: '#465F2B',
  pineDark: '#31451F',
  trunk: '#7A5132',
}

const FRONT_Z = BUILDING.depth / 2
const PODIUM_HEIGHT = 0.9
const FLOOR_Y = [0.92, 1.62, 2.34, 3.08]
const WINDOW_X = [-3.46, -2.82, -2.16, -1.5, 1.5, 2.16, 2.82, 3.46]
const COLUMN_X = [-3.8, -2.95, -2.1, -1.25, 1.25, 2.1, 2.95, 3.8]
const DORMER_X = [-3.7, -2.7, -1.7, -0.7, 0.7, 1.7, 2.7, 3.7]

export default function BukhakHall() {
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
    <group position={[BUILDING.x, BUILDING.y, BUILDING.z]}>
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

      {DORMER_X.map((x) => (
        <RoofDormer key={x} position={[x, PODIUM_HEIGHT + BUILDING.height + 0.54, FRONT_Z + 0.13]} />
      ))}

      <FacadeRhythm />
      <WindowGrid />
      <CentralEntrance />
      <BasementStairsLeft />
      <FrontCampusArea />
      <Route1164Bus position={[-100, 0.12, 110]} />
      <SideWindows side={-1} />
      <SideWindows side={1} />
    </group>
  )
}

function FrontCampusArea() {
  const parkingLines = [
    [3.1, 7.12, 1.05],
    [4.35, 7.12, 1.05],
    [5.6, 7.12, 1.05],
  ]

  return (
    <group>
      {/* front road and open paved entry area */}
      <RoundedBox
        args={[12.35, 0.055, 5.25]}
        radius={0.08}
        smoothness={2}
        position={[0, 0.025, 6.25]}
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.asphalt} roughness={0.96} />
      </RoundedBox>
      <mesh position={[0, 0.092, 6.05]}>
        <boxGeometry args={[2.9, 0.018, 0.08]} />
        <meshStandardMaterial color={COLORS.roadLine} roughness={0.7} />
      </mesh>
      {[-0.66, -0.22, 0.22, 0.66].map((x) => (
        <mesh key={x} position={[x, 0.105, 5.18]}>
          <boxGeometry args={[0.28, 0.02, 1.55]} />
          <meshStandardMaterial color={COLORS.roadLine} roughness={0.74} />
        </mesh>
      ))}

      {/* right side building hint and connected landscaping */}
      <RoundedBox
        args={[1.45, 2.8, 1.9]}
        radius={0.08}
        smoothness={3}
        position={[5.08, PODIUM_HEIGHT + 1.42, -0.08]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={COLORS.wallShade} roughness={0.9} />
      </RoundedBox>
      <mesh position={[5.08, PODIUM_HEIGHT + 2.9, -0.08]} castShadow>
        <boxGeometry args={[1.65, 0.2, 2.08]} />
        <meshStandardMaterial color={COLORS.roofDark} roughness={0.9} />
      </mesh>

      {/* parking area */}
      {parkingLines.map(([x, z, depth]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.11, z]}>
          <boxGeometry args={[0.07, 0.02, depth]} />
          <meshStandardMaterial color={COLORS.roadLine} roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[4.35, 0.11, 6.58]}>
        <boxGeometry args={[2.45, 0.02, 0.07]} />
        <meshStandardMaterial color={COLORS.roadLine} roughness={0.72} />
      </mesh>
    </group>
  )
}

function Route1164Bus({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[4.8, 1.28, 1.22]} radius={0.12} smoothness={4} position={[0, 0.78, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.bus} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[1.28, 1.02, 1.18]} radius={0.1} smoothness={3} position={[-1.76, 0.86, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.busLight} roughness={0.82} />
      </RoundedBox>
      <mesh position={[0.44, 1.04, -0.63]}>
        <boxGeometry args={[2.72, 0.38, 0.035]} />
        <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassDark} emissiveIntensity={0.08} roughness={0.28} />
      </mesh>
      <mesh position={[-1.74, 1.06, -0.63]}>
        <boxGeometry args={[0.74, 0.42, 0.035]} />
        <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassDark} emissiveIntensity={0.08} roughness={0.28} />
      </mesh>
      <mesh position={[-2.42, 0.94, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.72, 0.46, 0.04]} />
        <meshStandardMaterial color={COLORS.glassDark} roughness={0.32} />
      </mesh>
      <mesh position={[0.28, 0.42, -0.64]}>
        <boxGeometry args={[3.92, 0.12, 0.045]} />
        <meshStandardMaterial color={COLORS.busDark} roughness={0.88} />
      </mesh>
      <Text
        position={[0.46, 0.78, -0.675]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.34}
        color="#F7F7EF"
        anchorX="center"
        anchorY="middle"
      >
        1164
      </Text>
      <Text
        position={[-2.48, 0.78, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.28}
        color="#F7F7EF"
        anchorX="center"
        anchorY="middle"
      >
        1164
      </Text>
      {[-1.48, 1.48].map((x) => (
        <BusWheel key={x} position={[x, 0.24, -0.62]} radius={0.28} />
      ))}
      {[-1.48, 1.48].map((x) => (
        <BusWheel key={`far-${x}`} position={[x, 0.24, 0.62]} radius={0.25} />
      ))}
    </group>
  )
}

function BusWheel({ position, radius }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[radius, radius, 0.14, 12]} />
      <meshStandardMaterial color={COLORS.tire} roughness={0.9} />
    </mesh>
  )
}

function FacadeRhythm() {
  return (
    <group position={[0, PODIUM_HEIGHT, FRONT_Z + 0.035]}>
      <mesh position={[0, 4.0, 0]}>
        <boxGeometry args={[BUILDING.width + 0.05, 0.3, 0.16]} />
        <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} />
      </mesh>

      {COLUMN_X.map((x) => (
        <group key={x}>
          <RoundedBox
            args={[0.18, 3.8, 0.2]}
            radius={0.06}
            smoothness={3}
            position={[x, 2.16, 0.03]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={COLORS.wallLight} roughness={0.88} />
          </RoundedBox>
          <FacadeArch position={[x, 3.55, 0.095]} scale={[0.52, 0.7, 1]} />
        </group>
      ))}
    </group>
  )
}

function WindowGrid() {
  return (
    <group position={[0, PODIUM_HEIGHT, FRONT_Z + 0.08]}>
      {FLOOR_Y.flatMap((y, row) =>
        WINDOW_X.map((x) => <Window key={`${row}-${x}`} position={[x, y, 0.03]} />),
      )}
      {[-0.72, 0.72].map((x) =>
        FLOOR_Y.slice(1).map((y) => <Window key={`center-${x}-${y}`} position={[x, y, 0.03]} />),
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

      <StairSidePlanters />

      <pointLight color={COLORS.entranceGlow} intensity={1.8} distance={4.8} decay={2} position={[0, PODIUM_HEIGHT + 1.08, 0.64]} />
    </group>
  )
}

function StairSidePlanters() {
  const trees = [
    { x: -0.48, z: -1.1, scale: 0.58, rotation: 0.25 },
    { x: 0.5, z: -0.56, scale: 0.66, rotation: 0.8 },
    { x: -0.24, z: 0.04, scale: 0.62, rotation: 1.3 },
    { x: 0.44, z: 0.66, scale: 0.7, rotation: 1.9 },
    { x: -0.42, z: 1.18, scale: 0.6, rotation: 2.35 },
  ]

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.3, 0.09, 1.7]}>
          <TreePlanter size={[2.05, 0.42, 3.08]} />
          {trees.map((tree) => (
            <SmallPine
              key={`${tree.x}-${tree.z}`}
              position={[side * tree.x, 0.34, tree.z]}
              scale={tree.scale}
              rotation={side * tree.rotation}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

function TreePlanter({ size }) {
  const [w, h, d] = size
  const grassPatches = [
    [-0.66, -1.22, 0.18],
    [-0.2, -1.02, -0.12],
    [0.42, -1.18, 0.28],
    [-0.5, -0.52, 0.46],
    [0.06, -0.42, -0.32],
    [0.7, -0.5, 0.08],
    [-0.74, 0.08, -0.22],
    [-0.1, 0.18, 0.34],
    [0.52, 0.06, -0.46],
    [-0.46, 0.64, 0.14],
    [0.18, 0.72, -0.18],
    [0.72, 0.58, 0.38],
    [-0.62, 1.16, -0.38],
    [0.0, 1.2, 0.12],
    [0.56, 1.08, -0.06],
  ]

  return (
    <group>
      <RoundedBox args={[w, 0.08, d]} radius={0.05} smoothness={2} position={[0, 0.03, 0]} receiveShadow>
        <meshStandardMaterial color={COLORS.soil} roughness={0.98} />
      </RoundedBox>
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[w * 0.82, 0.035, d * 0.86]} />
        <meshStandardMaterial color={COLORS.planterGrass} roughness={0.95} />
      </mesh>
      {grassPatches.map(([x, z, rotation]) => (
        <GrassTuft key={`${x}-${z}`} position={[x, 0.16, z]} rotation={rotation} />
      ))}
      <PlanterWall position={[0, h / 2, -d / 2]} size={[w, h, 0.14]} />
      <PlanterWall position={[0, h / 2, d / 2]} size={[w, h, 0.14]} />
      <PlanterWall position={[-w / 2, h / 2, 0]} size={[0.14, h, d]} />
      <PlanterWall position={[w / 2, h / 2, 0]} size={[0.14, h, d]} />
    </group>
  )
}

function GrassTuft({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.08, 0, 0.08].map((x, index) => (
        <mesh key={x} position={[x, 0.07 + index * 0.015, 0]} rotation={[0.16 - index * 0.13, 0, x * 2.2]} castShadow>
          <coneGeometry args={[0.035, 0.2 + index * 0.025, 4]} />
          <meshStandardMaterial color={index === 1 ? COLORS.grassLight : COLORS.planterGrass} roughness={0.92} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function PlanterWall({ position, size }) {
  return (
    <RoundedBox args={size} radius={0.035} smoothness={2} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={COLORS.stoneShade} roughness={0.96} />
    </RoundedBox>
  )
}

function SmallPine({ position, scale = 1, rotation = 0 }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.15, 0.96, 6]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.96} flatShading />
      </mesh>
      {[
        { y: 0.98, radius: 0.68, color: COLORS.pineDark },
        { y: 1.28, radius: 0.54, color: COLORS.pine },
        { y: 1.55, radius: 0.4, color: COLORS.pine },
      ].map((branch) => (
        <mesh key={branch.y} position={[0, branch.y, 0]} scale={[1, 0.42, 1]} castShadow receiveShadow>
          <coneGeometry args={[branch.radius, 0.62, 7]} />
          <meshStandardMaterial color={branch.color} roughness={0.9} flatShading />
        </mesh>
      ))}
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
      {[1.08, 1.92, 2.76].map((y) =>
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
  const archGeo = useMemo(() => makeArchGeometry(0.55, 0.88, 0.16, 0.08), [])
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
      <mesh geometry={dormerGeo} castShadow>
        <meshStandardMaterial color={COLORS.roof} roughness={0.86} flatShading />
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
