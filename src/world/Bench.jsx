import { RoundedBox } from '@react-three/drei'

/**
 * 벤치 — 앉는 판 + 다리 + 등받이.
 */
const WOOD = '#A87A4C'
const WOOD_DARK = '#7A553A'

export default function Bench({ position = [3.8, 0, -1.6], rotation = [0, -0.9, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 좌판 */}
      <RoundedBox args={[1.6, 0.12, 0.55]} radius={0.05} smoothness={3} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </RoundedBox>
      {/* 등받이 */}
      <RoundedBox args={[1.6, 0.4, 0.1]} radius={0.05} smoothness={3} position={[0, 0.72, -0.22]} castShadow>
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </RoundedBox>
      {/* 다리 */}
      {[[-0.65, 0.18], [0.65, 0.18], [-0.65, -0.18], [0.65, -0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.1, 0.45, 0.1]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
