import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { PALETTE, ISLAND } from './constants'

/**
 * 섬 둘레의 두꺼운 계단식 테라스(스크린샷의 들쭉날쭉한 나무 테두리).
 *  - 네 변을 따라 블록을 늘어놓되 높이를 들쭉날쭉하게.
 *  - 각 블록 = 옆면(terraceSide) 본체 + 윗면(terraceTop) 캡.
 */
const S = ISLAND.size
const half = S / 2
const PER_SIDE = 6 // 한 변당 블록 수
const OUT_DEPTH = 2.3 // 바깥쪽 두께

function TerraceBlock({ x, z, w, d, h, top }) {
  return (
    <group position={[x, 0, z]}>
      {/* 옆면 본체 (아래로) */}
      <RoundedBox
        args={[w, h, d]}
        radius={0.22}
        smoothness={4}
        position={[0, top - h / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.terraceSide} roughness={0.95} />
      </RoundedBox>
      {/* 윗면 캡 */}
      <RoundedBox
        args={[w * 0.98, 0.5, d * 0.98]}
        radius={0.16}
        smoothness={4}
        position={[0, top - 0.12, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.terraceTop} roughness={0.85} />
      </RoundedBox>
    </group>
  )
}

export default function Terrace() {
  const blocks = useMemo(() => {
    const arr = []
    const span = S * 0.96
    const w = (span / PER_SIDE) * 0.98 // 변 방향 폭
    const edge = half - 0.3
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < PER_SIDE; i++) {
        const along = ((i + 0.5) / PER_SIDE - 0.5) * span
        const idx = side * PER_SIDE + i
        const h = 2.6 + ((idx * 37) % 5) * 0.45 // 2.6 ~ 4.4 (들쭉날쭉)
        const top = 0.15 + ((idx * 53) % 4) * 0.18 // 윗면 높이 변주
        let x, z, bw, bd
        if (side === 0) { x = along; z = -edge; bw = w; bd = OUT_DEPTH }
        else if (side === 1) { x = along; z = edge; bw = w; bd = OUT_DEPTH }
        else if (side === 2) { x = -edge; z = along; bw = OUT_DEPTH; bd = w }
        else { x = edge; z = along; bw = OUT_DEPTH; bd = w }
        arr.push({ key: idx, x, z, w: bw, d: bd, h, top })
      }
    }
    return arr
  }, [])

  return (
    <group>
      {blocks.map((b) => (
        <TerraceBlock key={b.key} x={b.x} z={b.z} w={b.w} d={b.d} h={b.h} top={b.top} />
      ))}
    </group>
  )
}
