import { RoundedBox } from '@react-three/drei'
import { PALETTE } from './constants'

/**
 * 테이블 세트 — 상판+다리 + 스툴 2~3 + 책 + 찻잔. 좌측 정원.
 */
const WOOD = '#A87A4C'
const WOOD_DARK = '#7A553A'

function Stool({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.1, 14]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      {[[-0.16, -0.16], [0.16, -0.16], [0, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export default function TableSet({ position = [-5.4, 0, -1.8], rotation = [0, 0.7, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 상판 */}
      <RoundedBox args={[1.5, 0.12, 1.0]} radius={0.06} smoothness={3} position={[0, 0.7, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </RoundedBox>
      {/* 다리 */}
      {[[-0.6, 0.36], [0.6, 0.36], [-0.6, -0.36], [0.6, -0.36]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} castShadow>
          <boxGeometry args={[0.1, 0.7, 0.1]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
      ))}
      {/* 스툴 */}
      <Stool position={[1.0, 0, 0.2]} />
      <Stool position={[-1.0, 0, -0.2]} />
      <Stool position={[0.1, 0, 0.95]} />

      {/* 책 (쌓임) */}
      <group position={[-0.35, 0.78, 0.1]}>
        <RoundedBox args={[0.4, 0.08, 0.3]} radius={0.02} smoothness={2} castShadow>
          <meshStandardMaterial color={PALETTE.roof} roughness={0.85} />
        </RoundedBox>
        <RoundedBox args={[0.36, 0.07, 0.28]} radius={0.02} smoothness={2} position={[0.02, 0.08, 0.02]} castShadow>
          <meshStandardMaterial color={PALETTE.water} roughness={0.85} />
        </RoundedBox>
      </group>
      {/* 찻잔 2 */}
      {[[0.4, 0.1], [0.5, -0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.14, 12]} />
          <meshStandardMaterial color={PALETTE.bubble} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
