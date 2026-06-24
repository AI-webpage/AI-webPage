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
const PATH_CENTER_Z = half * 0.5 - 0.08
const PATH_DARK_LENGTH = half - 0.45
const PATH_LENGTH = half - 1.05

export default function GrassPath() {
  return (
    <group>
      {/* 길 외곽(진한 테두리) */}
      <RoundedBox
        args={[3.1, 0.22, PATH_DARK_LENGTH]}
        radius={0.4}
        smoothness={4}
        position={[0, 0.07, PATH_CENTER_Z]}
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.pathDark} roughness={1} />
      </RoundedBox>

      {/* 길 */}
      <RoundedBox
        args={[2.5, 0.3, PATH_LENGTH]}
        radius={0.35}
        smoothness={4}
        position={[0, 0.12, PATH_CENTER_Z]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color={PALETTE.path} roughness={1} />
      </RoundedBox>

      {/* 중앙 광장 */}
    </group>
  )
}
