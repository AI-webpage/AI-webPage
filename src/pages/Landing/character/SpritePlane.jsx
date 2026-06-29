import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'
import { useSpriteTexture } from '../hooks/useSpriteTexture'

/**
 * 텍스처를 입힌 Plane.
 * height(월드 단위)를 기준으로 텍스처 원본 비율에 맞춰 width 를 자동 계산한다.
 * 투명 PNG/SVG 이므로 transparent + alphaTest 로 깔끔하게 처리한다.
 */
const SpritePlane = forwardRef(function SpritePlane(
  {
    url,
    height = 1,
    maxSize = 1024,
    transparent = true,
    opacity = 1,
    depthWrite = false,
    renderOrder = 0,
    children,
    ...props
  },
  ref,
) {
  const { texture, aspect } = useSpriteTexture(url, maxSize)
  const width = height * aspect

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent,
      opacity,
      alphaTest: 0.02,
      depthWrite,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  }, [texture, transparent, opacity, depthWrite])

  return (
    <mesh
      ref={ref}
      renderOrder={renderOrder}
      material={material}
      {...props}
    >
      <planeGeometry args={[width, height]} />
      {children}
    </mesh>
  )
})

export default SpritePlane
