import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { PALETTE, ISLAND } from '../config/constants'

const S = ISLAND.size
const half = S / 2
const PER_SIDE = 6
const OUT_DEPTH = 2.3

function TerraceBlock({ x, z, w, d, h, top }) {
  return (
    <group position={[x, 0, z]}>
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
    const w = (span / PER_SIDE) * 0.98
    const edge = half - 0.3

    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < PER_SIDE; i++) {
        const along = ((i + 0.5) / PER_SIDE - 0.5) * span
        const idx = side * PER_SIDE + i
        const h = 2.6 + ((idx * 37) % 5) * 0.45
        const top = 0.15 + ((idx * 53) % 4) * 0.18
        let x, z, bw, bd

        if (side === 0) {
          x = along
          z = -edge
          bw = w
          bd = OUT_DEPTH
        } else if (side === 1) {
          x = along
          z = edge
          bw = w
          bd = OUT_DEPTH
        } else if (side === 2) {
          x = -edge
          z = along
          bw = OUT_DEPTH
          bd = w
        } else {
          x = edge
          z = along
          bw = OUT_DEPTH
          bd = w
        }

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
