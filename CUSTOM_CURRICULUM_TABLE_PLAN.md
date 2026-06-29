# 나만의 커리큘럼 표 생성 기능 계획

## 개요

"맞춤 커리큘럼 생성하기" 버튼 클릭 시,  
기존 "섹션 2(학과 커리큘럼)로 스크롤" 방식 대신  
**버튼 하단에 1~4학년 × 1,2학기 커리큘럼 표를 인라인으로 펼치는** 방식으로 변경한다.

---

## 변경 전 / 후 흐름 비교

| | 변경 전 | 변경 후 |
|---|---|---|
| 트랙 선택 후 버튼 클릭 | 섹션 2로 스크롤 + 과목 하이라이트 | 버튼 아래에 표 생성 (스크롤 없음) |
| 표시 위치 | 섹션 2 (학과 커리큘럼 탭) | 섹션 3 (나만의 커리큘럼 섹션) 내부 |
| 과목 구분 방식 | 전체 커리큘럼에서 하이라이트 | 공통 / 트랙 전용 칩으로 분류 표시 |
| 섹션 2 하이라이트 | 유지 (scrollTo 제거 후에도 selectedTrack prop 유지) | 유지 (전체 커리큘럼 탭 보조 참고용) |

---

## 커리큘럼 표 레이아웃 (목표 구조)

```
┌──────────────────────────────────────────────────────────────────────┐
│  📋  웹개발  맞춤 커리큘럼                                           │
│  [● 공통 과목]  [■ 웹개발 전용]  [★ 공통+전용]                      │
├────────┬─────────────────────────────┬────────────────────────────────┤
│        │          1학기              │          2학기                  │
├────────┼─────────────────────────────┼────────────────────────────────┤
│ 1학년  │ [소프트웨어적 사고] [프기]  │ [프로그래밍 응용] [오픈소스]   │
├────────┼─────────────────────────────┼────────────────────────────────┤
│ 2학년  │ [자료구조] [웹 클라이언트]  │ [알고리즘] [웹 서버] [DB]      │
├────────┼─────────────────────────────┼────────────────────────────────┤
│ 3학년  │ [웹 정보 프레임워크] [DB설] │ [스프링] [데이터 크롤링]       │
├────────┼─────────────────────────────┼────────────────────────────────┤
│ 4학년  │ [소프트웨어 공학] [캡스톤1] │ [소프트웨어와 경영] [캡스톤2]  │
└────────┴─────────────────────────────┴────────────────────────────────┘
```

---

## 구현 체크리스트

### ✅ Step 1 — `SeokyeongHero.jsx` > `handleGenerate` 수정

- [ ] `scrollTo` 로직 전부 제거 (섹션 2로 스크롤하지 않음)
- [ ] `scrollElRef` 참조 및 관련 코드 불필요하면 정리
- [ ] `setSelectedTrack(track)` 호출만 남김

```js
// 변경 후
const handleGenerate = (track) => {
  setSelectedTrack(track);
  // scrollTo 제거 — 표는 섹션 3 내부에서 인라인으로 생성됨
};
```

---

### ✅ Step 2 — `CustomCurriculumSection` 컴포넌트 상태 추가

- [ ] `showTable` 상태 추가 `(boolean, 초기값 false)`
- [ ] `generatedTrack` 상태 추가 `(string | null, 초기값 null)`
- [ ] 버튼 `onClick` 수정:
  ```js
  onClick={() => {
    if (!pendingTrack) return;
    onGenerate(pendingTrack);       // selectedTrack 업데이트
    setGeneratedTrack(pendingTrack);
    setShowTable(true);
  }}
  ```
- [ ] 다른 트랙으로 재생성 시: `setGeneratedTrack(new)` → 표 교체 (fade 트랜지션)

---

### ✅ Step 3 — 섹션 높이 및 레이아웃 조정

표가 펼쳐지면 100vh를 초과한다.  
`ScrollControls pages=4` 환경에서 섹션 3이 100vh를 넘으면 섹션 4(교수 소개)와 겹친다.

**채택 방식 — 카드 내부 스크롤:**
- [ ] `CustomCurriculumSection` 섹션 높이: `height: '100vh'` 유지
- [ ] 섹션 내 카드 wrapper를 `overflow-y: auto` + `max-height: 88vh`로 제한
- [ ] 표 등장 시 카드가 세로로 커지며 내부 스크롤 발생
- [ ] 카드 padding 조정: 표가 없을 때 center, 있을 때 top-aligned

```js
// 섹션 style 변경
alignItems: showTable ? 'flex-start' : 'center',
paddingTop: showTable ? '5vh' : '0',
```

```js
// 카드 wrapper style 변경
maxHeight: '88vh',
overflowY: 'auto',
```

---

### ✅ Step 4 — `GeneratedCurriculumTable` 신규 컴포넌트 작성

**위치:** `SeokyeongHero.jsx` 내 (또는 동일 파일 상단에 분리)

**Props:**
```js
function GeneratedCurriculumTable({ track }) { ... }
// track: TRACKS key (e.g. '웹개발', '빅데이터AI')
```

**내부 로직:**

