import { RoundedBox, Text } from '@react-three/drei'
import Bus from './Bus'
import GSConvenienceStore from './GSConvenienceStore'
import { BUKHAK_HALL_ISLAND } from '../config/bukhakHallLayout'

const COLORS = {
  asphalt: '#575A5D',
  roadLine: '#F3F1E7',
  soil: '#6F5A3D',
  planterGrass: '#566B38',
  grassLight: '#6F8345',
  pine: '#465F2B',
  pineDark: '#31451F',
  stoneShade: '#B8AA94',
  trunk: '#7A5132',
}

export default function BukhakHallDecorations({ island = BUKHAK_HALL_ISLAND, onGS25Click, onBus1164Click, onBus2115Click }) {
  const buildingPosition = island.building.position
  const frontZ = island.building.depth / 2
  const planterPosition = island.stairPlanters.position ?? [0, 0, frontZ + 0.22]

  return (
    <group position={buildingPosition}>
      {/* island object management around Bukhak Hall */}
      <FrontCampusArea />
      <GSConvenienceStore position={island.convenienceStore.position} rotation={island.convenienceStore.rotation} onClick={onGS25Click} />
      {island.buses.map((bus, index) => (
        <Bus
          key={`${bus.routeNumber}-${index}`}
          position={bus.position}
          rotation={bus.rotation}
          routeNumber={bus.routeNumber}
          onClick={
            bus.routeNumber === '1164' && index === 1
              ? onBus1164Click
              : bus.routeNumber === '2115'
                ? onBus2115Click
                : undefined
          }
        />
      ))}
      <BusStopSign position={island.busStopSign.position} rotation={island.busStopSign.rotation} />
      <group position={planterPosition}>
        <StairSidePlanters sideOffset={island.stairPlanters.sideOffset} />
      </group>
    </group>
  )
}

function BusStopSign({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 1.2, 8]} />
        <meshStandardMaterial color="#D7DCE0" roughness={0.72} metalness={0.2} />
      </mesh>
      <RoundedBox args={[0.78, 0.58, 0.06]} radius={0.08} smoothness={3} position={[0, 1.3, 0]} castShadow>
        <meshStandardMaterial color="#245BAA" roughness={0.62} />
      </RoundedBox>
      <mesh position={[0, 1.42, 0.04]}>
        <boxGeometry args={[0.5, 0.16, 0.018]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.58} />
      </mesh>
      <mesh position={[-0.18, 1.22, 0.04]}>
        <boxGeometry args={[0.12, 0.12, 0.018]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.58} />
      </mesh>
      <mesh position={[0.18, 1.22, 0.04]}>
        <boxGeometry args={[0.12, 0.12, 0.018]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.58} />
      </mesh>
      <Text position={[0, 1.04, 0.045]} fontSize={0.16} color="#FFFFFF" anchorX="center" anchorY="middle">
        BUS
      </Text>
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
      <RoundedBox args={[12.35, 0.055, 5.25]} radius={0.08} smoothness={2} position={[0, 0.025, 6.25]} receiveShadow>
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

function StairSidePlanters({ sideOffset = 3.3 }) {
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
        <group key={side} position={[side * sideOffset, 0.09, 1.7]}>
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
