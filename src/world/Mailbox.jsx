import { RoundedBox } from '@react-three/drei'
import { PALETTE } from './constants'

/**
 * 우편함 — 기둥 + 둥근 박스 본체 + 빨간 깃발.
 */
const WOOD_DARK = '#7A553A'
const BODY = '#7FA8C9'

export default function Mailbox({ position = [2.0, 0, 7.6], rotation = [0, -0.3, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 기둥 */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 1.1, 7]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* 본체 (둥근 박스) */}
      <RoundedBox args={[0.5, 0.5, 0.8]} radius={0.24} smoothness={5} position={[0, 1.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BODY} roughness={0.7} metalness={0.1} />
      </RoundedBox>
      {/* 문(앞) */}
      <mesh position={[0, 1.18, 0.4]}>
        <circleGeometry args={[0.2, 20]} />
        <meshStandardMaterial color={PALETTE.wallShade} roughness={0.8} />
      </mesh>
      {/* 빨간 깃발 */}
      <group position={[0.27, 1.2, -0.1]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color={PALETTE.roofShade} />
        </mesh>
        <mesh position={[0.12, 0.28, 0]} castShadow>
          <boxGeometry args={[0.22, 0.16, 0.03]} />
          <meshStandardMaterial color={PALETTE.roof} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
