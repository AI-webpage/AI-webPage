import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Header from "../../components/Header";
import ScrollVideoBackground from "./ScrollVideoBackground";
import HomeIntro from "./HomeIntro";
import FacultySides from "./FacultySides";
import CurriculumPanel from "./curriculum/CurriculumPanel";
import AwardsCarousel from "./awards/AwardsCarousel";
import campusVideo from "../../assets/video/campusMove.MP4";
import { MainScroll, ScrollTrack } from "./styles";

/**
 * 메인 — 누끼 영상 배경(선형 진행, 멈추지 않음) + 교수 명함 사이드(유리 카드) + 커리큘럼 모달.
 *
 *   - 영상은 스크롤에 따라 계속 진행(진행도 = 스크롤 비율).
 *   - 파란 코드(0.30) 이후 ~ 핑크(0.63) 전에 양 사이드(흰 여백)에 교수 명함이 아래에서 위로 스크롤.
 *     앞면=반투명 카드 / 뒷면=유리(프로스트) 느낌. (핑크 전에 명함이 끝나도록 카드 크기/구간 조정)
 *   - 핑크 코드(0.63)에서 커리큘럼 모달.
 */

const INTRO_FADE_END = 0.05;
const STOPS = [{ key: "curriculum", at: 0.65 }];
const REARM_EPS = 0.04;

/* "명함 클릭해보세요" 안내가 잠깐 나타났다 사라지는 지점/폭 */
const HINT_AT = 0.18;
const HINT_W = 0.07; // 이 폭(±)만큼 페이드 인/아웃 → 0.15~0.21 사이에서 보임

/* SUPPORT & AWARDS(노란 코드, 진행도 0.97) 캐러셀 등장 구간.
   AWARDS_START 부터 스크롤 내릴수록 아래에서 위로 올라오고, AWARDS_FULL(노란 코드)에서 완전 등장. */
const AWARDS_START = 0.82;
const AWARDS_FULL = 0.97;

