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
import { CAMERA, PALETTE, ISLAND } from '../world/config/constants'
import Island from '../world/terrain/Island'
import Terrace from '../world/terrain/Terrace'
import BukhakHall from '../world/landmarks/BukhakHall'
import Tree from '../world/landmarks/Tree'

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

      <Island />
      <Terrace />
      <BukhakHall />
      <Tree />

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
