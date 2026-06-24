/* eslint-disable react-hooks/immutability */
import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import GLBCharacter from './GLBCharacter'
import Mascot from './Mascot'
import ErrorBoundary from './ErrorBoundary'
import { CHARACTER_MAP } from '../data/characters'
import { VIEW_HEIGHT, VIEW_WIDTH, SKON_POS, SKON_HEIGHT } from '../data/layout'

/**
 * skon 을 "터미널 위" 레이어로 올리기 위한 별도의 투명 캔버스.
 *
 * 터미널은 HTML 오버레이(z-index 20)라 메인 캔버스(z-index 1) 안의 skon 을
 * 항상 덮는다. 그래서 skon 만 터미널보다 위(z-index 22)의 두 번째 캔버스에
 * 그려, 겹칠 때 skon 이 터미널 위에 보이게 한다.
 *
 *  - 메인 캔버스와 동일한 OrthographicCamera/zoom 을 써서 SKON_POS 가
 *    메인 씬과 같은 화면 위치에 정렬된다.
 *  - pointer-events:none → 아래 터미널 입력/클릭은 그대로 통과.
 */
function Rig() {
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  useEffect(() => {
    camera.zoom = Math.min(height / VIEW_HEIGHT, width / VIEW_WIDTH)
    camera.updateProjectionMatrix()
  }, [width, height, camera])
  return null
}

export default function ForegroundCharacter() {
  const skon = CHARACTER_MAP.skon

  const skonSprite = (
    <Mascot
      url={skon.url}
      height={SKON_HEIGHT}
      position={SKON_POS}
      wave
      sway={0.03}
      renderOrder={10}
    />
  )

  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 100], zoom: 100, near: 0.1, far: 2000 }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 22, // 터미널(20) 보다 위
        pointerEvents: 'none',
      }}
    >
      <Rig />
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} />
      <directionalLight position={[-4, 2, 3]} intensity={0.35} />

      <ErrorBoundary fallback={skonSprite}>
        <Suspense fallback={skonSprite}>
          <GLBCharacter
            url={skon.glb}
            position={SKON_POS}
            height={SKON_HEIGHT}
            renderOrder={10}
          />
        </Suspense>
      </ErrorBoundary>
    </Canvas>
  )
}
