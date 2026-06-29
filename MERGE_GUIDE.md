# 병합 가이드 — 서경대 소프트웨어학과 히어로 페이지

> 이 프로젝트를 다른 Next.js 프로젝트에 통합할 때 사용하는 체크리스트 + 참조 문서

---

## 1. 이 프로젝트에서 가져갈 파일 목록

```
📁 가져갈 파일 (필수)
├── components/
│   ├── SeokyeongHero.jsx          ← 메인 컴포넌트 (925줄, 전체 기능 포함)
│   └── three/
│       ├── CyberTunnel.jsx        ← 사이버 터널 3D 효과
│       └── ServerRack.jsx         ← 3D 서버랙 모델
├── styles/
│   └── globals.css                ← 디자인 시스템 전역 CSS
└── pages/
    └── index.jsx                  ← 진입점 (SSR 비활성화 dynamic import)

📁 대상 프로젝트에 추가 설치 필요
└── package.json 의존성 참조 (섹션 2)
```

---

## 2. 필수 npm 패키지

대상 프로젝트에 아래 패키지가 없으면 설치:

```bash
npm install three @react-three/fiber @react-three/drei
```

**정확한 버전 (검증된 조합):**

```json
"@react-three/fiber": "^8.15.19",
"@react-three/drei": "^9.99.0",
"three": "^0.161.0"
```

**next.config.js 에 트랜스파일 설정 추가 (없으면 빌드 오류):**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};
module.exports = nextConfig;
```

---

## 3. 병합 절차 (단계별)

### STEP 1 — 파일 복사

대상 프로젝트 루트에 아래 파일들을 복사:

| 원본 경로 | 대상 경로 | 비고 |
|-----------|-----------|------|
| `components/SeokyeongHero.jsx` | `components/SeokyeongHero.jsx` | 그대로 |
| `components/three/CyberTunnel.jsx` | `components/three/CyberTunnel.jsx` | `three/` 폴더 생성 필요할 수 있음 |
| `components/three/ServerRack.jsx` | `components/three/ServerRack.jsx` | 동일 |
| `styles/globals.css` | **병합 주의** | 섹션 4 참고 |

### STEP 2 — globals.css 병합

대상 프로젝트에 이미 `globals.css`가 있다면 **덮어쓰지 말고** 아래 블록들을 **추가**:

```css
/* === 서경대 히어로 — 추가 필요 블록 === */

:root {
  --color-bg: #0a0b10;
  --color-indigo: #4f46e5;
  --color-purple: #7c3aed;
  --color-cyan: #06b6d4;
  --color-white: #f0f4ff;
  --color-muted: rgba(160, 170, 220, 0.7);
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 20px;
  --glass-radius: 20px;
}

/* 필수 클래스: glass-card, dept-label, main-title, sub-title,
   desc-text, section-title, card-divider, tech-badge,
   scroll-hint, stats-grid, stat-item, stat-number, stat-label,
   noise-overlay */
```

> 전체 CSS는 이 프로젝트의 `styles/globals.css` 참조 (238줄)

### STEP 3 — 라우트 연결

대상 프로젝트의 원하는 페이지에서 SeokyeongHero를 import:

```jsx
// pages/hero.jsx (또는 원하는 경로)
import dynamic from 'next/dynamic';
import Head from 'next/head';

const SeokyeongHero = dynamic(
  () => import('../components/SeokyeongHero'),
  { ssr: false }   // ← 반드시 ssr: false (Three.js는 브라우저 전용)
);

export default function HeroPage() {
  return (
    <>
      <Head>
        <title>소프트웨어학과 | 서경대학교</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SeokyeongHero />
    </>
  );
}
```

### STEP 4 — globals.css 임포트 확인

`pages/_app.jsx` (또는 `app/layout.tsx`)에 globals.css가 임포트되어 있는지 확인:

```jsx
// pages/_app.jsx
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

---

## 4. 충돌 가능성 및 주의사항

### CSS 변수 충돌
대상 프로젝트가 `:root`에 이미 같은 이름의 CSS 변수를 정의하고 있으면 충돌 발생.  
`--color-indigo`, `--color-bg` 등 겹치는 변수는 이름을 변경하고 SeokyeongHero.jsx 내부 인라인 스타일도 맞게 수정.

