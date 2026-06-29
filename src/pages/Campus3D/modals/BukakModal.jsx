import { useEffect, useState } from 'react'
import buk1 from '../../../assets/images/buk/buk1.png'
import buk2 from '../../../assets/images/buk/buk2.png'
import buk3 from '../../../assets/images/buk/buk3.png'
import buk4 from '../../../assets/images/buk/buk4.png'
import './GS25Modal.css'

const bukakSlides = [
  {
    image: buk1,
    title: '북악관 외관',
    description:
      '서경대학교 북악관은 캠퍼스의 주요 건물 중 하나로, 강의실과 학과 공간이 함께 구성된 학습 중심 건물입니다. 정면 계단과 아치형 구조가 특징이며 학생들이 자주 오가는 공간입니다.',
  },
  {
    image: buk2,
    title: '컴퓨터 실습실',
    description:
      '북악관 내부에는 소프트웨어학과 학생들이 수업과 실습을 진행할 수 있는 컴퓨터 실습실이 마련되어 있습니다. 프로그래밍, 데이터베이스, 웹 개발 등 다양한 전공 수업에 활용되는 공간입니다.',
  },
  {
    image: buk3,
    title: '전공 강의 공간',
    description:
      '소프트웨어학과 전공 수업이 진행되는 강의실입니다. 교수님의 설명을 들으며 실습과 이론을 함께 학습할 수 있는 공간으로, 학생들이 전공 역량을 쌓는 중요한 장소입니다.',
  },
  {
    image: buk4,
    title: '소프트웨어학과 6층 안내도',
    description:
      '북악관 6층에는 소프트웨어학과 강의실, 연구실, 실습실 등 학과 관련 공간들이 배치되어 있습니다. 학생들은 이곳에서 전공 수업, 실습, 학과 활동을 진행할 수 있습니다.',
  },
]

export default function BukakModal({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((index) => (index + 1) % bukakSlides.length)
  }

  const handlePrev = () => {
    setCurrentIndex((index) => (index - 1 + bukakSlides.length) % bukakSlides.length)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const slide = bukakSlides[currentIndex]

  return (
    <div className="gs25-modal-overlay" onClick={onClose} role="presentation">
      <section
        className="gs25-modal bukak-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bukak-modal-title"
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
          <h2 id="bukak-modal-title">{slide.title}</h2>
          <p>{slide.description}</p>
        </div>

        <div className="gs25-slide-dots" aria-label={`${currentIndex + 1} / ${bukakSlides.length}번째 사진`}>
          {bukakSlides.map((item, index) => (
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
