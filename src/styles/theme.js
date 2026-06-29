// 디자인 시안 기준값 + 반응형 토큰.
// 디자이너는 2412 × 1665 px (비율 ≈ 1.449:1) 기준으로 작업했다.
// 반응형 방식 A(스테이지 스케일): 이 가상 캔버스를 통째로 scale 해 비율을 절대 보존한다.

export const STAGE = {
  W: 2412,
  H: 1665,
};

// 랜딩 핵심 요소 비율 (2412 × 1665 기준)
//  - 모니터 : 1211 × 1381 px  → 가로 50.2%, 세로 82.9%, 화면 정중앙
//  - "welcome to software" : 글자 크기 800 px → 가로 대비 33.2%
export const LANDING = {
  MONITOR_W: 1311,
  MONITOR_H: 1481,
  TITLE_FONT: 800,
};

// 반응형 브레이크포인트 (px). 데스크탑/태블릿/모바일 3단계.
export const BP = {
  mobile: 600, // ~600px 이하 = 모바일
  tablet: 1024, // ~1024px 이하 = 태블릿
};

export const media = {
  mobile: `@media (max-width: ${BP.mobile}px)`,
  tablet: `@media (max-width: ${BP.tablet}px)`,
  desktop: `@media (min-width: ${BP.tablet + 1}px)`,
  reduced: "@media (prefers-reduced-motion: reduce)",
};

export const COLORS = {
  black: "#000",
  crtText: "#52ff7a",
  white: "#fff",
};
