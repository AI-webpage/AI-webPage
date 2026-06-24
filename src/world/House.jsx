import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from './constants'

/**
 * 중앙 집 — 전부 three.js 프리미티브.
 *  - 벽: 크림 RoundedBox
 *  - 박공지붕: 삼각 prism(ExtrudeGeometry), 기와 줄(roofShade 얇은 박스), 처마 돌출
 *  - 아치 문(어두운 나무색) + 손잡이
 *  - 창문 2~3개(프레임/유리/셔터)
 *  - 굴뚝 + 문 옆 발광 랜턴
 * 정면이 앞(z+)을 향한다. WorldScene 에서 [0,0,-4] 근처에 배치.
 */

// ── 치수 (미세조정) ──
const WALL_W = 3.4 // x
const WALL_H = 2.4 // y
const WALL_D = 3.0 // z
const FRONT = WALL_D / 2 // 정면 z
const ROOF_RX = WALL_W / 2 + 0.35 // 지붕 반폭(처마)
const ROOF_RISE = 1.4 // 용마루 높이
const ROOF_DEPTH = WALL_D + 0.7 // 앞뒤 처마 포함 길이
const DOOR_WOOD = '#7A553A'
const GLASS = '#BFE6E0'

export default function House() {
  // 박공지붕 prism — 단면 삼각형(XY), z 로 압출(용마루 = z축)
  const roofGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-ROOF_RX, 0)
    s.lineTo(ROOF_RX, 0)
    s.lineTo(0, ROOF_RISE)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: ROOF_DEPTH, bevelEnabled: false })
    g.translate(0, 0, -ROOF_DEPTH / 2) // z 중앙 정렬
    g.computeVertexNormals()
    return g
  }, [])

  // 기와 줄: 양 슬로프에 ridge 와 평행(z축)한 얇은 박스 몇 줄
  const slopeAngle = Math.atan2(ROOF_RISE, ROOF_RX)
  const tileRows = useMemo(() => {
    const rows = []
    const ts = [0.22, 0.42, 0.62, 0.82]
    for (const sign of [1, -1]) {
      for (const t of ts) {
        const x = sign * ROOF_RX * t
        const y = WALL_H + ROOF_RISE * (1 - t)
        rows.push({
          pos: [x + sign * 0.02, y + 0.04, 0],
          rot: [0, 0, -sign * slopeAngle],
        })
      }
    }
    return rows
  }, [slopeAngle])

  return (
    <group position={[0, 0, -4]}>
      {/* 벽 */}
      <RoundedBox args={[WALL_W, WALL_H, WALL_D]} radius={0.16} smoothness={4} position={[0, WALL_H / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.wall} roughness={0.9} />
      </RoundedBox>

      {/* 박공지붕 */}
      <mesh geometry={roofGeo} position={[0, WALL_H, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.roof} roughness={0.85} flatShading />
      </mesh>
      {/* 기와 줄 */}
      {tileRows.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={r.rot} castShadow>
          <boxGeometry args={[0.12, 0.05, ROOF_DEPTH * 0.98]} />
          <meshStandardMaterial color={PALETTE.roofShade} roughness={0.85} />
        </mesh>
      ))}
      {/* 용마루 캡 */}
      <mesh position={[0, WALL_H + ROOF_RISE - 0.02, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, ROOF_DEPTH * 0.99]} />
        <meshStandardMaterial color={PALETTE.roofShade} roughness={0.85} />
      </mesh>

      {/* 아치 문 (정면) */}
      <group position={[0, 0, FRONT + 0.02]}>
        <RoundedBox args={[1.0, 1.35, 0.18]} radius={0.06} smoothness={3} position={[0, 0.7, 0]} castShadow>
          <meshStandardMaterial color={DOOR_WOOD} roughness={0.8} />
        </RoundedBox>
        {/* 반원 아치 상단 */}
        <mesh position={[0, 1.37, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.18, 20, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={DOOR_WOOD} roughness={0.8} />
        </mesh>
        {/* 손잡이 */}
        <mesh position={[0.32, 0.7, 0.12]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={PALETTE.lampGlow} roughness={0.4} metalness={0.3} />
        </mesh>
      </group>

      {/* 창문: 정면 좌/우 + 우측면 1 */}
      <Window position={[-1.18, 1.45, FRONT + 0.02]} />
      <Window position={[1.18, 1.45, FRONT + 0.02]} />
      <Window position={[WALL_W / 2 + 0.02, 1.45, -0.4]} rotation={[0, Math.PI / 2, 0]} />

      {/* 굴뚝 */}
      <group position={[0.95, 0, -0.7]}>
        <RoundedBox args={[0.5, 1.5, 0.5]} radius={0.08} smoothness={3} position={[0, 3.0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={PALETTE.wallShade} roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[0.62, 0.22, 0.62]} radius={0.06} smoothness={3} position={[0, 3.78, 0]} castShadow>
          <meshStandardMaterial color={PALETTE.roofShade} roughness={0.9} />
        </RoundedBox>
      </group>

      {/* 문 옆 랜턴 (발광) */}
      <group position={[0.78, 1.5, FRONT + 0.06]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color={DOOR_WOOD} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.28, 0.22]} />
          <meshStandardMaterial
            color={PALETTE.lampGlow}
            emissive={PALETTE.lampGlow}
            emissiveIntensity={1.4}
            roughness={0.5}
          />
        </mesh>
        <pointLight color={PALETTE.lampGlow} intensity={2.2} distance={4} decay={2} position={[0, 0, 0.1]} />
      </group>
    </group>
  )
}

/** 창문 = 프레임 + 유리 + 양쪽 셔터 */
function Window({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 프레임 */}
      <RoundedBox args={[0.82, 0.92, 0.12]} radius={0.05} smoothness={3} castShadow>
        <meshStandardMaterial color={PALETTE.wallShade} roughness={0.85} />
      </RoundedBox>
      {/* 유리 */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.56, 0.66]} />
        <meshStandardMaterial
          color={GLASS}
          emissive={GLASS}
          emissiveIntensity={0.25}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {/* 가로/세로 살 */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.58, 0.05, 0.04]} />
        <meshStandardMaterial color={PALETTE.wallShade} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.05, 0.68, 0.04]} />
        <meshStandardMaterial color={PALETTE.wallShade} />
      </mesh>
      {/* 셔터 */}
      <mesh position={[-0.52, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.92, 0.08]} />
        <meshStandardMaterial color={PALETTE.roof} roughness={0.85} />
      </mesh>
      <mesh position={[0.52, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 0.92, 0.08]} />
        <meshStandardMaterial color={PALETTE.roof} roughness={0.85} />
      </mesh>
    </group>
  )
}
