import styled from 'styled-components';
import { useTypewriter } from '../Landing/hooks/useTypewriter';

/**
 * HOME 화면 인트로 — "환영합니다" 를 타자기 효과로 보여주고, 아래에 'Scroll down' 안내.
 *
 * - 스크롤 시작 구간에서만 보이도록, 부모가 넘겨준 opacity 로 페이드.
 * - pointer-events:none → 스크롤(휠/터치)은 그대로 아래 MainScroll 로 통과.
 *
 * props
 *  - opacity : 0~1 (스크롤 진행도에 따라 부모가 계산해서 전달)
 */
const WELCOME = '환영합니다';

export default function HomeIntro({ opacity = 1 }) {
  const { shown, done } = useTypewriter(WELCOME, 120); // 120ms/글자

  return (
    <Wrap style={{ opacity }} aria-hidden={opacity <= 0.01 ? 'true' : 'false'}>
      <Title>
        {shown}
        <Caret data-done={done} />
      </Title>

      {/* 타이핑이 끝나면 스크롤 안내 등장 */}
      <ScrollHint data-show={done}>
        <span>Scroll down</span>
        <Arrow aria-hidden="true">↓</Arrow>
      </ScrollHint>
    </Wrap>
  );
}

/* ───── styled ───── */
const Wrap = styled.div`
  position: fixed;
  inset: 0;
  z-index: 4; /* 배경(0) 위, 헤더(50)·카드뉴스(120) 아래 */
  pointer-events: none; /* 스크롤 통과 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  transition: opacity 0.3s ease;
  will-change: opacity;
`;

const Title = styled.h1`
  margin: 0;
  display: inline-flex;
  align-items: center;
  color: #111;
  font-family: 'Poppins', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 8vw, 104px);
  letter-spacing: 0.02em;
  text-shadow: 0 4px 30px rgba(255, 255, 255, 0.6);
`;

/* 타이핑 커서(깜빡임) — 타이핑 중엔 항상 보이고, 끝나면 blink */
const Caret = styled.span`
  display: inline-block;
  width: 0.06em;
  height: 1em;
  margin-left: 0.08em;
  background: #111;
  &[data-done='true'] {
    animation: blink 1s steps(1) infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    &[data-done='true'] {
      animation: none;
    }
  }
`;

const ScrollHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #333;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: clamp(13px, 1.4vw, 16px);
  letter-spacing: 0.18em;
  text-transform: uppercase;

  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  &[data-show='true'] {
    opacity: 0.9;
    transform: translateY(8px); /* scroll down + 화살표 아래로 (3px → 8px) */
  }
`;

const Arrow = styled.span`
  font-size: 1.4em;
  line-height: 1;
  animation: bounce 1.6s ease-in-out infinite;
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(6px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
