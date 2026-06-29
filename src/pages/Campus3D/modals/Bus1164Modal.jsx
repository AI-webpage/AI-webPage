import { useEffect } from 'react'
import './Bus1164Modal.css'

const MODAL_TITLE_ID = 'bus-1164-modal-title'

const BUS_1164_TIPS = [
  {
    icon: '🚌',
    title: '북악관 바로 앞 하차',
    description: (
      <><strong>1164번</strong> 버스를 타면 북악관 바로 앞에서 내릴 수 있어 처음 방문하는 학생도 쉽게 이동할 수 있어요.</>
    ),
  },
  {
    icon: '💡',
    title: '탑승 위치 꿀팁',
    description: (
      <>길음역 3번 출구 정류장보다 <strong>길음역 10번 출구</strong> 방향의 <strong>돈암1동 주민센터</strong> 정류장에서 탑승하면 비교적 여유롭게 이용할 수 있어요.</>
    ),
  },
]

export default function Bus1164Modal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="bus-modal-overlay" onClick={onClose} role="presentation">
      <section
        className="bus-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="bus-modal-close" type="button" onClick={onClose} aria-label="모달 닫기">×</button>
        <div className="bus-modal-heading">
          <span className="bus-modal-badge">1164</span>
          <div>
            <h2 id={MODAL_TITLE_ID}>1164 버스</h2>
            <p className="bus-modal-direction">길음역 방면</p>
          </div>
        </div>
        <div className="bus-tip-grid">
          {BUS_1164_TIPS.map((tip) => (
            <article className="bus-tip-card" key={tip.title}>
              <span className="bus-tip-icon" aria-hidden="true">{tip.icon}</span>
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="bus-modal-note">※ 실시간 도착 정보가 아닌 학생 이용 팁 안내입니다.</p>
      </section>
    </div>
  )
}
