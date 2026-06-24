import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 울타리 — 기둥 + 가로 레일 2줄. 광장 가장자리를 따라 인스턴싱 반복.
 */
const WOOD = '#A87A4C'
const WOOD_DARK = '#7A553A'

function buildFence() {
  // 광장(앞마당) 좌우 가장자리 + 앞쪽 일부를 따라 기둥/레일 배치
  const posts = []
  const rails = []
  const segs = [
    // [x1,z1, x2,z2]
    [-3.2, -4.2, -3.2, 2.2], // 좌
    [3.2, -4.2, 3.2, 2.2], // 우
    [-3.2, -4.2, -1.4, -4.2], // 뒤-좌
    [3.2, -4.2, 1.4, -4.2], // 뒤-우
  ]
  for (const [x1, z1, x2, z2] of segs) {
    const len = Math.hypot(x2 - x1, z2 - z1)
    const n = Math.max(2, Math.round(len / 1.1))
    const ang = Math.atan2(z2 - z1, x2 - x1)
    for (let i = 0; i <= n; i++) {
      const t = i / n
      posts.push({ pos: [x1 + (x2 - x1) * t, 0.4, z1 + (z2 - z1) * t], rot: ang })
    }
    // 레일 2줄 (구간 중앙에 길게)
    for (const y of [0.32, 0.62]) {
      rails.push({
        pos: [(x1 + x2) / 2, y, (z1 + z2) / 2],
        rot: ang,
        len: len,
      })
    }
  }
  return { posts, rails }
}

export default function Fence() {
  const { posts, rails } = useMemo(buildFence, [])
  const postGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.8, 0.12), [])
  const railGeo = useMemo(() => new THREE.BoxGeometry(1, 0.08, 0.08), [])

  return (
    <group>
      <Instances geometry={postGeo} limit={posts.length} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        {posts.map((p, i) => (
          <Instance key={i} position={p.pos} rotation={[0, -p.rot, 0]} />
        ))}
      </Instances>

      <Instances geometry={railGeo} limit={rails.length} castShadow>
        <meshStandardMaterial color={WOOD} roughness={0.9} />
        {rails.map((r, i) => (
          <Instance key={i} position={r.pos} rotation={[0, -r.rot, 0]} scale={[r.len, 1, 1]} />
        ))}
      </Instances>
    </group>
  )
}
