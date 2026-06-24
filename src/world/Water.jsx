import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE, ISLAND } from './constants'
import { createToonWater } from '../materials/toonWater'

/**
 * 섬을 도는 해자(물) — 사각 링 ShapeGeometry 평면.
 *  - 안쪽 구멍은 섬 발치(테라스) 아래로 들어가 물가가 자연스럽게 맞물린다.
 *  - 가장자리(물가)에 흰 거품 라인.
 */
const HALF = ISLAND.size / 2
export const WATER_Y = -0.7
export const MOAT_INNER = HALF - 0.7 // 9.3
export const MOAT_OUTER = HALF + 3.5 // 13.5

function squareRingShape(inner, outer) {
  const s = new THREE.Shape()
  s.moveTo(-outer, -outer)
  s.lineTo(outer, -outer)
  s.lineTo(outer, outer)
  s.lineTo(-outer, outer)
  s.closePath()
  const hole = new THREE.Path()
  hole.moveTo(-inner, -inner)
  hole.lineTo(-inner, inner)
  hole.lineTo(inner, inner)
  hole.lineTo(inner, -inner)
  hole.closePath()
  s.holes.push(hole)
  return s
}

export default function Water() {
  const material = useMemo(
    () =>
      createToonWater({
        color: PALETTE.water,
        bright: PALETTE.waterBright,
        opacity: 0.82,
        flow: [0.05, 0.03],
        scale: 0.32,
      }),
    [],
  )
  const matRef = useRef(material)

  const moatGeo = useMemo(() => {
    const g = new THREE.ShapeGeometry(squareRingShape(MOAT_INNER, MOAT_OUTER))
    return g
  }, [])

  const foamGeo = useMemo(() => {
    // 물가 거품: 안쪽 구멍 바로 바깥의 얇은 사각 링
    const g = new THREE.ShapeGeometry(squareRingShape(MOAT_INNER, MOAT_INNER + 0.5))
    return g
  }, [])

  useFrame(({ clock }) => {
    matRef.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <group>
      {/* 물 */}
      <mesh
        geometry={moatGeo}
        material={material}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, WATER_Y, 0]}
        renderOrder={1}
      />
      {/* 물가 거품 라인 */}
      <mesh
        geometry={foamGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, WATER_Y + 0.03, 0]}
        renderOrder={2}
      >
        <meshBasicMaterial color={PALETTE.waterBright} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  )
}
