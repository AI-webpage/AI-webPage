import { useEffect, useState } from 'react'
import { Html, RoundedBox, Text } from '@react-three/drei'

const COLORS = {
  wall: '#E7D6B6',
  sideWall: '#CBAF83',
  roof: '#5D5347',
  signBlue: '#245BAA',
  signGreen: '#20A75B',
  signOrange: '#F07B2B',
  glass: '#A9CBD2',
  glassDark: '#263A3E',
  floor: '#CFC5AE',
  frame: '#F3F0E8',
  bin: '#465356',
}

export default function GSConvenienceStore({ position, rotation = [0, 0, 0], onClick }) {
  const [isGS25Hovered, setIsGS25Hovered] = useState(false)

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
      position={position}
      rotation={rotation}
      scale={isGS25Hovered ? 1.05 : 1}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation()
        setIsGS25Hovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setIsGS25Hovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {isGS25Hovered && (
        <>
          {/* Soft brand-colored outline around the clickable building. */}
          <RoundedBox
            args={[2.58, 1.67, 1.01]}
            radius={0.1}
            smoothness={3}
            position={[0, 0.8, 0]}
            raycast={() => null}
          >
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.2}
              wireframe
              depthWrite={false}
            />
          </RoundedBox>

          {/* Low-opacity floor ring keeps the highlight grounded in the scene. */}
          <mesh
            position={[0, 0.025, 0.45]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
          >
            <ringGeometry args={[1.38, 1.72, 48]} />
            <meshBasicMaterial
              color="#FFFFFF"
              transparent
              opacity={0.24}
              depthWrite={false}
            />
          </mesh>

          <Html
            position={[0, 2.08, 0]}
            center
            zIndexRange={[100, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                padding: '8px 13px',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.94)',
                boxShadow: '0 6px 18px rgba(255, 255, 255, 0.2)',
                color: '#172033',
                fontSize: '13px',
                fontWeight: 700,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              GS25 둘러보기
            </div>
          </Html>
        </>
      )}

      {/* GS convenience store: left side store area */}
      <RoundedBox args={[2.45, 1.54, 0.88]} radius={0.07} smoothness={3} position={[0, 0.78, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 1.63, 0.02]} castShadow>
        <boxGeometry args={[2.62, 0.18, 1.02]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.88} />
      </mesh>

      {/* simplified GS25 sign */}
      <RoundedBox args={[2.18, 0.36, 0.08]} radius={0.04} smoothness={2} position={[0, 1.36, 0.49]} castShadow>
        <meshStandardMaterial color={COLORS.signBlue} roughness={0.7} />
      </RoundedBox>
      <mesh position={[-0.58, 1.36, 0.535]}>
        <boxGeometry args={[0.42, 0.36, 0.018]} />
        <meshStandardMaterial color={COLORS.signGreen} roughness={0.72} />
      </mesh>
      <mesh position={[0.84, 1.36, 0.536]}>
        <boxGeometry args={[0.22, 0.36, 0.02]} />
        <meshStandardMaterial color={COLORS.signOrange} roughness={0.72} />
      </mesh>
      <Text position={[0.08, 1.37, 0.58]} fontSize={0.25} color="#FFFFFF" anchorX="center" anchorY="middle">
        GS25
      </Text>

      {/* storefront glass door and show windows */}
      <StoreWindow position={[-0.72, 0.82, 0.5]} size={[0.72, 0.78, 0.055]} />
      <GlassDoor position={[0.1, 0.73, 0.51]} />
      <StoreWindow position={[0.82, 0.82, 0.5]} size={[0.62, 0.78, 0.055]} />

      <ShelfHint position={[-0.72, 0.68, 0.45]} />
      <ShelfHint position={[0.82, 0.68, 0.45]} />

      {/* small walking space and simple street furniture */}
      <RoundedBox args={[2.9, 0.08, 0.92]} radius={0.04} smoothness={2} position={[0, 0.04, 0.95]} receiveShadow>
        <meshStandardMaterial color={COLORS.floor} roughness={0.92} />
      </RoundedBox>
      <StandingSign position={[-1.08, 0.08, 1.28]} />
      <TrashBin position={[1.12, 0.08, 1.23]} />
    </group>
  )
}

function StoreWindow({ position, size }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={COLORS.frame} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[size[0] * 0.82, size[1] * 0.78, 0.032]} />
        <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassDark} emissiveIntensity={0.12} roughness={0.22} transparent opacity={0.78} />
      </mesh>
    </group>
  )
}

function GlassDoor({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.96, 0.06]} />
        <meshStandardMaterial color={COLORS.frame} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.03, 0.035]}>
        <boxGeometry args={[0.36, 0.78, 0.032]} />
        <meshStandardMaterial color={COLORS.glass} emissive={COLORS.glassDark} emissiveIntensity={0.14} roughness={0.22} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0.16, 0, 0.065]}>
        <boxGeometry args={[0.025, 0.62, 0.018]} />
        <meshStandardMaterial color="#E9E4D6" roughness={0.5} />
      </mesh>
    </group>
  )
}

function ShelfHint({ position }) {
  return (
    <group position={position}>
      {[0, 0.16].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.44, 0.045, 0.05]} />
          <meshStandardMaterial color="#E5C77B" roughness={0.84} />
        </mesh>
      ))}
    </group>
  )
}

function StandingSign({ position }) {
  return (
    <group position={position} rotation={[0, -0.2, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.34, 0.48, 0.045]} />
        <meshStandardMaterial color={COLORS.signBlue} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.5, 0.03]}>
        <boxGeometry args={[0.3, 0.08, 0.018]} />
        <meshStandardMaterial color={COLORS.signGreen} roughness={0.72} />
      </mesh>
      <Text position={[0, 0.3, 0.04]} fontSize={0.08} color="#FFFFFF" anchorX="center" anchorY="middle">
        GS
      </Text>
    </group>
  )
}

function TrashBin({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.26, 0.42, 0.26]} radius={0.04} smoothness={2} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.bin} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[0.32, 0.05, 0.32]} />
        <meshStandardMaterial color="#2E383A" roughness={0.86} />
      </mesh>
    </group>
  )
}
