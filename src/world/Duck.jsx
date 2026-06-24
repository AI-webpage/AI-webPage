import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * 오리 — 몸통/머리 sphere + 부리(cone) + 발. 앞마당 경로를 천천히 왕복하며
 * 이동 방향으로 회전. (기본 모델은 +z 를 바라봄)
 */
const BODY = '#F2C14E'
const BILL = '#E8852B'
const RANGE = 3.0
const Z = 5.6
const SPEED = 0.5

export default function Duck() {
  const ref = useRef()

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    const x = Math.sin(t * SPEED) * RANGE
    const dir = Math.cos(t * SPEED) // +면 +x로 이동
    g.position.x = x
    g.position.z = Z
    g.position.y = Math.abs(Math.sin(t * 4)) * 0.04 // 뒤뚱 bob
    g.rotation.y = dir >= 0 ? -Math.PI / 2 : Math.PI / 2
    g.rotation.z = Math.sin(t * 8) * 0.05 // 뒤뚱
  })

  return (
    <group ref={ref}>
      {/* 몸통 */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <sphereGeometry args={[0.34, 16, 14]} />
        <meshStandardMaterial color={BODY} roughness={0.6} />
      </mesh>
      {/* 꼬리 */}
      <mesh position={[0, 0.42, -0.3]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.14, 0.3, 10]} />
        <meshStandardMaterial color={BODY} roughness={0.6} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 0.66, 0.22]} castShadow>
        <sphereGeometry args={[0.2, 14, 12]} />
        <meshStandardMaterial color={BODY} roughness={0.6} />
      </mesh>
      {/* 부리 */}
      <mesh position={[0, 0.64, 0.44]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.2, 10]} />
        <meshStandardMaterial color={BILL} roughness={0.6} />
      </mesh>
      {/* 눈 */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.72, 0.36]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#2A1E0E" />
        </mesh>
      ))}
      {/* 발 */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.12, 0.06, 0.2]} />
          <meshStandardMaterial color={BILL} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
