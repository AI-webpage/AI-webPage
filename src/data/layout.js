// 씬·카메라·터미널이 공유하는 월드 좌표 상수.
// OrthographicCamera 기준, 1 world unit = camera.zoom CSS px.

export const VIEW_HEIGHT = 8; // 화면 세로에 보이는 월드 단위 수
export const VIEW_WIDTH = 13; // 화면 가로로 최소 보장할 월드 단위 수 (모바일 보정)

// ── 색상 팔레트 ────────────────────────────────────────────
export const COLORS = {
  bgTop: "#AEE0BB", // 배경 그라데이션 위(민트)
  bgBottom: "#9a80ff", // 배경 그라데이션 아래(라벤더)
  title: "#FFFFFF", // 큰 배경 글자
  crtBg: "#06140c", // CRT 화면 바탕
  crtText: "#52ff7a", // 인광 그린 글자
};

// ── 배경 그라데이션 비율 ───────────────────────────────────
// 색 전환을 월드 Y 기준으로 고정. (화면 세로는 대략 -4 ~ +4 이 보인다)
//   GRAD_Y_TOP    이상 = 100% 민트(bgTop)
//   GRAD_Y_BOTTOM 이하 = 100% 라벤더(bgBottom)
//   GRAD_BIAS     0~1. 0.5=선형, 클수록 민트가 넓고, 작을수록 라벤더가 넓다.
export const GRAD_Y_TOP = 4;
export const GRAD_Y_BOTTOM = -5;
export const GRAD_BIAS = 0.5;

// ── 배경 글자 ──────────────────────────────────────────────
export const TITLE_Y = 2.8;
export const TITLE_Z = -5;

// ── 중앙 모니터 1대 (모니터_빈화면.png) ────────────────────
export const MONITOR_ASPECT = 3633 / 4143; // ≈ 0.877 (w/h)
export const MONITOR_POS = [0, -0.5, 0];
export const MONITOR_HEIGHT = 6.5;
export const MONITOR_WIDTH = MONITOR_HEIGHT * MONITOR_ASPECT;

// ── ★터미널(CRT) 영역 — 모니터 스프라이트 대비 비율 (미세조정 가능)★ ──
// 0,0 = 스프라이트 좌상단, 1,1 = 우하단
// 모니터_빈화면 의 실제 어두운 CRT 유리 영역을 픽셀 분석해 맞춘 값
// (유리 안쪽: left 0.207, right 0.813, top 0.091, bottom 0.466)에 살짝 여백.
export const TERM_FRAC = {
  left: 0.225,
  right: 0.795,
  top: 0.12,
  bottom: 0.45,
};

// 위 비율 → 모니터 중심 기준 월드 오프셋/크기 (파생값)
const fracCx = (TERM_FRAC.left + TERM_FRAC.right) / 2; // 0.495
const fracCy = (TERM_FRAC.top + TERM_FRAC.bottom) / 2; // 0.28
export const TERM_W = (TERM_FRAC.right - TERM_FRAC.left) * MONITOR_WIDTH;
export const TERM_H = (TERM_FRAC.bottom - TERM_FRAC.top) * MONITOR_HEIGHT;
export const TERM_CENTER = [
  MONITOR_POS[0] + (fracCx - 0.5) * MONITOR_WIDTH,
  MONITOR_POS[1] + (0.5 - fracCy) * MONITOR_HEIGHT,
  MONITOR_POS[2] + 0.05,
];

// 포털(입장)이 빨아들이는 지점 = 터미널 화면 중심
export const SCREEN_CENTER = [TERM_CENTER[0], TERM_CENTER[1], TERM_CENTER[2]];

// ── skon.glb (모니터 옆, 터미널보다 위 레이어) ──────────────
// SKON_POS = [x(좌우), y(위아래), z(앞뒤)], SKON_HEIGHT = 캐릭터 키
export const SKON_POS = [2, -1.7, 5];
export const SKON_HEIGHT = 2;

// ── 풀밭 (지면) ────────────────────────────────────────────
export const GRASS_POS = [0, -1.9, 1];
export const GRASS_HEIGHT = 7.6; // aspect 1.93 → 폭 ≈ 14.7 (와이드 커버)

// 반응형 풀밭: 화면 하단을 가로 꽉 채우고, 윗변이 이 월드 Y 까지 올라온다.
// 값을 키울수록 풀밭이 화면 위쪽까지 차오른다. (모니터 아래를 덮는 정도)
export const GRASS_TOP_Y = 3;

// ── 캐릭터 배치 (정규화 nx:0~1 좌→우, ny:0~1 위→아래 → 월드) ──
// world = ((nx-0.5)*VIEW_WIDTH, (0.5-ny)*VIEW_HEIGHT)
export function normToWorld(nx, ny) {
  return [(nx - 0.5) * VIEW_WIDTH, (0.5 - ny) * VIEW_HEIGHT];
}

export const CHAR_LAYOUT = {
  arti: { n: [0.12, 0.45], z: 3, height: 2.6 }, // 좌상 — GLB
  conver: { n: [0.22, 0.78], z: 4, height: 1.8 }, // 좌하
  skon: { n: [0.66, 0.6], z: 6, height: 2.3 }, // 모니터 우측 (주인공)
  bart: { n: [0.82, 0.52], z: 4, height: 1.6 }, // 우상
  dmo: { n: [0.86, 0.8], z: 5, height: 1.8 }, // 우하
};

// ── 월드 캐릭터 (Scene B) ──────────────────────────────────
export const CHAR_BASE = [0, -1.5, 3];
export const CHAR_BOUNDS = [-5, 5];
export const CHAR_HEIGHT = 2.3;

// ── 카메라 ─────────────────────────────────────────────────
export const CAM_TRANSITION_ZOOM_FACTOR = 5.2; // 포털 줌인 배율
