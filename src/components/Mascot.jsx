import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SpritePlane from './SpritePlane'

/**
 * 전원버튼(⏻) 얼굴 마스코트 (투명 SVG 스프라이트).
 *
 *  - bob   : true 면 위아래로 통통 튀는 idle 모션
 *  - sway  : 바람에 미세하게 흔들리는 정도(rad). 위상은 phase 로 개별화.
 *  - wave  : true 면 가끔 손 흔들듯 좌우로 크게 기울인다(주인공용).
 *  - flip  : -1 이면 좌우 반전
 *  - hoverable/onClick : 주인공 마스코트 인터랙션
 */
export default function Mascot({
  url,
  height = 2,
  position = [0, 0, 0],
  bob = false,
  bobAmount = 0.1,
  sway = 0.03,
  wave = false,
  flip = 1,
  phase = 0,
  renderOrder = 8,
  hoverable = false,
  onClick,
}) {
  const group = useRef()
  const inner = useRef()
  const [hovered, setHovered] = useState(false)
  const waveT = useRef(0)

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const g = group.current
    if (!g) return
    waveT.current += dt
    const t = waveT.current + phase

    // idle bob
    const y = bob ? Math.sin(t * 2.3) * bobAmount : 0
    g.position.y = position[1] + y

    // 바람 sway
    let rot = Math.sin(t * 0.9) * sway

    // 주인공: 약 4초마다 손 흔들기(짧은 진동)
    if (wave) {
      const cycle = t % 4.2
      if (cycle < 0.9) {
        rot += Math.sin(cycle * 22) * 0.16 * (1 - cycle / 0.9)
      }
    }
    g.rotation.z = rot

    // 호버 시 살짝 확대
    if (hoverable) {
      const target = hovered ? 1.06 : 1
      const sc = THREE.MathUtils.damp(g.scale.x, target, 6, dt)
      g.scale.setScalar(sc)
    }
  })

  const interaction = hoverable
    ? {
        onPointerOver: (e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        },
        onPointerDown: (e) => e.stopPropagation(),
        onClick: (e) => {
          e.stopPropagation()
          onClick?.()
        },
      }
    : {}

  return (
    <group ref={group} position={position} {...interaction}>
      <group ref={inner} scale={[flip, 1, 1]}>
        <SpritePlane url={url} height={height} maxSize={1024} renderOrder={renderOrder} />
      </group>
    </group>
  )
}
