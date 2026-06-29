import styled, { keyframes, css } from "styled-components";
import { motion } from "framer-motion";
import { STAGE, LANDING, COLORS, media } from "../../styles/theme";
import { TERM_BOX } from "./config";

/* ── 루트 ──
   랜딩 전용 배경색 없음(allowlist 규칙): 비디오가 화면 전체를 덮으므로 불필요.
   레터박스 여백은 전역 body 검정으로 가려진다. */
export const LandingRoot = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: pointer;
`;

/* 배경 비디오 — 스테이지 밖 전체 화면 cover (레터박스까지 채움)
   object-position 의 세로값(80%)을 키울수록 영상이 위로 올라가 밑부분이 더 보인다.
   (0%=위 정렬, 50%=중앙, 100%=아래 정렬) */
export const LandingVideo = styled.video`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 80%;
  z-index: 0;
`;

/* 다이브 줌 레이어 — DesignStage(2412×1665) 안을 가득 채운다.
   transform-origin 을 CRT 중심에 두어 모니터 속으로 빨려드는 효과. */
export const DiveLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
  transform-origin: ${({ $origin }) => $origin};
  will-change: transform, filter;
`;

/* 모니터 뒤 거대한 흰 글자 (우→좌 무한 흐름) */
const marquee = keyframes`
  from { transform: translateX(${STAGE.W * 0.85}px); }
  to   { transform: translateX(-100%); }
`;

export const Title = styled.div`
  position: absolute;
  top: -5%;
  left: 0;
  white-space: nowrap;
  font-family: "Pathway Gothic One", "Poppins", system-ui, sans-serif;
  font-weight: 400;
  font-size: ${LANDING.TITLE_FONT}px; /* 시안 800px = 가로 33.2% */
  line-height: 1;
  letter-spacing: 0.04em;
  color: ${COLORS.white};
  opacity: 0.85;
  pointer-events: none;
  user-select: none;
  will-change: transform;
  z-index: 1;
  animation: ${marquee} 14s linear infinite;

  ${media.reduced} {
    animation: none;
    left: 50%;
    transform: translateX(-50%);
  }
`;

/* 모니터 래퍼 — 스테이지 정중앙, 시안 1211×1381px (50.2% × 82.9%) */
export const MonitorWrap = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${LANDING.MONITOR_W}px;
  height: ${LANDING.MONITOR_H}px;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

export const MonitorImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.35));
  pointer-events: none;
  user-select: none;
`;

/* 다이브 시 화면을 덮는 검정 + 비네트 (스테이지 밖 전체 화면) */
export const DiveBlack = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 10;
  /* 다이브 시 흰색으로 밝아지며 수렴 (메인은 흰색에서 떠오름) */
  background: radial-gradient(
    circle at 50% 40%,
    rgba(255, 255, 255, 0.75) 0%,
    #ffffff 70%
  );
  pointer-events: none;
`;

/* ── CRT 라이브 터미널 (모니터 유리 위) ── */
export const Crt = styled.div`
  position: absolute;
  left: ${TERM_BOX.left};
  top: ${TERM_BOX.top};
  width: ${TERM_BOX.width};
  height: ${TERM_BOX.height};
  z-index: 3;
  pointer-events: auto;
  overflow: hidden;
  border-radius: 6px;
  font-family:
    "SFMono-Regular", "Menlo", "Consolas", "D2Coding", "Courier New", monospace;
  font-size: ${({ $fontPx }) => $fontPx}px;
  color: ${COLORS.crtText};
  text-shadow:
    0 0 4px rgba(82, 255, 122, 0.65),
    0 0 10px rgba(82, 255, 122, 0.3);
  line-height: 1.4;
  letter-spacing: 0.02em;
  cursor: text;
  user-select: none;
`;

export const CrtScreen = styled.div`
  position: absolute;
  inset: 0;
  padding: 6% 7%;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const CrtLine = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1em;
  ${({ $blink }) =>
    $blink &&
    css`
      margin-top: 0.2em;
    `}
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
`;

export const Cursor = styled.span`
  display: inline-block;
  width: 0.6em;
  height: 1.05em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: ${COLORS.crtText};
  box-shadow: 0 0 6px rgba(82, 255, 122, 0.8);
  animation: ${blink} 1s steps(1) infinite;
`;

export const Scanlines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: multiply;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0) 2px,
      rgba(0, 0, 0, 0.18) 3px,
      rgba(0, 0, 0, 0.18) 4px
    ),
    radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0) 55%,
      rgba(0, 0, 0, 0.35) 100%
    );
`;

export const CrtInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 0;
  padding: 6% 7%;
  background: transparent;
  color: transparent;
  caret-color: transparent;
  font: inherit;
  outline: none;
  z-index: 3;
  -webkit-text-fill-color: transparent;
`;
