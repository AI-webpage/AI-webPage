import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { PALETTE } from './constants'

/**
 * 시계 기둥 — 기둥 + 원형 시계판 + 천천히 도는 분/시침.
 * 좌측에 배치.
 */
const WOOD_DARK = '#7A553A'

export default function ClockPost({ position = [-6.2, 0, 1.2], rotation = [0, 0.5, 0] }) {
  const minute = useRef()
  const hour = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (minute.current) minute.current.rotation.z = -t * 0.25
    if (hour.current) hour.current.rotation.z = -t * 0.25 / 12
  })

  return (
    <group position={position} rotation={rotation}>
      {/* 기둥 */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 2.0, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* 시계 몸체 (앞 +z 보게) */}
      <group position={[0, 2.1, 0]}>
        {/* 테두리 */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.52, 0.52, 0.16, 28]} />
          <meshStandardMaterial color={PALETTE.roof} roughness={0.8} />
        </mesh>
        {/* 흰 판 */}
        <mesh position={[0, 0, 0.09]}>
          <circleGeometry args={[0.44, 28]} />
          <meshStandardMaterial color={PALETTE.bubble} roughness={0.7} />
        </mesh>
        <Text position={[0, 0.3, 0.11]} fontSize={0.14} color={PALETTE.ink} anchorX="center" anchorY="middle">
          12
        </Text>
        <Text position={[0, -0.3, 0.11]} fontSize={0.14} color={PALETTE.ink} anchorX="center" anchorY="middle">
          6
        </Text>
        {/* 시침 */}
        <group ref={hour} position={[0, 0, 0.12]}>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.05, 0.26, 0.03]} />
            <meshStandardMaterial color={PALETTE.ink} />
          </mesh>
        </group>
        {/* 분침 */}
        <group ref={minute} position={[0, 0, 0.13]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.035, 0.38, 0.03]} />
            <meshStandardMaterial color={PALETTE.ink} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.14]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={PALETTE.roofShade} />
        </mesh>
      </group>
    </group>
  )
}
