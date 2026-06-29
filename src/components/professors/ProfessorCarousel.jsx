// ============================================================
// 교수 소개 캐러셀 - 무한 순환, 3D 원근 슬라이드
// ============================================================

import { useState, useCallback } from 'react';
import ProfessorCard, { CARD_W, CARD_H } from './ProfessorCard';
import { PROFESSORS } from '../../data/professors';

const COUNT = PROFESSORS.length; // 9

// ── 슬롯별 위치/스타일 설정 ───────────────────────────────────
// 카드 크기 400×400 기준 / ±1 카드 = Y축 ±45도 회전
const SLOT_CONFIG = {
  '-2': { x: -420, scale: 0.58, rotateY:  -50, opacity: 0.22, zIndex: 1, blur: 8 },
  '-1': { x: -320, scale: 0.90, rotateY:  -45, opacity: 0.92, zIndex: 3, blur: 0 },
   '0': { x:    0, scale: 1.00, rotateY:   0, opacity: 1.00, zIndex: 5, blur: 0 },
  '+1': { x:  320, scale: 0.90, rotateY: 45, opacity: 0.92, zIndex: 3, blur: 0 },
  '+2': { x:  420, scale: 0.58, rotateY: 50, opacity: 0.22, zIndex: 1, blur: 8 },
};

// ── 인덱스 유틸 ──────────────────────────────────────────────
const wrap = (idx) => ((idx % COUNT) + COUNT) % COUNT;

// rel: 데이터 인덱스와 activeIndex의 상대 거리 (-4 ~ +4)
function getRelative(dataIdx, activeIdx) {
  let rel = dataIdx - activeIdx;
  // 최단 경로 정규화 (e.g. 9개 카드에서 rel=8 → -1)
  if (rel > COUNT / 2)  rel -= COUNT;
  if (rel < -COUNT / 2) rel += COUNT;
  return rel;
}

// ── 화살표 버튼 ──────────────────────────────────────────────
function ArrowBtn({ direction, onClick }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? '이전' : '다음'}
      style={{
        position: 'absolute',
        top: '50%',
        [isLeft ? 'left' : 'right']: '12px',
        transform: 'translateY(-50%)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'rgba(20, 20, 40, 0.75)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        color: 'rgba(180, 190, 230, 0.85)',
        fontSize: '1.3rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(79, 70, 229, 0.4)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(20, 20, 40, 0.75)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
      }}
    >
      {isLeft ? '‹' : '›'}
    </button>
  );
}

// ── Dot 인디케이터 ────────────────────────────────────────────
function DotIndicator({ count, activeIdx, onDotClick }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '32px',
    }}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`${i + 1}번 교수`}
          style={{
            width: i === activeIdx ? '24px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: i === activeIdx
              ? 'rgba(99, 102, 241, 0.9)'
              : 'rgba(99, 102, 241, 0.25)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      ))}
    </div>
  );
}

// ── 메인 캐러셀 컴포넌트 ─────────────────────────────────────
export default function ProfessorCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const navigate = useCallback((dir) => {
    setIsFlipped(false);
    setActiveIdx((prev) => wrap(prev + dir));
  }, []);

  const jumpTo = useCallback((idx) => {
    setIsFlipped(false);
    setActiveIdx(idx);
  }, []);

  const handleCardClick = (rel) => {
    if (rel === 0) {
      setIsFlipped((prev) => !prev);
    } else {
      navigate(rel > 0 ? 1 : -1);
    }
  };

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {/* ── 카드 트랙 (원근 컨테이너) ── */}
      <div
        style={{
          position: 'relative',
          height: `${CARD_H + 20}px`,
          perspective: '1400px',
        }}
      >
        {PROFESSORS.map((prof, dataIdx) => {
          const rel = getRelative(dataIdx, activeIdx);
          if (Math.abs(rel) > 2) return null; // 보이지 않는 카드는 렌더 제외

          const slotKey = rel === 0 ? '0' : rel > 0 ? `+${rel}` : `${rel}`;
          const cfg = SLOT_CONFIG[slotKey];
          if (!cfg) return null;

          const isCenter = rel === 0;

          return (
            <div
              key={dataIdx}
              onClick={() => handleCardClick(rel)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                // translateX(-50%): 카드 가운데 정렬 기준
                // translateX(Xpx): 슬롯 위치로 이동
                // translateY(-50%): 수직 중앙
                // scale: 크기 조정
                // rotateY: 3D 기울기 (각 카드 자체 원근은 ProfessorCard 내부 perspective로)
                transform: `
                  translateX(calc(-50% + ${cfg.x}px))
                  translateY(-50%)
                  scale(${cfg.scale})
                  rotateY(${cfg.rotateY}deg)
                `,
                opacity: cfg.opacity,
                zIndex: cfg.zIndex,
                filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : 'none',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease, filter 0.5s ease',
                cursor: isCenter ? 'pointer' : 'pointer',
                // 중앙 카드는 약간의 glow 효과
                ...(isCenter && {
                  filter: `drop-shadow(0 0 24px ${prof.avatarColor}44)`,
                }),
              }}
            >
              <ProfessorCard
                data={prof}
                index={dataIdx + 1}
                total={COUNT}
                isCenter={isCenter}
                isFlipped={isCenter && isFlipped}
              />
            </div>
          );
        })}
      </div>

      {/* ── 화살표 버튼 ── */}
      <ArrowBtn direction="left"  onClick={() => navigate(-1)} />
      <ArrowBtn direction="right" onClick={() => navigate(1)}  />

      {/* ── Dot 인디케이터 ── */}
      <DotIndicator count={COUNT} activeIdx={activeIdx} onDotClick={jumpTo} />
    </div>
  );
}
