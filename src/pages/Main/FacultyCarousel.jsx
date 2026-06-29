import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FACULTY } from './faculty';

/**
 * 서경대 소프트웨어학과 교수진 — 3D 원통(실린더) 캐러셀.
 * 첨부 참조본(Alumni 카드뉴스)의 CSS/HTML/JS 구조·동작을 그대로 이식.
 *   - 원통 회전(STEP/RADIUS/PUSH 동일), 중앙 카드 강조
 *   - 좌우 화살표 · 하단 dot · 키보드 ←/→ 회전
 *   - 카드 클릭 시 플립(중앙) / 옆 카드는 가운데로
 *   - ✕ · 배경 클릭 · Esc 로 닫기
 * 데이터만 교수진으로 교체, 앞면=이미지(폴백 지원), 뒷면=텍스트(placeholder).
 *
 * props: { open, onClose }  — Alumni 키캡 클릭 시 Main 이 open 을 켠다.
 */

// 원통(실린더) 배치 수치. 카드를 키운 만큼(약 1.8배) RADIUS/PUSH 도 같은 비율로 키워
// 레이아웃(간격·중앙 강조감)은 원본 그대로 유지하면서 전체 크기만 커지게 한다.
const STEP = 42; // 카드 사이 각도(도) — 그대로
const RADIUS = 780; // 원통 반지름(px) — 클수록 좌우 카드가 벌어진다. 카드 폭보다 충분히 커야 카드끼리 안 겹치고 간격이 생긴다
const PUSH = 300; // 전체를 뒤로 미는 양 — 가운데 카드 크기/원근감 조절

