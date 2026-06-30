import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

/**
 * 스크롤 스크럽 프레임 시퀀스 배경 (Apple/iPhone 제품 페이지 스타일).
 *
 * [동작 방식]
 *  - bg.MP4 를 ffmpeg 로 쪼갠 프레임(public/frames/frame_0001.jpg ...)을
 *    전부 preload 한 뒤, 스크롤 진행도(0~1)에 해당하는 "프레임 1장"만 2D <canvas>에 그린다.
 *    → 스크롤할수록 영상이 앞으로 진행(스크럽)되는 느낌.
 *  - video 태그의 currentTime 스크럽은 끊김이 심해 사용하지 않는다(이미지 시퀀스 방식).
 *
 * [스크롤 소스 — 충돌 방지]
 *  - 이 프로젝트는 html/body/#root 가 overflow:hidden 이라 window 스크롤이 막혀 있고,
 *    메인의 유일한 스크롤 컨테이너는 MainScroll(overflow-y:auto) 하나뿐이다.
 *  - drei ScrollControls / Lenis 등 별도 스크롤 소스도 없다.
 *  - 따라서 새 스크롤 소스를 만들지 않고, prop 으로 받은 scrollRef(MainScroll)의
 *    스크롤 값에 "올라타서" 진행도를 계산한다. (scrollRef 없으면 window 폴백)
 *
 * props
 *   - scrollRef : 스크롤 컨테이너 ref (overflow:auto 인 엘리먼트). 미지정 시 window.
 */

/* ───── 설정값 (여기만 바꾸면 됨) ───── */
const FRAME_COUNT = 271; // public/frames 실제 개수 (bg.MP4 30fps × 9.03s ≈ 271)
const FRAME_PATH = (i) => `/frames/frame_${String(i).padStart(4, '0')}.webp`; // 배경 누끼된 투명 WebP
const MAX_DPR = 2; // 레티나 과부하 방지용 상한
const BACKDROP = '#ffffff'; // 누끼 뒤 깔 배경(흰색). 소켓이 어두워 밝은 배경 필요.
/* ──────────────────────────────── */

export default function ScrollVideoBackground({ scrollRef, onProgress, mapProgress }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]); // 프레임 이미지 배열
  const indexRef = useRef(0); // 현재 그려진 프레임 인덱스 (리사이즈 시 재사용)
  const rafRef = useRef(0); // 스크롤 rAF throttle 핸들
  const onProgressRef = useRef(onProgress); // 진행도 콜백(최신값 유지 → 리스너 재구독 방지)
  onProgressRef.current = onProgress;
  const mapRef = useRef(mapProgress); // 원시 진행도 → 영상 진행도 리매핑(핀 구간 정지용)
  mapRef.current = mapProgress;

  const [progress, setProgress] = useState(0); // preload 진행률 %
  const [ready, setReady] = useState(false); // 전체 preload 완료 여부

  // 현재 인덱스 프레임을 캔버스에 object-fit: cover 로 그린다 (devicePixelRatio 반영)
  const draw = (index) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 캔버스 버퍼 크기를 화면 × dpr 로 맞춤 (변할 때만 — 매 프레임 재할당 방지)
    if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 좌표계를 CSS 픽셀 기준으로
    ctx.imageSmoothingEnabled = true; // 스케일 시 화질 유지(계단현상 방지)
    ctx.imageSmoothingQuality = 'high';

    // 1) 흰 배경 먼저 (누끼 투명 영역 + 여백은 이 배경이 보인다)
    ctx.fillStyle = BACKDROP;
    ctx.fillRect(0, 0, vw, vh);

    // 2) object-fit: contain — 프레임 "전체"가 다 보이게(세로/가로 안 잘림), 가운데 정렬.
    //    세로로 긴 영상이라 좌우에 흰 여백이 생기지만, 위/아래가 절대 안 잘린다.
    const scale = Math.min(vw / img.naturalWidth, vh / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (vw - dw) / 2;
    const dy = (vh - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // 1) 모든 프레임 preload + 진행률 표시
  useEffect(() => {
    let loaded = 0;
    let cancelled = false;
    const imgs = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = FRAME_PATH(i + 1); // 파일은 1-based
      img.onload = img.onerror = () => {
        loaded += 1;
        if (cancelled) return;
        setProgress(Math.round((loaded / FRAME_COUNT) * 100));
        if (loaded === FRAME_COUNT) {
          setReady(true);
          draw(0); // 첫 프레임 표시
        }
      };
      imgs[i] = img;
    }
    imagesRef.current = imgs;
    return () => {
      cancelled = true; // 언마운트 시 setState 방지
    };
  }, []);

  // 2) 스크롤 → 프레임 (rAF throttle). preload 완료 후에만 연결.
  useEffect(() => {
    if (!ready) return undefined;
    const scroller = scrollRef?.current || null; // MainScroll 컨테이너
    const target = scroller || window; // 폴백: window

    // 컨테이너/윈도우에 맞춰 진행도(0~1) 계산
    const getProgress = () => {
      if (scroller) {
        const max = scroller.scrollHeight - scroller.clientHeight;
        return max > 0 ? scroller.scrollTop / max : 0;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };

    const onScroll = () => {
      if (rafRef.current) return; // 이미 예약돼 있으면 skip (throttle)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const rawP = Math.min(1, Math.max(0, getProgress()));
        onProgressRef.current?.(rawP); // 부모(Main)에 "원시" 진행도 전달
        // 영상 프레임은 리매핑된 진행도로 선택(핀 구간에선 파란 프레임에 정지)
        const vp = mapRef.current
          ? Math.min(1, Math.max(0, mapRef.current(rawP)))
          : rawP;
        const idx = Math.min(FRAME_COUNT - 1, Math.round(vp * (FRAME_COUNT - 1)));
        indexRef.current = idx;
        draw(idx);
      });
    };

    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 초기 1회 동기화
    return () => {
      target.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [ready, scrollRef]);

  // 3) 리사이즈 → 현재 프레임 다시 그리기 (rAF throttle, cleanup)
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw(indexRef.current);
      });
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* 풀스크린 2D 캔버스 배경 (R3F Canvas 보다 아래) */}
      <BgCanvas ref={canvasRef} aria-hidden="true" />

      {/* 로딩 진행률 로더 (preload 완료 전까지) */}
      {!ready && (
        <Loader>
          <span>배경 로딩 중… {progress}%</span>
          <Bar>
            <BarFill style={{ width: `${progress}%` }} />
          </Bar>
        </Loader>
      )}
    </>
  );
}

/* ───── styled ───── */
const BgCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* R3F Canvas(1)·텍스트(4) 보다 아래 = 최하단 배경 */
  display: block;
  pointer-events: none;
`;

const Loader = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #000;
  color: #cfd3e6;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 14px;
  letter-spacing: 1px;
`;
const Bar = styled.div`
  width: min(260px, 60vw);
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
`;
const BarFill = styled.div`
  height: 100%;
  background: #6c7bff;
  transition: width 0.15s ease;
`;
