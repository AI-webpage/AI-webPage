import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import imgImpact from "../../../assets/images/아시아 임팩트 해커톤.svg";
import imgUMC from "../../../assets/images/UMC 데모데이.svg";
import imgSkthon from "../../../assets/images/서경대 해커톤.svg";
import imgPccp from "../../../assets/images/프로그래밍경진대회.svg";
import imgHecto from "../../../assets/images/헥토 상반기 성과 발표회.svg";
import imgCoop from "../../../assets/images/대학기업 협력형 경진대회.svg";
import imgLikelion from "../../../assets/images/멋쟁이사자처럼.svg";

/**
 * SUPPORT & AWARDS — 부채살(arc fan) 카드 캐러셀.
 *
 * 카드 디자인은 awardCard.png 를 그대로 따른다:
 *  - 카드 전체가 솔리드 메인 컬러(카드마다 다름) + 연회색 둥근 프레임
 *  - 상단 검정 굵은 제목 / 중앙 둥근 사진 / 좌하단 검정 설명 / 우하단 검정 리본 배지(흰 글씨)
 *
 * 배치:
 *  - 비활성 카드는 카드 중심에서 아래로 D만큼 떨어진 한 점(피벗)을 중심으로 회전 →
 *    모든 비활성 카드(scale=1)가 동일한 아랫변 호(반경 D-HALF) 위에 정렬.
 *  - 활성 카드만 같은 피벗 기준 scale=ACT_SCALE → 곡선보다 위로 솟아오름.
 *  - 회전위치(center)와 선택카드(active) 분리. 화살표/드래그/키보드는 center만,
 *    클릭은 ±2장까지만 center=active 이동.
 *
 * props
 *  - reveal: 0~1. 스크롤 진행도. 카드들만 배경 위로 아래에서 위로 올라온다.
 */

/* 카드 데이터 (총 8장 = 수상 6 + 프로그램 2). bg = 카드 메인 컬러(서로 다름).
   ⚠️ 카드0 은 awardCard.png 기준 정확본. 나머지 한글은 원본 스펙이 깨져 복원본이니 확인/수정하세요.
   img 경로(예: "/assets/cards/0.svg" 또는 사진 png)를 채우면 이모지 대신 표시됩니다. */
const CARDS = [
  {
    ico: "🏆",
    img: imgImpact,
    bg: "#ffffff",
    title: "2025 아시아\n임팩트 해커톤",
    desc: "Google 후원\n연세대 주최\n아시아 12개국 300여 팀",
    badge: "대상",
  },
  {
    ico: "⌨️",
    img: imgUMC,
    bg: "#BB3259",
    title: "UMC 7th\n데모데이",
    desc: "대학생 IT 연합동아리\nUMC Demo Day",
    badge: "대상",
  },
  {
    ico: "🎯",
    img: imgSkthon,
    bg: "#F0C850",
    title: "서경대 해커톤\n(SKTHON)",
    desc: "제1회 · 멋쟁이사자처럼\n× 서경대학교",
    badge: "대상·최우수·우수",
  },
  {
    ico: "💻",
    img: imgPccp,
    bg: "#1F72B8",
    title: "서경대 총장배\n프로그래밍 경진대회",
    desc: "제2회 · PCCP\n상금 30만원",
    badge: "우수상",
  },
  {
    ico: "🤝",
    img: imgHecto,
    bg: "#ffffff",
    title: "(주)헥토」 상반기\n성과발표회",
    desc: "2025 상반기 발표회\n상금 100만원",
    badge: "금상",
  },
  {
    ico: "🤖",
    img: imgCoop,
    bg: "#BB3259",
    title: "제4회 대학-기업\n협력형 경진대회",
    desc: "서경SW아카데미 주관",
    badge: "우승",
  },
  {
    ico: "🦦",
    img: imgLikelion,
    bg: "#F0C850",
    title: "멋쟁이사자처럼",
    desc: "전국연합 코딩 동아리\nPO·FE·BE 모집",
    badge: "프로그램",
  },
  {
    ico: "SW",
    img: "",
    bg: "#1F72B8",
    title: "대학-기업 협력형\nSW 아카데미",
    desc: "기업과 협력\n한 학기 프로젝트",
    badge: "프로그램",
  },
];

