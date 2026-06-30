import { useEffect } from 'react'
import bon from '../../../assets/images/bon.png'
import './GS25Modal.css'

export default function RightWingModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="gs25-modal-overlay" onClick={onClose} role="presentation">
      <section
        className="gs25-modal right-wing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="right-wing-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="gs25-modal-close" type="button" onClick={onClose} aria-label="모달 닫기">
          ×
        </button>

        <div className="gs25-slide-image-wrap">
          <img className="gs25-slide-image" src={bon} alt="북악관 오른쪽 연결 건물 안내" />
        </div>

        <div className="gs25-slide-copy">
          <h2 id="right-wing-modal-title">북악관 연결 안내</h2>
          <ul className="right-wing-modal-description">
            <li>북악관 지하 1층과 연결됩니다.</li>
            <li>본관 2층으로 연결됩니다.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
