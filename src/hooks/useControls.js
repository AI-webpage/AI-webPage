import { useEffect, useRef } from 'react'

/**
 * 키보드 입력 상태를 ref 로 노출한다 (←/→ 이동, Space/↑ 점프).
 * useFrame 안에서 매 프레임 읽기 위해 state 가 아니라 ref 를 쓴다.
 */
export function useControls() {
  const keys = useRef({ left: false, right: false, jump: false })

  useEffect(() => {
    const down = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.left = true
          break
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = true
          break
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          keys.current.jump = true
          break
        default:
          break
      }
    }
    const up = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.left = false
          break
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = false
          break
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          keys.current.jump = false
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}
