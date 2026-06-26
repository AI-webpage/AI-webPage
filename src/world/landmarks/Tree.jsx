import { useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE, ISLAND } from '../config/constants'
import { seededRandom, randRange } from '../../utils/seededRandom'

const HALF = ISLAND.size / 2
const EDGE = HALF - 1.15
const HALL = { halfW: 7.35, front: 0.05, back: -6.6 }

function isNearHall(x, z) {
  return x > -HALL.halfW && x < HALL.halfW && z > HALL.back && z < HALL.front
}

function buildTrees() {
  const rnd = seededRandom(20240624)
  const trees = []

  const push = (x, z, scale) => {
    if (isNearHall(x, z)) return
    trees.push({
      x,
      z,
      s: scale,
      rot: randRange(rnd, 0, Math.PI * 2),
      tiers: rnd() > 0.5 ? 3 : 2,
      tint: rnd(),
    })
  }

  for (let x = -EDGE; x <= EDGE; x += 2.05) {
    push(x + randRange(rnd, -0.35, 0.35), -EDGE + randRange(rnd, -0.35, 0.35), randRange(rnd, 1.25, 1.7))
  }

  for (let z = -EDGE + 1.4; z <= EDGE - 1.4; z += 2.25) {
    push(-EDGE + randRange(rnd, -0.35, 0.35), z + randRange(rnd, -0.35, 0.35), randRange(rnd, 1.0, 1.45))
    push(EDGE + randRange(rnd, -0.35, 0.35), z + randRange(rnd, -0.35, 0.35), randRange(rnd, 1.0, 1.45))
  }

  for (let x = -EDGE; x <= EDGE; x += 2.45) {
    if (Math.abs(x) < 6.2) continue
    push(x + randRange(rnd, -0.3, 0.3), EDGE + randRange(rnd, -0.3, 0.3), randRange(rnd, 0.95, 1.3))
  }

  return trees
}

export default function Tree() {
  const trees = useMemo(() => buildTrees(), [])

  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.22, 1, 7), [])
  const leafGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), [])

  const leaves = useMemo(() => {
    const arr = []
    const c1 = new THREE.Color(PALETTE.leaf)
    const c2 = new THREE.Color(PALETTE.leafDark)

    for (const tree of trees) {
      const trunkH = 1.1 * tree.s
      for (let k = 0; k < tree.tiers; k++) {
        const f = k / Math.max(1, tree.tiers - 1)
        const r = (0.95 - f * 0.35) * tree.s
        const y = trunkH + (0.2 + k * 0.62 * tree.s)
        const color = c1.clone().lerp(c2, 0.25 + tree.tint * 0.5 - f * 0.15)
        arr.push({
          pos: [tree.x, y, tree.z],
          scale: [r, r * 0.92, r],
          rot: [0, tree.rot + k, 0],
          color,
        })
      }
    }

    return arr
  }, [trees])

  return (
    <group>
      <Instances geometry={trunkGeo} limit={trees.length} castShadow receiveShadow>
        <meshStandardMaterial color={PALETTE.trunk} roughness={0.95} />
        {trees.map((tree, i) => (
          <Instance
            key={i}
            position={[tree.x, (1.1 * tree.s) / 2, tree.z]}
            scale={[tree.s, 1.1 * tree.s, tree.s]}
            rotation={[0, tree.rot, 0]}
          />
        ))}
      </Instances>

      <group>
        <Instances geometry={leafGeo} limit={leaves.length} castShadow receiveShadow>
          <meshStandardMaterial roughness={0.85} flatShading />
          {leaves.map((leaf, i) => (
            <Instance key={i} position={leaf.pos} scale={leaf.scale} rotation={leaf.rot} color={leaf.color} />
          ))}
        </Instances>
      </group>
    </group>
  )
}
