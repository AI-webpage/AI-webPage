import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from './constants'
import { createToonWater } from '../materials/toonWater'
import { seededRandom, randRange } from '../utils/seededRandom'

/**
 * 우측 광장의 작은 돌 연못.
 *  - 돌(RoundedBox) 링 + 안쪽 물 평면(원형) + 부들 몇 개.
 */
const CENTER = [5.6, 0, 2.2]
const RADIUS = 1.5
const STONE = '#B9B0A2'
const STONE_DARK = '#938A7C'

export default function StonePond() {
  const material = useMemo(
    () =>
      createToonWater({
        color: PALETTE.water,
        bright: PALETTE.waterBright,
        opacity: 0.85,
        flow: [0.06, 0.05],
        scale: 5.0,
      }),
    [],
  )
  const matRef = useRef(material)

  const stones = useMemo(() => {
    const rnd = seededRandom(31313)
    const n = 11
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      const r = RADIUS + randRange(rnd, -0.1, 0.12)
      const s = randRange(rnd, 0.45, 0.7)
      return {
        pos: [Math.cos(a) * r, randRange(rnd, 0.12, 0.24), Math.sin(a) * r],
        scale: [s, s * randRange(rnd, 0.6, 0.85), s],
        rot: randRange(rnd, 0, Math.PI),
        dark: rnd() > 0.5,
      }
    })
  }, [])

  useFrame(({ clock }) => {
    matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <group position={CENTER}>
      {/* 돌 링 */}
      {stones.map((s, i) => (
        <RoundedBox
          key={i}
          args={[s.scale[0], s.scale[1], s.scale[2]]}
          radius={0.16}
          smoothness={3}
          position={s.pos}
          rotation={[0, s.rot, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={s.dark ? STONE_DARK : STONE} roughness={0.95} />
        </RoundedBox>
      ))}

      {/* 안쪽 물 */}
      <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
        <circleGeometry args={[RADIUS * 0.92, 32]} />
      </mesh>

      {/* 부들 몇 개 (가장자리) */}
      {[
        [RADIUS * 0.7, 0, RADIUS * 0.4],
        [-RADIUS * 0.6, 0, RADIUS * 0.5],
        [RADIUS * 0.2, 0, -RADIUS * 0.7],
      ].map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 1.2, 6]} />
            <meshStandardMaterial color={PALETTE.leafDark} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.42, 8]} />
            <meshStandardMaterial color={PALETTE.trunk} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
