import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import LandingScene from './scenes/LandingScene'
import WorldScene from './scenes/WorldScene'
import CameraRig from './components/CameraRig'
import Terminal from './components/Terminal'
import ForegroundCharacter from './components/ForegroundCharacter'
import Overlay from './ui/Overlay'
import { useStore } from './store'
import landingVideo from './assets/video/landing.mp4'
import GS25Modal from './components/GS25Modal'
import BukakModal from './components/BukakModal'
import RightWingModal from './components/RightWingModal'
import Bus1164Modal from './components/Bus1164Modal'
import Bus2115Modal from './components/Bus2115Modal'
import CampusGuideModal from './components/CampusGuideModal'

/**
 * 루트.
 *  - 배경: 전체 화면 HTML <video> (grassfield.mp4).
 *  - Canvas: 그 위에 투명하게 올라가는 OrthographicCamera 씬 (모니터/제목).
 *  - phase 에 따라 Scene A / Scene B 마운트 (전환 구간 포함).
 *  - HTML 오버레이(터미널 등)는 Canvas 밖(위)에서 렌더.
 *
 * Effects(후처리)는 불투명 배경이 필요한 월드 씬에서만 켠다.
 * (랜딩은 투명 캔버스라 후처리를 끄지 않으면 영상이 가려진다)
 */
export default function App() {
  const phase = useStore((s) => s.phase)
  const [isGS25ModalOpen, setIsGS25ModalOpen] = useState(false)
  const [isBukakModalOpen, setIsBukakModalOpen] = useState(false)
  const [isRightWingModalOpen, setIsRightWingModalOpen] = useState(false)
  const [isBus1164ModalOpen, setIsBus1164ModalOpen] = useState(false)
  const [isBus2115ModalOpen, setIsBus2115ModalOpen] = useState(false)
  const [isCampusGuideModalOpen, setIsCampusGuideModalOpen] = useState(false)
  const closeGS25Modal = useCallback(() => setIsGS25ModalOpen(false), [])
  const closeBukakModal = useCallback(() => setIsBukakModalOpen(false), [])
  const closeRightWingModal = useCallback(() => setIsRightWingModalOpen(false), [])

  // 전환 구간 포함해서 어떤 씬을 그릴지 결정
  const showLanding = phase === 'landing' || phase === 'toWorld'
  const showWorld = phase === 'world' || phase === 'toLanding'

  return (
    <>
      {/* 전체 화면 영상 배경 */}
      <video
        className="bg-video"
        src={landingVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      <Canvas
        orthographic
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0, 100], zoom: 100, near: 0.1, far: 2000 }}
        style={{ width: '100%', height: '100%', background: 'transparent', position: 'relative', zIndex: 1 }}
      >
        <CameraRig />

        <Suspense fallback={null}>
          {showLanding && <LandingScene />}
          {showWorld && (
            <WorldScene
              onGS25Click={() => setIsGS25ModalOpen(true)}
              onBukakClick={() => setIsBukakModalOpen(true)}
              onRightWingClick={() => setIsRightWingModalOpen(true)}
              onBus1164Click={() => setIsBus1164ModalOpen(true)}
              onBus2115Click={() => setIsBus2115ModalOpen(true)}
            />
          )}
          <ReadySignal />
        </Suspense>
      </Canvas>

      {/* 월드 브라운 비네트 (CSS) */}
      {showWorld && <div className="vignette" />}

      {/* 모니터 화면 위 실시간 CRT 터미널 (HTML 오버레이) */}
      <Terminal />

      {/* skon.glb — 터미널보다 위 레이어 (겹치면 skon 이 위에) */}
      {showLanding && <ForegroundCharacter />}

      <Overlay onOpenCampusGuide={() => setIsCampusGuideModalOpen(true)} />
      <Loader />
      {isCampusGuideModalOpen && (
        <CampusGuideModal onClose={() => setIsCampusGuideModalOpen(false)} />
      )}
      {isGS25ModalOpen && <GS25Modal onClose={closeGS25Modal} />}
      {isBukakModalOpen && <BukakModal onClose={closeBukakModal} />}
      {isRightWingModalOpen && <RightWingModal onClose={closeRightWingModal} />}
      <Bus1164Modal
        isOpen={isBus1164ModalOpen}
        onClose={() => setIsBus1164ModalOpen(false)}
      />
      <Bus2115Modal
        isOpen={isBus2115ModalOpen}
        onClose={() => setIsBus2115ModalOpen(false)}
      />
    </>
  )
}

/**
 * Suspense 경계 안에서 모든 텍스처가 resolve 된 뒤에만 마운트되므로,
 * 마운트 시점에 ready 플래그를 올려 로더를 끈다.
 */
function ReadySignal() {
  const setReady = useStore((s) => s.setReady)
  useEffect(() => {
    setReady()
  }, [setReady])
  return null
}

/** 최초 텍스처 로딩 동안만 표시되는 로더 */
function Loader() {
  const ready = useStore((s) => s.ready)
  if (ready) return null
  return (
    <div className="loader">
      <div className="spinner" />
      <div className="pct">로딩 중…</div>
      <div>WELCOME TO SOFTWARE</div>
    </div>
  )
}