/* ───── 레이아웃 기본값 ───── */
const CARD_W = 420;
const CARD_H = 530;
const HALF = CARD_H / 2;
const GAP_DEG = 2;
const ACT_SCALE = 1.13;
const HIDE_FACTOR = 2.5; // 중심 ±2장(=5장)만 보이고 그 바깥은 숨김(화면 크기 무관)
const PXSTEP = 140;
const CLICK_RANGE = 2;
const DRAG_THRESHOLD = 6;
const N = CARDS.length;

/* 순환 오프셋: i-center 를 [-N/2, N/2] 로 감아 무한 회전 가능하게 */
const wrapOffset = (d) => {
  d = ((d % N) + N) % N;
  if (d > N / 2) d -= N;
  return d;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* 고정 설계 지오메트리(px) — 반응형은 전체 scale 로 처리(랜딩 DesignStage 방식). */
const D = 1200; // 곡선 반경(피벗까지 거리)
const STEP = (CARD_W / (D - HALF)) * (180 / Math.PI) + GAP_DEG; // 카드 간 각도
const HIDE_DEG = HIDE_FACTOR * STEP; // 중심 ±2장(5장)만 보임

/* 반응형: 설계 기준 뷰포트(BASE) 대비 화면에 맞춰 통째로 축소/확대 */
const BASE_W = 2400;
const BASE_H = 1150;
const SCALE_MIN = 0.3;
const SCALE_MAX = 1.05;
function computeScale() {
  if (typeof window === "undefined") return 1;
  return clamp(
    Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H),
    SCALE_MIN,
    SCALE_MAX,
  );
}

const splitLines = (t) =>
  t.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 ? <br /> : null}
    </span>
  ));

