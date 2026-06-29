import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const ANNEX = {
  length: 11.2,
  depth: 1.7,
  height: 1.65,
  roofHeight: 0.32,
}

const COLORS = {
  wall: '#7C6656',
  wallLight: '#9A8170',
  wallDark: '#5A4A40',
  mortar: '#B8A797',
  roof: '#554F4A',
  roofDark: '#403B37',
  glass: '#8EB6BE',
  glassDark: '#2F474B',
  door: '#2C2420',
  paving: '#8B929D',
  curb: '#B8AA94',
  soil: '#6F5A3D',
  shrub: '#5F7D3F',
  shrubDark: '#3F6332',
  trunk: '#7A5132',
}

export default function LeftAnnexBuilding({ annex }) {
  return (
    <group position={annex.position} rotation={annex.rotation} scale={annex.scale}>
      <AnnexPaving />
      <AnnexBody />
      <ArcadeWindows />
      <AnnexDoor />
      <AnnexLandscape />
    </group>
  )
}

function AnnexBody() {
  const roofGeo = useMemo(() => {
    const halfD = ANNEX.depth / 2 + 0.16
    const shape = new THREE.Shape()
    shape.moveTo(-halfD, 0)
    shape.lineTo(halfD, 0)
    shape.lineTo(halfD - 0.14, ANNEX.roofHeight * 0.62)
    shape.lineTo(0, ANNEX.roofHeight)
    shape.lineTo(-halfD + 0.14, ANNEX.roofHeight * 0.62)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, { depth: ANNEX.length + 0.42, bevelEnabled: false })
    geo.rotateY(Math.PI / 2)
    geo.translate(-(ANNEX.length + 0.42) / 2, 0, 0)
    geo.computeVertexNormals()
    return geo
  }, [])

  const brickRows = [0.42, 0.78, 1.14]
  const pilasters = [-4.6, -3.28, -1.96, -0.64, 0.64, 1.96, 3.28, 4.6]

  return (
    <group>
      <RoundedBox args={[ANNEX.length, ANNEX.height, ANNEX.depth]} radius={0.08} smoothness={3} position={[0, ANNEX.height / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </RoundedBox>
      <mesh geometry={roofGeo} position={[0, ANNEX.height + 0.03, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.roof} roughness={0.88} flatShading />
      </mesh>
      <RoundedBox args={[ANNEX.length + 0.5, 0.16, ANNEX.depth + 0.36]} radius={0.04} smoothness={2} position={[0, ANNEX.height + 0.02, 0]} castShadow>
        <meshStandardMaterial color={COLORS.roofDark} roughness={0.92} />
      </RoundedBox>
      {brickRows.map((y) => (
        <mesh key={y} position={[0, y, ANNEX.depth / 2 + 0.025]}>
          <boxGeometry args={[ANNEX.length - 0.38, 0.035, 0.035]} />
          <meshStandardMaterial color={COLORS.mortar} roughness={0.94} />
        </mesh>
      ))}
      {pilasters.map((x) => (
        <RoundedBox key={x} args={[0.14, ANNEX.height - 0.22, 0.1]} radius={0.035} smoothness={2} position={[x, ANNEX.height / 2 + 0.02, ANNEX.depth / 2 + 0.05]} castShadow>
          <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} />
        </RoundedBox>
      ))}
    </group>
  )
}

function ArcadeWindows() {
  const archGeo = useMemo(() => makeArchFillGeometry(0.72, 0.96, 0.04), [])
  const xs = [-4.5, -3.26, -2.02, -0.78, 0.78, 2.02, 3.26, 4.5]

  return (
    <group position={[0, 0, ANNEX.depth / 2 + 0.075]}>
      {xs.map((x) => (
        <group key={x} position={[x, 0.92, 0]}>
          <mesh geometry={archGeo}>
            <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassDark} emissiveIntensity={0.08} roughness={0.34} />
          </mesh>
          <mesh position={[0, -0.02, 0.045]}>
            <boxGeometry args={[0.04, 0.74, 0.022]} />
            <meshStandardMaterial color={COLORS.mortar} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.047]}>
            <boxGeometry args={[0.5, 0.035, 0.022]} />
            <meshStandardMaterial color={COLORS.mortar} roughness={0.8} />
          </mesh>
          <RoundedBox args={[0.88, 0.09, 0.09]} radius={0.03} smoothness={2} position={[0, -0.52, 0.02]} castShadow>
            <meshStandardMaterial color={COLORS.wallLight} roughness={0.9} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

function AnnexDoor() {
  return (
    <group position={[0, 0.52, ANNEX.depth / 2 + 0.08]}>
      <RoundedBox args={[0.62, 1.05, 0.06]} radius={0.035} smoothness={2} castShadow>
        <meshStandardMaterial color={COLORS.door} roughness={0.72} />
      </RoundedBox>
      <mesh position={[0.16, 0.03, 0.04]}>
        <boxGeometry args={[0.025, 0.72, 0.02]} />
        <meshStandardMaterial color={COLORS.mortar} roughness={0.72} />
      </mesh>
      <RoundedBox args={[0.86, 0.08, 0.18]} radius={0.025} smoothness={2} position={[0, -0.56, 0.02]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.curb} roughness={0.94} />
      </RoundedBox>
    </group>
  )
}

function AnnexPaving() {
  return (
    <group>
      <RoundedBox args={[ANNEX.length + 0.9, 0.06, ANNEX.depth + 1.1]} radius={0.08} smoothness={2} position={[0, 0.025, 0.32]} receiveShadow>
        <meshStandardMaterial color={COLORS.paving} roughness={0.96} />
      </RoundedBox>
      {[-4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8].map((x) => (
        <mesh key={x} position={[x, 0.07, 1.36]}>
          <boxGeometry args={[0.055, 0.018, 0.62]} />
          <meshStandardMaterial color={COLORS.curb} roughness={0.9} />
        </mesh>
      ))}
      <RoundedBox args={[ANNEX.length + 0.7, 0.1, 0.12]} radius={0.025} smoothness={2} position={[0, 0.09, 1.72]} receiveShadow>
        <meshStandardMaterial color={COLORS.curb} roughness={0.92} />
      </RoundedBox>
    </group>
  )
}

function AnnexLandscape() {
  const shrubs = [
    [-4.78, 1.78, 0.28, COLORS.shrubDark],
    [-3.86, 1.72, 0.34, COLORS.shrub],
    [-2.52, 1.78, 0.26, COLORS.shrub],
    [-1.28, 1.72, 0.3, COLORS.shrubDark],
    [1.28, 1.78, 0.32, COLORS.shrub],
    [2.52, 1.72, 0.28, COLORS.shrubDark],
    [3.86, 1.78, 0.3, COLORS.shrub],
    [4.78, 1.72, 0.28, COLORS.shrubDark],
  ]
  const pines = [
    [-5.42, -0.74, 0.42],
    [5.42, -0.72, 0.38],
  ]

  return (
    <group>
      <RoundedBox args={[ANNEX.length - 0.6, 0.16, 0.42]} radius={0.04} smoothness={2} position={[-0.1, 0.09, 1.86]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.soil} roughness={0.98} />
      </RoundedBox>
      {shrubs.map(([x, z, radius, color]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.28, z]} scale={[1.1, 0.5, 0.82]} castShadow receiveShadow>
          <sphereGeometry args={[radius, 7, 5]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
      ))}
      {pines.map(([x, z, scale]) => (
        <AnnexPine key={x} position={[x, 0.08, z]} scale={scale} />
      ))}
    </group>
  )
}

function AnnexPine({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.96, 6]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.96} flatShading />
      </mesh>
      {[
        [0.94, 0.5, COLORS.shrubDark],
        [1.18, 0.42, COLORS.shrub],
      ].map(([y, radius, color]) => (
        <mesh key={y} position={[0, y, 0]} scale={[1, 0.42, 1]} castShadow receiveShadow>
          <coneGeometry args={[radius, 0.54, 7]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
      ))}
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
