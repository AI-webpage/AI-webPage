import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { ISLAND } from './constants'
import { seededRandom, randRange } from '../utils/seededRandom'

/**
 * 데이지 — 줄기 + 흰 꽃잎 디스크 + 노란 중심. 인스턴싱으로 다수,
 * 그룹 단위 미세 흔들림(바람).
 */
const HALF = ISLAND.size / 2
const WHITE = '#F4F0E6'
const YELLOW = '#F2C14E'
const STEM = '#6E8B3D'
const HALL = { halfW: 5.35, front: 0.05, back: -6.6 }

function isNearHall(x, z) {
  return x > -HALL.halfW && x < HALL.halfW && z > HALL.back && z < HALL.front
}

function buildDaisies() {
  const rnd = seededRandom(246810)
  const arr = []
  let g = 0
  while (arr.length < 46 && g++ < 800) {
    const x = randRange(rnd, -HALF + 1.5, HALF - 1.5)
    const z = randRange(rnd, -HALF + 1.5, HALF - 1.5)
    if (isNearHall(x, z)) continue // 북악관 주변 회피
    if (Math.abs(x) < 1.7 && z > 0) continue // 길 회피
    arr.push({
      x,
      z,
      h: randRange(rnd, 0.35, 0.6),
      s: randRange(rnd, 0.7, 1.15),
      rot: randRange(rnd, 0, Math.PI * 2),
      phase: randRange(rnd, 0, Math.PI * 2),
    })
  }
  return arr
}

export default function Daisy() {
  const daisies = useMemo(buildDaisies, [])
  const group = useRef()

  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.025, 1, 5), [])
  const petalGeo = useMemo(() => new THREE.CylinderGeometry(0.12, 0.12, 0.03, 9), [])
  const coreGeo = useMemo(() => new THREE.SphereGeometry(0.06, 8, 8), [])

  useFrame(({ clock }) => {
    // 잔잔한 바람 (그룹 전체 미세 기울임)
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 1.4) * 0.02
  })

  return (
    <group ref={group}>
      {/* 줄기 */}
      <Instances geometry={stemGeo} limit={daisies.length} castShadow>
        <meshStandardMaterial color={STEM} roughness={0.9} />
        {daisies.map((d, i) => (
          <Instance key={i} position={[d.x, d.h / 2, d.z]} scale={[d.s, d.h, d.s]} />
        ))}
      </Instances>
      {/* 흰 꽃잎 디스크 */}
      <Instances geometry={petalGeo} limit={daisies.length} castShadow>
        <meshStandardMaterial color={WHITE} roughness={0.7} />
        {daisies.map((d, i) => (
          <Instance key={i} position={[d.x, d.h, d.z]} rotation={[0, d.rot, 0]} scale={d.s} />
        ))}
      </Instances>
      {/* 노란 중심 */}
      <Instances geometry={coreGeo} limit={daisies.length}>
        <meshStandardMaterial color={YELLOW} roughness={0.6} />
        {daisies.map((d, i) => (
          <Instance key={i} position={[d.x, d.h + 0.02, d.z]} scale={d.s} />
        ))}
      </Instances>
    </group>
  )
}
