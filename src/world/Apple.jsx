import { useMemo } from 'react'
import { seededRandom, randRange } from '../utils/seededRandom'
import { ISLAND } from './constants'

/**
 * 사과 — 빨간 sphere + 꼭지. 잔디에 몇 개.
 */
const HALF = ISLAND.size / 2
const RED = '#D7503A'
const HALL = { halfW: 5.35, front: 0.05, back: -6.6 }

function isNearHall(x, z) {
  return x > -HALL.halfW && x < HALL.halfW && z > HALL.back && z < HALL.front
}

export default function Apple() {
  const apples = useMemo(() => {
    const rnd = seededRandom(7777)
    const arr = []
    let g = 0
    while (arr.length < 7 && g++ < 200) {
      const x = randRange(rnd, -HALF + 2, HALF - 2)
      const z = randRange(rnd, -HALF + 2, HALF - 2)
      if (isNearHall(x, z)) continue // 북악관 주변 회피
      if (Math.abs(x) < 1.6 && z > 0) continue // 길 회피
      arr.push({ pos: [x, 0.22, z], s: randRange(rnd, 0.85, 1.15) })
    }
    return arr
  }, [])

  return (
    <group>
      {apples.map((a, i) => (
        <group key={i} position={a.pos} scale={a.s}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.22, 14, 12]} />
            <meshStandardMaterial color={RED} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 5]} />
            <meshStandardMaterial color="#5A3A22" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
