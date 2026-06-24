import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import './overlay.css'

/**
 * HTML/CSS 오버레이 (three.js Canvas 위).
 *  - 흰색 페이드 (store.fade)
 *  - 랜딩: 안내 문구 (입력/입장은 모니터 안 터미널이 담당)
 *  - 월드: 돌아가기 버튼
 */
export default function Overlay() {
  const phase = useStore((s) => s.phase)
  const fade = useStore((s) => s.fade)
  const exitToLanding = useStore((s) => s.exitToLanding)

  const isLanding = phase === 'landing'
  const isWorld = phase === 'world'

  return (
    <div className="overlay">
      {/* 흰색 페이드 오버레이 */}
      <div className="fade" style={{ opacity: fade, display: fade <= 0.001 ? 'none' : 'block' }} />

      {/* 큰 타이틀·입력·입장은 모두 3D 씬 / 모니터 터미널이 담당한다. */}
      {isLanding && (
        <div className="help-keys">
          <div>모니터 화면에 이름과 성별을 입력해 보세요 · 캐릭터를 누르면 인사해요</div>
        </div>
      )}

      <AnimatePresence>
        {isWorld && (
          <motion.button
            key="back"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35 }}
            className="btn btn-back"
            onClick={exitToLanding}
          >
            ← 돌아가기
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
