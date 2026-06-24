/* eslint-disable react-hooks/immutability */
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import {
  OrthographicCamera,
  OrbitControls,
  Environment,
  ContactShadows,
} from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA, PALETTE, ISLAND } from '../world/constants'
import Island from '../world/Island'
import Terrace from '../world/Terrace'
import GrassPath from '../world/GrassPath'
import House from '../world/House'
import Tree from '../world/Tree'
import Bush from '../world/Bush'
import Water from '../world/Water'
import Waterfall from '../world/Waterfall'
import Bridge from '../world/Bridge'
import StonePond from '../world/StonePond'
import LilyPad from '../world/LilyPad'
import Cattail from '../world/Cattail'
import Lantern from '../world/Lantern'
import Fence from '../world/Fence'
import Sign from '../world/Sign'
import ClockPost from '../world/ClockPost'
import Mailbox from '../world/Mailbox'
import Bench from '../world/Bench'
import Stump from '../world/Stump'
import Bucket from '../world/Bucket'
import TableSet from '../world/TableSet'
import Apple from '../world/Apple'
import Daisy from '../world/Daisy'
import BeachBall from '../world/BeachBall'
import Duck from '../world/Duck'

/**
 * Scene B — SOFTWARE 월드맵 (아이소메트릭 디오라마).
 * STEP 1: 토대(섬·테라스·길) + 카메라/조명/그림자 + 브라운 룩.
 *
 * 랜딩은 투명 캔버스(영상 배경)지만, 월드에 들어오면 scene.background 를
 * 브라운(bg)으로 칠해 영상 위를 불투명하게 덮는다(언마운트 시 복원).
 */
function WorldBackground() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const prev = scene.background
    scene.background = new THREE.Color(PALETTE.bg)
    return () => {
      scene.background = prev
    }
  }, [scene])
  return null
}

export default function WorldScene() {
  return (
    <group>
      <WorldBackground />

      {/* 아이소메트릭 카메라 + 약한 컨트롤(패닝 끔, 회전·줌 제한) */}
      <OrthographicCamera
        makeDefault
        position={CAMERA.position}
        zoom={CAMERA.zoom}
        near={CAMERA.near}
        far={CAMERA.far}
      />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom
        minZoom={36}
        maxZoom={72}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.42}
        enableDamping
        dampingFactor={0.08}
      />

      {/* 조명 — 따뜻한 햇빛 + 채움광 + 환경광
          (SoftShadows[PCSS] 는 three 0.184 와 셰이더 충돌이 있어 제외,
           Canvas shadows 의 기본 PCFSoft 그림자를 사용) */}
      <ambientLight color="#FFF3E0" intensity={0.5} />
      <directionalLight
        color="#FFE9C8"
        intensity={1.1}
        position={[9, 15, 7]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={70}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0004}
      />
      <Environment preset="sunset" />

      {/* 토대 */}
      <Island />
      <Terrace />
      <GrassPath />

      {/* 물 시스템 */}
      <Water />
      <Waterfall />
      <Bridge />
      <StonePond />
      <LilyPad />
      <Cattail />

      {/* 랜드마크 + 녹지 */}
      <House />
      <Tree />
      <Bush />

      {/* 소품 + 미세 애니메이션 */}
      <Daisy />
      <Apple />
      <Lantern />
      <Fence />
      <Sign />
      <ClockPost />
      <Mailbox />
      <Bench />
      <Stump />
      <Bucket />
      <TableSet />
      <BeachBall />
      <Duck />

      {/* 바닥 접지 그림자 */}
      <ContactShadows
        position={[0, ISLAND.topY + 0.02, 0]}
        scale={ISLAND.size * 1.5}
        blur={2.6}
        opacity={0.5}
        color="#3a2a12"
        far={20}
        resolution={1024}
      />
    </group>
  )
}
