import { PALETTE } from './constants'

/**
 * 그루터기 + 박힌 작은 도끼.
 */
const BARK = '#8A6A45'
const RING = '#C9A26B'

export default function Stump({ position = [-4.2, 0, 4.4], rotation = [0, 0.6, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 몸통 */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.7, 14]} />
        <meshStandardMaterial color={BARK} roughness={0.95} />
      </mesh>
      {/* 윗면 나이테 */}
      <mesh position={[0, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshStandardMaterial color={RING} roughness={0.9} />
      </mesh>
      {/* 도끼 */}
      <group position={[0.1, 0.72, 0]} rotation={[0, 0, -0.5]}>
        {/* 자루 */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.045, 0.7, 6]} />
          <meshStandardMaterial color={PALETTE.trunk} roughness={0.9} />
        </mesh>
        {/* 날 */}
        <mesh position={[0.02, 0.72, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.22, 0.18, 0.06]} />
          <meshStandardMaterial color="#9AA0A6" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
