import { useEffect, useState } from 'react'
import { Html, RoundedBox, Text } from '@react-three/drei'

const COLORS = {
  bus: '#23D64F',
  busDark: '#111B18',
  busLight: '#4AEA69',
  busPanel: '#16B83F',
  glass: '#182D2D',
  glassGlow: '#274B4C',
  frontGlass: '#142526',
  frontGlassGlow: '#223C3D',
  headlight: '#FFF4B8',
  tire: '#1B1B1B',
}

const SIDE_WINDOWS = [-0.18, 0.48, 1.14, 1.8]
const BODY_PANELS = [-0.58, 0.18, 0.94, 1.7]
const SIDE_MARKERS = [-0.88, 0.18, 1.2, 2.18]
const WHEEL_X_POSITIONS = [-1.58, 1.78]

const TOOLTIP_STYLE = {
  padding: '8px 13px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,.95)',
  boxShadow: '0 6px 18px rgba(17,64,125,.22)',
  color: '#172033',
  fontSize: '13px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
}

export default function Bus({ position, rotation = [0, 0, 0], routeNumber = '1164', onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const isInteractive = Boolean(onClick)

  useEffect(() => {
    return () => {
      if (isInteractive) document.body.style.cursor = 'default'
    }
  }, [isInteractive])

  const handleClick = (event) => {
    if (!isInteractive) return
    event.stopPropagation()
    onClick()
  }

  const handlePointerOver = (event) => {
    if (!isInteractive) return
    event.stopPropagation()
    setIsHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    if (!isInteractive) return
    setIsHovered(false)
    document.body.style.cursor = 'default'
  }

  return (
    <group
      position={position}
      rotation={rotation}
      scale={isHovered ? 1.035 : 1}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {isHovered && (
        <>
          <RoundedBox args={[5.65, 1.55, 1.42]} radius={0.2} smoothness={4} position={[0, 0.8, 0]} raycast={() => null}>
            <meshBasicMaterial color="#6FAEFF" transparent opacity={0.2} wireframe depthWrite={false} />
          </RoundedBox>
          <Html position={[0, 2.25, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div style={TOOLTIP_STYLE}>
              {routeNumber} 버스 정보 보기
            </div>
          </Html>
        </>
      )}

      <RoundedBox args={[5.45, 1.32, 1.22]} radius={0.18} smoothness={5} position={[0, 0.76, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.bus} roughness={0.82} />
      </RoundedBox>

      <RoundedBox args={[2.8, 0.34, 1.08]} radius={0.16} smoothness={5} position={[-0.88, 1.54, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.busLight} roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[1.45, 0.18, 0.96]} radius={0.08} smoothness={3} position={[1.42, 1.56, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#F1F3EA" roughness={0.76} />
      </RoundedBox>
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} position={[1.42 + x, 1.66, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.03, 0.46, 0.018]} />
          <meshStandardMaterial color="#C9CDC3" roughness={0.85} />
        </mesh>
      ))}

      <BusWindowSide z={0.68} bandZ={0.645} sideWindows={SIDE_WINDOWS} />
      <DriverWindow position={[-2.1, 1.0, 0.68]} />
      <BusWindowSide z={-0.68} bandZ={-0.645} sideWindows={SIDE_WINDOWS} sideKey="right" />
      <BusSideDoor position={[-2.2, 0, -0.69]} />

      <RoundedBox args={[0.08, 0.82, 0.94]} radius={0.08} smoothness={3} position={[-2.76, 1.02, 0]} castShadow>
        <meshStandardMaterial color={COLORS.busDark} roughness={0.58} />
      </RoundedBox>
      <mesh position={[-2.81, 1.08, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.72, 0.5, 0.035]} />
        <meshStandardMaterial color={COLORS.frontGlass} emissive={COLORS.frontGlassGlow} emissiveIntensity={0.12} roughness={0.22} />
      </mesh>

      {BODY_PANELS.map((x) => (
        <mesh key={x} position={[x, 0.48, 0.655]}>
          <boxGeometry args={[0.58, 0.44, 0.028]} />
          <meshStandardMaterial color={COLORS.busPanel} roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[2.28, 0.58, 0.655]}>
        <boxGeometry args={[0.42, 0.5, 0.028]} />
        <meshStandardMaterial color={COLORS.busPanel} roughness={0.86} />
      </mesh>
      <Text position={[1.48, 0.7, 0.69]} fontSize={0.42} color="#F7F7EF" anchorX="center" anchorY="middle">
        {routeNumber}
      </Text>

      <mesh position={[-2.82, 0.44, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.82, 0.12, 0.04]} />
        <meshStandardMaterial color="#1D2522" roughness={0.82} />
      </mesh>
      {[-0.34, 0.34].map((z) => (
        <mesh key={z} position={[-2.855, 0.52, z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.22, 0.26, 0.035]} />
          <meshStandardMaterial color={COLORS.headlight} emissive={COLORS.headlight} emissiveIntensity={0.35} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[-2.865, 0.28, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.3, 0.16, 0.035]} />
        <meshStandardMaterial color="#F2C43A" roughness={0.72} />
      </mesh>
      <mesh position={[-2.87, 0.66, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.12, 0.018, 6, 16]} />
        <meshStandardMaterial color="#D9E0D8" roughness={0.58} />
      </mesh>
      <Text position={[-2.48, 0.78, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.28} color="#F7F7EF" anchorX="center" anchorY="middle">
        {routeNumber}
      </Text>

      {SIDE_MARKERS.map((x) => (
        <mesh key={x} position={[x, 0.35, 0.69]}>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshStandardMaterial color="#FFC94A" emissive="#FFC94A" emissiveIntensity={0.22} roughness={0.45} />
        </mesh>
      ))}

      <BusRear routeNumber={routeNumber} />

      {WHEEL_X_POSITIONS.map((x) => (
        <BusWheel key={x} position={[x, 0.24, 0.62]} radius={0.31} />
      ))}
      {WHEEL_X_POSITIONS.map((x) => (
        <BusWheel key={`far-${x}`} position={[x, 0.24, -0.62]} radius={0.27} />
      ))}
    </group>
  )
}

function BusWindowSide({ z, bandZ, sideWindows, sideKey = 'left' }) {
  return (
    <>
      <RoundedBox args={[4.04, 0.62, 0.055]} radius={0.05} smoothness={2} position={[0.55, 1.06, bandZ]} castShadow>
        <meshStandardMaterial color={COLORS.busDark} roughness={0.62} />
      </RoundedBox>
      {sideWindows.map((x) => (
        <mesh key={`${sideKey}-${x}`} position={[x, 1.08, z]}>
          <boxGeometry args={[0.52, 0.44, 0.035]} />
          <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassGlow} emissiveIntensity={0.1} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[-0.84, 1.08, z]}>
        <boxGeometry args={[0.52, 0.44, 0.035]} />
        <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassGlow} emissiveIntensity={0.1} roughness={0.24} />
      </mesh>
    </>
  )
}

function BusRear({ routeNumber }) {
  return (
    <group position={[2.7, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[1.02, 0.56, 0.055]} radius={0.06} smoothness={2} position={[0, 1.08, 0.03]} castShadow>
        <meshStandardMaterial color={COLORS.busDark} roughness={0.62} />
      </RoundedBox>
      <mesh position={[0, 1.08, 0.07]}>
        <boxGeometry args={[0.82, 0.34, 0.032]} />
        <meshStandardMaterial color="#152525" emissive="#213A3A" emissiveIntensity={0.1} roughness={0.25} />
      </mesh>
      <Text position={[0.22, 1.12, 0.1]} fontSize={0.2} color="#F7F7EF" anchorX="center" anchorY="middle">
        {routeNumber}
      </Text>
      <mesh position={[0, 0.72, 0.07]}>
        <boxGeometry args={[0.72, 0.12, 0.03]} />
        <meshStandardMaterial color="#DDE0D7" roughness={0.55} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.4, 0.075]}>
        <boxGeometry args={[0.36, 0.16, 0.01]} />
        <meshStandardMaterial color="#F2C43A" roughness={0.72} />
      </mesh>
      <Text position={[0, 0.4, 0.1]} fontSize={0.1} color="#2C2410" anchorX="center" anchorY="middle">
        {routeNumber}
      </Text>
      {[-0.57, 0.57].map((x) => (
        <mesh key={`white-${x}`} position={[x, 0.38, 0.01]}>
          <boxGeometry args={[0.08, 0.14, 0.025]} />
          <meshStandardMaterial color="#F2F0DE" emissive="#F2F0DE" emissiveIntensity={0.18} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0.06]}>
        <boxGeometry args={[0.94, 0.16, 0.01]} />
        <meshStandardMaterial color="#333A37" roughness={0.82} />
      </mesh>
    </group>
  )
}

function DriverWindow({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.82, 0.78, 0.05]} radius={0.08} smoothness={4} position={[0, 0.02, 0]} castShadow>
        <meshStandardMaterial color={COLORS.busDark} roughness={0.58} />
      </RoundedBox>
      <mesh position={[0, 0.08, 0.028]}>
        <boxGeometry args={[0.64, 0.42, 0.025]} />
        <meshStandardMaterial color="#1B3031" emissive="#2A4C4D" emissiveIntensity={0.12} roughness={0.22} />
      </mesh>
      <mesh position={[0, -0.2, 0.029]}>
        <boxGeometry args={[0.54, 0.16, 0.024]} />
        <meshStandardMaterial color="#1A2B2C" emissive="#243F40" emissiveIntensity={0.08} roughness={0.26} />
      </mesh>
      <mesh position={[0, -0.3, 0.03]} scale={[0.62, 0.18, 0.04]}>
        <sphereGeometry args={[0.48, 16, 8]} />
        <meshStandardMaterial color="#162728" emissive="#243F40" emissiveIntensity={0.08} roughness={0.28} />
      </mesh>
      <mesh position={[-0.16, 0.08, 0.045]}>
        <boxGeometry args={[0.035, 0.54, 0.018]} />
        <meshStandardMaterial color="#2F3C39" roughness={0.78} />
      </mesh>
      <mesh position={[0, -0.08, 0.045]}>
        <boxGeometry args={[0.66, 0.035, 0.018]} />
        <meshStandardMaterial color="#2F3C39" roughness={0.78} />
      </mesh>
      <mesh position={[0.34, -0.34, 0.05]}>
        <boxGeometry args={[0.12, 0.06, 0.018]} />
        <meshStandardMaterial color="#F1C64C" emissive="#F1C64C" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
    </group>
  )
}

function BusSideDoor({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[0.72, 0.92, 0.035]} />
        <meshStandardMaterial color={COLORS.busDark} roughness={0.58} />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 1.0, -0.025]}>
          <boxGeometry args={[0.28, 0.42, 0.025]} />
          <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassGlow} emissiveIntensity={0.1} roughness={0.24} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, -0.04]}>
        <boxGeometry args={[0.035, 0.86, 0.02]} />
        <meshStandardMaterial color="#202A27" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.38, -0.035]}>
        <boxGeometry args={[0.62, 0.035, 0.02]} />
        <meshStandardMaterial color="#202A27" roughness={0.78} />
      </mesh>
    </group>
  )
}

function BusWheel({ position, radius }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, 0.16, 16]} />
        <meshStandardMaterial color={COLORS.tire} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.085]}>
        <cylinderGeometry args={[radius * 0.52, radius * 0.52, 0.035, 12]} />
        <meshStandardMaterial color="#C9CCC4" roughness={0.58} metalness={0.25} />
      </mesh>
    </group>
  )
}
