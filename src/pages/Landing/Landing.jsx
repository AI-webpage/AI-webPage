import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingVideo from '../../assets/video/landingPage.MP4';
import monitorSvg from '../../assets/images/모니터_빈화면.svg';
import DesignStage from '../../components/shared/DesignStage';
import Terminal from './Terminal';
import ForegroundCharacter from './ForegroundCharacter';
import { DIVE_ORIGIN } from './config';
import * as S from './styles';

/**
 * 랜딩 — 풀스크린 영상 + 중앙 모니터 + 모니터 화면 위 실시간 터미널 + 모니터 위 skon 캐릭터.
 * 터미널 마지막 [Enter] → 모니터 속으로 빨려드는 줌인 다이브 → /main 으로 전환.
 *   (로딩이 필요 없으면 로딩 페이지를 건너뛴다. 필요할 때만 '/loading' 사용)
 * reduced(모션 최소화) 면 줌 대신 단순 페이드.
 *
 * 모니터·텍스트·터미널은 DesignStage(2412×1665) 안에 시안 비율 그대로 배치된다.
 * skon 캐릭터(3D)는 transform 스테이지 밖 풀스크린 캔버스에서 모니터 DOM 좌표를 추적해
 * 그 위에 앵커링된다(ForegroundCharacter 참고).
 */
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Landing() {
  const navigate = useNavigate();
  const [diving, setDiving] = useState(false);
  const timer = useRef(null);
  const monitorRef = useRef(null); // skon 앵커링 기준이 되는 모니터 DOM

  const enter = useCallback(() => {
    setDiving((d) => {
      if (d) return d;
      clearTimeout(timer.current);
      // 로딩이 필요 없으면 다이브 후 바로 메인으로. (로딩이 필요하면 '/loading' 으로 보내면 됨)
      timer.current = setTimeout(() => navigate('/main'), prefersReduced ? 350 : 1050);
      return true;
    });
  }, [navigate]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const diveAnim = prefersReduced
    ? { scale: 1 }
    : { scale: diving ? 9 : 1, filter: diving ? 'blur(7px)' : 'blur(0px)' };

  return (
    <S.LandingRoot>
      {/* 배경 영상 — 스테이지 밖 전체 화면 cover */}
      <S.LandingVideo src={landingVideo} autoPlay loop muted playsInline preload="auto" />

      <DesignStage>
        <S.DiveLayer
          $origin={DIVE_ORIGIN}
          animate={diving ? diveAnim : { scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: prefersReduced ? 0.3 : 1.0, ease: [0.5, 0, 0.85, 1] }}
        >
          {/* 모니터 뒤 배경 글자 */}
          <S.Title aria-hidden="true">WELCOME TO SOFTWARE</S.Title>

          {/* 중앙 모니터 + 화면 위 터미널 (skon 앵커링 기준) */}
          <S.MonitorWrap ref={monitorRef}>
            <S.MonitorImg src={monitorSvg} alt="" draggable={false} />
            <Terminal active={!diving} onEnter={enter} />
          </S.MonitorWrap>
        </S.DiveLayer>
      </DesignStage>

      {/* skon 캐릭터 — transform 스테이지 밖 풀스크린 캔버스가 모니터 DOM 을 추적.
          다이브 시작 시 숨김(다이브 중엔 줌이 모니터만 처리). */}
      {!diving && <ForegroundCharacter monitorRef={monitorRef} />}

      {/* 다이브 시 검정으로 수렴 */}
      <S.DiveBlack
        initial={{ opacity: 0 }}
        animate={{ opacity: diving ? 1 : 0 }}
        transition={{ duration: prefersReduced ? 0.3 : 0.9, ease: 'easeIn' }}
      />
    </S.LandingRoot>
  );
}