export default function AwardsCarousel({ reveal = 0 }) {
  const [center, setCenter] = useState(6);
  const [active, setActive] = useState(-1); // 처음엔 아무 카드도 활성화 안 함(클릭해야 솟음)
  const [scale, setScale] = useState(computeScale); // 반응형 전체 스케일
  const [dragging, setDragging] = useState(false);
  const [dismissed, setDismissed] = useState(false); // 배경/X 클릭 시 아래로 슬라이드되어 사라짐

  const stageRef = useRef(null);
  const dragRef = useRef({
    down: false,
    startX: 0,
    startCenter: 6,
    dragged: false,
    onCard: false,
  });

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScale(computeScale());
      });
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 스크롤로 다시 올라오면(=섹션 재진입) 닫힘 상태 해제 (스크롤 prop 동기화 목적)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reveal < 0.05 && dismissed) setDismissed(false);
  }, [reveal, dismissed]);

  const move = useCallback((dir) => {
    setCenter((c) => c + dir); // 클램프 없음 → 무한(순환) 회전
    setActive(-1);
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  const clickCard = useCallback(
    (i) => {
      if (dragRef.current.dragged) return;
      if (Math.abs(wrapOffset(i - center)) > CLICK_RANGE) return;
      // 클릭한 카드만 위로 솟음 / 다시 클릭하면 제자리. (다른 동작 없음)
      setActive((a) => (a === i ? -1 : i));
      setCenter((c) => (wrapOffset(i - c) === 0 ? c : i));
    },
    [center],
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move(1);
      }
    },
    [move],
  );

  // 포인터 다운: 드래그 시작점 기록(포인터 캡처는 쓰지 않는다 → 클릭 타깃 변질 방지)
  const onPointerDown = useCallback(
    (e) => {
      dragRef.current = {
        down: true,
        startX: e.clientX,
        startCenter: center,
        dragged: false,
        onCard: !!(e.target.closest && e.target.closest("[data-card]")),
      };
      setDragging(true);
    },
    [center],
  );

  // move/up 은 window 에 묶어 stage 밖으로 나가도 드래그가 이어지게(예시 코드와 동일)
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d.down) return;
      const dx = e.clientX - d.startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) d.dragged = true;
      setCenter(d.startCenter + Math.round(-dx / PXSTEP)); // 순환
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d.down) return;
      d.down = false;
      setDragging(false);
      if (d.dragged) {
        setActive(-1); // 실제로 돌렸으면 선택 해제(스냅)
      } else if (!d.onCard) {
        dismiss(); // 드래그 아님 + 배경(빈 곳) 클릭 → 닫기
      }
      // 카드 위에서의 클릭(=선택)은 카드 onClick(clickCard)이 처리
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dismiss]);

  const hiddenDown = dismissed && reveal > 0.05; // 닫혀서 아래로 내려간 상태
  const interactive = reveal > 0.98 && !dismissed;

  return (
    <Root
      style={{
        transform: `translateY(${hiddenDown ? 100 : (1 - reveal) * 100}%)`,
        opacity: reveal > 0 ? 1 : 0,
        transition: hiddenDown
          ? "transform .5s cubic-bezier(.4,0,.2,1)"
          : "none",
      }}
      aria-hidden={reveal < 0.5}
    >
      <Close
        type="button"
        aria-label="닫기"
        onClick={dismiss}
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        ✕
      </Close>

      <Stage
        ref={stageRef}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={onKeyDown}
        onPointerDown={interactive ? onPointerDown : undefined}
        style={{ pointerEvents: interactive ? "auto" : "none" }}
      >
        <Fan style={{ transform: `scale(${scale})` }}>
          {CARDS.map((card, i) => {
          const off = wrapOffset(i - center);
          const deg = off * STEP;
          const isActive = active === i;
          const hidden = Math.abs(deg) > HIDE_DEG;
          const cardScale = isActive ? ACT_SCALE : 1;
          const z = isActive ? 1000 : Math.round(200 - Math.abs(deg));
          const clickable = Math.abs(off) <= CLICK_RANGE && !hidden;

          return (
            <Card
              key={i}
              type="button"
              data-card=""
              data-active={isActive}
              onClick={() => clickCard(i)}
              style={{
                transformOrigin: `50% ${HALF + D}px`,
                transform: `rotate(${deg}deg) scale(${cardScale})`,
                transition: dragging
                  ? "none"
                  : "transform .55s cubic-bezier(.22,.61,.36,1), opacity .55s cubic-bezier(.22,.61,.36,1)",
                opacity: hidden ? 0 : 1,
                zIndex: z,
                cursor: clickable ? "pointer" : "default",
                "--bg": card.bg,
              }}
            >
              <span className="card-inner">
                <span className="card-title">{splitLines(card.title)}</span>

                <span className="card-media">
                  {card.img ? (
                    <img
                      src={card.img}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="card-ico" aria-hidden="true">
                      {card.ico}
                    </span>
                  )}
                </span>

                <span className="card-foot">
                  <span className="card-desc">{splitLines(card.desc)}</span>
                  <span className="card-badge">{card.badge}</span>
                </span>
              </span>
            </Card>
          );
          })}
        </Fan>
      </Stage>

      <Arrows style={{ pointerEvents: interactive ? "auto" : "none" }}>
        <button
          type="button"
          className="arrow"
          aria-label="이전"
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="arrow"
          aria-label="다음"
          onClick={() => move(1)}
        >
          ›
        </button>
      </Arrows>
    </Root>
  );
}

