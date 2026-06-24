import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE, ISLAND } from './constants'
import { seededRandom, randRange } from '../utils/seededRandom'

/**
 * 나무 — 줄기(cylinder) + 잎(icosahedron) 1~3단 적층.
 * <Instances> 로 줄기/잎을 각각 인스턴싱(드로우콜 2회)해 다수 배치.
 * 섬 둘레, 특히 뒤쪽(z-)을 빽빽하게 채워 "나무 벽"을 만든다.
 */
const HALF = ISLAND.size / 2

// 집 주변 비움 영역 (집 중심 [0,-4], 반경 안에는 나무 금지)
const HOUSE = { x: 0, z: -4 }
const HOUSE_KEEPOUT = 4.6

function buildTrees() {
  const rnd = seededRandom(20240624)
  const trees = []

  const push = (x, z, scale) => {
    // 집 위/근처에는 나무를 두지 않는다
    if (Math.hypot(x - HOUSE.x, z - HOUSE.z) < HOUSE_KEEPOUT) return
    trees.push({
      x,
      z,
      s: scale,
      rot: randRange(rnd, 0, Math.PI * 2),
      tiers: rnd() > 0.5 ? 3 : 2,
      // 잎 색 변주용 시드
      tint: rnd(),
    })
  }

  // 뒤쪽 나무 벽 (z-) — 2줄, 크고 빽빽
  for (let row = 0; row < 2; row++) {
    const z = -HALF - 1 - row * 2.4
    for (let x = -HALF - 1; x <= HALF + 1; x += 1.7) {
      push(x + randRange(rnd, -0.5, 0.5), z + randRange(rnd, -0.5, 0.5), randRange(rnd, 1.25, 1.75))
    }
  }

  // 좌/우 둘레 — 1줄, 중간 크기
  for (let z = -HALF; z <= HALF - 1; z += 2.2) {
    push(-HALF - 1 + randRange(rnd, -0.4, 0.4), z + randRange(rnd, -0.4, 0.4), randRange(rnd, 1.0, 1.4))
    push(HALF + 1 + randRange(rnd, -0.4, 0.4), z + randRange(rnd, -0.4, 0.4), randRange(rnd, 1.0, 1.4))
  }

  // 앞쪽(z+)은 길을 위해 모서리에만 약간
  push(-HALF - 0.5, HALF + 0.5, randRange(rnd, 1.0, 1.3))
  push(HALF + 0.5, HALF + 0.5, randRange(rnd, 1.0, 1.3))

  // 섬 위 군데군데 (뒤쪽 언덕)
  for (let i = 0; i < 5; i++) {
    push(randRange(rnd, -HALF + 2, HALF - 2), randRange(rnd, -HALF + 2, -2), randRange(rnd, 0.8, 1.2))
  }

  return trees
}

export default function Tree() {
  const trees = useMemo(buildTrees, [])
  const leafSway = useRef()

  useFrame(({ clock }) => {
    if (leafSway.current) leafSway.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.012
  })

  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.22, 1, 7), [])
  const leafGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])

  // 잎 인스턴스 평탄화 (나무마다 2~3단)
  const leaves = useMemo(() => {
    const arr = []
    const c1 = new THREE.Color(PALETTE.leaf)
    const c2 = new THREE.Color(PALETTE.leafDark)
    for (const t of trees) {
      const trunkH = 1.1 * t.s
      for (let k = 0; k < t.tiers; k++) {
        const f = k / Math.max(1, t.tiers - 1) // 0(아래)→1(위)
        const r = (0.95 - f * 0.35) * t.s
        const y = trunkH + (0.2 + k * 0.62 * t.s)
        const col = c1.clone().lerp(c2, 0.25 + t.tint * 0.5 - f * 0.15)
        arr.push({
          pos: [t.x, y, t.z],
          scale: [r, r * 0.92, r],
          rot: [0, t.rot + k, 0],
          color: col,
        })
      }
    }
    return arr
  }, [trees])

  return (
    <group>
      {/* 줄기 */}
      <Instances geometry={trunkGeo} limit={trees.length} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.trunk} roughness={0.95} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, (1.1 * t.s) / 2, t.z]}
            scale={[t.s, 1.1 * t.s, t.s]}
            rotation={[0, t.rot, 0]}
          />
        ))}
      </Instances>

      {/* 잎 (그룹 단위 미세 바람 흔들림) */}
      <group ref={leafSway}>
        <Instances geometry={leafGeo} limit={leaves.length} castShadow receiveShadow>
          <meshStandardMaterial roughness={0.85} flatShading />
          {leaves.map((l, i) => (
            <Instance key={i} position={l.pos} scale={l.scale} rotation={l.rot} color={l.color} />
          ))}
        </Instances>
      </group>
    </group>
  )
}
