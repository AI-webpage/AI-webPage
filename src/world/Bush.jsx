import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE, ISLAND } from './constants'
import { seededRandom, randRange } from '../utils/seededRandom'

/**
 * 덤불/헤지 — 낮고 넓은 둥근 녹색 블록. 인스턴싱으로 다수 배치.
 * 길·광장 가장자리와 집 주변, 섬 빈 곳을 채운다.
 */
const HALF = ISLAND.size / 2
const HALL = { halfW: 5.35, front: 0.05, back: -6.6 }

function isNearHall(x, z) {
  return x > -HALL.halfW && x < HALL.halfW && z > HALL.back && z < HALL.front
}

function buildBushes() {
  const rnd = seededRandom(778899)
  const arr = []
  const c1 = new THREE.Color(PALETTE.leaf)
  const c2 = new THREE.Color(PALETTE.grassShade)

  const push = (x, z, w) => {
    arr.push({
      pos: [x, 0.32 * (w / 1.1), z],
      scale: [w, w * 0.55, w * 0.9],
      rot: [0, randRange(rnd, 0, Math.PI), 0],
      color: c1.clone().lerp(c2, rnd() * 0.6),
    })
  }

  // 길 양옆 헤지 (z+ 방향)
  for (let z = 1; z < HALF - 1; z += 1.7) {
    push(-1.9 + randRange(rnd, -0.2, 0.2), z, randRange(rnd, 0.8, 1.2))
    push(1.9 + randRange(rnd, -0.2, 0.2), z, randRange(rnd, 0.8, 1.2))
  }

  // 집 주변
  ;[-1, 1].forEach((side) => {
    for (let i = 0; i < 3; i++) {
      push(side * randRange(rnd, 5.45, 6.25), randRange(rnd, -5.8, -3.0), randRange(rnd, 0.7, 1.05))
    }
  })

  // 섬 가장자리 군데군데
  for (let i = 0; i < 14; i++) {
    const x = randRange(rnd, -HALF + 1, HALF - 1)
    const z = randRange(rnd, -HALF + 1, HALF - 1)
    if (Math.abs(x) < 2 && z > 0) continue // 길 위는 피함
    if (isNearHall(x, z)) continue // 북악관 주변 회피
    push(x, z, randRange(rnd, 0.7, 1.3))
  }

  return arr
}

export default function Bush() {
  const bushes = useMemo(buildBushes, [])
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])
  const sway = useRef()

  useFrame(({ clock }) => {
    if (sway.current) sway.current.rotation.z = Math.sin(clock.elapsedTime * 1.1 + 1) * 0.015
  })

  return (
    <group ref={sway}>
      <Instances geometry={geo} limit={bushes.length} castShadow receiveShadow>
        <meshStandardMaterial roughness={0.9} flatShading />
        {bushes.map((b, i) => (
          <Instance key={i} position={b.pos} scale={b.scale} rotation={b.rot} color={b.color} />
        ))}
      </Instances>
    </group>
  )
}
