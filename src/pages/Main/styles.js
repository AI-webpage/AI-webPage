import styled, { keyframes } from "styled-components";
import { COLORS, media } from "../../styles/theme";

/* 메인 진입 — 흰색에서 빠져나오듯 살짝 줌아웃(emerge) */
const mainEmerge = keyframes`
  from { transform: scale(1.08); }
  to   { transform: scale(1); }
`;

/* 스크롤 거리(vh). 영상은 멈추지 않고 선형으로 진행(진행도 = 스크롤 비율). */
export const SCROLL_LENGTH_VH = 800;

/* 교수 명함이 보이는 영상 진행도 구간.
   환영합니다(인트로 ~0.05) 가 끝나면 바로 교수님이 나오도록 시작을 당기고, 핑크 0.63 전에 종료. */
export const CARD_START = 0.16; // 명함 시작(환영합니다 직후)
export const CARD_END = 0.7; // 명함 종료(핑크 전)
export const CARD_TOP_VH = SCROLL_LENGTH_VH * CARD_START; // 명함 컬럼 시작 위치(vh)

/* 메인 = 독립 스크롤 컨테이너 (window/body 는 잠긴 채 두고 여기만 스크롤).
   배경 프레임 진행도를 이 엘리먼트의 스크롤에 연동한다. */
export const MainScroll = styled.div`
  position: fixed;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: ${COLORS.black};
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  /* 모달 열림 = 브레이크: 스크롤 잠금(현재 위치=코드 프레임에서 멈춤) */
  ${(p) => p.$locked && "overflow-y: hidden;"}

  /* 진입 시 흰색에서 빠져나오듯 살짝 줌아웃 (fill 미사용 → 끝나면 transform 제거되어 fixed 자식 정상) */
  animation: ${mainEmerge} 0.85s cubic-bezier(0.2, 0.7, 0.2, 1);
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/* 스크롤 거리 확보용 트랙 (이 안에서 키보드를 sticky 로 핀 고정).
   ★ fixed 가 아니라 sticky 여야 휠 커서가 키보드 위에 있어도 MainScroll 이 굴러간다. */
export const ScrollTrack = styled.div`
  position: relative;
  width: 100%;
  height: ${SCROLL_LENGTH_VH}vh;