### next.config.js 병합
대상 프로젝트에 이미 next.config.js가 있으면 `transpilePackages` 배열만 병합:

```js
// 기존 설정에 추가
transpilePackages: [
  ...기존항목들,
  'three', '@react-three/fiber', '@react-three/drei'
]
```

### React 버전
최소 React 18 필요. 대상 프로젝트가 React 17 이하면 Concurrent Mode 관련 오류 발생.

### SSR 환경
`SeokyeongHero`는 `dynamic({ ssr: false })`로만 import해야 함.  
직접 import하거나 SSR 환경에서 렌더링 시 `window is not defined` 오류 발생.

---

## 5. 아키텍처 핵심 패턴 (코드 수정 시 참고)

### 스크롤 오프셋 타임라인

```
offset 0.00  → 시작, 서버랙 정면
offset 0.05  → 서버랙 이동 시작
offset 0.18  → 사이버터널 페이드인 시작
offset 0.30  → 터널 완전 등장
offset 0.50  → 터널 종료 (TUNNEL_START 0.18 + TUNNEL_RANGE 0.32)
offset 0.54  → 커리큘럼 카드 완전 표시 (페이드인 0.50→0.54)
offset 0.60  → "생성하기" 버튼 클릭 시 스크롤 타깃 (= 1.2 × innerHeight)
offset 1.00  → 스크롤 끝
```

### Canvas ↔ HTML 브릿지 패턴

drei의 `<Scroll html>` 내부 HTML은 일반 DOM이지만 drei 스크롤에 묶여 있어  
`window.scrollY`, IntersectionObserver 등 브라우저 스크롤 API가 작동하지 않음.  
대신 아래 두 브릿지 컴포넌트를 사용:

```
ScrollBridge          → scroll.offset 읽어 커리큘럼 카드 DOM의 opacity/pointerEvents 직접 제어
ScrollContainerBridge → scroll.el(drei 내부 스크롤 div) 을 React ref로 노출 → 프로그래밍 스크롤
```

### ScrollControls 설정

```jsx
<ScrollControls pages={3} damping={0.04} distance={1}>
  <Scroll>
    {/* 3D 오브젝트 — 스크롤에 함께 올라감 */}
  </Scroll>
  <CyberTunnel />               {/* Scroll 밖 — 뷰포트 정중앙 고정 */}
  <ScrollBridge ... />           {/* null 렌더러 — DOM 제어 */}
  <ScrollContainerBridge ... />  {/* null 렌더러 — ref 수집 */}
  <Scroll html style={{ width: '100%' }}>
    {/* HTML UI */}
  </Scroll>
</ScrollControls>
```

**주의**: `CyberTunnel`은 반드시 `<Scroll>` 밖에 위치해야 함.  
`<Scroll>` 안에 넣으면 drei가 +Y 방향으로 오프셋을 적용해 화면 위로 잘림.

### 스크롤 위치 계산 공식

```
drei pages=3 기준:
  총 스크롤 가능 거리 = (pages - 1) × innerHeight = 2 × innerHeight
  offset = scrollTop / (2 × innerHeight)
  
  섹션 1 : scrollTop 0           → offset 0.00
  섹션 2 : scrollTop innerHeight → offset 0.50
  섹션 3 : scrollTop 2×innerHeight → offset 1.00
  
  커리큘럼 카드 가시 영역: offset 0.54 이상
  → scrollElRef.current.scrollTo({ top: innerHeight * 1.2 })
    = offset 0.60 에 안착
```

---

## 6. SeokyeongHero.jsx 컴포넌트 구조 요약

