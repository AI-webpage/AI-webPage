import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from './constants'
import { createToonWater } from '../materials/toonWater'
import { seededRandom, randRange } from '../utils/seededRandom'
import { WATER_Y } from './Water'

/**
 * 폭포 — 우상단(뒤-오른쪽) 기울인 평면에 아래로 스크롤되는 물 + 하단 흰 물보라.
 */
const POS = [10.5, 1.2, -10.0] // 폭포 위치 (back-right)
const WIDTH = 3.0
const HEIGHT = 4.2

export default function Waterfall() {
  const material = useMemo(
    () =>
      createToonWater({
        color: PALETTE.water,
        bright: PALETTE.waterBright,
        opacity: 0.92,
        flow: [0.0, -2.6], // 아래로 강하게 흐름
        scale: 5.0,
        emissive: 0.15,
      }),
    [],
  )
  const matRef = useRef(material)

  const spray = useMemo(() => {
    const rnd = seededRandom(4242)
    return Array.from({ length: 12 }, () => ({
      pos: [
        POS[0] + randRange(rnd, -1.4, 1.4),
        WATER_Y + randRange(rnd, 0.0, 0.5),
        POS[2] + randRange(rnd, -1.0, 1.2),
      ],
      r: randRange(rnd, 0.12, 0.26),
    }))
  }, [])

  useFrame(({ clock }) => {
    matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <group>
      {/* 흐르는 물 평면 (기울임 + 카메라 쪽으로 회전) */}
      <mesh
        material={material}
        position={POS}
        rotation={[-0.12, Math.PI * 0.25, 0]}
      >
        <planeGeometry args={[WIDTH, HEIGHT, 1, 1]} />
      </mesh>

      {/* 하단 물보라 */}
      <Float speed={3} rotationIntensity={0} floatIntensity={0.6}>
        {spray.map((s, i) => (
          <mesh key={i} position={s.pos}>
            <sphereGeometry args={[s.r, 10, 10]} />
            <meshStandardMaterial
              color={PALETTE.waterBright}
              emissive={PALETTE.waterBright}
              emissiveIntensity={0.3}
              roughness={0.6}
            />
          </mesh>
        ))}
      </Float>
    </group>
  )
}
