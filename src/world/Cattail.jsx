import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PALETTE, ISLAND } from './constants'
import { seededRandom, randRange } from '../utils/seededRandom'
import { WATER_Y } from './Water'

/**
 * 갈대(부들) — 얇은 cylinder + 갈색 끝. 물가에 무리지어 바람에 흔들림.
 */
const HALF = ISLAND.size / 2

function buildClusters() {
  const rnd = seededRandom(515151)
  const clusters = []
  const n = 9
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + randRange(rnd, -0.2, 0.2)
    const r = HALF - 0.2 + randRange(rnd, -0.3, 0.5) // 물가(섬 안쪽 가장자리)
    const cx = Math.cos(a) * r
    const cz = Math.sin(a) * r
    if (Math.abs(cx) < 2.2 && cz > HALF - 1) continue // 다리 회피
    const stalks = Array.from({ length: 2 + Math.floor(rnd() * 2) }, () => ({
      dx: randRange(rnd, -0.25, 0.25),
      dz: randRange(rnd, -0.25, 0.25),
      h: randRange(rnd, 1.0, 1.6),
      phase: randRange(rnd, 0, Math.PI * 2),
    }))
    clusters.push({ cx, cz, stalks })
  }
  return clusters
}

export default function Cattail() {
  const clusters = useMemo(buildClusters, [])
  const refs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      g.rotation.z = Math.sin(t * 1.3 + i) * 0.08
      g.rotation.x = Math.cos(t * 1.0 + i * 0.7) * 0.05
    })
  })

  return (
    <group>
      {clusters.map((c, ci) => (
        <group key={ci} position={[c.cx, WATER_Y + 0.1, c.cz]}>
          {c.stalks.map((s, si) => (
            <group
              key={si}
              position={[s.dx, 0, s.dz]}
              ref={(el) => (refs.current[ci * 4 + si] = el)}
            >
              {/* 줄기 */}
              <mesh position={[0, s.h / 2, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.04, s.h, 6]} />
                <meshStandardMaterial color={PALETTE.leafDark} roughness={0.9} />
              </mesh>
              {/* 갈색 끝(부들) */}
              <mesh position={[0, s.h + 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.36, 8]} />
                <meshStandardMaterial color={PALETTE.trunk} roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}
