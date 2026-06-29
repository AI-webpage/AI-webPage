// ============================================================
// 교수 소개 카드 - 앞면: 교수진 이미지 레이아웃 / 뒷면: 선배 꿀팁
// ============================================================

export const CARD_W = 400;
export const CARD_H = 400;

// 배경색이 밝은지 판별 (뒷면 텍스트 색상 결정)
function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 145;
}

// 세부 정보 행 (전공분야 / 연구실 / Email)
function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <span style={{
        fontSize: '0.6rem',
        fontWeight: '700',
        color: 'rgba(140, 150, 200, 0.55)',
        letterSpacing: '0.04em',
        flexShrink: 0,
        paddingTop: '2px',
        minWidth: '40px',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.7rem',
        color: 'rgba(185, 195, 235, 0.88)',
        lineHeight: 1.45,
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  );
}

// ── 앞면 ─────────────────────────────────────────────────────
// 레이아웃: 교수진 앞면 이미지 구성 그대로
// ┌────────────────────────────────────┐
// │ [전공교수]            [01 / 09]   │
// │      소프트웨어학과 교수진         │
// ├────────────────────────────────────┤
// │ [아바타 140px]   이름 (large)     │
// │                  학위             │
// │                  PROFESSOR        │
// ├────────────────────────────────────┤
// │ 전공분야: ...                     │
// │ 연구실: ... · phone               │
// │ Email: ...                        │
// ├────────────────────────────────────┤
// │ ⊙ 카드를 눌러 선배 꿀팁 보기     │
// └────────────────────────────────────┘
function CardFront({ data, index, total }) {
  const AVATAR = 140;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderRadius: '24px',
        background: 'rgba(11, 11, 26, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(24px)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* 상단 컬러 라인 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${data.avatarColor} 0%, transparent 100%)`,
        borderRadius: '24px 24px 0 0',
      }} />

      {/* 헤더: 카테고리 + 페이지 번호 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: '800',
          letterSpacing: '0.14em',
          color: data.avatarColor,
          textTransform: 'uppercase',
        }}>
          {data.category}
        </span>
        <span style={{
          fontSize: '0.65rem',
          color: 'rgba(140, 150, 200, 0.5)',
          letterSpacing: '0.08em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* 섹션 타이틀 */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.72rem',
        fontWeight: '600',
        color: 'rgba(140, 150, 200, 0.55)',
        letterSpacing: '0.07em',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '16px',
      }}>
        소프트웨어학과 교수진
      </div>

      {/* 메인: 아바타(좌) + 이름/직위(우) */}
      <div style={{
        display: 'flex',
        gap: '18px',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        {/* 아바타 */}
        <div style={{
          width: `${AVATAR}px`,
          height: `${AVATAR}px`,
          borderRadius: '20px',
          background: data.avatarColor,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `0 8px 28px ${data.avatarColor}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.8rem',
          fontWeight: '800',
          color: '#fff',
        }}>
          <span style={{ position: 'relative', zIndex: 0 }}>
            {data.nameInitial}
          </span>
          <img
            src={`/professors/avatar/prof_${String(data.id).padStart(2, '0')}.png`}
            alt={data.name}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />
        </div>

        {/* 이름 + 직위 */}
        <div style={{ flex: 1, paddingTop: '10px' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#eaedff',
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            marginBottom: '12px',
          }}>
            {data.name}
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: 'rgba(160, 170, 220, 0.65)',
            marginBottom: '5px',
            letterSpacing: '0.03em',
          }}>
            {/* "교수 · 공학박사" → "공학박사" 부분만 */}
            {data.position.includes('·')
              ? data.position.split('·')[1].trim()
              : data.position}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '800',
            color: data.avatarColor,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            PROFESSOR
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div style={{
        height: '1px',
        background: 'rgba(255, 255, 255, 0.05)',
        marginBottom: '14px',
      }} />

      {/* 세부 정보 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <InfoRow label="전공분야" value={data.specialization} />
        <InfoRow label="연구실" value={`${data.lab} · ${data.phone}`} />
        <InfoRow label="Email" value={data.email} />
      </div>

      {/* 하단 힌트 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '10px',
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '1.5px solid rgba(140, 150, 200, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'rgba(140, 150, 200, 0.35)',
          }} />
        </div>
        <span style={{
          fontSize: '0.65rem',
          //color: 'rgba(140, 150, 200, 0.4)',
          color: data.avatarColor,
          letterSpacing: '0.03em',
          fontWeight: 800
        }}>
          카드를 눌러 선배 꿀팁 보기
        </span>
      </div>
    </div>
  );
}

// ── 뒷면 ─────────────────────────────────────────────────────
// 교수님 뒷면 이미지와 동일한 색감/구성
// - 배경: avatarColor (교수별 고유 색)
// - 텍스트: 밝은 배경→어두운 글자 / 어두운 배경→흰 글자
function CardBack({ data }) {
  const light = isLightColor(data.avatarColor);
  const textMain   = light ? 'rgba(15, 15, 30, 0.92)'  : 'rgba(240, 243, 255, 0.95)';
  const textSub    = light ? 'rgba(15, 15, 30, 0.65)'  : 'rgba(240, 243, 255, 0.65)';
  const divider    = light ? 'rgba(0, 0, 0, 0.14)'     : 'rgba(255, 255, 255, 0.22)';
  const badgeBg    = light ? 'rgba(0, 0, 0, 0.10)'     : 'rgba(255, 255, 255, 0.18)';
  const bulletColor = light ? 'rgba(0, 0, 0, 0.35)'    : 'rgba(255, 255, 255, 0.5)';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        borderRadius: '24px',
        background: data.avatarColor,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0,0,0,0.55)',
      }}
    >
      {/* 헤더: "○○ 교수님한테서 살아남는 선배들의 꿀팁!" */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '0.82rem',
          fontWeight: '700',
          color: textMain,
          lineHeight: 1.4,
          marginBottom: '2px',
        }}>
          {data.name} 교수님한테서 살아남는
        </div>
        <div style={{
          fontSize: '1.15rem',
          fontWeight: '900',
          color: textMain,
          letterSpacing: '-0.01em',
        }}>
          선배들의 꿀팁!
        </div>
      </div>

      <div style={{ height: '1.5px', background: divider, marginBottom: '18px' }} />

      {/* 꿀팁 bullet points */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '1rem',
              color: bulletColor,
              flexShrink: 0,
              lineHeight: 1.3,
            }}>
              •
            </span>
            <span style={{
              fontSize: '0.78rem',
              color: textMain,
              lineHeight: 1.6,
              wordBreak: 'keep-all',
            }}>
              {tip}
            </span>
          </div>
        ))}
      </div>

      {/* 연구분야 뱃지 */}
      <div style={{
        marginTop: '18px',
        paddingTop: '14px',
        borderTop: `1.5px solid ${divider}`,
      }}>
        <div style={{
          fontSize: '0.58rem',
          fontWeight: '700',
          color: textSub,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          연구분야
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {data.research.map((r, i) => (
            <span key={i} style={{
              fontSize: '0.63rem',
              padding: '3px 9px',
              borderRadius: '100px',
              background: badgeBg,
              color: textMain,
              letterSpacing: '0.02em',
              fontWeight: '600',
            }}>
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 메인 카드 컴포넌트 ────────────────────────────────────────
export default function ProfessorCard({ data, index, total, isFlipped }) {
  return (
    <div
      style={{
        width: `${CARD_W}px`,
        height: `${CARD_H}px`,
        flexShrink: 0,
        perspective: '1200px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <CardFront data={data} index={index} total={total} />
        <CardBack data={data} />
      </div>
    </div>
  );
}
