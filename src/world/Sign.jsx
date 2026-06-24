import { RoundedBox, Text } from '@react-three/drei'
import { PALETTE } from './constants'

/**
 * 표지판 — 기둥 + 판자 + drei <Text> "WW'S".
 * 앞쪽(다리 입구 근처)에 배치.
 */
const WOOD = '#A87A4C'
const WOOD_DARK = '#7A553A'

export default function Sign({ position = [-2.4, 0, 7.2], rotation = [0, 0.4, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 기둥 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 1.4, 7]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* 판자 */}
      <RoundedBox args={[1.5, 0.7, 0.12]} radius={0.06} smoothness={3} position={[0, 1.35, 0]} castShadow>
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </RoundedBox>
      {/* 글자 */}
      <Text
        position={[0, 1.35, 0.08]}
        fontSize={0.34}
        color={PALETTE.ink}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
      >
        WW&apos;S
      </Text>
    </group>
  )
}
