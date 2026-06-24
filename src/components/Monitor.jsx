import SpritePlane from './SpritePlane'
import { ASSETS } from '../data/characters'
import { MONITOR_POS, MONITOR_HEIGHT } from '../data/layout'

/**
 * 중앙 레트로 모니터 (모니터_빈화면.png) — 정적.
 *  - 모니터의 빈 CRT 화면 위에 HTML 터미널 텍스트만 얹는다(별도 배경 패널 없음).
 *  - 실시간 터미널은 캔버스 밖 HTML 오버레이(Terminal.jsx)로 그려지며,
 *    ScreenRectBridge 가 화면 영역(TERM_*)을 픽셀로 투영해 정렬한다.
 *
 * 모니터는 위치/스케일이 고정이라 터미널이 흔들리지 않는다.
 */
export default function Monitor() {
  return (
    <group position={MONITOR_POS}>
      {/* 모니터 본체 (빈 화면 PNG) */}
      <SpritePlane
        url={ASSETS.monitor}
        height={MONITOR_HEIGHT}
        maxSize={2048}
        renderOrder={3}
        position={[0, 0, 0]}
      />
    </group>
  )
}
