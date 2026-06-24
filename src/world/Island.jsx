import { RoundedBox } from '@react-three/drei'
import { PALETTE, ISLAND } from './constants'

/**
 * 섬 본체 — 둥근 토이 룩.
 *  - 잔디 윗면(큰 RoundedBox, 윗면 y=0)
 *  - 그 아래 흙 본체(살짝 좁고 깊은 블록)
 *  - 높이가 살짝 다른 잔디 슬래브 2~3장으로 단차(언덕 느낌)
 * 치수는 상단 상수로 빼서 미세조정 가능.
 */
const S = ISLAND.size
const GRASS_H = 1.4 // 잔디 슬래브 두께
const DIRT_H = 4.0 // 흙 본체 깊이

export default function Island() {
  return (
    <group>
      {/* 흙 본체 (아래로 깊게) */}
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

      {/* 잔디 윗면 (윗면 = topY) */}
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

      {/* 단차 잔디 1 — 뒤-왼쪽 언덕 (집과 겹치지 않게) */}
      <RoundedBox
        args={[S * 0.3, 0.6, S * 0.26]}
        radius={0.3}
        smoothness={4}
        position={[-S * 0.3, ISLAND.topY + 0.15, -S * 0.28]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.grassShade} roughness={0.9} />
      </RoundedBox>

      {/* 단차 잔디 2 — 앞-오른쪽 작은 둔덕 */}
      <RoundedBox
        args={[S * 0.26, 0.45, S * 0.26]}
        radius={0.25}
        smoothness={4}
        position={[S * 0.28, ISLAND.topY + 0.12, S * 0.18]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.grass} roughness={0.9} />
      </RoundedBox>
    </group>
  )
}
