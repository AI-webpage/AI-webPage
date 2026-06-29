import { RoundedBox } from '@react-three/drei'
import { PALETTE, ISLAND } from '../config/constants'

const S = ISLAND.size
const GRASS_H = 1.4
const DIRT_H = 4.0

export default function Island() {
  return (
    <group>
      <RoundedBox
        args={[S * 0.95, DIRT_H, S * 0.95]}
        radius={0.5}
        smoothness={4}
        position={[0, ISLAND.topY - GRASS_H - DIRT_H / 2 + 0.2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.trunk} roughness={0.98} />
      </RoundedBox>

      <RoundedBox
        args={[S, GRASS_H, S]}
        radius={0.55}
        smoothness={4}
        position={[0, ISLAND.topY - GRASS_H / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.grass} roughness={0.9} />
      </RoundedBox>
    </group>
  )
}
