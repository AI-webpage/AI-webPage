import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

/**
 * 스크롤 연동 헤더 (투명 · 가운데 정렬 · 활성 메뉴는 라운드 박스 강조).
 *
 * [동작]
 *  - 스크롤 진행도(0~1)를 STOPS 기준 fractional index 로 환산 → 가장 가까운 메뉴를 active.
 *  - 해당 페이지(프레임)에 오면 그 카테고리가 "검정 테두리 라운드 박스 + 흰색 반투명 배경 + 흰 글씨"로 변함.
 *  - 메뉴 클릭 시 그 메뉴의 STOPS 위치로 스크롤.
 *
 * [스크롤 소스] window 가 막혀 있어 유일한 스크롤 컨테이너 MainScroll(scrollRef)에 올라탄다. 없으면 window.
 *
 * props
 *  - scrollRef : 스크롤 컨테이너 ref (예: 메인의 MainScroll). 미지정 시 window.
 */

/* ───── 설정값 (여기만 바꾸면 됨) ───── */
const NAV_ITEMS = [
  { label: 'HOME' },
  { label: 'FACULTY' },
  { label: 'CURRICULUM' },
  { label: 'SUPPORT & AWARDS' },
  { label: 'CAMPUS TOUR' },
];

/* 각 메뉴가 활성화/이동되는 "스크롤 진행도(0~1)".
   HOME / FACULTY: 교수 명함 / CURRICULUM: 핑크 코드 / SUPPORT & AWARDS: 노란 코드.
   ★ CAMPUS TOUR(마지막)는 어떤 프레임에도 안 묶임 → STOPS 에 넣지 않음(스크롤 활성표시 X, 클릭 시 영상 전환). */
const STOPS = [0, 0.2, 0.65, 0.97];
/* ──────────────────────────────── */

// 스크롤 진행도(p)를 STOPS 기준 fractional index(0 ~ n-1)로 변환
const progressToFrac = (p, stops) => {
  const n = stops.length;
  if (p <= stops[0]) return 0;
  if (p >= stops[n - 1]) return n - 1;
  for (let i = 0; i < n - 1; i++) {
    if (p >= stops[i] && p <= stops[i + 1]) {
      const seg = stops[i + 1] - stops[i];
      return i + (seg > 0 ? (p - stops[i]) / seg : 0);
    }
  }
  return n - 1;
};

export default function Header({ scrollRef, onNavigate }) {
  const rafRef = useRef(0); // 스크롤 rAF throttle 핸들
  const [active, setActive] = useState(0); // 현재 강조 메뉴 인덱스

  // 현재 스크롤 소스의 진행도(0~1)
  const getProgress = () => {
    const scroller = scrollRef?.current || null;
    if (scroller) {
      const max = scroller.scrollHeight - scroller.clientHeight;
      return max > 0 ? scroller.scrollTop / max : 0;
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  };

  // 진행도 → 가장 가까운 메뉴를 active 로
  const applyProgress = (p) => {
    const nearest = Math.round(progressToFrac(p, STOPS));
    setActive((prev) => (prev === nearest ? prev : nearest));
  };

  // 스크롤 → active 갱신 (rAF throttle). scrollRef 변경 시 재바인딩.
  useEffect(() => {
    const target = scrollRef?.current || window;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        applyProgress(getProgress());
      });
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 초기 1회 동기화
    return () => {
      target.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef]);

  // 메뉴 클릭 → 해당 프레임으로 "바로" 이동.
  //  - Main 이 onNavigate 를 주면 그쪽에 위임(브레이크 우회 + 해당 모달 직접 오픈).
  //  - 없으면 폴백으로 직접 스크롤.
  const handleClick = (i) => {
    if (onNavigate) {
      onNavigate(i, STOPS[i] ?? 0);
      return;
    }
    const frac = STOPS[i] ?? 0;
    const scroller = scrollRef?.current || null;
    if (scroller) {
      const max = scroller.scrollHeight - scroller.clientHeight;
      scroller.scrollTop = max * frac;
    } else {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * frac });
    }
  };

  return (
    <Bar>
      <Nav aria-label="주요 메뉴">
        {NAV_ITEMS.map((item, i) => (
          <Item
            key={item.label}
            type="button"
            data-active={active === i}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => handleClick(i)}
          >
            {item.label}
          </Item>
        ))}
      </Nav>
    </Bar>
  );
}

/* ───── styled ───── */
const Bar = styled.header`
  position: fixed;
  top: clamp(14px, 3vh, 40px); /* 헤더를 살짝 아래로 */
  left: 0;
  right: 0;
  height: clamp(76px, 8vw, 110px);
  z-index: 50; /* 배경(0)·텍스트(4)·로더(30) 위 */
  display: flex;
  align-items: center;
  justify-content: center; /* 메뉴를 가운데로 */
  padding: 0 clamp(8px, 2.5vw, 40px);
  background: transparent; /* 네모 박스(흰 배경+경계선) 제거 */
  pointer-events: none; /* 빈 영역은 아래 스크롤로 통과, 버튼만 클릭 */
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap; /* 항상 한 줄 — 줌/창 축소에도 줄바꿈 금지 */
  gap: clamp(6px, 1.4vw, 36px);
  max-width: 100%;
`;

const Item = styled.button`
  pointer-events: auto; /* 버튼은 클릭 가능 */
  appearance: none;
  cursor: pointer;
  font-family: 'Poppins', system-ui, sans-serif;
  /* 전부 vw 기반 → 줌/창 크기와 무관하게 비율 유지, 좁아지면 같이 줄어 한 줄 유지.
     min 을 낮춰 확대(=좁은 뷰포트)에서도 안 넘치게. */
  font-size: clamp(11px, 1.9vw, 38px);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  font-weight: 600;

  /* 평소: 테두리/배경 없이 검은 글씨 (테두리는 투명으로 잡아둬 활성 시 레이아웃 안 흔들림) */
  color: #111111;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 999px;
  padding: clamp(7px, 0.9vw, 16px) clamp(9px, 1.5vw, 40px); /* vw 기반 여백(좁아지면 같이 축소) */
  transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;

  /* 해당 페이지(프레임)에 오면: 검정 테두리 라운드 박스 + 흰색 반투명 배경 + 흰 글씨 */
  &[data-active='true'] {
    color: #000000;
    background: rgba(255, 255, 255, 0.18);
    border-color: #000000;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }
  &:hover:not([data-active='true']) {
    color: #000000;
  }
  &:focus-visible {
    outline: 2px solid #000;
    outline-offset: 3px;
  }
`;