export default function Main() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [introOpacity, setIntroOpacity] = useState(1);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [cardHint, setCardHint] = useState(0); // 명함 클릭 안내 opacity
  const [awardsReveal, setAwardsReveal] = useState(0); // SUPPORT&AWARDS 캐러셀 등장(0~1)
  const [campusTour, setCampusTour] = useState(false); // 캠퍼스 투어 영상
  const [campusEnding, setCampusEnding] = useState(false); // 투어 영상 종료 → 검정 페이드아웃
  const campusRef = useRef(null);
  const campusEndTimerRef = useRef(0);

  // 캠퍼스 투어 영상이 끝나면 검정으로 fade out 후 3D 캠퍼스 맵으로 이동
  const handleCampusEnded = useCallback(() => {
    setCampusEnding(true);
    clearTimeout(campusEndTimerRef.current);
    campusEndTimerRef.current = setTimeout(() => {
      navigate("/campus3d");
    }, 800); // CampusTour video opacity 트랜지션(0.8s)과 맞춤
  }, [navigate]);

  useEffect(() => () => clearTimeout(campusEndTimerRef.current), []);

  // 캠퍼스 투어 열리면 영상 처음부터 재생, 닫히면 정지
  useEffect(() => {
    const v = campusRef.current;
    if (!v) return;
    if (campusTour) {
      try {
        v.currentTime = 0;
      } catch {
        /* noop */
      }
      const p = v.play?.();
      // 소리 포함 자동재생이 막히면 음소거로 재시도(재생 보장)
      if (p && p.catch) {
        p.catch(() => {
          v.muted = true;
          v.play?.();
        });
      }
    } else {
      v.pause?.();
    }
  }, [campusTour]);

  const prevPRef = useRef(0);
  const armedRef = useRef({ curriculum: true });
  const anyOpenRef = useRef(false);
  const lockedTopRef = useRef(null);
  const skipBrakeRef = useRef(false);
  const navRef = useRef({ active: false, at: 0, arrive: null });
  const navTimerRef = useRef(0);

  const handleProgress = useCallback((p) => {
    // SUPPORT & AWARDS 캐러셀 — 진행도에 비례해 아래에서 위로 등장(스크롤 직결, 항상 갱신)
    const rev = Math.max(
      0,
      Math.min(1, (p - AWARDS_START) / (AWARDS_FULL - AWARDS_START)),
    );
    setAwardsReveal((prev) => (Math.abs(prev - rev) < 0.005 ? prev : rev));

    if (navRef.current.active) {
      // 이동 중에도 인트로/안내 문구는 진행도에 맞게 갱신(지나가면 사라지게)
      const op = Math.max(0, Math.min(1, 1 - p / INTRO_FADE_END));
      setIntroOpacity((prev) => (Math.abs(prev - op) < 0.01 ? prev : op));
      const h = Math.max(0, 1 - Math.abs(p - HINT_AT) / HINT_W);
      setCardHint((prev) => (Math.abs(prev - h) < 0.01 ? prev : h));
      prevPRef.current = p;
      if (Math.abs(p - navRef.current.at) < 0.004) {
        navRef.current.active = false;
        clearTimeout(navTimerRef.current);
        navRef.current.arrive?.();
      }
      return;
    }
    if (skipBrakeRef.current) {
      skipBrakeRef.current = false;
      prevPRef.current = p;
      return;
    }
    if (anyOpenRef.current) {
      const scroller = scrollRef.current;
      if (scroller && lockedTopRef.current != null)
        scroller.scrollTop = lockedTopRef.current;
      prevPRef.current = p;
      return;
    }

    // HOME 인트로 페이드
    const op = Math.max(0, Math.min(1, 1 - p / INTRO_FADE_END));
    setIntroOpacity((prev) => (Math.abs(prev - op) < 0.01 ? prev : op));

    // "명함 클릭해보세요" 안내 — HINT_AT 근처에서 잠깐 떴다 사라짐(삼각 페이드)
    const h = Math.max(0, 1 - Math.abs(p - HINT_AT) / HINT_W);
    setCardHint((prev) => (Math.abs(prev - h) < 0.01 ? prev : h));

    // 핑크 코드 → 커리큘럼 모달
    const prev = prevPRef.current;
    const lo = Math.min(prev, p);
    const hi = Math.max(prev, p);
    for (const s of STOPS) {
      if (Math.abs(p - s.at) > REARM_EPS) armedRef.current[s.key] = true;
    }
    const crossed = STOPS.filter(
      (s) => s.at >= lo && s.at <= hi && armedRef.current[s.key],
    );
    if (crossed.length) {
      const hit = crossed[0];
      armedRef.current[hit.key] = false;
      anyOpenRef.current = true;
      const scroller = scrollRef.current;
      if (scroller) {
        const max = scroller.scrollHeight - scroller.clientHeight;
        const top = hit.at * max;
        scroller.scrollTop = top;
        lockedTopRef.current = top;
      }
      prevPRef.current = hit.at;
      setCurriculumOpen(true);
      return;
    }

    prevPRef.current = p;
  }, []);

  const closeCurriculum = useCallback(() => {
    setCurriculumOpen(false);
    armedRef.current.curriculum = false;
    anyOpenRef.current = false;
    lockedTopRef.current = null;
  }, []);

  // 헤더 메뉴 클릭 → 해당 진행도(at) 위치로 부드럽게 이동 (선형: top = at*max).
  const onNavigate = useCallback((i, at) => {
    // CAMPUS TOUR(마지막 메뉴) → 스크롤 대신 캠퍼스 투어 영상으로 전환
    if (i === 4) {
      setCampusEnding(false);
      setCampusTour(true);
      return;
    }
    const scroller = scrollRef.current;
    const max = scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
    const top = at * max;
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const curP = scroller && max > 0 ? scroller.scrollTop / max : 0;

    const arrive = () => {
      if (i === 2) {
        armedRef.current.curriculum = false;
        lockedTopRef.current = top;
        anyOpenRef.current = true;
        setCurriculumOpen(true);
      } else {
        anyOpenRef.current = false;
        lockedTopRef.current = null;
        setCurriculumOpen(false);
      }
    };

    if (!scroller || prefersReduced || Math.abs(curP - at) < 0.004) {
      skipBrakeRef.current = true;
      if (scroller) scroller.scrollTop = top;
      prevPRef.current = at;
      setIntroOpacity(at <= INTRO_FADE_END ? 1 : 0);
      setCardHint(Math.max(0, 1 - Math.abs(at - HINT_AT) / HINT_W)); // 목표 지점 기준 안내 갱신
      arrive();
      return;
    }

    navRef.current = { active: true, at, arrive };
    anyOpenRef.current = false;
    setCurriculumOpen(false);
    scroller.scrollTo({ top, behavior: "smooth" });
    clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      if (!navRef.current.active) return;
      navRef.current.active = false;
      if (scroller) scroller.scrollTop = top;
      prevPRef.current = at;
      arrive();
    }, 1500);
  }, []);

  return (
    <MainScroll ref={scrollRef} $locked={curriculumOpen}>
      <Header scrollRef={scrollRef} onNavigate={onNavigate} />

      {/* 누끼 프레임 배경 — 선형 진행(멈추지 않음) */}
      <ScrollVideoBackground
        scrollRef={scrollRef}
        onProgress={handleProgress}
      />

      {/* HOME 타이핑 인트로 */}
      <HomeIntro opacity={introOpacity} />

      {/* 0.18 근처: 명함 클릭 안내 (잠깐 나타났다 사라짐) */}
      <ClickHint style={{ opacity: cardHint }} aria-hidden="true">
        <span className="l1">선배들의 꿀팁을 얻고 싶다면</span>
        <span className="l2">교수님 명함을 클릭해보세요</span>
      </ClickHint>

      {/* 핑크 코드 → 커리큘럼 모달 */}
      <CurriculumPanel open={curriculumOpen} onClose={closeCurriculum} />

      {/* 노란 코드(SUPPORT & AWARDS) → 스크롤 따라 아래에서 위로 올라오는 수상/프로그램 캐러셀 */}
      <AwardsCarousel reveal={awardsReveal} />

      {/* 스크롤 트랙 + 좌우 교수 명함 */}
      <ScrollTrack>
        <FacultySides />
      </ScrollTrack>

      {/* 진입 연출 — 흰색에서 점점 밝아졌다 사라지며 메인 fade in */}
      <WhiteIn aria-hidden="true" />

      {/* 캠퍼스 투어 — 메인이 fade out 되며 campusMove 영상 재생.
          영상이 끝나면 검정으로 fade out → 3D 캠퍼스 맵(/campus3d)으로 이동 */}
      <CampusTour
        data-on={campusTour ? "true" : "false"}
        data-ending={campusEnding ? "true" : "false"}
      >
        <video
          ref={campusRef}
          src={campusVideo}
          playsInline
          preload="auto"
          onEnded={handleCampusEnded}
        />
        <button className="ct-close" aria-label="닫기" onClick={() => setCampusTour(false)}>✕</button>
      </CampusTour>
    </MainScroll>
  );
}

const whiteOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;
/* 흰색 오버레이 — 마운트 시 1→0 으로 사라짐(메인이 흰색에서 떠오르듯) */
const WhiteIn = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #ffffff;
  pointer-events: none;
  opacity: 0;
  animation: ${whiteOut} 0.9s ease-out forwards;
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.3s;
  }
`;

/* 캠퍼스 투어 오버레이 — 메인 위로 fade in(=메인 fade out 느낌) + campusMove 풀스크린 재생 */
const CampusTour = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.8s ease;
  &[data-on="true"] {
    opacity: 1;
    pointer-events: auto;
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.8s ease;
  }
  /* 영상 종료 → 검정 배경 위로 영상이 사라지며(페이드아웃) 닫기 버튼도 숨김 */
  &[data-ending="true"] video {
    opacity: 0;
  }
  &[data-ending="true"] .ct-close {
    opacity: 0;
    pointer-events: none;
  }
  .ct-close {
    position: fixed;
    top: clamp(16px, 2.5vw, 28px);
    right: clamp(16px, 2.5vw, 28px);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.55);
    background: rgba(0, 0, 0, 0.45);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: background 0.15s ease, opacity 0.8s ease;
    &:hover {
      background: rgba(0, 0, 0, 0.65);
    }
  }
`;

/* 명함 클릭 안내 — 화면 중앙, 스크롤 진행도로 잠깐 나타났다 사라짐 */
const ClickHint = styled.div`
  position: fixed;
  inset: 0;
  z-index: 6; /* 배경·명함(5) 위, 헤더(50)·모달(120) 아래 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  pointer-events: none;
  text-align: center;
  font-family: "Poppins", "Pretendard", system-ui, sans-serif;
  color: #111;
  transition: opacity 0.2s ease;
  .l1 {
    font-size: clamp(20px, 2.4vw, 34px);
    font-weight: 600;
  }
  .l2 {
    font-size: clamp(24px, 3vw, 44px);
    font-weight: 800;
  }
`;
