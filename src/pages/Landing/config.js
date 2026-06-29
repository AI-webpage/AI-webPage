// 랜딩 전용 상수.
// 구 data/layout.js 에서 "실제로 쓰이던" 값만 추렸다. (맵/캐릭터배치 등 죽은 상수 전부 제거)

// ── skon 캐릭터를 모니터에 앵커링하는 비율 ──
// 모니터 좌상단 (0,0) ~ 우하단 (1,1) 기준.
//  - x, y   : 캐릭터 발(앵커점)이 놓일 모니터 내 상대 위치
//  - height : 캐릭터 키 = 모니터 높이 대비 비율
// ForegroundCharacter 가 매 프레임 모니터의 실제 화면 좌표를 읽어 이 비율대로 배치한다.
export const SKON_ANCHOR = { x: 0.842, y: 0.67, height: 0.301 };

// ── 터미널(CRT) 영역 — 모니터_빈화면 대비 비율 ──
// 0,0 = 모니터 좌상단, 1,1 = 우하단. 모니터 유리(CRT) 영역에 맞춤.
export const TERM_FRAC = { left: 0.225, right: 0.795, top: 0.12, bottom: 0.45 };

// 터미널 박스를 모니터 기준 % 로 환산 (스테이지 px 공간에서 그대로 스케일됨)
export const TERM_BOX = {
  left: `${TERM_FRAC.left * 100}%`,
  top: `${TERM_FRAC.top * 100}%`,
  width: `${(TERM_FRAC.right - TERM_FRAC.left) * 100}%`,
  height: `${(TERM_FRAC.bottom - TERM_FRAC.top) * 100}%`,
};

// 다이브 줌이 빨려드는 지점 = CRT 화면 중심 (스테이지 비율)
// 모니터 1311×1481, 중앙 배치 기준 재계산: x=50.5%, y=30.9%
export const DIVE_ORIGIN = "50.5% 30.9%";
