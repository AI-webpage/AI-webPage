// ============================================================
// 교수 소개 섹션 래퍼
// SeokyeongHero의 4번째 섹션 (height: 100vh)
// contentRef: ScrollBridge가 opacity를 제어하는 컨테이너 ref
// ============================================================

import ProfessorCarousel from './ProfessorCarousel';

export default function ProfessorSection({ contentRef }) {
  return (
    <section
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        position: 'relative',
      }}
    >
      {/* ScrollBridge가 opacity / pointerEvents를 직접 제어 */}
      <div
        ref={contentRef}
        style={{
          width: '100%',
          maxWidth: '960px',
          opacity: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 섹션 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p className="dept-label">Faculty · 교수 소개</p>
          <h2 className="section-title" style={{ marginBottom: '8px' }}>
            교수진 소개
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: 'rgba(150, 160, 210, 0.65)',
            lineHeight: 1.6,
          }}>
            서경대학교 소프트웨어학과 교수진을 소개합니다
          </p>
        </div>

        {/* 캐러셀 */}
        <div style={{ width: '100%' }}>
          <ProfessorCarousel />
        </div>
      </div>
    </section>
  );
}
