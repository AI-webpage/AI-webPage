import styled, { keyframes } from "styled-components";
import { COLORS } from "../../styles/theme";

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
