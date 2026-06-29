# 서경대학교 소프트웨어학과 히어로 페이지 개발 로그

## 프로젝트 개요
- **스택**: Next.js + React Three Fiber (R3F) + Drei
- **목표**: 3D 인터랙티브 히어로 페이지 (사이버 터널 효과 + 스크롤 애니메이션)
- **진입점**: `pages/index.jsx` → `components/SeokyeongHero.jsx`

---

## 파일 구조

```
C:\AIWebDevelop\
├── pages/
│   └── index.jsx                    # 메인 페이지 (SSR 비활성화, dynamic import)
├── components/
│   ├── SeokyeongHero.jsx            # 최상위 히어로 컴포넌트
│   └── three/
│       ├── ServerRack.jsx           # 3D 서버랙 모델 (스크롤 시 사라짐)
│       └── CyberTunnel.jsx          # 사이버 터널 효과 (스크롤 시 등장)
└── styles/                          # 글래스모피즘 CSS
```

---

## SeokyeongHero.jsx 구조

### Canvas 설정
```jsx
camera={{ position: [0, 0, 6.2], fov: 52, near: 0.1, far: 500 }}
```

### ScrollControls 구성
```jsx
<ScrollControls pages={3} damping={0.04} distance={1}>
  <Scroll>
    <Scene />          {/* 조명 + 환경 + Stars */}
    <FloorReflection /> {/* 반사 바닥 position=[0,-1.65,-1] */}
    <ServerRack />     {/* 서버랙 - Scroll 안에서 같이 올라감 */}
  </Scroll>
  <CyberTunnel />     {/* Scroll 밖 - 뷰포트 정중앙 고정 */}
  <Scroll html style={{ width: '100%' }}>
    <HeroUI />         {/* HTML UI 오버레이 */}
  </Scroll>
</ScrollControls>
```

### HeroUI 섹션 (현재 상태)
| 섹션 | 높이 | 내용 | 상태 |
|------|------|------|------|
| Section 1 | 100vh | 메인 슬로건 카드 (좌측 하단) | **유지** |
| Section 2 | 100vh | AI & 클라우드 컴퓨팅 stats 카드 (우측) | **삭제 예정** |
| Section 3 | 100vh | 미래 비전 카드 (좌측) | **유지** |

---

## CyberTunnel.jsx 핵심 파라미터

```js
const FRAME_COUNT = 32;
const FRAME_SPACING = 6;
const TOTAL_DEPTH = 192;          // 32 * 6
const TUNNEL_START_SCROLL = 0.18; // 페이드인 시작
const TUNNEL_SCROLL_RANGE = 0.82; // 스크롤 끝까지 동작
```

### 뷰포트 정중앙 고정 로직 (핵심)
```js
// 카메라 시선 벡터 → Z=0 평면 교차점 계산
state.camera.getWorldDirection(_dir);
if (Math.abs(_dir.z) > 0.0001) {
  const t = -state.camera.position.z / _dir.z;
  groupRef.current.position.x = state.camera.position.x + _dir.x * t;
  groupRef.current.position.y = state.camera.position.y + _dir.y * t;
}
groupRef.current.position.z = 0;
```

### 스크롤 애니메이션
- 페이드인: `offset 0.18 → 0.30`
- 터널 이동: `easeOut` 곡선으로 `TOTAL_DEPTH * 2.5` 거리 이동
- 프레임 무한 루프: `z > 3` 이면 `z -= TOTAL_DEPTH`

---

## ServerRack.jsx 핵심 로직

```js
const zStart = 0.05, zEnd = 0.45;
const zProg = clamp((offset - zStart) / (zEnd - zStart), 0, 1);

groupRef.current.position.z = -2 + zProg * 18;    // 뒤로 물러남
groupRef.current.position.y = -0.3 + zProg * 0.3; // 바닥 상대 고정
groupRef.current.scale.setScalar(1 + zProg * 0.9); // 확대

// 페이드 아웃: zProg 0.3~0.45 구간
const opacity = clamp(1 - (zProg - 0.3) / 0.15, 0, 1);
```

---

## 해결된 주요 버그

### 1. CyberTunnel 화면 상단에 잘림
- **원인**: `<Scroll>` 내부에 배치 → drei가 그룹을 +Y로 이동시켜 화면 위로 올라감
- **해결**: `<CyberTunnel />`을 `<Scroll>` 밖으로 이동 + 카메라 레이-Z=0 교차점으로 정중앙 고정

### 2. ServerRack이 바닥을 뚫음
- **원인**: `FloorReflection`은 `<Scroll>` 안, `ServerRack`은 밖 → 스크롤 시 바닥만 올라가서 랙 위로 침범
- **해결**: 둘 다 `<Scroll>` 안에 배치 → 같은 좌표계에서 함께 이동

### 3. 터널이 서버랙 위치를 따라감
- **원인**: 카메라 위치 `[0, 1.2, 6.2]`로 11° 하향 틸트 → 정중앙 보정 필요
- **해결**: 카메라 `[0, 0, 6.2]`으로 수정 + 레이 교차점 계산으로 완전 고정

---

## 현재 남은 작업 (TODO)

### 1. Section 2 삭제 (Core Curriculum 카드)
`SeokyeongHero.jsx` Line 153~202 삭제

### 2. CyberTunnel 중간에 끝내기
`CyberTunnel.jsx`에서 `TUNNEL_SCROLL_RANGE`를 `0.82 → ~0.50`으로 줄임
(터널이 스크롤 중간쯤에서 끝나도록)

### 3. 커리큘럼 섹션 추가
Section 2 자리에 새 섹션 삽입:
```
┌─────────────────────────────────────┐
│  [1학년] [2학년] [3학년] [4학년]    ← 탭 버튼 4개
├─────────────────────────────────────┤
│                                     │
│     (학과 커리큘럼 콘텐츠 영역)      │
│     - 향후 프롬프트로 채울 예정      │
│                                     │
└─────────────────────────────────────┘
```
- 글래스모피즘 디자인 유지
- `useState`로 활성 탭 관리
- `pointerEvents: 'auto'` 필요 (부모가 none)

### 4. ScrollControls pages 조정 검토
커리큘럼 섹션이 추가되면 `pages={3}` 유지 또는 `pages={4}`로 늘릴지 결정

---

## 스크롤 타임라인 (현재)

| offset | 이벤트 |
|--------|--------|
| 0.00 | 시작 - 서버랙 정면 |
| 0.05 | 서버랙 이동 시작 |
| 0.17 | 서버랙 페이드 시작 |
| 0.18 | CyberTunnel 페이드인 시작 |
| 0.23 | 서버랙 완전 사라짐 |
| 0.30 | CyberTunnel 완전 등장 |
| 0.45 | 서버랙 이동 완료 |
| 1.00 | 스크롤 끝 |

---

## 디자인 토큰

| 항목 | 값 |
|------|-----|
| 배경색 | `#0a0b10` |
| 인디고 | `#4f46e5` |
| 퍼플 | `#7c3aed` |
| 시안 | `#06b6d4` |
| 글래스 카드 | `backdrop-filter: blur(12px)`, `border: 1px solid rgba(99,102,241,0.2)` |
| 폰트 (메인) | 한글 + 영문 혼합 |
