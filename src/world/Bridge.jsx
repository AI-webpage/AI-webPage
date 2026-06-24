import { RoundedBox } from '@react-three/drei'
import { PALETTE, ISLAND } from './constants'
import { WATER_Y } from './Water'

/**
 * 앞쪽(z+) 해자를 건너는 나무 다리.
 *  - 판자(RoundedBox) 반복 데크 + 양쪽 난간(기둥+레일) + 안쪽 끝 계단 몇 단.
 *  - 길(x=0)과 정렬.
 */
const HALF = ISLAND.size / 2
const WOOD = '#9A6B43'
const WOOD_DARK = '#7A553A'
const DECK_Y = 0.05
const Z_IN = HALF - 0.6 // 섬 쪽 끝 (≈9.4)
const Z_OUT = HALF + 3.6 // 바깥 끝 (≈13.6)

export default function Bridge() {
  const planks = []
  const n = 11
  for (let i = 0; i < n; i++) {
    const z = Z_IN + ((i + 0.5) / n) * (Z_OUT - Z_IN)
    planks.push(z)
  }
  const railZ = [Z_IN + 0.4, (Z_IN + Z_OUT) / 2, Z_OUT - 0.4]

  return (
    <group>
      {/* 데크 받침 */}
      <RoundedBox
        args={[2.8, 0.18, Z_OUT - Z_IN]}
        radius={0.06}
        smoothness={3}
        position={[0, DECK_Y - 0.12, (Z_IN + Z_OUT) / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </RoundedBox>

      {/* 판자 */}
      {planks.map((z, i) => (
        <RoundedBox
          key={i}
          args={[2.6, 0.12, (Z_OUT - Z_IN) / n - 0.06]}
          radius={0.04}
          smoothness={3}
          position={[0, DECK_Y, z]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={i % 2 ? WOOD : '#A87A4C'} roughness={0.9} />
        </RoundedBox>
      ))}

      {/* 난간 (양쪽) */}
      {[-1.25, 1.25].map((x) => (
        <group key={x}>
          {/* 레일 */}
          <RoundedBox
            args={[0.12, 0.12, Z_OUT - Z_IN]}
            radius={0.05}
            smoothness={3}
            position={[x, DECK_Y + 0.7, (Z_IN + Z_OUT) / 2]}
            castShadow
          >
            <meshStandardMaterial color={WOOD} roughness={0.9} />
          </RoundedBox>
          {/* 기둥 */}
          {railZ.map((z, i) => (
            <RoundedBox
              key={i}
              args={[0.16, 0.85, 0.16]}
              radius={0.05}
              smoothness={3}
              position={[x, DECK_Y + 0.35, z]}
              castShadow
            >
              <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
            </RoundedBox>
          ))}
        </group>
      ))}

      {/* 안쪽 끝 계단 몇 단 (섬으로 오름) */}
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={i}
          args={[2.6, 0.16, 0.5]}
          radius={0.05}
          smoothness={3}
          position={[0, DECK_Y - 0.02 - i * 0.16, Z_IN - 0.3 - i * 0.45]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={i % 2 ? WOOD : '#A87A4C'} roughness={0.9} />
        </RoundedBox>
      ))}

      {/* 지지 기둥(물 속으로) */}
      {[Z_IN + 0.5, Z_OUT - 0.5].map((z, i) => (
        <mesh key={i} position={[0, (WATER_Y + DECK_Y) / 2, z]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, DECK_Y - WATER_Y + 0.4, 8]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