/* ───── styled ───── */
const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40; /* 배경(0)·텍스트(4)·명함(5)·힌트(6) 위, 헤더(50)·모달(120) 아래 */
  background: transparent; /* 창이 아니라 카드들만 배경 위로 올라온다 */
  pointer-events: none; /* 내부 인터랙티브 요소만 auto */
  overflow: hidden;
  font-family: "Poppins", "Pretendard", system-ui, sans-serif;
  will-change: transform;
`;

const Stage = styled.div`
  position: absolute;
  inset: 0;
  touch-action: pan-y; /* 세로 스크롤은 페이지로, 가로 제스처만 캐러셀 */
  outline: none;
`;

/* 반응형 스케일 래퍼 — 고정 px 지오메트리를 화면에 맞춰 통째로 축소/확대.
   카드 앵커(50% 62%) 기준으로 스케일해 중심 카드 위치가 유지된다. */
const Fan = styled.div`
  position: absolute;
  inset: 0;
  transform-origin: 50% 62%;
  will-change: transform;
`;

const Card = styled.button`
  position: absolute;
  left: 50%;
  top: 62%;
  width: ${CARD_W}px;
  height: ${CARD_H}px;
  margin-left: -${CARD_W / 2}px;
  margin-top: -${HALF}px;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;

  /* === awardCard.png 카드 (radius 없음 · 겉 테두리 검정) === */
  .card-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 22px 22px 20px;
    border-radius: 0;
    background: var(--bg);
    border: 1px solid #111; /* 겉 테두리 검정(얇게) */
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    text-align: left;
    color: #111;
  }
  &:hover .card-inner {
    transform: translateY(-12px);
  }
  &[data-active="true"] .card-inner {
    box-shadow: 0 26px 58px rgba(0, 0, 0, 0.55);
  }

  /* 상단 검정 제목 (중앙 정렬) */
  .card-title {
    text-align: center;
    font-size: 40px;
    font-weight: 800;
    line-height: 1.22;
    letter-spacing: -0.01em;
    color: #111;
    margin: 2px 0 18px;
  }

  /* 중앙 사진 — 감싸는 네모칸 없이 사진만 (배경/테두리 X) */
  .card-media {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    flex: 1;
    min-height: 0;
    background: transparent;
    border: 0;
    overflow: visible;
    img {
      width: 90%;
      height: 90%;
      object-fit: contain;
    }
    .card-ico {
      font-size: 130px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: 0.02em;
      color: #111;
    }
  }

  /* 하단: 좌측 설명 + 우측 리본 배지 */
  .card-foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: 16px;
  }
  .card-desc {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.4;
    color: #111;
  }
  /* 배지("상") = 검정 배경 + 글씨색은 해당 카드색, 리본 형태 */
  .card-badge {
    flex: 0 0 auto;
    background: #111;
    color: var(--bg);
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 0.02em;
    padding: 10px 28px 10px 18px;
    white-space: nowrap;
    transform: translateY(-14px); /* 배지만 살짝 위로 */
    clip-path: polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%);
  }
`;

/* 닫기(X) — 우상단 */
const Close = styled.button`
  position: absolute;
  top: clamp(16px, 3vw, 30px);
  right: clamp(16px, 3vw, 30px);
  z-index: 1100;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  color: #111;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transition:
    background 0.15s ease,
    transform 0.15s ease;
  &:hover {
    background: #fff;
  }
  &:active {
    transform: scale(0.94);
  }
`;

const Arrows = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  .arrow {
    position: absolute;
    top: 62%;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.18);
    background: rgba(255, 255, 255, 0.82);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    color: #111;
    font-size: 30px;
    line-height: 1;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
    transition:
      background 0.15s ease,
      transform 0.15s ease;
  }
  .arrow:hover {
    background: #fff;
  }
  .arrow:active {
    transform: translateY(-50%) scale(0.94);
  }
  .arrow:first-child {
    left: clamp(16px, 4vw, 56px);
  }
  .arrow:last-child {
    right: clamp(16px, 4vw, 56px);
  }
`;
