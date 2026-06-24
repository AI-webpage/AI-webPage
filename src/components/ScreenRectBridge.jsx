import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '../store'
import { TERM_CENTER, TERM_W, TERM_H } from '../data/layout'

/**
 * 모니터 CRT(터미널) 영역의 월드 사각형을 화면 CSS 픽셀로 투영해 store 에 기록.
 *
 * OrthographicCamera 에서는 1 world unit = camera.zoom CSS px,
 * 화면 중심 px = (width/2, height/2), y 축은 반전.
 *   px.x = width/2  + worldX * zoom
 *   px.y = height/2 - worldY * zoom
 *
 * 모니터가 고정이므로 카메라 zoom/캔버스 크기가 바뀔 때(=리사이즈)만 갱신하면 된다.
 */
export default function ScreenRectBridge() {
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const setScreenRect = useStore((s) => s.setScreenRect)
  const last = useRef('')

  useEffect(() => {
    // zoom 은 CameraRig 의 effect 후에 확정되므로 한 틱 미뤄 읽는다.
    const id = requestAnimationFrame(() => {
      const zoom = camera.zoom
      const cx = TERM_CENTER[0]
      const cy = TERM_CENTER[1]
      const wPx = TERM_W * zoom
      const hPx = TERM_H * zoom
      const left = width / 2 + cx * zoom - wPx / 2
      const top = height / 2 - cy * zoom - hPx / 2
      const rect = {
        left: Math.round(left),
        top: Math.round(top),
        w: Math.round(wPx),
        h: Math.round(hPx),
      }
      const key = `${rect.left},${rect.top},${rect.w},${rect.h}`
      if (key !== last.current) {
        last.current = key
        setScreenRect(rect)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [camera, width, height, setScreenRect])

  return null
}
