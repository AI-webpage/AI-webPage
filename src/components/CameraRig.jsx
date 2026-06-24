/*
 * three.js 카메라를 명령형으로 제어하는 것은 R3F 의 표준 패턴이라
 * react-hooks 의 immutability 규칙(렌더 외부에서 객체 변경 금지)을 끈다.
 */
/* eslint-disable react-hooks/immutability */
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useStore } from '../store'
import {
  VIEW_HEIGHT,
  VIEW_WIDTH,
  SCREEN_CENTER,
  CAM_TRANSITION_ZOOM_FACTOR,
} from '../data/layout'

/**
 * 카메라 줌/전환 컨트롤러 (gsap).
 *  - 반응형: 화면 높이에 맞춰 base zoom 재계산.
 *  - toWorld: 모니터로 줌인 + Bloom flash + 흰색 fade → 'world'.
 *  - toLanding: 흰색 fade → landing 마운트 → 줌아웃 (역전환).
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const setFade = useStore((s) => s.setFade)
  const setFlash = useStore((s) => s.setFlash)

  const baseZoom = useRef(100)
  const tlRef = useRef(null)

  // 반응형 base zoom (전환 중이 아닐 때만 즉시 반영).
  // 세로 기준(VIEW_HEIGHT)과 가로 기준(VIEW_WIDTH) 중 작은 쪽을 골라
  // 좁은 모바일 화면에서도 컴퓨터 2대가 잘리지 않게 한다.
  useEffect(() => {
    baseZoom.current = Math.min(height / VIEW_HEIGHT, width / VIEW_WIDTH)
    const p = useStore.getState().phase
    // 랜딩에서만 즉시 반영. 월드는 자체 OrthographicCamera(아이소메트릭 zoom)를
    // 쓰므로 여기서 zoom 을 건드리지 않는다.
    if (p === 'landing') {
      camera.zoom = baseZoom.current
      camera.updateProjectionMatrix()
    }
  }, [width, height, camera])

  useEffect(() => {
    const updateProj = () => camera.updateProjectionMatrix()
    const fadeObj = { v: useStore.getState().fade }
    const flashObj = { v: useStore.getState().flash }

    if (phase === 'toWorld') {
      tlRef.current?.kill()
      const tl = gsap.timeline()

      // 1) 모니터로 줌인 + 카메라 이동
      tl.to(
        camera,
        {
          zoom: baseZoom.current * CAM_TRANSITION_ZOOM_FACTOR,
          duration: 1.3,
          ease: 'power2.in',
          onUpdate: updateProj,
        },
        0,
      )
      tl.to(
        camera.position,
        {
          x: SCREEN_CENTER[0],
          y: SCREEN_CENTER[1],
          duration: 1.3,
          ease: 'power2.inOut',
        },
        0,
      )

      // 2) 포털 발광 (Bloom flash)
      tl.to(
        flashObj,
        { v: 1, duration: 0.4, ease: 'power2.in', onUpdate: () => setFlash(flashObj.v) },
        0.65,
      )
      tl.to(
        flashObj,
        { v: 0, duration: 0.5, ease: 'power2.out', onUpdate: () => setFlash(flashObj.v) },
        1.05,
      )

      // 3) 흰색 fade
      tl.to(
        fadeObj,
        { v: 1, duration: 0.45, ease: 'power2.in', onUpdate: () => setFade(fadeObj.v) },
        1.0,
      )

      // 4) Scene B 마운트 + 카메라 리셋
      tl.add(() => {
        setPhase('world')
        camera.zoom = baseZoom.current
        camera.position.set(0, 0, camera.position.z)
        camera.updateProjectionMatrix()
      }, 1.45)

      // 5) fade out → 월드 보이기
      tl.to(
        fadeObj,
        { v: 0, duration: 0.6, ease: 'power2.out', onUpdate: () => setFade(fadeObj.v) },
        1.5,
      )

      tlRef.current = tl
    }

    if (phase === 'toLanding') {
      tlRef.current?.kill()
      const tl = gsap.timeline()

      // 1) 흰색으로 덮기
      tl.to(
        fadeObj,
        { v: 1, duration: 0.4, ease: 'power2.in', onUpdate: () => setFade(fadeObj.v) },
        0,
      )

      // 2) Scene A 마운트 + 카메라를 모니터 줌인 상태로 세팅
      tl.add(() => {
        setPhase('landing')
        camera.zoom = baseZoom.current * CAM_TRANSITION_ZOOM_FACTOR
        camera.position.set(SCREEN_CENTER[0], SCREEN_CENTER[1], camera.position.z)
        camera.updateProjectionMatrix()
      })

      // 3) 줌아웃 + fade out (랜딩 드러내기)
      tl.to(camera, {
        zoom: baseZoom.current,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: updateProj,
      })
      tl.to(
        camera.position,
        { x: 0, y: 0, duration: 1.1, ease: 'power2.inOut' },
        '<',
      )
      tl.to(
        fadeObj,
        { v: 0, duration: 0.7, ease: 'power2.out', onUpdate: () => setFade(fadeObj.v) },
        '<+=0.1',
      )

      tlRef.current = tl
    }
  }, [phase, camera, setPhase, setFade, setFlash])

  return null
}
