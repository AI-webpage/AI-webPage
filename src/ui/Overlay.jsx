import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import './overlay.css'

export default function Overlay({ onOpenCampusGuide }) {
  const phase = useStore((s) => s.phase)
  const fade = useStore((s) => s.fade)
  const exitToLanding = useStore((s) => s.exitToLanding)

  const isLanding = phase === 'landing'
  const isWorld = phase === 'world'

  return (
    <div className="overlay">
      <div className="fade" style={{ opacity: fade, display: fade <= 0.001 ? 'none' : 'block' }} />

      {isLanding && (
        <div className="help-keys">
          <div>모니터 화면을 클릭하고 학번을 입력해 보세요. 캐릭터를 누르면 인사해요</div>
        </div>
      )}

      <AnimatePresence>
        {isWorld && (
          <>
            <motion.button
              key="campus-guide"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="btn btn-campus-guide"
              type="button"
              onClick={onOpenCampusGuide}
              aria-label="3D 캠퍼스 투어 안내"
            >
              ?
            </motion.button>

            <motion.button
              key="back"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
              className="btn btn-back"
              onClick={exitToLanding}
            >
              돌아가기
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
