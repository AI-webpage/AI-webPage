import { useEffect } from 'react'
import './Bus1164Modal.css'

const busTips = [
  {
    icon: '🚌',
    title: '북악관 바로 앞 하차',
    description: <><strong>2115번</strong> 버스를 이용하면 북악관 바로 앞 정류장에서 하차할 수 있어요.</>,
  },
  {
    icon: '⏰',
    title: '혼잡 시간대 추천',
    description: <>등교 시간처럼 사람이 많은 시간대에는 1164번보다 <strong>2115번</strong> 이용을 추천해요.</>,
  },
]

export default function Bus2115Modal({ isOpen, onClose }) {
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
        aria-labelledby="bus-2115-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="bus-modal-close" type="button" onClick={onClose} aria-label="모달 닫기">×</button>
        <div className="bus-modal-heading">
          <span className="bus-modal-badge">2115</span>
          <div>
            <h2 id="bus-2115-modal-title">2115 버스</h2>
            <p className="bus-modal-direction">성신여대 방면</p>
          </div>
        </div>
        <div className="bus-tip-grid">
          {busTips.map((tip) => (
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
