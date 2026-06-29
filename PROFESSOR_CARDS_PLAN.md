# 교수 소개 카드뉴스 개발 계획

> 이 파일은 개발 진행 상황을 추적하는 체크리스트입니다.
> 각 Step이 완료되면 `[ ]` → `[x]`로 변경합니다.

---

## 진행 체크리스트

- [x] Step 1: 폴더 구조 및 이미지 네이밍 규칙 정의
- [x] Step 2: 교수 데이터 파일 생성 (`src/data/professors.js`)
- [x] Step 3: `ProfessorCard.jsx` — 앞/뒷면 플립 카드 컴포넌트
- [x] Step 4: `ProfessorCarousel.jsx` — 3D 캐러셀 컴포넌트
- [x] Step 5: `ProfessorSection.jsx` — 섹션 래퍼 컴포넌트
- [x] Step 6: `SeokyeongHero.jsx` 통합 (pages=4, 스크롤 상수 조정)
- [x] Step 7: `CyberTunnel.jsx` 터널 상수 조정
- [x] Step 8: `ServerRack.jsx` 랙 페이드 상수 조정
- [x] Step 9: 빌드 검증
- [ ] Step 10: 이미지 분석 및 실제 교수 데이터 입력 (이미지 수신 후 수행)

---

## Step 1: 폴더 구조 및 이미지 네이밍 규칙

### 생성할 폴더
```
public/
  professors/       ← 교수님이 제공하실 정보 이미지 저장 위치
    front/          ← 앞면 정보 이미지 (저를 위한 분석용)
      prof_01.png   ← 교수 1번 앞면 정보
      prof_02.png
      ...
      prof_09.png
    back/           ← 뒷면 정보 이미지 (저를 위한 분석용)
      prof_01.png
      prof_02.png
      ...
      prof_09.png

src/
  data/
    professors.js   ← 교수 데이터 (이미지에서 추출한 속성값)
  components/
    professors/
      ProfessorCard.jsx
      ProfessorCarousel.jsx
      ProfessorSection.jsx
```

### 이미지 제공 방법
- 앞면 이미지: `public/professors/front/prof_01.png` ~ `prof_09.png`
- 뒷면 이미지: `public/professors/back/prof_01.png` ~ `prof_09.png`
- 순서: 교수 번호(01~09)는 나중에 제공할 이미지 순서대로 매핑
- 이미지 수신 후 Step 10에서 `professors.js` 실제 데이터로 교체

---

## Step 2: 교수 데이터 구조 (`professors.js`)

각 교수 객체의 속성:

```javascript
{
  id: 1,                           // 고유 번호 (1~9)

  // ─── 앞면 표시 데이터 ───
  name: '홍길동',                   // 성명
  nameInitial: '홍',               // 아바타에 표시할 첫 글자
  avatarColor: '#4f46e5',          // 아바타 배경색
  category: '전공교수',             // 카드 상단 카테고리 레이블
  categoryColor: '#06b6d4',        // 카테고리 텍스트 색상
  position: '교수',                 // 직위 (교수/부교수/조교수/겸임/초빙)
  specialization: '인공지능',       // 전공 분야 (1~2줄)

  // ─── 뒷면 표시 데이터 ───
  email: 'hong@seokyeong.ac.kr',   // 이메일
  lab: '인공지능 연구실',            // 연구실명
  office: 'IT관 401호',             // 연구실 위치
  education: [                      // 학력 (최신순)
    '박사 - 서울대학교 컴퓨터공학 (2010)',
    '석사 - 연세대학교 전산학 (2006)',
  ],
  research: [                       // 연구 분야 키워드
    '딥러닝', '컴퓨터 비전', '자연어처리',
  ],
  mainCourses: [                    // 담당 주요 과목
    '인공지능', '머신러닝',
  ],
  bio: '인공지능 기반 스마트 시스템을 연구합니다.', // 한 줄 소개
}
```

---

## Step 3: ProfessorCard 컴포넌트 설계

### 앞면 레이아웃
```
┌─────────────────────────────┐
│ [CATEGORY]       [01 / 09]  │  ← 카테고리(좌), 번호(우)
│                             │
│    ┌────┐                   │
│    │  홍 │  ← 아바타 (60px) │
│    └────┘                   │
│                             │
│    홍길동                   │  ← 이름 (1.6rem)
│    인공지능                 │  ← 전공분야
│                             │
│  ⓪ 카드를 눌러 상세정보 보기 │  ← 하단 힌트
└─────────────────────────────┘
```

### 뒷면 레이아웃
```
┌─────────────────────────────┐
│  홍길동 교수                │  ← 이름 + 직위
│  ─────────────────          │
│                             │
│  학력                       │
│  • 박사 - 서울대 (2010)     │
│  • 석사 - 연세대 (2006)     │
│                             │
│  연구분야                   │
│  [딥러닝] [컴퓨터비전]      │  ← 배지 형태
│                             │
│  담당과목                   │
│  [인공지능] [머신러닝]      │
│                             │
│  📧 hong@seokyeong.ac.kr   │
│  🏢 IT관 401호              │
└─────────────────────────────┘
```

### 플립 애니메이션
- `transform-style: preserve-3d`
- 클릭 시: `rotateY(0deg)` → `rotateY(180deg)` (0.6s ease)
- 중앙 카드(isCenter=true)만 클릭 시 플립 작동
- 비중앙 카드 클릭 → 캐러셀 이동

---

## Step 4: ProfessorCarousel 컴포넌트 설계

### 표시 방식
- 한 번에 5개 카드 렌더 (rel: -2, -1, 0, +1, +2)
- 나머지는 DOM에서 `display: none` (렌더 최적화)