```
SeokyeongHero (default export)
 ├── state: selectedTrack (null | 트랙 키)
 ├── ref: mouseRef, curriculumRef, scrollElRef
 ├── handleGenerate(track) → setSelectedTrack + scrollTo
 │
 ├── Canvas
 │    └── ScrollControls (pages=3)
 │         ├── Scroll → Scene, FloorReflection, ServerRack
 │         ├── CyberTunnel
 │         ├── ScrollBridge(curriculumRef)
 │         ├── ScrollContainerBridge(scrollElRef)
 │         └── Scroll html → HeroUI
 │
 └── HeroUI(curriculumRef, selectedTrack, onGenerate)
      ├── 섹션 1: 메인 슬로건 glass-card
      ├── 섹션 2: CurriculumSection(domRef, selectedTrack)
      │    ├── 학년 탭 (1~4학년) + 스캔라인 글리치 전환
      │    ├── 전공역량 범례 (computing/logic/software/communication)
      │    └── 과목 칩 (type별 색상 + core=전핵 + 트랙 하이라이트/딤)
      └── 섹션 3: CustomCurriculumSection(selectedTrack, onGenerate)
           ├── 트랙 카드 5개 (웹개발/프론트엔드/백엔드/빅데이터AI/게임개발)
           └── 맞춤 커리큘럼 생성하기 버튼
```

---

## 7. 주요 상수 위치 (수정이 필요할 경우)

| 상수 | 파일 | 용도 |
|------|------|------|
| `CURRICULUM` | `SeokyeongHero.jsx:123` | 학년/학기별 과목 데이터 + tags |
| `CAT_META` | `SeokyeongHero.jsx:192` | 전공역량 색상·아이콘 |
| `TYPE_META` | `SeokyeongHero.jsx:200` | 수업유형(강의/실습) 색상 |
| `TRACKS` | `SeokyeongHero.jsx:209` | 진로 트랙 정의 + 매칭 tags |
| `TUNNEL_START_SCROLL` | `CyberTunnel.jsx:19` | 터널 시작 오프셋 (0.18) |
| `TUNNEL_SCROLL_RANGE` | `CyberTunnel.jsx:20` | 터널 지속 구간 (0.32) |
| `TUNNEL_END` | `SeokyeongHero.jsx:105` | 브릿지 기준점 (0.50) — 터널 상수와 연동 |

---

## 8. 검증 체크리스트

병합 후 아래 항목을 브라우저에서 직접 확인:

- [ ] 페이지 로드 시 서버랙 3D 모델 정상 표시
- [ ] 스크롤 시 서버랙이 멀어지며 사라지는 애니메이션
- [ ] 스크롤 계속 시 사이버터널 등장 (offset 0.18~0.50)
- [ ] 터널 끝나고 커리큘럼 카드 페이드인 (offset 0.50~0.54)
- [ ] 커리큘럼 탭 전환 시 스캔라인 글리치 효과
- [ ] 학년 탭 전환해도 카드 크기 고정 (300px 스크롤 영역)
- [ ] 섹션 3 스크롤 시 "나만의 커리큘럼 짜기" 카드 표시
- [ ] 트랙 카드 클릭 → 버튼 활성화
- [ ] "맞춤 커리큘럼 생성하기" 클릭 → 커리큘럼 섹션으로 스크롤 (너무 상단/하단이면 `innerHeight * 1.2` 값 조정)
- [ ] 커리큘럼에서 하이라이트(골드) / 딤(흐리게) 과목 구분 표시
- [ ] 학년 탭 전환 후에도 하이라이트 유지

---

## 9. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `window is not defined` | SSR에서 SeokyeongHero 렌더링 | `dynamic({ ssr: false })`로 import |
| 터널이 화면 상단에 잘림 | CyberTunnel을 `<Scroll>` 안에 넣음 | `<Scroll>` 밖으로 이동 |
| 커리큘럼 카드가 안 보임 | ScrollBridge가 없거나 ref 연결 안 됨 | `curriculumRef`가 카드 div의 `ref`에 연결됐는지 확인 |
| 생성 버튼 클릭 후 잘못된 위치로 스크롤 | `innerHeight * 1.2` 값이 다른 pages 수와 안 맞음 | `pages` 값 변경 시 공식으로 재계산 |
| three.js 관련 빌드 오류 | next.config.js `transpilePackages` 누락 | 섹션 2의 config 추가 |
| 커리큘럼 카드가 hover/click 안 됨 | 부모 `pointerEvents: 'none'` 상속 | 카드 div에 `pointerEvents: 'auto'` 확인 |

---

*작성일: 2026-06-28*  
*원본 프로젝트: `C:\AIWebDevelop`*  
*연관 문서: `DEVLOG.md`, `CUSTOM_CURRICULUM.md`*
