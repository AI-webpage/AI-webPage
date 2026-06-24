import { useMemo } from 'react'
import { Instances, Instance, Float } from '@react-three/drei'
import * as THREE from 'three'
import { PALETTE } from './constants'
import { seededRandom, randRange } from '../utils/seededRandom'
import { WATER_Y, MOAT_INNER, MOAT_OUTER } from './Water'

/**
 * 수련잎 — 납작한 원반(노치 1개) + 작은 꽃. 인스턴싱 + Float 로 부드럽게 부유.
 */
const PAD_Y = WATER_Y + 0.06
const PINK = '#E8A0B8'

function buildPads() {
  const rnd = seededRandom(909090)
  const pads = []
  let guard = 0
  while (pads.length < 11 && guard++ < 400) {
    const x = randRange(rnd, -MOAT_OUTER + 1, MOAT_OUTER - 1)
    const z = randRange(rnd, -MOAT_OUTER + 1, MOAT_OUTER - 1)
    const cheb = Math.max(Math.abs(x), Math.abs(z))
    if (cheb < MOAT_INNER + 0.6 || cheb > MOAT_OUTER - 0.8) continue // 물 밴드 안만
    if (Math.abs(x) < 2.2 && z > MOAT_INNER) continue // 다리 영역 회피
    pads.push({
      x,
      z,
      s: randRange(rnd, 0.6, 1.05),
      rot: randRange(rnd, 0, Math.PI * 2),
      dark: rnd() > 0.5,
      flower: rnd() > 0.55,
    })
  }
  return pads
}

export default function LilyPad() {
  const pads = useMemo(buildPads, [])

  // 노치(틈) 있는 납작 원반
  const padGeo = useMemo(
    () => new THREE.CircleGeometry(0.5, 18, 0.32, Math.PI * 2 - 0.64),
    [],
  )
  const flowerGeo = useMemo(() => new THREE.IcosahedronGeometry(0.12, 0), [])

  const flowers = pads.filter((p) => p.flower)

  return (
    <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.5}>
      {/* 잎 */}
      <Instances geometry={padGeo} limit={pads.length} receiveShadow castShadow>
        <meshStandardMaterial roughness={0.8} side={THREE.DoubleSide} flatShading />
        {pads.map((p, i) => (
          <Instance
            key={i}
            position={[p.x, PAD_Y, p.z]}
            rotation={[-Math.PI / 2, 0, p.rot]}
            scale={p.s}
            color={p.dark ? PALETTE.leafDark : PALETTE.leaf}
          />
        ))}
      </Instances>

      {/* 꽃 (일부 잎 위) */}
      <Instances geometry={flowerGeo} limit={Math.max(1, flowers.length)} castShadow>
        <meshStandardMaterial color={PINK} roughness={0.6} emissive={PINK} emissiveIntensity={0.15} />
        {flowers.map((p, i) => (
          <Instance key={i} position={[p.x, PAD_Y + 0.12, p.z]} scale={p.s} />
        ))}
      </Instances>
    </Float>
  )
}
