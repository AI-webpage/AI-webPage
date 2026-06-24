import * as THREE from 'three'
import { useMemo } from 'react'
import { PALETTE } from './constants'

/**
 * 양동이 — 위가 넓은 원통 + 테 + 손잡이.
 */
const METAL = '#9AA0A6'

export default function Bucket({ position = [4.6, 0, 3.4], rotation = [0, 0.3, 0] }) {
  const handleGeo = useMemo(() => new THREE.TorusGeometry(0.28, 0.025, 8, 18, Math.PI), [])
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.24, 0.56, 16, 1, true]} />
        <meshStandardMaterial color={METAL} metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* 바닥 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.24, 16]} />
        <meshStandardMaterial color={METAL} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* 물 */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color={PALETTE.water} transparent opacity={0.85} />
      </mesh>
      {/* 손잡이 */}
      <mesh geometry={handleGeo} position={[0, 0.56, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color={METAL} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
