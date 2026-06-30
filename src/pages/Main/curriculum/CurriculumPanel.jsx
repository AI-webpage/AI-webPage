import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

/**
 * 커리큘럼 패널 — feat-taehyun(SeokyeongHero.jsx)의 "학과 커리큘럼 + 나만의 커리큘럼"
 * 부분만 추출해 독립 컴포넌트로 재구성한 것.
 *
 * - three.js / ScrollControls 의존 없음 (순수 React DOM).
 * - 핑크 코드가 꽂히면(Main 의 진행도 트리거) open=true → 화면 하단 패널이 fade+slide-up 으로 등장.
 * - 닫기 전까지 유지(✕ 버튼 / Esc). 패널 내부는 스크롤.
 *
 * props
 *   - open    : 표시 여부
 *   - onClose : 닫기 콜백
 *
 * ※ 원본과 차이:
 *   - 원본의 100vh <section> 래퍼/ScrollBridge(opacity 제어)를 제거하고 패널 본문에 배치.
 *   - 학과 커리큘럼 카드의 opacity:0/pointerEvents:none(원본은 스크롤로 페이드인) → 항상 보이게 변경.
 */

/* ── 반응형 훅 (원본 useIsMobile 이식) ── */
function useIsMobile(bp = 640) {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return v;
}

