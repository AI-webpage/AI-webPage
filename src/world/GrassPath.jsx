import { RoundedBox } from '@react-three/drei'
import { PALETTE, ISLAND } from './constants'

/**
 * 흙길 + 중앙 광장.
 *  - 중앙 광장에서 앞(z+)으로 이어지는 길.
 *  - 잔디 윗면(y=0) 위에 살짝 얹히게 배치.
 *  - pathDark 얇은 테두리로 길 외곽을 강조.
 */
const S = ISLAND.size
const half = S / 2

export default function GrassPath() {
  return (
    <group>
      {/* 길 외곽(진한 테두리) */}
      <RoundedBox
        args={[3.1, 0.22, half + 1]}
        radius={0.4}
        smoothness={4}
        position={[0, 0.07, half * 0.5 - 0.6]}
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.pathDark} roughness={1} />
      </RoundedBox>

      {/* 길 */}
      <RoundedBox
        args={[2.5, 0.3, half]}
        radius={0.35}
        smoothness={4}
        position={[0, 0.12, half * 0.5 - 0.6]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color={PALETTE.path} roughness={1} />
      </RoundedBox>

      {/* 중앙 광장 */}
      <RoundedBox
        args={[6.4, 0.3, 6.4]}
        radius={0.7}
        smoothness={4}
        position={[0, 0.12, -1.4]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color={PALETTE.path} roughness={1} />
      </RoundedBox>
    </group>
  )
}
