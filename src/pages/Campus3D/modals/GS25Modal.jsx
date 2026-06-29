import { useEffect, useState } from 'react'
import gs1 from '../../../assets/images/gs25/gs1.png'
import gs2 from '../../../assets/images/gs25/gs2.png'
import gs3 from '../../../assets/images/gs25/gs3.png'
import './GS25Modal.css'

const gs25Slides = [
  {
    image: gs1,
    title: 'GS25 편의점 입구',
    description:
      '서경대학교 캠퍼스 안에 위치한 GS25 편의점입니다. 유리 외관과 밝은 조명으로 구성되어 있어 학생들이 쉽게 찾을 수 있는 편의 공간입니다.',
  },
  {
    image: gs2,
    title: '편의점 내부 휴게 공간',
    description:
      '구매한 음식을 먹거나 잠깐 쉬어갈 수 있는 테이블과 좌석이 마련된 공간입니다. 학생들이 공강 시간이나 이동 중에 편하게 이용할 수 있습니다.',
  },
  {
    image: gs3,
    title: '전자레인지 및 셀프 이용 공간',
    description:
      '도시락, 컵라면, 간편식 등을 데워 먹을 수 있는 전자레인지와 셀프바가 있는 공간입니다. 간단한 식사나 간식을 해결하기 좋은 장소입니다.',
  },
]

export default function GS25Modal({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((index) => (index + 1) % gs25Slides.length)
  }

  const handlePrev = () => {
    setCurrentIndex((index) => (index - 1 + gs25Slides.length) % gs25Slides.length)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const slide = gs25Slides[currentIndex]

  return (
    <div className="gs25-modal-overlay" onClick={onClose} role="presentation">
      <section
        className="gs25-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gs25-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="gs25-modal-close" type="button" onClick={onClose} aria-label="모달 닫기">
          ×
        </button>

        <div className="gs25-slide-image-wrap">
          <button className="gs25-slide-arrow gs25-slide-arrow--prev" type="button" onClick={handlePrev} aria-label="이전 사진">
            ‹
          </button>
          <img className="gs25-slide-image" src={slide.image} alt={slide.title} />
          <button className="gs25-slide-arrow gs25-slide-arrow--next" type="button" onClick={handleNext} aria-label="다음 사진">
            ›
          </button>
        </div>

        <div className="gs25-slide-copy">
          <h2 id="gs25-modal-title">{slide.title}</h2>
          <p>{slide.description}</p>
        </div>

        <div className="gs25-slide-dots" aria-label={`${currentIndex + 1} / ${gs25Slides.length}번째 사진`}>
          {gs25Slides.map((item, index) => (
            <button
              key={item.title}
              className={`gs25-slide-dot${index === currentIndex ? ' is-active' : ''}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