// hex → "r, g, b" 변환 유틸 (inline rgba 에 사용)
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/* ── 커리큘럼 데이터 (이미지 기반) — tags: 분야 매칭용 ── */
const CURRICULUM = {
  '1학년': {
    '1학기': [
      { name: '소프트웨어적 사고', type: 'lecture', cat: 'computing', tags: ['공통'] },
      { name: '프로그래밍 기초', type: 'both', cat: 'logic', tags: ['공통'] },
      { name: '대학수학 1', type: 'lecture', cat: 'logic', tags: ['공통', '빅데이터AI'] },
    ],
    '2학기': [
      { name: '프로그래밍 응용', type: 'both', cat: 'logic', tags: ['공통'] },
      { name: '대학수학 2', type: 'lecture', cat: 'logic', tags: ['공통', '빅데이터AI'] },
      { name: '오픈소스 프로그래밍', type: 'both', cat: 'software', tags: ['공통', '웹개발', '프론트엔드', '백엔드'] },
    ],
  },
  '2학년': {
    '1학기': [
      { name: '자료구조 및 실습', type: 'both', cat: 'computing', tags: ['공통'] },
      { name: '자바 프로그래밍', type: 'both', cat: 'logic', tags: ['공통', '백엔드'] },
      { name: '웹 클라이언트 컴퓨팅', type: 'both', cat: 'software', tags: ['웹개발', '프론트엔드'] },
      { name: '운영체제', type: 'lecture', cat: 'software', tags: ['공통'], core: true },
      { name: '소프트웨어 실습 1', type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
    '2학기': [
      { name: '알고리즘 및 실습', type: 'both', cat: 'computing', tags: ['공통'], core: true },
      { name: '객체지향 프로그래밍', type: 'both', cat: 'logic', tags: ['공통', '백엔드', '게임개발'] },
      { name: '웹 서버 컴퓨팅', type: 'both', cat: 'software', tags: ['웹개발', '백엔드'] },
      { name: '시스템 프로그래밍', type: 'both', cat: 'software', tags: ['백엔드', '게임개발'] },
      { name: '컴퓨터 네트워크', type: 'lecture', cat: 'software', tags: ['공통', '백엔드'] },
      { name: '데이터베이스', type: 'lecture', cat: 'software', tags: ['공통', '웹개발', '백엔드'], core: true },
      { name: '소프트웨어 실습 2', type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
  },
  '3학년': {
    '1학기': [
      { name: '빅데이터 분석', type: 'both', cat: 'computing', tags: ['빅데이터AI'] },
      { name: '자바 어플리케이션', type: 'both', cat: 'logic', tags: ['백엔드'] },
      { name: '모바일 소프트웨어개발', type: 'both', cat: 'logic', tags: ['프론트엔드'] },
      { name: '웹 정보 프레임워크', type: 'both', cat: 'software', tags: ['웹개발', '프론트엔드', '백엔드'] },
      { name: '컴퓨터 아키텍처', type: 'lecture', cat: 'software', tags: ['백엔드', '게임개발'] },
      { name: '소프트웨어 보안', type: 'lecture', cat: 'software', tags: ['공통', '백엔드'] },
      { name: '컴퓨터 네트워크 프로그래밍', type: 'both', cat: 'software', tags: ['백엔드'] },
      { name: '데이터베이스 설계 및 응용', type: 'both', cat: 'software', tags: ['공통', '웹개발', '백엔드'] },
    ],
    '2학기': [
      { name: '빅데이터 소프트웨어', type: 'both', cat: 'computing', tags: ['빅데이터AI', '백엔드'] },
      { name: '게임 그래픽스', type: 'both', cat: 'logic', tags: ['게임개발'] },
      { name: '영상처리 프로그램', type: 'both', cat: 'logic', tags: ['빅데이터AI', '게임개발'] },
      { name: '스프링 프레임워크', type: 'both', cat: 'software', tags: ['웹개발', '백엔드'] },
      { name: '데이터 크롤링', type: 'both', cat: 'software', tags: ['빅데이터AI', '웹개발'] },
      { name: '네트워크 프로그래밍', type: 'both', cat: 'software', tags: ['백엔드'] },
      { name: '소프트웨어 분석 및 설계', type: 'lecture', cat: 'software', tags: ['공통'] },
    ],
  },
  '4학년': {
    '1학기': [
      { name: '프로그래밍 언어분석', type: 'lecture', cat: 'logic', tags: ['공통'] },
      { name: '인공지능', type: 'both', cat: 'logic', tags: ['빅데이터AI'] },
      { name: '소프트웨어 공학', type: 'lecture', cat: 'software', tags: ['공통'], core: true },
      { name: '캡스톤설계 1', type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
    '2학기': [
      { name: '머신러닝', type: 'both', cat: 'logic', tags: ['빅데이터AI'] },
      { name: '소프트웨어 분석 및 설계', type: 'lecture', cat: 'software', tags: ['공통'] },
      { name: '소프트웨어와 경영', type: 'lecture', cat: 'software', tags: ['공통'] },
      { name: '캡스톤설계 2', type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
  },
};

// 전공역량 메타데이터 (색상 + 아이콘)
const CAT_META = {
  computing: { label: '컴퓨팅 사고', color: '#06b6d4', icon: '◉' },
  logic: { label: '논리적 문제해결', color: '#4f46e5', icon: '◆' },
  software: { label: '소프트웨어 구축', color: '#7c3aed', icon: '◈' },
  communication: { label: '의사소통 및 협업', color: '#ffffff', icon: '◎' },
};

// 수업 유형 메타데이터
// 교수님 포인트 컬러 팔레트 사용 (강의=파랑 / 강의+실습=노랑 / 실습=핑크 / 전핵=연두)
const TYPE_META = {
  lecture: { label: '강의', dot: '#0973CD', bg: 'rgba(9,115,205,0.10)', border: 'rgba(9,115,205,0.35)' },
  both: { label: '강의+실습', dot: '#f0a92e', bg: 'rgba(240,169,46,0.12)', border: 'rgba(240,169,46,0.4)' },
  practice: { label: '실습', dot: '#D5006A', bg: 'rgba(213,0,106,0.10)', border: 'rgba(213,0,106,0.35)' },
};

const CAT_ORDER = ['computing', 'logic', 'software', 'communication'];

// ── 진로 트랙 정의 ──
const TRACKS = {
  '웹개발': { label: '웹개발', desc: 'HTML/CSS/JS · 풀스택 개발', color: '#06b6d4', tags: ['공통', '웹개발', '프론트엔드', '백엔드'] },
  '프론트엔드': { label: '프론트엔드', desc: 'UI/UX · React · 사용자 경험', color: '#818cf8', tags: ['공통', '웹개발', '프론트엔드'] },
  '백엔드': { label: '백엔드', desc: '서버 · DB · 시스템 설계', color: '#7c3aed', tags: ['공통', '백엔드'] },
  '빅데이터AI': { label: '빅데이터/AI', desc: '데이터 분석 · 머신러닝 · AI', color: '#10b981', tags: ['공통', '빅데이터AI'] },
  '게임개발': { label: '게임개발자', desc: '게임 로직 · 그래픽스 · 엔진', color: '#f97316', tags: ['공통', '게임개발'] },
};
const TRACK_KEYS = Object.keys(TRACKS);

// ============================================
// 학과 커리큘럼 탭 섹션 (highlight/dim)
// ============================================
function CurriculumSection({ selectedTrack }) {
  const [selectedYear, setSelectedYear] = useState('1학년');
  const [displayYear, setDisplayYear] = useState('1학년');
  const [animPhase, setAnimPhase] = useState('idle');
  const isMobile = useIsMobile();
  const years = ['1학년', '2학년', '3학년', '4학년'];
  const yearData = CURRICULUM[displayYear];

  const handleYearChange = (year) => {
    if (year === selectedYear || animPhase !== 'idle') return;
    setSelectedYear(year);
    setAnimPhase('out');
    setTimeout(() => {
      setDisplayYear(year);
      setAnimPhase('in');
    }, 220);
    setTimeout(() => setAnimPhase('idle'), 480);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1220px',
        margin: '0 auto',
        background: 'rgba(20, 22, 35, 0.45)', // 위로드래그 버튼과 동일 다크 반투명
        backdropFilter: 'blur(14px)', // 모달(카드) 뒤 배경만 흐리게
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.9)', // 흰색 테두리
        borderRadius: '22px',
        padding: isMobile ? '26px 24px' : '44px 56px',
      }}
    >
      {/* ── 헤더 + 수업유형 범례 ── */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: isMobile ? '8px' : '0',
        marginBottom: '18px',
      }}>
        <div>
          <p className="dept-label">Department Curriculum</p>
          <h2 className="section-title" style={{ marginBottom: 0 }}>학과 커리큘럼</h2>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? '8px' : '14px', alignItems: 'center', flexWrap: 'wrap', paddingTop: isMobile ? '0' : '6px' }}>
          {Object.entries(TYPE_META).map(([key, m]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.dot, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: isMobile ? '1.18rem' : '1.35rem', color: '#6b7280' }}>{m.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontSize: isMobile ? '1.04rem' : '1.14rem', fontWeight: '700', color: '#7cb342',
              background: 'rgba(124,179,66,0.15)', border: '1px solid rgba(124,179,66,0.4)',
              borderRadius: '3px', padding: '1px 4px',
            }}>전핵</span>
          </div>
        </div>
      </div>

      {/* ── 학년 탭 ── */}
      <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', marginBottom: '24px' }}>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            style={{
              flex: isMobile ? '1' : 'none',
              padding: isMobile ? '7px 8px' : '8px 22px',
              background: selectedYear === year ? 'linear-gradient(135deg, #0973CD, #D5006A)' : 'rgba(99, 102, 241, 0.08)',
              border: selectedYear === year ? '1px solid transparent' : '1px solid rgba(99, 102, 241, 0.28)',
              borderRadius: '100px',
              color: selectedYear === year ? '#fff' : '#6b7280',
              fontSize: isMobile ? '1.48rem' : '1.66rem',
              fontWeight: selectedYear === year ? '600' : '400',
              cursor: animPhase !== 'idle' ? 'default' : 'pointer',
              letterSpacing: '0.02em',
              boxShadow: selectedYear === year ? '0 4px 20px rgba(213,0,106,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* ── 전공역량 범례 ── */}
      <div style={{ display: 'flex', gap: isMobile ? '8px' : '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {CAT_ORDER.map((key) => {
          const m = CAT_META[key];
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', background: m.color, borderRadius: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: isMobile ? '1.18rem' : '1.35rem', color: '#6b7280' }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── 1학기 / 2학기 그리드 (글리치 래퍼) ── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
        {animPhase !== 'idle' && (
          <>
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '3px', zIndex: 20,
              background: 'linear-gradient(90deg, transparent 0%, #06b6d4 30%, #818cf8 50%, #06b6d4 70%, transparent 100%)',
              boxShadow: '0 0 14px #06b6d4, 0 0 28px rgba(79,70,229,0.7)',
              animation: 'scanline-sweep 0.48s linear forwards', pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '1px', zIndex: 19,
              background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)',
              animation: 'scanline-sweep 0.48s linear 0.04s forwards', pointerEvents: 'none',
            }} />
          </>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          animation: animPhase === 'out' ? 'glitch-out 0.22s ease-in forwards'
            : animPhase === 'in' ? 'glitch-in 0.26s ease-out forwards' : 'none',
        }}>
          {['1학기', '2학기'].map((sem, si) => (
            <div key={sem} style={{
              borderLeft: (si === 1 && !isMobile) ? '1px solid rgba(99,102,241,0.15)' : 'none',
              borderTop: (si === 1 && isMobile) ? '1px solid rgba(99,102,241,0.15)' : 'none',
              paddingLeft: (si === 1 && !isMobile) ? '18px' : '0',
              paddingRight: (si === 0 && !isMobile) ? '18px' : '0',
              paddingTop: (si === 1 && isMobile) ? '14px' : '0',
            }}>
              {/* 학기 헤더 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                marginBottom: '10px', paddingBottom: '8px',
                borderBottom: '1px solid rgba(99,102,241,0.12)',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '7px',
                  background: si === 0 ? 'rgba(79,70,229,0.22)' : 'rgba(124,58,237,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.33rem', fontWeight: '700',
                  color: si === 0 ? '#818cf8' : '#a78bfa',
                }}>
                  {si + 1}
                </div>
                <span style={{ fontSize: '1.44rem', color: '#374151', letterSpacing: '0.06em', fontWeight: '500' }}>{sem}</span>
              </div>

              {/* 전공역량별 과목 목록 */}
              <div className="curriculum-scroll" style={{
                display: 'flex', flexDirection: 'column', gap: '10px',
                height: isMobile ? '300px' : '460px',
                overflowY: 'auto', paddingRight: '4px',
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent',
              }}>
                {CAT_ORDER.map((cat) => {
                  const courses = (yearData[sem] || []).filter((c) => c.cat === cat);
                  if (!courses.length) return null;
                  const cm = CAT_META[cat];
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                        {courses.map((course) => {
                          const tm = TYPE_META[course.type];
                          const trackActive = selectedTrack !== null;
                          const isHighlighted = trackActive && (course.tags || []).some(t => TRACKS[selectedTrack]?.tags.includes(t));
                          const isDimmed = trackActive && !isHighlighted;
                          return (
                            <div key={course.name} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 14px',
                              background: isHighlighted ? 'rgba(213, 0, 106, 0.13)' : course.core ? 'rgba(124, 179, 66, 0.12)' : tm.bg,
                              border: isHighlighted ? '2px solid #D5006A' : course.core ? '1px solid rgba(124,179,66,0.45)' : `1px solid ${tm.border}`,
                              borderLeft: isHighlighted ? '3px solid #D5006A' : course.core ? '3px solid #7cb342' : `3px solid ${cm.color}`,
                              borderRadius: '6px', fontSize: '1.41rem',
                              color: isHighlighted ? '#92400e' : '#1f2937', lineHeight: 1.3,
                              opacity: isDimmed ? 0.22 : 1, filter: isDimmed ? 'grayscale(55%)' : 'none',
                              boxShadow: isHighlighted ? '0 0 10px rgba(213, 0, 106,0.28)' : 'none',
                              transition: 'all 0.35s ease',
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isHighlighted ? '#D5006A' : course.core ? '#7cb342' : tm.dot, flexShrink: 0, display: 'inline-block' }} />
                              {course.name}
                              {course.core && (
                                <span style={{
                                  fontSize: '1.14rem', fontWeight: '700', letterSpacing: '0.04em',
                                  color: isHighlighted ? '#D5006A' : '#7cb342',
                                  background: isHighlighted ? 'rgba(213, 0, 106,0.15)' : 'rgba(124,179,66,0.15)',
                                  border: isHighlighted ? '1px solid rgba(213, 0, 106,0.4)' : '1px solid rgba(124,179,66,0.4)',
                                  borderRadius: '3px', padding: '1px 4px', lineHeight: 1.4, flexShrink: 0,
                                }}>전핵</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 생성된 맞춤 커리큘럼 표 (1-1 ~ 4-2)
// ============================================
function GeneratedCurriculumTable({ track }) {
  const tr = TRACKS[track];
  const isMobile = useIsMobile();

  const ROWS = [
    { label: '1-1', year: '1학년', sem: '1학기' },
    { label: '1-2', year: '1학년', sem: '2학기' },
    { label: '2-1', year: '2학년', sem: '1학기' },
    { label: '2-2', year: '2학년', sem: '2학기' },
    { label: '3-1', year: '3학년', sem: '1학기' },
    { label: '3-2', year: '3학년', sem: '2학기' },
    { label: '4-1', year: '4학년', sem: '1학기' },
    { label: '4-2', year: '4학년', sem: '2학기' },
  ];

  function getFilteredCourses(year, sem) {
    return (CURRICULUM[year][sem] || []).filter(c => c.tags.some(t => tr.tags.includes(t)));
  }
  function getCourseKind(course) {
    const isCommon = course.tags.includes('공통');
    const isTrack = course.tags.some(t => t !== '공통' && tr.tags.includes(t));
    if (isCommon && isTrack) return 'both';
    if (isCommon) return 'common';
    return 'track';
  }
  function chipColors(kind) {
    const rgb = hexToRgb(tr.color);
    if (kind === 'common') return { bg: 'rgba(99,102,241,0.11)', border: '1.5px solid rgba(99,102,241,0.32)', color: '#4f46e5', icon: '●' };
    if (kind === 'track') return { bg: `rgba(${rgb},0.16)`, border: `1.5px solid ${tr.color}88`, color: tr.color, icon: '■' };
    return { bg: `rgba(${rgb},0.13)`, border: `2px solid ${tr.color}`, color: tr.color, icon: '★' };
  }

  return (
    <div style={{ animation: 'table-appear 0.4s ease-out forwards' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(99,102,241,0.18)',
        paddingTop: '20px', marginTop: '20px', marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.9rem' }}>📋</span>
          <span style={{ fontSize: isMobile ? '1.56rem' : '1.71rem', fontWeight: '700', color: tr.color }}>{tr.label} 맞춤 커리큘럼</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { icon: '●', label: '공통 과목', color: '#4f46e5' },
            { icon: '■', label: `${tr.label} 전용`, color: tr.color },
            { icon: '★', label: '공통+전용', color: tr.color },
          ].map(({ icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '1.14rem', color }}>{icon}</span>
              <span style={{ fontSize: '1.23rem', color: '#6b7280' }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontSize: '1.04rem', fontWeight: '700', color: '#7cb342',
              background: 'rgba(124,179,66,0.15)', border: '1px solid rgba(124,179,66,0.4)',
              borderRadius: '3px', padding: '1px 4px',
            }}>전핵</span>
            <span style={{ fontSize: '1.23rem', color: '#6b7280' }}>전공핵심</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ROWS.map(({ label, year, sem }, idx) => {
          const courses = getFilteredCourses(year, sem);
          const isNewYear = label.endsWith('-1');
          return (
            <div key={label} style={{
              display: 'flex', gap: isMobile ? '10px' : '16px', alignItems: 'flex-start',
              padding: `${isMobile ? '9px' : '11px'} 0`,
              borderBottom: '1px solid rgba(99,102,241,0.08)',
              borderTop: isNewYear && idx > 0 ? '2px solid rgba(99,102,241,0.18)' : 'none',
            }}>
              <div style={{
                fontSize: isMobile ? '1.33rem' : '1.42rem', fontWeight: '800',
                color: label.endsWith('-1') ? 'rgba(129,140,248,0.85)' : 'rgba(167,139,250,0.75)',
                letterSpacing: '0.05em', whiteSpace: 'nowrap',
                minWidth: isMobile ? '28px' : '34px', paddingTop: '3px', flexShrink: 0,
              }}>{label}</div>

              {courses.length === 0 ? (
                <span style={{ fontSize: '1.29rem', color: '#cbd5e1', paddingTop: '3px' }}>—</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                  {courses.map((course) => {
                    const kind = getCourseKind(course);
                    const { bg, border, color, icon } = chipColors(kind);
                    return (
                      <div key={course.name} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: isMobile ? '6px 10px' : '7px 13px',
                        background: bg, border, borderRadius: '6px',
                        fontSize: isMobile ? '1.29rem' : '1.37rem', color, lineHeight: 1.3,
                      }}>
                        <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{icon}</span>
                        {course.name}
                        {course.core && (
                          <span style={{
                            fontSize: '1.04rem', fontWeight: '700', color: '#7cb342',
                            background: 'rgba(124,179,66,0.15)', border: '1px solid rgba(124,179,66,0.4)',
                            borderRadius: '3px', padding: '1px 4px', flexShrink: 0,
                          }}>전핵</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// 나만의 커리큘럼 짜기 (트랙 선택 + 생성)
// ============================================
function CustomCurriculumSection({ selectedTrack, onGenerate }) {
  const [pendingTrack, setPendingTrack] = useState(null);
  const [generatedTrack, setGeneratedTrack] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const isMobile = useIsMobile();

  const handleCard = (key) => setPendingTrack(prev => (prev === key ? null : key));
  const handleGenerate = () => {
    if (!pendingTrack) return;
    onGenerate(pendingTrack);
    setGeneratedTrack(pendingTrack);
    setShowTable(true);
  };
  // 리셋 — 선택/적용/생성표 모두 초기화(학과 커리큘럼 하이라이트도 해제)
  const handleReset = () => {
    setPendingTrack(null);
    setGeneratedTrack(null);
    setShowTable(false);
    onGenerate(null);
  };

  return (
    <div
      className="custom-curriculum-card"
      style={{
        width: '100%', maxWidth: '1160px', margin: '0 auto',
        background: 'rgba(20, 22, 35, 0.45)', // 위로드래그 버튼과 동일 다크 반투명
        backdropFilter: 'blur(14px)', // 모달(카드) 뒤 배경만 흐리게
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.9)', // 흰색 테두리
        borderRadius: '22px',
        padding: isMobile ? '34px 28px' : '56px 64px',
      }}
    >
      <p className="dept-label">My Curriculum</p>
      <h2 className="section-title" style={{ marginBottom: '8px' }}>나만의 커리큘럼 짜기</h2>
      <p style={{ fontSize: '1.9rem', color: '#6b7280', marginBottom: '36px', lineHeight: 1.6 }}>
        관심 분야를 선택하면 학과 커리큘럼에서 맞춤 과목을 추천해드려요
      </p>

      {/* 트랙 카드 5개 */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {TRACK_KEYS.map((key) => {
          const tr = TRACKS[key];
          const isSelected = pendingTrack === key;
          const isApplied = selectedTrack === key;
          return (
            <button
              key={key}
              className="track-card"
              onClick={() => handleCard(key)}
              style={{
                flex: '1 1 170px', padding: '22px 20px',
                background: isSelected ? `rgba(${hexToRgb(tr.color)}, 0.15)` : 'rgba(255,255,255,0.08)',
                border: `1.5px solid ${isSelected ? tr.color : 'rgba(99,102,241,0.22)'}`,
                borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.22s ease', position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: isSelected ? tr.color : 'transparent', transition: 'background 0.22s ease' }} />
              {isApplied && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.05em',
                  color: tr.color, background: `rgba(${hexToRgb(tr.color)}, 0.15)`,
                  border: `1px solid ${tr.color}`, borderRadius: '3px', padding: '1px 5px',
                }}>적용중</div>
              )}
              <div style={{ fontSize: '1.99rem', fontWeight: '700', letterSpacing: '0.02em', color: isSelected ? tr.color : '#374151', marginBottom: '7px', transition: 'color 0.22s ease' }}>{tr.label}</div>
              <div style={{ fontSize: '1.56rem', color: '#6b7280', lineHeight: 1.5 }}>{tr.desc}</div>
            </button>
          );
        })}
      </div>

      {/* 생성 버튼 */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '14px' }}>
        <button
          onClick={handleGenerate}
          disabled={!pendingTrack}
          style={{
            padding: isMobile ? '16px 28px' : '16px 40px',
            background: pendingTrack ? 'linear-gradient(135deg, #D5006A, #0973CD)' : 'rgba(255,255,255,0.12)',
            border: pendingTrack ? 'none' : '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px', color: pendingTrack ? '#fff' : '#9ca3af',
            fontSize: isMobile ? '1.99rem' : '1.99rem', fontWeight: '600', letterSpacing: '0.04em',
            cursor: pendingTrack ? 'pointer' : 'not-allowed',
            boxShadow: pendingTrack ? '0 4px 24px rgba(213,0,106,0.35)' : 'none',
            transition: 'all 0.25s ease', textAlign: 'center',
          }}
        >맞춤 커리큘럼 생성하기 →</button>

        {/* 리셋 버튼 — 적용/생성 후 표시 */}
        {(selectedTrack || showTable) && (
          <button
            onClick={handleReset}
            style={{
              padding: isMobile ? '16px 28px' : '16px 34px',
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.55)',
              borderRadius: '100px', color: '#fff',
              fontSize: '1.7rem', fontWeight: '600', letterSpacing: '0.04em',
              cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center',
            }}
          >초기화 ↺</button>
        )}

        {selectedTrack && (
          <span style={{ fontSize: '1.48rem', color: '#6b7280', textAlign: isMobile ? 'center' : 'left' }}>
            현재 적용: <span style={{ color: TRACKS[selectedTrack].color, fontWeight: '600' }}>{TRACKS[selectedTrack].label}</span>
          </span>
        )}
      </div>

      {/* 생성된 맞춤 커리큘럼 표 */}
      {showTable && generatedTrack && <GeneratedCurriculumTable key={generatedTrack} track={generatedTrack} />}
    </div>
  );
}

// ============================================
// 패널 래퍼 (핑크 코드 → 가운데 모달 + 세로 드래그 페이저)
//   page 0 = 학과 커리큘럼 (먼저)  →  위로 드래그 →  page 1 = 나만의 커리큘럼 짜기
// ============================================
const PAGES = 2;
const DRAG_THRESHOLD = 70; // 이 px 이상 끌면 페이지 전환

export default function CurriculumPanel({ open, onClose }) {
  const [selectedTrack, setSelectedTrack] = useState(null); // 생성 적용된 트랙
  const [page, setPage] = useState(0); // 0=학과, 1=나만의
  const [dragY, setDragY] = useState(0); // 드래그 중 임시 오프셋(px)
  const [dragging, setDragging] = useState(false);

  const stageRef = useRef(null);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const ptrTypeRef = useRef('mouse'); // 'mouse' | 'touch' | 'pen'
  const pageRef = useRef(0); // window 리스너에서 최신 page 참조용
  const bodyRefs = useRef([]); // 각 페이지 스크롤 본문 (휠/터치 경계 판정용)

  // 최신 page 를 ref 에 동기화
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // 열릴 때마다 1페이지(학과 커리큘럼)부터 시작
  useEffect(() => {
    if (open) {
      setPage(0);
      setDragY(0);
    }
  }, [open]);

  // Esc 로 닫기 (열려 있을 때만)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // ── 세로 드래그로 페이지 전환 (window 레벨 추적 → 이벤트 누락 없음) ──
  //   마우스: 내부 스크롤은 휠이 담당 → 드래그는 곧장 페이지 이동(경계 무관)
  //   터치/펜: 스와이프가 내부 스크롤도 겸하므로, 스크롤 경계(끝/맨위)에 닿았을 때만 페이지 이동
  const onPointerDown = (e) => {
    draggingRef.current = true;
    startYRef.current = e.clientY;
    ptrTypeRef.current = e.pointerType || 'mouse';
    dragYRef.current = 0;
    setDragging(true);
    // ※ setPointerCapture 사용 안 함 — 캡처하면 내부 버튼 클릭이 막힘
  };

  // 드래그 추적은 마운트 시 window 에 1회 등록 (draggingRef 로 활성 여부 판단)
  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const dy = e.clientY - startYRef.current;
      const pg = pageRef.current;
      let pdy = 0;
      if (ptrTypeRef.current === 'mouse') {
        if (dy < 0 && pg < PAGES - 1) pdy = dy;
        else if (dy > 0 && pg > 0) pdy = dy;
      } else {
        const body = bodyRefs.current[pg];
        const atTop = !body || body.scrollTop <= 0;
        const atBottom = !body || body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
        if (dy < 0 && pg < PAGES - 1 && atBottom) pdy = dy;
        else if (dy > 0 && pg > 0 && atTop) pdy = dy;
      }
      dragYRef.current = pdy;
      setDragY(pdy);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      const d = dragYRef.current;
      const pg = pageRef.current;
      if (d < -DRAG_THRESHOLD && pg < PAGES - 1) setPage(pg + 1);
      else if (d > DRAG_THRESHOLD && pg > 0) setPage(pg - 1);
      dragYRef.current = 0;
      setDragY(0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // ── 휠/트랙패드 스와이프로 페이지 전환 ──
  //   내부 스크롤이 경계(맨 아래/맨 위)에 닿으면, 그 다음 스와이프가 페이지를 넘긴다(= 풀페이지 방식).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    let lock = false; // 한 번의 스와이프로 여러 페이지 넘어가는 것 방지
    const onWheel = (e) => {
      const pg = pageRef.current;
      const body = bodyRefs.current[pg];
      const atTop = !body || body.scrollTop <= 0;
      const atBottom = !body || body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
      const goNext = e.deltaY > 0 && pg < PAGES - 1 && atBottom; // 아래로 스와이프 → 다음
      const goPrev = e.deltaY < 0 && pg > 0 && atTop; // 위로 스와이프(맨 위) → 이전
      if (goNext || goPrev) {
        e.preventDefault(); // 내부 스크롤 대신 페이지 전환
        if (lock) return;
        lock = true;
        setPage(goNext ? pg + 1 : pg - 1);
        setTimeout(() => { lock = false; }, 700);
      }
      // 경계가 아니면 내부 PageScroll 이 네이티브로 스크롤됨
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <Overlay
      data-open={open ? 'true' : 'false'}
      role="dialog"
      aria-label="학과 커리큘럼"
      aria-hidden={open ? 'false' : 'true'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button className="cur-close" aria-label="닫기" onClick={onClose}>✕</button>

      {/* 페이지 인디케이터(점) */}
      <Dots aria-hidden="true">
        {Array.from({ length: PAGES }).map((_, i) => (
          <span key={i} className={i === page ? 'on' : ''} />
        ))}
      </Dots>

      <Stage className="cur-stage" ref={stageRef} onPointerDown={onPointerDown}>
        <Track
          style={{ transform: `translateY(calc(${-page * 50}% + ${dragY}px))` }}
          data-dragging={dragging ? 'true' : 'false'}
        >
          {/* page 0 — 학과 커리큘럼 (먼저) */}
          <Page>
            <PageScroll ref={(el) => (bodyRefs.current[0] = el)}>
              <CurriculumSection selectedTrack={selectedTrack} />
              {/* 위로 드래그 안내(클릭으로도 이동 가능) */}
              <DragHint type="button" onClick={() => setPage(1)}>
                <span className="arrow">↑</span>
                위로 드래그 — 나만의 커리큘럼 짜기
              </DragHint>
            </PageScroll>
          </Page>

          {/* page 1 — 나만의 커리큘럼 짜기 */}
          <Page>
            <PageScroll ref={(el) => (bodyRefs.current[1] = el)}>
              <BackHint type="button" onClick={() => setPage(0)}>
                <span className="arrow">↓</span>
                아래로 — 학과 커리큘럼
              </BackHint>
              <CustomCurriculumSection selectedTrack={selectedTrack} onGenerate={setSelectedTrack} />
            </PageScroll>
          </Page>
        </Track>
      </Stage>

      {/* 추출 컴포넌트가 쓰는 클래스/키프레임 (패널 안에서만 적용되도록 스코프) */}
      <style>{`
        /* 커리큘럼 안 폰트 전부 흰색 (inline color 보다 우선) */
        .curriculum-panel-scope .cur-stage,
        .curriculum-panel-scope .cur-stage * { color: #ffffff !important; }

        .curriculum-panel-scope .dept-label {
          font-size: 1.4rem; font-weight: 600; letter-spacing: 0.25em;
          text-transform: uppercase; margin-bottom: 14px; opacity: 0.9;
        }
        .curriculum-panel-scope .section-title {
          font-size: clamp(2rem, 3.4vw, 2.8rem); font-weight: 800;
          margin-bottom: 22px; line-height: 1.2;
        }
        .curriculum-panel-scope .track-card:hover {
          transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        }
        .curriculum-panel-scope .curriculum-scroll::-webkit-scrollbar,
        .curriculum-panel-scope .custom-curriculum-card::-webkit-scrollbar { width: 4px; }
        .curriculum-panel-scope .curriculum-scroll::-webkit-scrollbar-track,
        .curriculum-panel-scope .custom-curriculum-card::-webkit-scrollbar-track { background: transparent; }
        .curriculum-panel-scope .curriculum-scroll::-webkit-scrollbar-thumb,
        .curriculum-panel-scope .custom-curriculum-card::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3); border-radius: 2px;
        }
        .curriculum-panel-scope .curriculum-scroll::-webkit-scrollbar-thumb:hover,
        .curriculum-panel-scope .custom-curriculum-card::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.55);
        }
        @keyframes scanline-sweep {
          0% { top: -4px; opacity: 0; } 6% { opacity: 1; } 94% { opacity: 1; }
          100% { top: calc(100% + 4px); opacity: 0; }
        }
        @keyframes glitch-out {
          0% { opacity: 1; transform: translateX(0) skewX(0deg); filter: blur(0); }
          15% { opacity: 0.8; transform: translateX(-4px) skewX(-0.4deg); }
          35% { opacity: 0.5; transform: translateX(3px) skewX(0.3deg); filter: blur(1px); }
          60% { opacity: 0.2; transform: translateX(-2px) skewX(0deg); filter: blur(3px); }
          100% { opacity: 0; transform: translateX(0); filter: blur(0); }
        }
        @keyframes glitch-in {
          0% { opacity: 0; transform: translateX(6px) skewX(0.5deg); filter: blur(6px); }
          20% { opacity: 0.4; transform: translateX(-3px) skewX(-0.3deg); filter: blur(3px); }
          50% { opacity: 0.7; transform: translateX(2px) skewX(0.2deg); filter: blur(1px); }
          80% { opacity: 0.9; transform: translateX(-1px) skewX(0deg); filter: blur(0.3px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes table-appear {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Overlay>
  );
}

/* ───── 가운데 모달 오버레이 (파란 코드 카드뉴스처럼 fade-in) ───── */
const Overlay = styled.div.attrs({ className: 'curriculum-panel-scope' })`
  position: fixed;
  inset: 0;
  z-index: 120; /* 교수 카드뉴스와 동일 레벨 (동시 표시 안 됨) */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vh, 48px);
  font-family: 'Poppins', system-ui, sans-serif;
  /* 전체 화면은 흐리게/어둡게 하지 않는다 — 흐림은 카드(모달) 자체의 backdrop-filter 로만. */
  background: transparent;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.34s ease;
  &[data-open='true'] {
    opacity: 1;
    pointer-events: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.12s;
  }

  .cur-close {
    /* 모달(Stage) 오른쪽 위 모서리 바로 "위"에 놓는다.
       Stage = 65.3vw × 86vh 가운데 정렬 → 모서리 좌표를 순수 vw/vh 로 계산
       (px 캡 제거: 줌/뷰포트가 바뀌어도 버튼이 항상 모서리에 붙어 보이게) */
    position: fixed;
    top: calc(50% - 43vh - 4.5vh); /* Stage(86vh) 상단보다 위 */
    right: calc(50% - 32.65vw); /* Stage(65.3vw) 오른쪽 끝 */
    z-index: 130;
    width: clamp(40px, 4.5vmin, 56px);
    height: clamp(40px, 4.5vmin, 56px);
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.85);
    background: rgba(20, 22, 35, 0.45); /* 영상 위에서도 ✕ 보이게 */
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: clamp(16px, 2.2vmin, 22px);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.15s ease;
    &:hover {
      background: rgba(20, 22, 35, 0.62);
    }
    &:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }
    /* 모바일: Stage 92vw → 오른쪽 끝(=화면 가장자리 근처)에 맞춤 */
    @media (max-width: 768px) {
      top: calc(50% - 43vh - 3vh);
      right: calc(50% - 45vw);
    }
  }
`;

/* 페이지 인디케이터 (우측 세로 점) */
const Dots = styled.div`
  position: fixed;
  right: clamp(14px, 2vw, 26px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 125;
  display: flex;
  flex-direction: column;
  gap: 10px;
  span {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45); /* 밝은 영상 위에서도 보이게 */
    transition: all 0.25s ease;
  }
  span.on {
    height: 26px;
    border-radius: 99px;
    background: #fff;
  }
`;

/* 모달 안쪽 — 세로 페이저의 뷰포트(고정 크기, 가운데) */
const Stage = styled.div`
  position: relative;
  /* px 캡 없이 순수 뷰포트 비율 → 어떤 줌/창 크기에서도 화면 점유 비율 동일
     (50% 줌 중측값 기준 화면 폭 65.3%). 이전 min(1300px,96vw) 는 줌 단계마다
     96vw↔1300px 로 튀어 "줌 시 비율 깨짐"의 원인이었음. */
  width: 65.3vw;
  height: 86vh;
  overflow: hidden;
  border-radius: 22px;
  touch-action: pan-y; /* 세로 제스처 허용 */
  user-select: none; /* 드래그 시 텍스트 선택 방지 (드래그가 페이지 전환을 가로채도록) */

  /* 모바일: 너무 좁아지지 않게 화면 폭 거의 채움 */
  @media (max-width: 768px) {
    width: 92vw;
  }
`;

/* 2페이지를 위아래로 쌓은 트랙 (translateY 로 전환) */
const Track = styled.div`
  width: 100%;
  height: 200%; /* 페이지 2장 */
  display: flex;
  flex-direction: column;
  will-change: transform;
  &[data-dragging='false'] {
    transition: transform 0.45s cubic-bezier(0.22, 0.8, 0.26, 1);
  }
`;

/* 각 페이지 = 스테이지 높이 (트랙의 절반) */
const Page = styled.div`
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* 페이지 내부 스크롤 본문 (길면 여기서 스크롤, 경계에서 드래그 페이저로 넘어감) */
const PageScroll = styled.div`
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  padding: 6px 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 4px;
  }
`;

/* "위로 드래그" 안내 (클릭 시 2페이지로) */
const DragHint = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 22px auto 6px;
  padding: 12px 22px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  background: rgba(20, 22, 35, 0.45); /* 흐리지 않은 영상 위에서도 보이게 (다크 프로스트 펄) */
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 100px;
  font-family: inherit;
  font-size: 1.71rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
  &:hover {
    background: rgba(20, 22, 35, 0.62);
  }
  .arrow {
    font-size: 2.09rem;
    animation: cur-bounce 1.5s ease-in-out infinite;
  }
  @keyframes cur-bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .arrow {
      animation: none;
    }
  }
`;

/* "아래로 — 학과 커리큘럼" 되돌아가기 */
const BackHint = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 auto 18px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  background: rgba(20, 22, 35, 0.45);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #ffffff;
  border-radius: 100px;
  font-family: inherit;
  font-size: 1.61rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.18s ease;
  &:hover {
    background: rgba(20, 22, 35, 0.62);
  }
`;
