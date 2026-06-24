import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { PALETTE } from './constants'
import { seededRandom, randRange } from '../utils/seededRandom'

/**
 * 랜턴 — 나무 기둥 + 상단 발광 박스 + 약한 pointLight + flicker.
 * 길/광장 가장자리에 다수.
 */
const WOOD = '#7A553A'
const POSITIONS = [
  [-1.9, 0, 3.2],
  [1.9, 0, 5.4],
  [-1.9, 0, 7.4],
  [-2.8, 0, -3.4],
  [2.8, 0, -3.4],
  [6.4, 0, 0.6],
]

export default function Lantern() {
  const lights = useRef([])
  const glows = useRef([])
  const phases = useMemo(() => {
    const rnd = seededRandom(123)
    return POSITIONS.map(() => randRange(rnd, 0, Math.PI * 2))
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    POSITIONS.forEach((_, i) => {
      const f = 1 + Math.sin(t * 7 + phases[i]) * 0.12 + Math.sin(t * 13 + phases[i] * 2) * 0.06
      if (lights.current[i]) lights.current[i].intensity = 2.0 * f
      if (glows.current[i]) glows.current[i].emissiveIntensity = 1.3 * f
    })
  })

  return (
    <group>
      {POSITIONS.map((p, i) => (
        <group key={i} position={p}>
          {/* 기둥 */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1.4, 7]} />
            <meshStandardMaterial color={WOOD} roughness={0.9} />
          </mesh>
          {/* 상단 캡 */}
          <RoundedBox args={[0.34, 0.12, 0.34]} radius={0.04} smoothness={3} position={[0, 1.55, 0]} castShadow>
            <meshStandardMaterial color={PALETTE.roofShade} roughness={0.9} />
          </RoundedBox>
          {/* 발광 박스 */}
          <mesh position={[0, 1.36, 0]}>
            <boxGeometry args={[0.24, 0.3, 0.24]} />
            <meshStandardMaterial
              ref={(el) => (glows.current[i] = el)}
              color={PALETTE.lampGlow}
              emissive={PALETTE.lampGlow}
              emissiveIntensity={1.3}
              roughness={0.5}
            />
          </mesh>
          <pointLight
            ref={(el) => (lights.current[i] = el)}
            color={PALETTE.lampGlow}
            intensity={2.0}
            distance={4.5}
            decay={2}
            position={[0, 1.36, 0]}
          />
        </group>
      ))}
    </group>
  )
}
