import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loadingVideo from '../../assets/video/loading.mp4';
import * as S from './styles';

/**
 * 로딩 — 스피너 대신 풀스크린 동영상.
 *  - autoplay/muted/playsinline. 한 번 재생 후 onEnded 에 /main 으로 전환.
 *  - 영상 위 "loading..." 점 개수가 늘었다 줄었다(화이트).
 *  - 폴백: 로드 실패 또는 최대 시간 초과 시 즉시 메인 진행.
 */
const DOT_SEQ = [0, 1, 2, 3, 2, 1]; // 늘었다 줄었다

export default function Loading() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    navigate('/main');
  };

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % DOT_SEQ.length), 420);
    // 안전 폴백: 영상이 길어도/멈춰도 최대 12초 후 진행
    const to = setTimeout(finish, 12000);
    return () => {
      clearInterval(id);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dots = '.'.repeat(DOT_SEQ[step]);

  return (
    <S.LoadingRoot>
      <S.LoadingVideoEl
        src={loadingVideo}
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
      />
      <S.LoadingText>{`loading${dots}`}</S.LoadingText>
    </S.LoadingRoot>
  );
}
