import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SpritePlane from './SpritePlane'
import { useControls } from '../hooks/useControls'
import { CHARACTER_MAP } from '../data/characters'
import { useStore } from '../store'
import { SCREEN_CENTER } from '../data/layout'

const GRAVITY = 24
const JUMP_V = 9.5
const MOVE_SPEED = 4.8

const clamp = (v, [min, max]) => Math.max(min, Math.min(max, v))

/**
 * 스프라이트 캐릭터.
 *  - idle: sin 통통 튀기
 *  - 점프: position.y 포물선 (키 Space / tap)
 *  - 손 흔들기: rotation.z 흔들기 (wave())
 *  - 좌우 이동: ←/→ 키 또는 moveTo(x) (화면 탭)
 *  - 바람: 미세한 rotation 흔들림 (위상 phase 로 개별화)
 *  - 포털: store.phase === 'toWorld' 면 모니터 화면으로 빨려 들어감 (scale↓ + 회전)
 *
 * forwardRef 로 jump()/wave()/moveTo()/getX() imperative API 노출.
 */
const Character = forwardRef(function Character(
  {
    characterId,
    height = 2.3,
    basePosition = [0, -1.5, 3],
    bounds = [-5, 5],
    controllable = true,
    idle = true,
    phase = 0, // 바람/모션 위상
    portal = false, // toWorld 전환에서 빨려 들어가게 할지
  },
  ref,
) {
  const char = CHARACTER_MAP[characterId] ?? CHARACTER_MAP.skon
  const group = useRef()
  const flip = useRef()
  const keys = useControls()

  const s = useRef({
    x: basePosition[0],
    vy: 0,
    jumpY: 0,
    grounded: true,
    wave: 0,
    facing: 1,
    moveTarget: null,
    t: phase,
    portalK: 0, // 0 = 정상, 1 = 포털 완전 흡입
  }).current

  useImperativeHandle(
    ref,
    () => ({
      jump: () => {
        if (s.grounded) {
          s.vy = JUMP_V
          s.grounded = false
        }
      },
      wave: () => {
        s.wave = 1.0
      },
      moveTo: (x) => {
        s.moveTarget = clamp(x, bounds[0], bounds[1])
      },
      getX: () => s.x,
      object: group,
    }),
    [s, bounds],
  )

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    s.t += dt
    const g = group.current
    if (!g) return

    const phaseNow = useStore.getState().phase
    const inPortal = portal && phaseNow === 'toWorld'

    // ── 입력 ──
    let dir = 0
    if (controllable && !inPortal) {
      if (keys.current.left) dir -= 1
      if (keys.current.right) dir += 1
      if (keys.current.jump && s.grounded) {
        s.vy = JUMP_V
        s.grounded = false
      }
    }
    if (dir !== 0) {
      s.x += dir * MOVE_SPEED * dt
      s.facing = dir > 0 ? 1 : -1
      s.moveTarget = null
    } else if (s.moveTarget != null) {
      const d = s.moveTarget - s.x
      if (Math.abs(d) < 0.05) {
        s.moveTarget = null
      } else {
        s.x += Math.sign(d) * Math.min(MOVE_SPEED * dt, Math.abs(d))
        s.facing = d > 0 ? 1 : -1
      }
    }
    s.x = clamp(s.x, bounds)

    // ── 점프 (포물선) ──
    if (!s.grounded) {
      s.vy -= GRAVITY * dt
      s.jumpY += s.vy * dt
      if (s.jumpY <= 0) {
        s.jumpY = 0
        s.vy = 0
        s.grounded = true
      }
    }

    // ── 포털 흡입 보간 ──
    s.portalK = THREE.MathUtils.damp(s.portalK, inPortal ? 1 : 0, 5, dt)
    const k = s.portalK

    // 위치 (idle bob + 포털이면 화면 중심으로 이동)
    const bob = idle ? Math.sin(s.t * 2.2) * 0.07 : 0
    const baseX = s.x
    const baseY = basePosition[1] + s.jumpY + bob
    const baseZ = basePosition[2]

    g.position.x = THREE.MathUtils.lerp(baseX, SCREEN_CENTER[0], k)
    g.position.y = THREE.MathUtils.lerp(baseY, SCREEN_CENTER[1], k)
    g.position.z = THREE.MathUtils.lerp(baseZ, SCREEN_CENTER[2] + 0.2, k)

    // 스케일 (포털이면 작아짐) + 좌우 반전
    const scale = THREE.MathUtils.lerp(1, 0.04, k)
    g.scale.setScalar(scale)
    if (flip.current) flip.current.scale.x = s.facing

    // 회전 (바람 sway + wave + 포털 스핀)
    let rot = Math.sin(s.t * 1.2 + phase) * 0.025
    if (s.wave > 0) {
      s.wave -= dt
      rot += Math.sin(s.t * 18) * 0.18 * Math.max(0, s.wave)
    }
    // 포털 흡입 시 빙글 도는 느낌
    g.rotation.z = rot + k * Math.sin(s.t * 6) * 0.8
  })

  const handleTap = (e) => {
    e.stopPropagation()
    if (s.grounded) {
      s.vy = JUMP_V
      s.grounded = false
    }
    s.wave = 1.0
  }

  // group 은 위치/회전/스케일, 내부 flip 그룹은 좌우 반전 전용
  return (
    <group ref={group}>
      <group ref={flip}>
        <SpritePlane
          url={char.url}
          height={height}
          maxSize={1024}
          renderOrder={10}
          onClick={handleTap}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </group>
    </group>
  )
})

export default Character