// 교수 카드 SVG 는 src/assets/images 에 있다(파일명에 한글/공백 포함).
// Vite 의 import.meta.glob 으로 번들링하고 "파일명" 으로 매핑한다.
// (faculty.js 의 'images/<파일명>' 에서 파일명만 떼어 매칭)
const imgModules = import.meta.glob('../../assets/images/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});
// ★ macOS 는 한글 파일명을 NFD(분해형)로 저장하고 소스 문자열은 NFC(결합형)이라
//   그대로 비교하면 안 맞는다 → 양쪽 모두 NFC 로 정규화해 매칭한다.
const baseName = (p) => p.split('/').pop().normalize('NFC');
const imgByName = {};
for (const path in imgModules) {
  imgByName[baseName(path)] = imgModules[path];
}
const resolveImg = (p) => imgByName[baseName(p)];

export default function FacultyCarousel({ open, onClose }) {
  const N = FACULTY.length;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(null); // 중앙 카드만 뒤집힘
  const [failed, setFailed] = useState(() => new Set()); // 앞면 이미지 로드 실패 인덱스

  const cardRefs = useRef([]);
  const offs = useRef([]); // 직전 off 값(래핑 감지용)
  const prevArrowRef = useRef(null);

  // 원통 위 배치/스케일/불투명도 계산 — 참조본 layout() 그대로
  const layout = useCallback(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      let off = i - index;
      if (off > N / 2) off -= N;
      if (off < -N / 2) off += N;

      const prev = offs.current[i];
      const wrapped = prev !== undefined && Math.abs(off - prev) > 2; // 반대편으로 한 바퀴
      offs.current[i] = off;

      const a = Math.abs(off);
      const sc = a === 0 ? 1 : a === 1 ? 0.78 : 0.6; // 옆 카드를 조금 더 작게 → 가운데 카드와 공백 확보(화살표 자리)
      const op = a === 0 ? 1 : a === 1 ? 1 : a === 2 ? 0.18 : 0;
      const tf = `translateZ(${-PUSH}px) rotateY(${off * STEP}deg) translateZ(${RADIUS}px) scale(${sc})`;

      if (wrapped) {
        // 앞을 가로질러 쓸고 가지 않도록 순간 이동
        card.style.transition = 'none';
        card.style.transform = tf;
        void card.offsetWidth; // reflow
        card.style.transition = '';
      } else {
        card.style.transform = tf;
      }
      card.style.opacity = String(op);
      card.style.zIndex = String(100 - a);
      // ★ 닫혀 있을 땐 카드가 화면 중앙 클릭을 가로채지 않도록 항상 none.
      //   (열렸을 때만, 그리고 화면에 보이는 카드만 클릭 가능)
      card.style.pointerEvents = open && a <= 2 ? 'auto' : 'none';
    });
  }, [index, N, open]);

  // 네비게이션 시 중앙을 벗어나므로 항상 앞면으로 복귀
  const goTo = useCallback((i) => {
    setIndex(((i % N) + N) % N);
    setFlipped(null);
  }, [N]);
  const step = useCallback((dir) => {
    setIndex((i) => (((i + dir) % N) + N) % N);
    setFlipped(null);
  }, [N]);

  // 배치는 index/open 변화 시 갱신
  useEffect(() => {
    layout();
  }, [layout, open]);

  // 열릴 때 배치 갱신 + 화살표에 포커스 (위치/페인트 확정 후 한 번 더 layout)
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      layout();
      prevArrowRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, layout]);

  // 열려 있는 동안 ←/→/Esc 가로채기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose?.(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step, onClose]);

  const onCardClick = (i) => {
    if (i === index) setFlipped((f) => (f === i ? null : i)); // 중앙 → 뒤집기
    else goTo(i); // 옆 카드 → 가운데로
  };

  const onImgError = (i) =>
    setFailed((s) => {
      if (s.has(i)) return s;
      const next = new Set(s);
      next.add(i);
      return next;
    });

  return (
    <Overlay
      className={open ? 'open' : ''}
      role="dialog"
      aria-label="소프트웨어학과 교수진 카드뉴스"
      aria-hidden={open ? 'false' : 'true'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button className="al-close" aria-label="닫기" onClick={onClose}>✕</button>

      <div className="al-head">
        <div className="al-eyebrow">FACULTY · 소프트웨어학과 교수진</div>
        <div className="al-title">소프트웨어학과 교수진</div>
      </div>

      <div className="al-stage">
        <button className="al-nav al-prev" ref={prevArrowRef} aria-label="이전 카드" onClick={() => step(-1)}>‹</button>

        <div className="al-track">
          {FACULTY.map((a, i) => (
            <button
              key={i}
              className={`al-card${flipped === i ? ' flipped' : ''}`}
              style={{ '--accent': a.accent, '--accent2': a.accent2 }}
              ref={(el) => (cardRefs.current[i] = el)}
              onClick={() => onCardClick(i)}
              aria-label={`${a.name} 교수`}
            >
              <div className="al-card-inner">
                {/* 앞면 = 카드뉴스 이미지 (src 없거나 로드 실패 시 이니셜 폴백) */}
                <div className="al-face al-front">
                  {resolveImg(a.img) && !failed.has(i) ? (
                    <img
                      className="al-img"
                      src={resolveImg(a.img)}
                      alt={`${a.name} 교수`}
                      loading="lazy"
                      draggable={false}
                      onError={() => onImgError(i)}
                    />
                  ) : (
                    <div className="al-fallback">
                      <span className="al-fallback-initial">{a.initial}</span>
                      <span className="al-fallback-name">{a.name} 교수</span>
                    </div>
                  )}
                </div>

                {/* 뒷면 = 선배들의 꿀팁 (제목 + 항목) */}
                <div className="al-face al-back">
                  <div className="al-back-text">
                    <div className="al-back-name">{a.name} 교수님한테서 살아남는 선배들의 꿀팁!</div>
                    <ul className="al-tips">
                      {a.tips.map((t, k) => (
                        <li key={k}>{t}</li>
                      ))}
                    </ul>
                    <div className="al-foot"><span className="flip-ic" /> 눌러서 앞면으로</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button className="al-nav al-next" aria-label="다음 카드" onClick={() => step(1)}>›</button>
      </div>

      <div className="al-dots">
        {FACULTY.map((a, i) => (
          <button
            key={i}
            className={`al-dot${i === index ? ' active' : ''}`}
            aria-label={`${a.name} 교수 카드로 이동`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </Overlay>
  );
}

/* ============ 참조본 [1] CSS 를 styled-components 로 이식 ============ */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 40px 18px;
  background:
    radial-gradient(900px 600px at 50% 16%, rgba(255, 255, 255, 0.1), transparent 60%),
    rgba(22, 24, 38, 0.46);
  -webkit-backdrop-filter: blur(7px) saturate(0.92);
  backdrop-filter: blur(7px) saturate(0.92);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.34s ease;

  &.open {
    opacity: 1;
    pointer-events: auto;
  }

  .al-head {
    text-align: center;
    color: #fff;
    transform: translateY(10px);
    opacity: 0;
    transition: transform 0.5s cubic-bezier(0.2, 0.85, 0.3, 1) 0.06s, opacity 0.5s ease 0.06s;
  }
  &.open .al-head {
    transform: none;
    opacity: 1;
  }
  .al-eyebrow {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #c4c8e6;
    margin-bottom: 8px;
  }
  .al-title {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  /* 3D viewport */
  .al-stage {
    position: relative;
    width: min(1400px, 96vw);
    height: min(660px, 78vh);
    perspective: 1800px;
    display: grid;
    place-items: center;
  }
  .al-track {
    position: relative;
    width: 0;
    height: 0;
    transform-style: preserve-3d;
  }

  .al-card {
    /* 카드뉴스 원본 비율 922:822 에 맞춤 → 좌우 잘림 없음 */
    --w: 480px;
    --h: 428px;
    appearance: none;
    border: 0;
    padding: 0;
    margin: 0;
    background: none;
    font: inherit;
    position: absolute;
    left: 0;
    top: 0;
    width: var(--w);
    height: var(--h);
    margin-left: calc(var(--w) / -2);
    margin-top: calc(var(--h) / -2);
    transform-style: preserve-3d;
    cursor: pointer;
    outline: none;
    transition: transform 0.58s cubic-bezier(0.22, 0.78, 0.26, 1), opacity 0.4s ease;
    will-change: transform;
  }
  .al-card:focus-visible .al-face {
    box-shadow: 0 0 0 3px #fff, 0 28px 60px rgba(10, 12, 24, 0.5);
  }

  .al-card-inner {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    transition: transform 0.62s cubic-bezier(0.5, 0.06, 0.2, 1);
  }
  .al-card.flipped .al-card-inner {
    transform: rotateY(180deg);
  }

  .al-face {
    position: absolute;
    inset: 0;
    border-radius: 24px;
    overflow: hidden;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    box-shadow: 0 26px 56px rgba(10, 12, 24, 0.42);
    display: flex;
    flex-direction: column;
  }

  /* ---- front = 이미지 ---- */
  .al-front {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .al-img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* 원본 전체 표시(잘림 없음) — 카드 비율을 원본에 맞춰 여백도 없음 */
    border-radius: 24px;
    display: block;
    user-select: none;
  }
  .al-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
  }
  .al-fallback-initial {
    width: 96px;
    height: 96px;
    border-radius: 28px;
    display: grid;
    place-items: center;
    font-size: 44px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.18);
  }
  .al-fallback-name {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  /* ---- back: 뒷면 SVG 이미지(.al-img) 가 채우고, 없으면 .al-back-text 폴백 ---- */
  .al-back {
    transform: rotateY(180deg);
    background: linear-gradient(150deg, var(--accent), var(--accent2));
    color: #fff;
    padding: 0;
  }
  .al-back-text {
    width: 100%;
    height: 100%;
    padding: 32px 30px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 제목+내용을 카드 세로 중앙에 */
    overflow-y: auto;
    scrollbar-width: none;
  }
  .al-back-text::-webkit-scrollbar {
    display: none;
  }
  .al-back-name {
    font-size: 26px;
    font-weight: 800;
    line-height: 1.35;
    text-align: center;
    margin-bottom: 22px;
  }
  .al-tips {
    margin: 0;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    list-style: disc;
  }
  .al-tips li {
    font-size: 19px;
    font-weight: 500;
    line-height: 1.55;
    word-break: keep-all;
  }
  .al-quote-mark {
    font-size: 54px;
    font-weight: 700;
    line-height: 0.6;
    opacity: 0.5;
  }
  .al-quote {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.5;
    margin-top: 4px;
  }
  .al-now-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.72;
    margin-bottom: 5px;
  }
  .al-now-label.al-gap {
    margin-top: 14px;
  }
  .al-now {
    font-size: 14.5px;
    font-weight: 500;
    line-height: 1.45;
    opacity: 0.96;
  }
  .al-back .al-foot {
    margin-top: 22px; /* 중앙 그룹 안에서 내용 바로 아래에 (auto 로 바닥 고정하지 않음) */
    padding-top: 0;
    font-size: 15px;
    font-weight: 600;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .flip-ic {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    border: 1.6px solid currentColor;
    position: relative;
    flex: none;
  }
  .flip-ic::after {
    content: '↻';
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 11px;
    line-height: 1;
  }

  /* nav arrows — 카드 밖(화면 좌우 가장자리)에 고정 */
  /* nav arrows — 가운데 카드와 옆 카드 "사이 공백"의 정중앙(가로·세로)에 배치 */
  .al-nav {
    position: fixed; /* 화면 기준 (카드가 px 고정이라 화면 폭과 무관) */
    top: 50%; /* 세로 중앙 */
    z-index: 130; /* 카드(100대)·오버레이 위 */
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    transition: background 0.15s ease, filter 0.15s ease;
  }
  .al-nav:hover {
    background: rgba(255, 255, 255, 0.24);
  }
  .al-nav:active {
    filter: brightness(0.85); /* transform 은 위치고정에 쓰므로 누름 피드백은 밝기로 */
  }
  /* --gap-x = 화면 중앙에서 공백 중앙까지의 거리(px). translate 로 화살표 "중심"을 그 지점에 맞춤
     → 화살표 크기와 무관하게 항상 공백 정중앙. 위치가 어긋나면 --gap-x 만 조절. */
  .al-prev {
    left: calc(50% - var(--gap-x, 362px));
    transform: translate(-50%, -50%);
  }
  .al-next {
    right: calc(50% - var(--gap-x, 362px));
    transform: translate(50%, -50%);
  }

  .al-dots {
    display: flex;
    gap: 9px;
    align-items: center;
  }
  .al-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 0;
    padding: 0;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.32);
    transition: all 0.25s ease;
  }
  .al-dot.active {
    width: 30px;
    border-radius: 99px;
    background: #fff;
  }

  .al-close {
    position: fixed;
    top: clamp(16px, 2.5vw, 28px);
    right: clamp(16px, 2.5vw, 28px);
    z-index: 130;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 22px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.15s ease;
  }
  .al-close:hover {
    background: rgba(255, 255, 255, 0.22);
  }

  @media (max-width: 560px) {
    .al-stage {
      height: min(460px, 62vh);
    }
    .al-card {
      --w: 300px;
      --h: 268px;
    }
    .al-title {
      font-size: 26px;
    }
    .al-nav {
      width: 44px;
      height: 44px;
      font-size: 24px;
    }
    /* 모바일은 카드가 작아져 공백 계산이 안 맞으므로 화면 가장자리로 (translate 는 세로 중앙만) */
    .al-prev {
      left: 8px;
      transform: translateY(-50%);
    }
    .al-next {
      right: 8px;
      transform: translateY(-50%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &,
    .al-card,
    .al-card-inner,
    .al-head {
      transition-duration: 0.12s;
    }
  }
`;
