import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SpritePlane from './SpritePlane'
import { useSpriteTexture } from '../hooks/useSpriteTexture'
import { ASSETS } from '../data/characters'
import { GRASS_POS, GRASS_HEIGHT, GRASS_TOP_Y } from '../data/layout'

/**
 * 풀밭.
 *  - responsive 모드(랜딩): 뷰포트에 맞춰 매 리사이즈마다 plane 크기를 다시 계산해
 *    화면 가로를 꽉 채우고, 아랫변은 화면 바닥 아래까지(오버스캔) 내려 빈틈 없이,
 *    윗변은 topY 까지 올라오게 한다. 어떤 화면 비율에서도 하단이 꽉 찬다.
 *  - 기본 모드(월드): 기존 타일 방식 유지.
 */
export default function GrassField(props) {
  if (props.responsive) return <ResponsiveGrass {...props} />
  return <TiledGrass {...props} />
}

/* ── 반응형: 뷰포트 가득 채우는 한 장 ───────────────────────── */
function ResponsiveGrass({
  topY = GRASS_TOP_Y,
  overscan = 1.08,
  z = 1,
  renderOrder = 1,
}) {
  const ref = useRef()
  const { texture } = useSpriteTexture(ASSETS.grass, 2048)

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  }, [texture])

  // 단위 plane(1×1)을 매 프레임 실제 카메라 zoom/캔버스 크기에 맞춰 스케일.
  // (R3F viewport 는 초기 zoom 으로 메모이즈돼 CameraRig 가 바꾼 zoom 을 못 따라가므로
  //  camera.zoom 을 직접 읽어 계산한다. Orthographic: 1 world = camera.zoom px)
  useFrame(({ clock, camera, size }) => {
    const m = ref.current
    if (!m) return
    const zoom = camera.zoom || 1
    const visW = size.width / zoom
    const visH = size.height / zoom
    const camY = camera.position.y || 0

    const bottomY = camY - visH / 2
    const bottomExtended = bottomY - visH * 0.12 // 화면 바닥 아래까지 오버스캔
    const height = topY - bottomExtended
    const width = visW * overscan
    const centerY = (topY + bottomExtended) / 2

    const t = clock.elapsedTime
    m.scale.set(width, height, 1)
    m.position.set(Math.sin(t * 0.5) * (width * (overscan - 1) * 0.25), centerY, z)
    m.rotation.z = Math.sin(t * 0.7) * 0.006
  })

  return (
    <mesh ref={ref} material={material} renderOrder={renderOrder}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}

/* ── 타일(월드 씬) ─────────────────────────────────────────── */
function TiledGrass({
  position = GRASS_POS,
  height = GRASS_HEIGHT,
  tiles = 3,
  spread = 7,
  renderOrder = 5,
}) {
  const refs = useRef([])

  const layout = useMemo(() => {
    const arr = []
    const half = (tiles - 1) / 2
    for (let i = 0; i < tiles; i++) {
      arr.push({
        x: (i - half) * spread,
        phase: i * 1.7,
        depth: i % 2 === 0 ? 0 : 0.2,
      })
    }
    return arr
  }, [tiles, spread])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const ph = layout[i].phase
      m.rotation.z = Math.sin(t * 0.8 + ph) * 0.012
      m.position.y = position[1] + Math.cos(t * 1.1 + ph) * 0.04
    })
  })

  return (
    <group>
      {layout.map((tile, i) => (
        <SpritePlane
          key={i}
          ref={(el) => (refs.current[i] = el)}
          url={ASSETS.grass}
          height={height}
          maxSize={2048}
          position={[position[0] + tile.x, position[1], position[2] + tile.depth]}
          renderOrder={renderOrder}
        />
      ))}
    </group>
  )
}