`;

/* 키보드 핀 고정 — sticky(정상 흐름) 이라 스크롤 체인이 MainScroll 로 이어진다.
   배경(0) 위, 텍스트(4)·캐러셀(120) 아래. */
export const Pin = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* 인터랙티브 3D 키보드 — 구 keyboard.css 를 .kbd 스코프 그대로 styled 로 이전.
   내부 .layer/.cap/.key 등은 JS(useEffect)로 동적 생성되며, 이 중첩 선택자가 그대로 적용됨.
   키보드는 자체 반응형(scene 의 vw 기반 크기 + 모바일 미디어쿼리)으로 모든 화면에서 비율 유지. */
export const KbdRoot = styled.div`
  /* board geometry */
  --board-w: 424px;
  --board-h: 324px;
  --case-h: 52px;
  --key-h: 60px;
  --rest: var(--case-h);
  --travel: calc(
    var(--key-h) / 2
  ); /* 키캡 눌림 깊이 = 전체 두께(60px)의 절반(30px) */
  --scale: 2; /* 키보드(+키캡) 전체 배율 — 키울수록 커진다 */

  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family:
    "Poppins",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  color: #eef1f6;
  user-select: none;

  &,
  & * {
    box-sizing: border-box;
  }

  /* 보드(scene)만 화면 정중앙. 안내문/토글은 하단 고정. */
  & .stage {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ----- 3D scene ----- */
  & .scene {
    perspective: 1800px;
    width: min(620px, 94vw);
    aspect-ratio: 620 / 540;
    overflow: visible;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    touch-action: none;
  }
  & .scene.dragging {
    cursor: grabbing;
  }

  & .board-wrap {
    position: relative;
    width: var(--board-w);
    height: var(--board-h);
    transform: scale(var(--scale, 1));
    transform-style: preserve-3d;
  }

  & .floor-shadow {
    position: absolute;
    left: 50%;
    top: 62%;
    width: 120%;
    height: 78%;
    transform: translate(-50%, -50%) rotateX(54deg) rotateZ(-46deg)
      translateZ(-4px);
    background: radial-gradient(
      ellipse at center,
      rgba(15, 18, 30, 0.55),
      rgba(15, 18, 30, 0) 68%
    );
    filter: blur(16px);
    z-index: 0;
  }

  & .board {
    position: absolute;
    inset: 0;
    transform: rotateX(54deg) rotateZ(-46deg);
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
  }

  /* ----- layered blocks ----- */
  & .block {
    position: absolute;
    left: 0;
    top: 0;
    transform-style: preserve-3d;
  }
  & .layer {
    position: absolute;
  }
  & .cap {
    display: grid;
    place-items: center;
    color: var(--txt);
    font-weight: 600;
    letter-spacing: 0.2px;
    user-select: none;
    overflow: hidden;
  }

  /* ----- keys ----- */
  & .keys {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }
  & .key {
    --w: 80px;
    --d: 80px;
    --h: var(--key-h);
    appearance: none;
    border: 0;
    padding: 0;
    margin: 0;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
    position: absolute;
    left: 0;
    top: 0;
    width: var(--w);
    height: var(--d);
    transform-style: preserve-3d;
    transform: translate3d(var(--x), var(--y), var(--rest));
    transition:
      transform 0.12s cubic-bezier(0.2, 0.8, 0.25, 1),
      filter 0.12s ease;
    outline: none;
  }
  & .key.pressed {
    transform: translate3d(
      var(--x),
      var(--y),
      calc(var(--rest) - var(--travel))
    );
    filter: brightness(0.96);
  }

  & .key .cap {
    position: relative;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 0 16px rgba(0, 0, 0, 0.09);
  }
  & .key .cap::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      54% 50% at 50% 50%,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 44%,
      rgba(255, 255, 255, 0) 74%
    );
    pointer-events: none;
  }
  & .key .cap .lbl {
    position: relative;
    z-index: 2;
  }
  & .key:focus-visible .cap {
    outline: 3px solid #6366f1;
    outline-offset: 3px;
  }

  /* metallic sheen on the base top */
  & .metal .cap {
    position: relative;
  }
  & .metal .cap::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      126deg,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.04) 22%,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 0.04) 78%,
      rgba(255, 255, 255, 0.16) 100%
    );
    pointer-events: none;
  }

  & .lbl {
    font-size: 17px;
    text-align: center;
    line-height: 1.08;
    padding: 0 5px;
    white-space: nowrap;
  }
  & .lbl.glyph {
    font-size: 26px;
    font-weight: 700;
  }
  & .lbl.letter {
    font-size: 30px;
    font-weight: 700;
  }

  /* matte color themes */
  & .k-yellow {
    --top: #f4be36;
    --side: #d2950f;
    --txt: #5b3e00;
  }
  & .k-purple {
    --top: #7b49dd;
    --side: #5a2db0;
    --txt: #fff;
  }
  & .k-navy {
    --top: #222b4d;
    --side: #141a33;
    --txt: #eef1ff;
  }
  & .k-white {
    --top: #f2f3f7;
    --side: #d2d6e0;
    --txt: #3a3f4d;
  }
  & .k-blue {
    --top: #4b43e0;
    --side: #352db8;
    --txt: #fff;
  }
  & .k-green {
    --top: #34a853;
    --side: #23823e;
    --txt: #fff;
  }

  /* chrome — 하단 고정 */
  & .hint {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 72px;
    font-size: 13.5px;
    color: #aeb4c2;
    font-weight: 500;
    text-align: center;
  }
  & .hint b {
    color: #e7eaf2;
    font-weight: 600;
  }
  & kbd {
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    background: #2a2d39;
    border: 1px solid #3a3e4c;
    border-bottom-width: 2px;
    border-radius: 6px;
    padding: 1px 6px;
    color: #d8dce4;
  }
  & .controls {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  & .toggle {
    appearance: none;
    border: 1px solid #3a3e4c;
    background: #1b1d27;
    border-radius: 999px;
    padding: 7px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #d8dce4;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }
  & .toggle:hover {
    background: #262936;
  }
  & .toggle[aria-pressed="true"] {
    background: #f2f3f7;
    color: #15161d;
    border-color: #f2f3f7;
  }

  ${media.mobile} {
    & .board-wrap {
      --scale: 1; /* 모바일에선 화면에 맞게 축소 */
    }
  }
  ${media.reduced} {
    & .key {
      transition: transform 0.04s linear;
    }
    --travel: 7px;
  }
`;
