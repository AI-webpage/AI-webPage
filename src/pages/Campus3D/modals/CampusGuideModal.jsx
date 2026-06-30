import { useEffect, useRef } from 'react'
import './CampusGuideModal.css'

export default function CampusGuideModal({ onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="campus-guide-overlay" onClick={onClose} role="presentation">
      <section
        className="campus-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campus-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="campus-guide-close"
          type="button"
          onClick={onClose}
          aria-label="안내 닫기"
        >
          ×
        </button>
        <h2 id="campus-guide-title">
          <span className="campus-guide-title-icon" aria-hidden="true">🌿</span>
          캠퍼스 투어 이용 안내
        </h2>
        <div className="campus-guide-content">
          <p>
            소프트웨어학과의 학습 공간과 캠퍼스 이용 정보를
            <br />
            <strong>3D 캠퍼스 투어</strong>로 미리 확인해보세요.
          </p>
          <p>
            맵에 표시된 건물과 시설을 클릭하면
            <br />
            각 장소의 자세한 정보를 확인할 수 있어요!
          </p>
          <p>
            <strong>드래그로 줌인/줌아웃</strong>해서
            <br />
            건물 둘러보기도 가능해요!
          </p>
        </div>
      </section>
    </div>
  )
}
