import { useMemo } from 'react'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 비치볼 — 캔버스 텍스처(빨/흰/파 세그먼트)로 칠한 sphere, Float 로 살짝 bounce.
 */
function makeBallTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const ctx = c.getContext('2d')
  const colors = ['#D7503A', '#F4F0E6', '#4F8FD0', '#F4F0E6', '#F2C14E', '#F4F0E6']
  const seg = c.width / colors.length
  colors.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.fillRect(i * seg, 0, seg + 1, c.height)
  })
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function BeachBall({ position = [2.6, 0.55, 4.2] }) {
  const tex = useMemo(makeBallTexture, [])
  return (
    <Float speed={2.4} rotationIntensity={0.5} floatIntensity={1.1}>
      <mesh position={position} castShadow>
        <sphereGeometry args={[0.55, 24, 18]} />
        <meshStandardMaterial map={tex} roughness={0.5} />
      </mesh>
    </Float>
  )
}
