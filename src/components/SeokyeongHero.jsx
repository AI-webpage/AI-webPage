// ============================================
// 서경대학교 소프트웨어학과 히어로 컴포넌트
// React Three Fiber + Drei 기반 3D 인터랙션 페이지
// 글래스모피즘 디자인 + 스크롤 애니메이션
// ============================================

import { useRef, Suspense, useState, useEffect } from 'react';

// 화면 너비 감지 훅 (640px 기준 모바일 판별)
function useIsMobile(bp = 640) {
  const [v, setV] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return v;
}
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment, Stars, useScroll } from '@react-three/drei';
import ServerRack from './three/ServerRack';
import CyberTunnel from './three/CyberTunnel';
import ProfessorSection from './professors/ProfessorSection';

// ============================================
// 바닥 반사 플레이트 (씬 레벨)
// 서버랙 아래 반짝이는 바닥면 표현
// ============================================
function FloorReflection() {
  return (
    <mesh
      position={[0, -1.65, -1]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[14, 14]} />
      <meshStandardMaterial
        color="#06060f"
        metalness={0.92}
        roughness={0.06}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ============================================
// Canvas 내부 씬 컴포넌트 - 환경/조명만 담당
// ScrollControls > Scroll 내부에서 동작
// ServerRack, CyberTunnel은 <Scroll> 밖에서 useScroll로 자체 관리
// ============================================
function Scene() {
  return (
    <>
      {/* 환경 맵 - metallic/physical 재질의 반사광 공급 */}
      <Environment preset="city" background={false} />

      {/* 전역 앰비언트 - 딥 블루 */}
      <ambientLight intensity={0.45} color="#1a1850" />

      {/* 메인 키 라이트 - 상단 우측, 흰색 */}
      <directionalLight
        position={[3, 7, 5]}
        intensity={1.2}
        color="#e8eeff"
        castShadow
      />

      {/* 보조 필 라이트 - 좌측 상단, 인디고 */}
      <directionalLight
        position={[-4, 3, 3]}
        intensity={0.5}
        color="#6366f1"
      />

      {/* 림 라이트 - 뒤쪽 하단, 퍼플 (실루엣 강조) */}
      <pointLight position={[0, -4, -5]} intensity={3.0} color="#7c3aed" distance={14} decay={2} />

      {/* 상단 스팟 - 서버랙 직접 조명 */}
      <pointLight position={[0, 8, 3]}  intensity={2.5} color="#ffffff" distance={16} decay={2} />

      {/* 좌측 사이드 인디고 */}
      <pointLight position={[-6, 2, 2]} intensity={2.0} color="#4f46e5" distance={12} decay={2} />

      {/* 우측 사이드 시안 */}
      <pointLight position={[6, 1, 2]}  intensity={1.5} color="#06b6d4" distance={12} decay={2} />

      {/* 배경 별 파티클 */}
      <Stars
        radius={80}
        depth={60}
        count={2500}
        factor={3.5}
        saturation={0.3}
        fade
        speed={0.2}
      />
    </>
  );
}

// ============================================
// Canvas ↔ HTML DOM 브릿지
// useScroll(offset)을 읽어 커리큘럼·교수 섹션 DOM의 opacity/pointerEvents 제어
// pages=4 기준: Section2 중앙 offset=0.33, Section4 중앙 offset=1.00
// ============================================
function ScrollBridge({ curriculumRef, professorRef }) {
  const scroll = useScroll();

  useFrame(() => {
    const offset = scroll.offset;

    // ── 커리큘럼 (Section 2): offset 0.33(터널 종료)부터 페이드인 ──
    const TUNNEL_END    = 0.33;   // pages=4에서 Section2 중앙 offset (was 0.50)
    const FADE_DURATION = 0.03;   // 0.33 ~ 0.36 구간에서 완전 표시
    if (curriculumRef.current) {
      const currOpacity = Math.max(0, Math.min(1, (offset - TUNNEL_END) / FADE_DURATION));
      curriculumRef.current.style.opacity = String(currOpacity);
      curriculumRef.current.style.pointerEvents = currOpacity > 0.01 ? 'auto' : 'none';
    }

    // ── 교수 소개 (Section 4): offset 0.85부터 페이드인 ──
    // Section4 중앙 = offset 1.00, 뷰포트 진입 시작 = ~0.67, 페이드 시작 = 0.85
    const PROF_START = 0.85;
    const PROF_FADE  = 0.08;
    if (professorRef.current) {
      const profOpacity = Math.max(0, Math.min(1, (offset - PROF_START) / PROF_FADE));
      professorRef.current.style.opacity = String(profOpacity);
      professorRef.current.style.pointerEvents = profOpacity > 0.01 ? 'auto' : 'none';
    }
  });

  return null;
}

// ── 커리큘럼 데이터 (이미지 기반) ───────────────────────────
// tags: 나만의 커리큘럼 짜기 분야 매칭용 해시태그
//   '공통'      → 모든 분야에 해당
//   '웹개발'    → 웹개발 트랙
//   '프론트엔드'→ 프론트엔드 트랙
//   '백엔드'    → 백엔드 트랙
//   '빅데이터AI'→ 빅데이터/AI 트랙
//   '게임개발'  → 게임개발자 트랙
const CURRICULUM = {
  '1학년': {
    '1학기': [
      { name: '소프트웨어적 사고', type: 'lecture', cat: 'computing', tags: ['공통'] },
      { name: '프로그래밍 기초',   type: 'both',    cat: 'logic',     tags: ['공통'] },
      { name: '대학수학 1',        type: 'lecture', cat: 'logic',     tags: ['공통', '빅데이터AI'] },
    ],
    '2학기': [
      { name: '프로그래밍 응용',     type: 'both',    cat: 'logic',    tags: ['공통'] },
      { name: '대학수학 2',          type: 'lecture', cat: 'logic',    tags: ['공통', '빅데이터AI'] },
      { name: '오픈소스 프로그래밍', type: 'both',    cat: 'software', tags: ['공통', '웹개발', '프론트엔드', '백엔드'] },
    ],
  },
  '2학년': {
    '1학기': [
      { name: '자료구조 및 실습',     type: 'both',     cat: 'computing',     tags: ['공통'] },
      { name: '자바 프로그래밍',      type: 'both',     cat: 'logic',         tags: ['공통', '백엔드'] },
      { name: '웹 클라이언트 컴퓨팅', type: 'both',     cat: 'software',      tags: ['웹개발', '프론트엔드'] },
      { name: '운영체제',             type: 'lecture',  cat: 'software',      tags: ['공통'],                     core: true },
      { name: '소프트웨어 실습 1',    type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
    '2학기': [
      { name: '알고리즘 및 실습',    type: 'both',     cat: 'computing',     tags: ['공통'],                              core: true },
      { name: '객체지향 프로그래밍', type: 'both',     cat: 'logic',         tags: ['공통', '백엔드', '게임개발'] },
      { name: '웹 서버 컴퓨팅',      type: 'both',     cat: 'software',      tags: ['웹개발', '백엔드'] },
      { name: '시스템 프로그래밍',   type: 'both',     cat: 'software',      tags: ['백엔드', '게임개발'] },
      { name: '컴퓨터 네트워크',     type: 'lecture',  cat: 'software',      tags: ['공통', '백엔드'] },
      { name: '데이터베이스',        type: 'lecture',  cat: 'software',      tags: ['공통', '웹개발', '백엔드'],          core: true },
      { name: '소프트웨어 실습 2',   type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
  },
  '3학년': {
    '1학기': [
      { name: '빅데이터 분석',             type: 'both',    cat: 'computing', tags: ['빅데이터AI'] },
      { name: '자바 어플리케이션',          type: 'both',    cat: 'logic',     tags: ['백엔드'] },
      { name: '모바일 소프트웨어개발',      type: 'both',    cat: 'logic',     tags: ['프론트엔드'] },
      { name: '웹 정보 프레임워크',         type: 'both',    cat: 'software',  tags: ['웹개발', '프론트엔드', '백엔드'] },
      { name: '컴퓨터 아키텍처',           type: 'lecture', cat: 'software',  tags: ['백엔드', '게임개발'] },
      { name: '소프트웨어 보안',           type: 'lecture', cat: 'software',  tags: ['공통', '백엔드'] },
      { name: '컴퓨터 네트워크 프로그래밍', type: 'both',   cat: 'software',  tags: ['백엔드'] },
      { name: '데이터베이스 설계 및 응용',  type: 'both',   cat: 'software',  tags: ['공통', '웹개발', '백엔드'] },
    ],
    '2학기': [
      { name: '빅데이터 소프트웨어',    type: 'both',    cat: 'computing', tags: ['빅데이터AI', '백엔드'] },
      { name: '게임 그래픽스',          type: 'both',    cat: 'logic',     tags: ['게임개발'] },
      { name: '영상처리 프로그램',       type: 'both',    cat: 'logic',     tags: ['빅데이터AI', '게임개발'] },
      { name: '스프링 프레임워크',       type: 'both',    cat: 'software',  tags: ['웹개발', '백엔드'] },
      { name: '데이터 크롤링',          type: 'both',    cat: 'software',  tags: ['빅데이터AI', '웹개발'] },
      { name: '네트워크 프로그래밍',     type: 'both',    cat: 'software',  tags: ['백엔드'] },
      { name: '소프트웨어 분석 및 설계', type: 'lecture', cat: 'software',  tags: ['공통'] },
    ],
  },
  '4학년': {
    '1학기': [
      { name: '프로그래밍 언어분석', type: 'lecture',  cat: 'logic',         tags: ['공통'] },
      { name: '인공지능',            type: 'both',     cat: 'logic',         tags: ['빅데이터AI'] },
      { name: '소프트웨어 공학',     type: 'lecture',  cat: 'software',      tags: ['공통'],  core: true },
      { name: '캡스톤설계 1',        type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
    '2학기': [
      { name: '머신러닝',              type: 'both',     cat: 'logic',         tags: ['빅데이터AI'] },
      { name: '소프트웨어 분석 및 설계', type: 'lecture', cat: 'software',     tags: ['공통'] },
      { name: '소프트웨어와 경영',      type: 'lecture', cat: 'software',      tags: ['공통'] },
      { name: '캡스톤설계 2',           type: 'practice', cat: 'communication', tags: ['공통'] },
    ],
  },
};

// 전공역량 메타데이터 (색상 + 아이콘)
const CAT_META = {
  computing:     { label: '컴퓨팅 사고',      color: '#06b6d4', icon: '◉' },
  logic:         { label: '논리적 문제해결',   color: '#4f46e5', icon: '◆' },
  software:      { label: '소프트웨어 구축',   color: '#7c3aed', icon: '◈' },
  communication: { label: '의사소통 및 협업',  color: '#10b981', icon: '◎' },
};

// 수업 유형 메타데이터
const TYPE_META = {
  lecture:  { label: '강의',      dot: '#818cf8', bg: 'rgba(79,70,229,0.10)',  border: 'rgba(79,70,229,0.35)' },
  both:     { label: '강의+실습', dot: '#22d3ee', bg: 'rgba(6,182,212,0.10)', border: 'rgba(6,182,212,0.35)' },
  practice: { label: '실습',      dot: '#fb923c', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.35)' },
};

const CAT_ORDER = ['computing', 'logic', 'software', 'communication'];

// ── 진로 트랙 정의 ──────────────────────────────────────────
const TRACKS = {
  '웹개발':     { label: '웹개발',      desc: 'HTML/CSS/JS · 풀스택 개발',    color: '#06b6d4', tags: ['공통', '웹개발', '프론트엔드', '백엔드'] },
  '프론트엔드': { label: '프론트엔드',  desc: 'UI/UX · React · 사용자 경험',  color: '#818cf8', tags: ['공통', '웹개발', '프론트엔드'] },
  '백엔드':     { label: '백엔드',      desc: '서버 · DB · 시스템 설계',      color: '#7c3aed', tags: ['공통', '백엔드'] },
  '빅데이터AI': { label: '빅데이터/AI', desc: '데이터 분석 · 머신러닝 · AI',  color: '#10b981', tags: ['공통', '빅데이터AI'] },
  '게임개발':   { label: '게임개발자',  desc: '게임 로직 · 그래픽스 · 엔진',  color: '#f97316', tags: ['공통', '게임개발'] },
};
const TRACK_KEYS = Object.keys(TRACKS);

// ============================================
// 학과 커리큘럼 탭 섹션
// ============================================
function CurriculumSection({ domRef, selectedTrack }) {
  const [selectedYear, setSelectedYear] = useState('1학년');
  const [displayYear, setDisplayYear]   = useState('1학년');
  const [animPhase, setAnimPhase]       = useState('idle');
  const isMobile = useIsMobile();
  const years = ['1학년', '2학년', '3학년', '4학년'];
  const yearData = CURRICULUM[displayYear];

  const handleYearChange = (year) => {
    if (year === selectedYear || animPhase !== 'idle') return;
    setSelectedYear(year);   // 탭 즉시 반응
    setAnimPhase('out');     // 글리치 아웃 시작
    setTimeout(() => {
      setDisplayYear(year);  // 콘텐츠 교체
      setAnimPhase('in');    // 글리치 인 시작
    }, 220);
    setTimeout(() => setAnimPhase('idle'), 480);
  };

  return (
    <section
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0 3vw' : '0 5vw',
      }}
    >
      <div
        ref={domRef}
        style={{
          width: '100%',
          maxWidth: '920px',
          background: 'rgba(8, 9, 18, 0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '20px',
          padding: isMobile ? '16px 16px' : '28px 36px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        {/* ── 헤더 + 수업유형 범례 ── */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: isMobile ? '8px' : '0',
          marginBottom: '12px',
        }}>
          <div>
            <p className="dept-label">Department Curriculum</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>학과 커리큘럼</h2>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '8px' : '14px', alignItems: 'center', flexWrap: 'wrap', paddingTop: isMobile ? '0' : '6px' }}>
            {Object.entries(TYPE_META).map(([key, m]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: m.dot, display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ fontSize: isMobile ? '0.62rem' : '0.71rem', color: 'rgba(150,160,210,0.7)' }}>
                  {m.label}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: isMobile ? '0.55rem' : '0.6rem', fontWeight: '700', color: '#fb923c',
                background: 'rgba(251,146,60,0.15)',
                border: '1px solid rgba(251,146,60,0.4)',
                borderRadius: '3px', padding: '1px 4px',
              }}>전핵</span>
            </div>
          </div>
        </div>

        {/* ── 학년 탭 ── */}
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', marginBottom: '12px' }}>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              style={{
                flex: isMobile ? '1' : 'none',
                padding: isMobile ? '7px 8px' : '8px 22px',
                background: selectedYear === year
                  ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                  : 'rgba(99, 102, 241, 0.08)',
                border: selectedYear === year
                  ? '1px solid transparent'
                  : '1px solid rgba(99, 102, 241, 0.28)',
                borderRadius: '100px',
                color: selectedYear === year ? '#fff' : 'rgba(160, 170, 220, 0.75)',
                fontSize: isMobile ? '0.78rem' : '0.875rem',
                fontWeight: selectedYear === year ? '600' : '400',
                cursor: animPhase !== 'idle' ? 'default' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: selectedYear === year ? '0 4px 20px rgba(79,70,229,0.35)' : 'none',
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
                <div style={{
                  width: '8px', height: '8px',
                  background: m.color, borderRadius: '2px', flexShrink: 0,
                }} />
                <span style={{ fontSize: isMobile ? '0.62rem' : '0.71rem', color: 'rgba(150,160,210,0.7)' }}>{m.label}</span>
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
                animation: 'scanline-sweep 0.48s linear forwards',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', left: 0, right: 0, height: '1px', zIndex: 19,
                background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)',
                animation: 'scanline-sweep 0.48s linear 0.04s forwards',
                pointerEvents: 'none',
              }} />
            </>
          )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            animation: animPhase === 'out' ? 'glitch-out 0.22s ease-in forwards'
                     : animPhase === 'in'  ? 'glitch-in 0.26s ease-out forwards'
                     : 'none',
          }}
        >
          {['1학기', '2학기'].map((sem, si) => (
            <div
              key={sem}
              style={{
                borderLeft: (si === 1 && !isMobile) ? '1px solid rgba(99,102,241,0.15)' : 'none',
                borderTop:  (si === 1 && isMobile)  ? '1px solid rgba(99,102,241,0.15)' : 'none',
                paddingLeft:  (si === 1 && !isMobile) ? '18px' : '0',
                paddingRight: (si === 0 && !isMobile) ? '18px' : '0',
                paddingTop:   (si === 1 && isMobile)  ? '14px' : '0',
              }}
            >
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
                  fontSize: '0.7rem', fontWeight: '700',
                  color: si === 0 ? '#818cf8' : '#a78bfa',
                }}>
                  {si + 1}
                </div>
                <span style={{
                  fontSize: '0.76rem', color: 'rgba(180,190,230,0.85)',
                  letterSpacing: '0.06em', fontWeight: '500',
                }}>
                  {sem}
                </span>
              </div>

              {/* 전공역량별 과목 목록 */}
              <div
                className="curriculum-scroll"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  height: isMobile ? '220px' : '300px',
                  overflowY: 'auto', paddingRight: '4px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(99,102,241,0.3) transparent',
                }}
              >
                {CAT_ORDER.map((cat) => {
                  const courses = (yearData[sem] || []).filter((c) => c.cat === cat);
                  if (!courses.length) return null;
                  const cm = CAT_META[cat];
                  return (
                    <div key={cat}>
                      {/* 전공역량 레이블 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <div style={{
                          width: '3px', height: '13px',
                          background: cm.color, borderRadius: '2px', flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '0.67rem', color: cm.color,
                          letterSpacing: '0.05em', fontWeight: '600',
                        }}>
                          {cm.icon} {cm.label}
                        </span>
                      </div>
                      {/* 과목 칩 */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', paddingLeft: '9px' }}>
                        {courses.map((course) => {
                          const tm = TYPE_META[course.type];
                          // 트랙 하이라이트 판정
                          const trackActive = selectedTrack !== null;
                          const isHighlighted = trackActive &&
                            (course.tags || []).some(t => TRACKS[selectedTrack]?.tags.includes(t));
                          const isDimmed = trackActive && !isHighlighted;

                          return (
                            <div
                              key={course.name}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '5px 10px',
                                background: isHighlighted
                                  ? 'rgba(250, 204, 21, 0.13)'
                                  : course.core ? 'rgba(251, 146, 60, 0.12)' : tm.bg,
                                border: isHighlighted
                                  ? '2px solid #facc15'
                                  : course.core ? '1px solid rgba(251,146,60,0.45)' : `1px solid ${tm.border}`,
                                borderLeft: isHighlighted
                                  ? '3px solid #facc15'
                                  : course.core ? '3px solid #fb923c' : `3px solid ${cm.color}`,
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                color: isHighlighted ? '#fef08a' : 'rgba(218, 226, 248, 0.92)',
                                lineHeight: 1.3,
                                opacity: isDimmed ? 0.22 : 1,
                                filter: isDimmed ? 'grayscale(55%)' : 'none',
                                boxShadow: isHighlighted ? '0 0 10px rgba(250,204,21,0.28)' : 'none',
                                transition: 'all 0.35s ease',
                              }}
                            >
                              <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: isHighlighted ? '#facc15' : course.core ? '#fb923c' : tm.dot,
                                flexShrink: 0, display: 'inline-block',
                              }} />
                              {course.name}
                              {course.core && (
                                <span style={{
                                  fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.04em',
                                  color: isHighlighted ? '#facc15' : '#fb923c',
                                  background: isHighlighted ? 'rgba(250,204,21,0.15)' : 'rgba(251,146,60,0.15)',
                                  border: isHighlighted ? '1px solid rgba(250,204,21,0.4)' : '1px solid rgba(251,146,60,0.4)',
                                  borderRadius: '3px', padding: '1px 4px',
                                  lineHeight: 1.4, flexShrink: 0,
                                }}>
                                  전핵
                                </span>
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
        </div> {/* 글리치 래퍼 닫기 */}
      </div>
    </section>
  );
}

// ============================================
// 생성된 맞춤 커리큘럼 표 컴포넌트
// track: TRACKS key / 1-1 ~ 4-2 단일 행 구조
// ============================================
function GeneratedCurriculumTable({ track }) {
  const tr = TRACKS[track];
  const isMobile = useIsMobile();

  // 8개 행: 학년-학기 순서
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
    return (CURRICULUM[year][sem] || []).filter(c =>
      c.tags.some(t => tr.tags.includes(t))
    );
  }

  function getCourseKind(course) {
    const isCommon = course.tags.includes('공통');
    const isTrack  = course.tags.some(t => t !== '공통' && tr.tags.includes(t));
    if (isCommon && isTrack) return 'both';
    if (isCommon) return 'common';
    return 'track';
  }

  function chipColors(kind) {
    const rgb = hexToRgb(tr.color);
    if (kind === 'common') return { bg: 'rgba(99,102,241,0.11)', border: '1.5px solid rgba(99,102,241,0.32)', color: '#a5b4fc', icon: '●' };
    if (kind === 'track')  return { bg: `rgba(${rgb},0.16)`, border: `1.5px solid ${tr.color}88`, color: tr.color, icon: '■' };
    return                        { bg: `rgba(${rgb},0.13)`, border: `2px solid ${tr.color}`,    color: tr.color, icon: '★' };
  }

  return (
    <div style={{ animation: 'table-appear 0.4s ease-out forwards' }}>
      {/* 헤더 + 범례 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px',
        borderTop: '1px solid rgba(99,102,241,0.18)',
        paddingTop: '20px', marginTop: '20px', marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>📋</span>
          <span style={{ fontSize: isMobile ? '0.82rem' : '0.9rem', fontWeight: '700', color: tr.color }}>
            {tr.label} 맞춤 커리큘럼
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { icon: '●', label: '공통 과목',      color: '#a5b4fc' },
            { icon: '■', label: `${tr.label} 전용`, color: tr.color },
            { icon: '★', label: '공통+전용',      color: tr.color },
          ].map(({ icon, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.6rem', color }}>{icon}</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(150,160,210,0.65)' }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontSize: '0.55rem', fontWeight: '700', color: '#fb923c',
              background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.4)',
              borderRadius: '3px', padding: '1px 4px',
            }}>전핵</span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(150,160,210,0.65)' }}>전공핵심</span>
          </div>
        </div>
      </div>

      {/* 행 목록: 1-1 ~ 4-2 */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ROWS.map(({ label, year, sem }, idx) => {
          const courses = getFilteredCourses(year, sem);
          const isNewYear = label.endsWith('-1');
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                gap: isMobile ? '10px' : '16px',
                alignItems: 'flex-start',
                padding: `${isMobile ? '9px' : '11px'} 0`,
                borderBottom: '1px solid rgba(99,102,241,0.08)',
                borderTop: isNewYear && idx > 0
                  ? '2px solid rgba(99,102,241,0.18)'
                  : 'none',
              }}
            >
              {/* 학기 레이블 (1-1, 1-2 …) */}
              <div style={{
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                fontWeight: '800',
                color: label.endsWith('-1') ? 'rgba(129,140,248,0.85)' : 'rgba(167,139,250,0.75)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                minWidth: isMobile ? '28px' : '34px',
                paddingTop: '3px',
                flexShrink: 0,
              }}>
                {label}
              </div>

              {/* 과목 칩 */}
              {courses.length === 0 ? (
                <span style={{ fontSize: '0.68rem', color: 'rgba(120,130,175,0.3)', paddingTop: '3px' }}>—</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', flex: 1 }}>
                  {courses.map((course) => {
                    const kind = getCourseKind(course);
                    const { bg, border, color, icon } = chipColors(kind);
                    return (
                      <div key={course.name} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: isMobile ? '3px 7px' : '4px 9px',
                        background: bg, border, borderRadius: '6px',
                        fontSize: isMobile ? '0.68rem' : '0.72rem',
                        color, lineHeight: 1.3,
                      }}>
                        <span style={{ fontSize: '0.5rem', flexShrink: 0 }}>{icon}</span>
                        {course.name}
                        {course.core && (
                          <span style={{
                            fontSize: '0.55rem', fontWeight: '700', color: '#fb923c',
                            background: 'rgba(251,146,60,0.15)',
                            border: '1px solid rgba(251,146,60,0.4)',
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
// 나만의 커리큘럼 짜기 섹션 (섹션 3)
// ============================================
function CustomCurriculumSection({ selectedTrack, onGenerate }) {
  const [pendingTrack,   setPendingTrack]   = useState(null);
  const [generatedTrack, setGeneratedTrack] = useState(null);
  const [showTable,      setShowTable]      = useState(false);
  const isMobile = useIsMobile();

  const handleCard = (key) => setPendingTrack(prev => prev === key ? null : key);

  const handleGenerate = () => {
    if (!pendingTrack) return;
    onGenerate(pendingTrack);
    setGeneratedTrack(pendingTrack);
    setShowTable(true);
  };

  return (
    <section
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: showTable ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: showTable
          ? `3vh ${isMobile ? '4vw' : '5vw'} 0`
          : `0 ${isMobile ? '4vw' : '5vw'}`,
        overflowY: showTable ? 'visible' : 'hidden',
      }}
    >
      <div
        className="custom-curriculum-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          background: 'rgba(8, 9, 18, 0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '40px 44px',
          pointerEvents: 'auto',
          maxHeight: showTable ? '90vh' : 'none',
          overflowY: showTable ? 'auto' : 'visible',
        }}
      >
        {/* 헤더 */}
        <p className="dept-label">My Curriculum</p>
        <h2 className="section-title" style={{ marginBottom: '8px' }}>나만의 커리큘럼 짜기</h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(150,160,210,0.7)', marginBottom: '32px', lineHeight: 1.6 }}>
          관심 분야를 선택하면 학과 커리큘럼에서 맞춤 과목을 추천해드려요
        </p>

        {/* 트랙 카드 5개 */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {TRACK_KEYS.map((key) => {
            const tr = TRACKS[key];
            const isSelected = pendingTrack === key;
            const isApplied  = selectedTrack === key;
            return (
              <button
                key={key}
                onClick={() => handleCard(key)}
                style={{
                  flex: '1 1 140px',
                  padding: '18px 16px',
                  background: isSelected
                    ? `rgba(${hexToRgb(tr.color)}, 0.15)`
                    : 'rgba(99,102,241,0.06)',
                  border: `1.5px solid ${isSelected ? tr.color : 'rgba(99,102,241,0.22)'}`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.22s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 선택된 트랙 상단 컬러바 */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: isSelected ? tr.color : 'transparent',
                  transition: 'background 0.22s ease',
                }} />

                {/* 적용 중 표시 */}
                {isApplied && (
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.05em',
                    color: tr.color, background: `rgba(${hexToRgb(tr.color)}, 0.15)`,
                    border: `1px solid ${tr.color}`, borderRadius: '3px', padding: '1px 5px',
                  }}>
                    적용중
                  </div>
                )}

                <div style={{
                  fontSize: '0.92rem', fontWeight: '700', letterSpacing: '0.02em',
                  color: isSelected ? tr.color : 'rgba(180,190,230,0.9)',
                  marginBottom: '6px',
                  transition: 'color 0.22s ease',
                }}>
                  {tr.label}
                </div>
                <div style={{
                  fontSize: '0.72rem', color: 'rgba(130,140,185,0.72)', lineHeight: 1.5,
                }}>
                  {tr.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* 생성 버튼 */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '14px',
        }}>
          <button
            onClick={handleGenerate}
            disabled={!pendingTrack}
            style={{
              padding: isMobile ? '14px 24px' : '13px 32px',
              background: pendingTrack
                ? `linear-gradient(135deg, ${TRACKS[pendingTrack].color}, #4f46e5)`
                : 'rgba(99,102,241,0.15)',
              border: pendingTrack
                ? 'none'
                : '1px solid rgba(99,102,241,0.3)',
              borderRadius: '100px',
              color: pendingTrack ? '#fff' : 'rgba(140,150,200,0.5)',
              fontSize: isMobile ? '0.95rem' : '0.9rem',
              fontWeight: '600',
              letterSpacing: '0.04em',
              cursor: pendingTrack ? 'pointer' : 'not-allowed',
              boxShadow: pendingTrack ? '0 4px 24px rgba(79,70,229,0.35)' : 'none',
              transition: 'all 0.25s ease',
              textAlign: 'center',
            }}
          >
            맞춤 커리큘럼 생성하기 →
          </button>

          {selectedTrack && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(150,160,210,0.65)', textAlign: isMobile ? 'center' : 'left' }}>
              현재 적용: <span style={{ color: TRACKS[selectedTrack].color, fontWeight: '600' }}>
                {TRACKS[selectedTrack].label}
              </span>
            </span>
          )}
        </div>

        {/* 생성된 맞춤 커리큘럼 표 */}
        {showTable && generatedTrack && (
          <GeneratedCurriculumTable
            key={generatedTrack}
            track={generatedTrack}
          />
        )}
      </div>
    </section>
  );
}

// hex → "r, g, b" 변환 유틸 (inline rgba에 사용)
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ============================================
// HTML UI 오버레이 - 글래스모피즘 카드들
// Scroll html 내부에서 스크롤에 동기화
// ============================================
function HeroUI({ curriculumRef, professorRef, selectedTrack, onGenerate }) {
  return (
    <div style={{ width: '100%', pointerEvents: 'none' }}>

      {/* ── 섹션 1: 메인 슬로건 카드 (좌측 하단 - 서버랙과 비겹침) ── */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 6vw 7vh',
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: '420px',
            pointerEvents: 'auto',
          }}
        >
          {/* 학교/학과 레이블 */}
          <p className="dept-label">Seokyeong University</p>

          {/* 메인 타이틀 */}
          <h1 className="main-title">
            소프트웨어학과
          </h1>

          {/* 서브 타이틀 */}
          <p className="sub-title">미래를 코딩하다</p>

          <div className="card-divider" />

          {/* 설명 텍스트 */}
          <p className="desc-text">
            최첨단 기술과 창의적 사고를 융합하여<br />
            디지털 세상을 이끌어갈 글로벌 인재를 양성합니다.<br />
            인공지능, 클라우드, 빅데이터의 최전선에서<br />
            여러분의 꿈을 현실로 만들어 드립니다.
          </p>

          {/* 기술 배지 그룹 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '24px' }}>
            <span className="tech-badge">AI · 인공지능</span>
            <span className="tech-badge">클라우드</span>
            <span className="tech-badge">빅데이터</span>
          </div>

          {/* 스크롤 힌트 */}
          <div className="scroll-hint">
            <span className="scroll-hint__text">Scroll</span>
            <div className="scroll-hint__line" />
          </div>
        </div>
      </section>

      {/* ── 섹션 2: 학과 커리큘럼 탭 ── */}
      <CurriculumSection domRef={curriculumRef} selectedTrack={selectedTrack} />

      {/* ── 섹션 3: 나만의 커리큘럼 짜기 ── */}
      <CustomCurriculumSection
        selectedTrack={selectedTrack}
        onGenerate={onGenerate}
      />

      {/* ── 섹션 4: 교수 소개 카드뉴스 ── */}
      <ProfessorSection contentRef={professorRef} />

    </div>
  );
}

// ============================================
// 로딩 폴백 컴포넌트
// ============================================
function LoadingFallback() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0b10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div style={{ textAlign: 'center', color: 'rgba(160, 170, 220, 0.7)' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '2px solid rgba(79, 70, 229, 0.3)',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ fontSize: '0.85rem', letterSpacing: '0.15em' }}>로딩 중...</p>
      </div>
    </div>
  );
}

// ============================================
// 메인 히어로 컴포넌트 (최상위 export)
// ============================================
// 스크롤 컨테이너를 Canvas 외부로 노출시키는 브릿지
function ScrollContainerBridge({ elRef }) {
  const scroll = useScroll();
  useFrame(() => { if (!elRef.current) elRef.current = scroll.el; });
  return null;
}

export default function SeokyeongHero() {
  // 마우스 위치 ref - Canvas 외부에서 추적하여 3D 씬에 전달
  const mouseRef = useRef({ x: 0, y: 0 });

  // 커리큘럼 카드 DOM ref - ScrollBridge가 터널 종료 후 opacity 제어
  const curriculumRef = useRef(null);

  // 교수 소개 섹션 DOM ref - ScrollBridge가 offset 0.85부터 표시
  const professorRef = useRef(null);

  // 나만의 커리큘럼: 선택된 트랙 + drei 스크롤 컨테이너 ref
  const [selectedTrack, setSelectedTrack] = useState(null);
  const scrollElRef = useRef(null);

  // "맞춤 커리큘럼 생성하기" 클릭 핸들러
  // 섹션 2 스크롤 대신 섹션 3 내부에 인라인 표를 생성하는 방식으로 변경
  const handleGenerate = (track) => {
    setSelectedTrack(track);
  };

  const handleMouseMove = (e) => {
    // -1 ~ 1 범위로 정규화, Y축 반전 (Three.js 좌표계)
    mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.y = -((e.clientY / window.innerHeight - 0.5) * 2);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#0a0b10',
        overflow: 'hidden',
      }}
    >
      {/* ── 노이즈 텍스처 오버레이 (CSS로 처리) ── */}
      <div className="noise-overlay" style={{ zIndex: 3, pointerEvents: 'none' }} />

      {/* ── Three.js Canvas (전체 화면 고정) ── */}
      <Canvas
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
        }}
        camera={{
          position: [0, 0, 6.2],
          fov: 52,
          near: 0.1,
          far: 500,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        shadows
      >
        <Suspense fallback={null}>
          {/*
            ScrollControls: 스크롤을 Three.js 생태계로 가져옴
            pages: 3  → 뷰포트 높이 기준 3페이지 분량의 스크롤
            damping: 스크롤 관성 (낮을수록 빠르게 반응)
            distance: 스크롤 감도 배율
          */}
          <ScrollControls pages={4} damping={0.04} distance={1}>

            {/* 서버랙 + 바닥을 Scroll 안에 함께 배치
                → 스크롤 시 같은 좌표계에서 함께 위로 올라가므로
                  랙이 바닥을 뚫는 현상 없음, 터널 등장 시 자연스럽게 사라짐 */}
            <Scroll>
              <Scene />
              <FloorReflection />
              <ServerRack mouseRef={mouseRef} />
            </Scroll>

            {/* 사이버터널 - Scroll 밖에서 뷰포트 정중앙 고정 */}
            <CyberTunnel />

            {/* 터널 종료 후 커리큘럼/교수 섹션 DOM 제어 (Canvas ↔ HTML 브릿지) */}
            <ScrollBridge curriculumRef={curriculumRef} professorRef={professorRef} />

            {/* drei 스크롤 컨테이너 ref 수집 */}
            <ScrollContainerBridge elRef={scrollElRef} />

            {/* HTML UI 오버레이 레이어 - 스크롤에 동기화 */}
            <Scroll html style={{ width: '100%' }}>
              <HeroUI
                curriculumRef={curriculumRef}
                professorRef={professorRef}
                selectedTrack={selectedTrack}
                onGenerate={handleGenerate}
              />
            </Scroll>

          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* 로딩 중 보여줄 스피너 CSS */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── 커리큘럼 탭 전환: 스캔라인 글리치 ── */
        @keyframes scanline-sweep {
          0%   { top: -4px;         opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { top: calc(100% + 4px); opacity: 0; }
        }

        /* 콘텐츠 퇴장: 글리치되며 사라짐 */
        @keyframes glitch-out {
          0%   { opacity: 1;   transform: translateX(0)   skewX(0deg);   filter: blur(0); }
          15%  { opacity: 0.8; transform: translateX(-4px) skewX(-0.4deg); }
          35%  { opacity: 0.5; transform: translateX(3px)  skewX(0.3deg);  filter: blur(1px); }
          60%  { opacity: 0.2; transform: translateX(-2px) skewX(0deg);   filter: blur(3px); }
          100% { opacity: 0;   transform: translateX(0);                   filter: blur(0); }
        }

        /* 콘텐츠 등장: 블러에서 선명하게 */
        @keyframes glitch-in {
          0%   { opacity: 0;   transform: translateX(6px)  skewX(0.5deg);  filter: blur(6px); }
          20%  { opacity: 0.4; transform: translateX(-3px) skewX(-0.3deg); filter: blur(3px); }
          50%  { opacity: 0.7; transform: translateX(2px)  skewX(0.2deg);  filter: blur(1px); }
          80%  { opacity: 0.9; transform: translateX(-1px) skewX(0deg);    filter: blur(0.3px); }
          100% { opacity: 1;   transform: translateX(0);                    filter: blur(0); }
        }

        /* ── 나만의 커리큘럼: 트랙 카드 hover ── */
        .track-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        }

        .curriculum-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .curriculum-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .curriculum-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .curriculum-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.55);
        }

        /* ── 맞춤 커리큘럼 카드 스크롤바 ── */
        .custom-curriculum-card::-webkit-scrollbar { width: 4px; }
        .custom-curriculum-card::-webkit-scrollbar-track { background: transparent; }
        .custom-curriculum-card::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 2px;
        }
        .custom-curriculum-card::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.55);
        }

        /* ── 맞춤 커리큘럼 표 등장 애니메이션 ── */
        @keyframes table-appear {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
