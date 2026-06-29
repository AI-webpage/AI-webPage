import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { STAGE } from '../../styles/theme';

/**
 * 반응형 방식 A — 디자인 스테이지 스케일.
 *
 * 2412 × 1665(STAGE) 가상 캔버스를 그대로 두고, 화면 크기에 맞춰
 *   scale = min(viewportW / STAGE.W, viewportH / STAGE.H)
 * 로 통째로 축소/확대한다. 내부 요소는 항상 같은 px·같은 좌표 → 시안 비율이 절대 깨지지 않는다.
 * 화면 비율이 시안과 다르면 레터박스(여백)가 생기는데, 배경 비디오를 스테이지 밖
 * 전체 화면 cover 로 깔아 여백을 가린다.
 *
 *  - 큰 화면  : scale > 1 로 확대되어 가득 찬다.
 *  - 작은 화면: scale < 1 로 축소되어 잘리지 않고 전체가 보인다.
 *  - 모바일 세로: 세로 기준으로 축소되어 좌우 여백(비디오로 채움) — 요소는 안 잘린다.
 */
const Viewport = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none; /* 여백 영역은 클릭 통과, 실제 스테이지만 입력 받음 */
`;

/* 스테이지(2412×1665)가 뷰포트보다 커도 중심이 항상 뷰포트 정중앙에 고정되도록
   absolute + translate(-50%,-50%) 로 중앙 정렬한 뒤 scale 한다.
   (grid place-items:center 는 오버플로 정렬이 깨져 작은 화면에서 밀려나 사라진다) */
const Stage = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${STAGE.W}px;
  height: ${STAGE.H}px;
  transform: translate(-50%, -50%) scale(var(--stage-scale, 1));
  transform-origin: center center;
  pointer-events: auto;
`;

function computeScale() {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.innerWidth / STAGE.W, window.innerHeight / STAGE.H);
}

export default function DesignStage({ children, className }) {
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return (
    <Viewport>
      <Stage className={className} style={{ '--stage-scale': scale }}>
        {children}
      </Stage>
    </Viewport>
  );
}