1. **과목 필터링 함수:**
   ```js
   function getFilteredCourses(year, semester, track) {
     const trackTags = TRACKS[track].tags; // ['공통', '웹개발', ...]
     return (CURRICULUM[year][semester] || []).filter(c =>
       c.tags.some(t => trackTags.includes(t))
     );
   }
   ```

2. **과목 유형 분류:**
   ```js
   function getCourseKind(course, track) {
     const isCommon      = course.tags.includes('공통');
     const isTrackOnly   = course.tags.some(t => t !== '공통' && TRACKS[track].tags.includes(t));
     if (isCommon && isTrackOnly) return 'both';    // 공통 + 트랙 전용
     if (isCommon)                return 'common';  // 공통만
     return 'track';                                // 트랙 전용만
   }
   ```

3. **과목 칩 색상 규칙:**

   | kind | 배경 | 테두리 | 텍스트 |
   |------|------|--------|--------|
   | `common` | `rgba(99,102,241,0.11)` | `rgba(99,102,241,0.32)` | `#a5b4fc` |
   | `track` | `rgba(trackColor, 0.16)` | `trackColor + 50%` | `trackColor` |
   | `both` | `rgba(trackColor, 0.12)` | `trackColor + 80%` (굵게) | `trackColor 밝게` |
   | + `core: true` | 동일 | 동일 | 오른쪽 `[전핵]` 뱃지 추가 |

4. **범례 (표 상단):**
   - `● 공통 과목` — 인디고 색
   - `■ {트랙명} 전용` — 트랙 고유 색
   - `★ 공통+전용` — 트랙 색 굵은 테두리
   - `[전핵]` 뱃지 설명

**표 구조 (JSX 골격):**
```jsx
<div> {/* 표 헤더: 트랙명 + 범례 */}
  <div>📋 {TRACKS[track].label} 맞춤 커리큘럼</div>
  <div>{/* 범례 칩들 */}</div>
</div>

<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      <th>{/* 빈 셀 (학년 열 헤더) */}</th>
      <th>1학기</th>
      <th>2학기</th>
    </tr>
  </thead>
  <tbody>
    {['1학년','2학년','3학년','4학년'].map(year => (
      <tr key={year}>
        <td>{year}</td>
        {['1학기','2학기'].map(sem => (
          <td key={sem}>
            {getFilteredCourses(year, sem, track).map(course => (
              <CourseChip key={course.name} course={course} track={track} />
            ))}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

---

### ✅ Step 5 — 애니메이션

- [ ] **표 등장:** `opacity 0 → 1` + `translateY(16px) → 0`, duration 0.4s, ease-out
- [ ] **트랙 재생성:** 표 fade-out (0.2s) → data 교체 → fade-in (0.3s)
- [ ] **칩 stagger 등장:** 각 칩을 열 × 행 순서로 약간의 delay 차이로 나타남 (선택)

```js
// 표 래퍼 스타일 (애니메이션용)
animation: 'table-appear 0.4s ease-out forwards'

// keyframes (SeokyeongHero style 태그에 추가)
@keyframes table-appear {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### ✅ Step 6 — 내부 스크롤바 스타일 추가

기존 `.curriculum-scroll` 클래스와 동일한 스크롤바 스타일을 카드 wrapper에 적용:

```css
/* SeokyeongHero style 태그에 추가 */
.custom-curriculum-card::-webkit-scrollbar { width: 4px; }
.custom-curriculum-card::-webkit-scrollbar-track { background: transparent; }
.custom-curriculum-card::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 2px;
}
```

---

### ✅ Step 7 — 섹션 2 하이라이트 유지 여부 결정

- [ ] `selectedTrack` prop은 `CurriculumSection`에 계속 전달 (변경 없음)
- [ ] 섹션 2에서 학과 전체 커리큘럼을 보면 여전히 트랙 과목이 하이라이트됨
- [ ] **결정: 유지** — 섹션 2는 "전체 보기 + 비교용", 섹션 3은 "맞춤 요약용"으로 역할 분리

---

## 수정 파일 범위

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/SeokyeongHero.jsx` | `handleGenerate` 수정, `CustomCurriculumSection` 수정, `GeneratedCurriculumTable` 컴포넌트 추가, `@keyframes table-appear` 추가 |

---

## 완료 기준 체크리스트

- [ ] 트랙 선택 → "맞춤 커리큘럼 생성하기" 클릭 → 버튼 하단에 표가 펼쳐짐
- [ ] 표: 1~4학년 행 × 1,2학기 열 구조
- [ ] 각 셀에 해당 학년+학기의 공통+트랙 과목 칩 표시
- [ ] 칩 색상으로 공통 / 트랙 전용 / 공통+전용 시각 구분
- [ ] `core: true` 과목에 `[전핵]` 뱃지 표시
- [ ] 다른 트랙 선택 → 재생성 → 표 내용 교체됨
- [ ] 표 등장 애니메이션 정상 동작
- [ ] 카드 내부 스크롤로 100vh 초과 없이 레이아웃 유지
- [ ] 섹션 2 하이라이트도 동일하게 유지됨
- [ ] 빌드 오류 없음
