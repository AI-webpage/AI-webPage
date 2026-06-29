import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/** names 배열에서 keys(부분일치) 중 처음 매칭되는 클립명을 찾는다. */
function pickClip(names, keys) {
  const lower = names.map((n) => n.toLowerCase())
  for (const k of keys) {
    const idx = lower.findIndex((n) => n.includes(k))
    if (idx >= 0) return names[idx]
  }
  return null
}

/**
 * GLB 3D 캐릭터.
 *  - useGLTF 로 로드, useAnimations 로 클립 재생.
 *  - 마운트 시 인사(wave/greet) 1회 → idle 루프. 호버/탭 시 다시 인사.
 *  - 클립이 없으면 절차적 모션(몸 bob + rotation.z 흔들기)으로 인사 흉내.
 *  - bbox 로 원하는 height 에 맞춰 스케일, 발을 position.y 바닥에 정렬.
 */
export default function GLBCharacter({
  url,
  position = [0, 0, 0],
  height = 2.3,
  phase = 0,
  rotationY = 0,
  renderOrder = 8,
}) {
  const group = useRef()
  const inner = useRef()
  const waveUntil = useRef(-1)
  const { scene, animations } = useGLTF(url)
  const { actions, names, mixer } = useAnimations(animations, group)

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const s = size.y > 0 ? height / size.y : 1
    return { s, cx: center.x, cz: center.z, minY: box.min.y }
  }, [scene, height])

  // renderOrder 전파 + 스키닝 메시 컬링 비활성화 + 환경맵 반사 강도 보정
  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.renderOrder = renderOrder
        // 본 애니메이션으로 정점이 바인드포즈 밖으로 나가도 잘리지 않게 한다.
        o.frustumCulled = false
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((m) => {
          if (m && 'envMapIntensity' in m) {
            m.envMapIntensity = 1.2
            m.needsUpdate = true
          }
        })
      }
    })
  }, [scene, renderOrder])

  const greetName = useMemo(
    () => pickClip(names, ['wave', 'hello', 'greet', 'hi', 'hand']),
    [names],
  )
  const idleName = useMemo(
    () => pickClip(names, ['idle', 'breath', 'stand', 'loop']) || names[0],
    [names],
  )
  const noClips = names.length === 0

  const playIdle = () => {
    if (idleName && actions[idleName]) {
      actions[idleName].reset().fadeIn(0.3).play()
    }
  }

  const greet = () => {
    if (noClips) {
      waveUntil.current = (mixer?.time ?? 0) + 1.2
      return
    }
    if (greetName && actions[greetName]) {
      const a = actions[greetName]
      Object.values(actions).forEach((o) => o !== a && o.fadeOut(0.2))
      a.reset()
      a.setLoop(THREE.LoopOnce, 1)
      a.clampWhenFinished = true
      a.fadeIn(0.15).play()
    } else {
      playIdle()
    }
  }

  // 마운트: 인사 → (끝나면) idle. 클립 없으면 절차적 인사 1회.
  useEffect(() => {
    if (noClips) {
      waveUntil.current = 0.0001
      return
    }
    greet()
    const onFinished = () => playIdle()
    mixer.addEventListener('finished', onFinished)
    return () => mixer.removeEventListener('finished', onFinished)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, names])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime + phase

    // 위아래(bob) 모션 제거 — y 는 고정. 바람 sway(좌우 기울임)만 유지.
    g.position.y = position[1]
    let rot = Math.sin(t * 0.8) * 0.02

    // 절차적 인사 (클립 없을 때)
    if (noClips && inner.current) {
      const now = (mixer?.time ?? clock.elapsedTime)
      if (now < waveUntil.current) {
        const k = waveUntil.current - now // 1.2 → 0
        rot += Math.sin((1.2 - k) * 18) * 0.22 * Math.min(1, k / 1.2 + 0.2)
        inner.current.position.y = Math.sin((1.2 - k) * 6) * 0.06
      } else {
        inner.current.position.y = 0
      }
    }
    g.rotation.z = rot
  })

  return (
    <group
      ref={group}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        greet()
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
      onPointerDown={(e) => {
        e.stopPropagation()
        greet()
      }}
    >
      <group
        ref={inner}
        scale={fit.s}
        position={[-fit.cx * fit.s, -fit.minY * fit.s, -fit.cz * fit.s]}
      >
        <primitive object={scene} />
      </group>
    </group>
  )
}