### 슬롯 설정값
| 슬롯 | translateX | scale | rotateY | opacity | blur |
|------|-----------|-------|---------|---------|------|
| -2   | -420px    | 0.62  | 22deg   | 0.30    | 5px  |
| -1   | -230px    | 0.82  | 14deg   | 0.75    | 1px  |
|  0   | 0px       | 1.00  | 0deg    | 1.00    | 0px  |
| +1   | +230px    | 0.82  | -14deg  | 0.75    | 1px  |
| +2   | +420px    | 0.62  | -22deg  | 0.30    | 5px  |

### 인터랙션
- 중앙 카드 클릭 → 플립
- 양옆 카드 클릭 → 해당 방향으로 carousel 이동 + 플립 초기화
- 좌/우 화살표 버튼 → 이동
- 하단 dot indicator 클릭 → 해당 카드로 직접 이동
- 무한 순환: `getWrapped = (idx) => ((idx % 9) + 9) % 9`

---

## Step 5: ProfessorSection 컴포넌트 설계

### 섹션 레이아웃 (height: 100vh)
```
┌─────────────────────────────────────────┐
│                                         │
│  FACULTY · 교수 소개                    │  ← dept-label (cyan)
│  교수 소개                              │  ← section-title
│                                         │
│  [← ]  [ 카드 -1 ]  [ 카드 0 ]  [ 카드 +1 ]  [ →]  │
│                                         │
│         ● ○ ○ ○ ○ ○ ○ ○ ○            │  ← dot indicators
│                                         │
└─────────────────────────────────────────┘
```

---

## Step 6: SeokyeongHero 통합 사항

### ScrollControls 변경
```jsx
// Before
<ScrollControls pages={3} damping={0.04} distance={1}>
// After
<ScrollControls pages={4} damping={0.04} distance={1}>
```

### pages=4에서 섹션별 중앙 offset
| 섹션 | 내용 | 중앙 offset |
|------|------|------------|
| S1 | Hero (0~100vh) | 0.00 |
| S2 | Curriculum (100~200vh) | 0.33 |
| S3 | Custom Curriculum (200~300vh) | 0.67 |
| S4 | Professor Cards (300~400vh) | 1.00 |

### ScrollBridge 상수 변경
```javascript
// Before
const TUNNEL_END = 0.50;
const FADE_DURATION = 0.04;
// After
const TUNNEL_END = 0.33;   // Section 2 중앙과 일치
const FADE_DURATION = 0.03;
```

### handleGenerate 스크롤 타겟 변경
```javascript
// Before
el.scrollTo({ top: maxScroll * 0.6, behavior: 'smooth' });
// After
el.scrollTo({ top: maxScroll * 0.38, behavior: 'smooth' });
// 이유: Section 2 중앙(0.33) + 여유분(0.05) = 0.38
```

### HeroUI에 ProfessorSection 추가
```jsx
function HeroUI({ ... }) {
  return (
    <div>
      <section>... Hero ...</section>
      <CurriculumSection ... />
      <CustomCurriculumSection ... />
      <ProfessorSection />   {/* 새로 추가 */}
    </div>
  );
}
```

---

## Step 7: CyberTunnel 상수 조정

pages=3 → pages=4 변경에 따라 터널 구간을 압축하여
Section 2 중앙(offset 0.33)에서 터널이 종료되도록 조정.

```javascript
// Before
const TUNNEL_START_SCROLL = 0.18;
const TUNNEL_SCROLL_RANGE = 0.32; // 종료: 0.50

// After
const TUNNEL_START_SCROLL = 0.10;
const TUNNEL_SCROLL_RANGE = 0.23; // 종료: 0.33
```

실제 스크롤 거리(절대값) 비교:
- Before: 0.32 × 2×innerHeight = 64vh
- After:  0.23 × 3×innerHeight = 69vh → 거의 동일, 사용자 체감 차이 없음

---

## Step 8: ServerRack 상수 조정

터널 시작(0.10) 전에 서버랙이 완전히 사라지도록 조정.

```javascript
// Before
const zStart = 0.05;
const zEnd   = 0.45;
const opacity = Math.max(0, 1 - Math.max(0, zProg - 0.3) / 0.15);
// 랙이 offset 0.17~0.23 구간에서 페이드아웃

// After
const zStart = 0.02;
const zEnd   = 0.12;
const opacity = Math.max(0, 1 - Math.max(0, zProg - 0.5) / 0.5);
// 랙이 offset 0.07~0.12 구간에서 페이드아웃 (터널 시작 전 완료)
```

---

## Step 9: 빌드 검증

```bash
cd D:\StudySection\AIWebDevelop\AIWebDevelop
npm run build
```

빌드 성공 시 Step 9 완료 체크.

---

## Step 10: 이미지 분석 및 실제 데이터 입력 (사용자 이미지 수신 후)

1. `public/professors/front/prof_01.png` ~ `prof_09.png` 분석
2. `public/professors/back/prof_01.png` ~ `prof_09.png` 분석
3. 각 이미지에서 추출한 정보로 `src/data/professors.js` 업데이트
4. 데이터 확인 후 빌드 재검증

추출할 항목:
- name, nameInitial, category, position, specialization
- email, lab, office, education[], research[], mainCourses[], bio

---

## 아바타 색상 배정

| 교수 번호 | 색상 | 코드 |
|----------|------|------|
| 01 | 인디고 | `#4f46e5` |
| 02 | 퍼플 | `#7c3aed` |
| 03 | 시안 | `#06b6d4` |
| 04 | 에메랄드 | `#10b981` |
| 05 | 앰버 | `#f59e0b` |
| 06 | 로즈 | `#f43f5e` |
| 07 | 바이올렛 | `#8b5cf6` |
| 08 | 스카이 | `#0ea5e9` |
| 09 | 퓨샤 | `#d946ef` |
