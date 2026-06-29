import { useCallback, useEffect, useRef, useState } from 'react';
import { useTypewriter } from './hooks/useTypewriter';
import { LANDING } from '../../styles/theme';
import { TERM_FRAC } from './config';
import { Crt, CrtScreen, CrtLine, Cursor, Scanlines, CrtInput } from './styles';

/**
 * 실시간 CRT 터미널 — 모니터 빈 화면(MonitorWrap) 위에 % 로 정렬된 오버레이.
 * DesignStage 안에 있어 스테이지와 함께 그대로 스케일된다(별도 좌표 측정 불필요).
 *
 * C 의 scanf 흐름:
 *   0) 이름 입력 → 1) 성별 입력 → 2) 인사 → 3) 성별 출력 → 4) [Enter] 로 입장(onEnter)
 *
 *  props
 *   - active : true 일 때만 표시/입력 (다이브 시작 시 false 로 숨김)
 *   - onEnter: 마지막 Enter 시 호출 (모니터 다이브 입장)
 */
const isInput = (i) => i < 2;
const isFinal = (i) => i === 4;

// 터미널 글자 크기 = 터미널 높이(스테이지 px)의 12%
const FONT_PX = Math.round((TERM_FRAC.bottom - TERM_FRAC.top) * LANDING.MONITOR_H * 0.12);

export default function Terminal({ active = true, onEnter }) {
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [buffer, setBuffer] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const composing = useRef(false);

  const lineText = (i) => {
    switch (i) {
      case 0:
        return '이름을 입력하세요: ';
      case 1:
        return '성별을 입력하세요: ';
      case 2:
        return `안녕하세요, ${name || '익명'}님!`;
      case 3:
        return `(성별: ${gender || '-'})`;
      case 4:
        return '> 모니터 속으로 입장하려면 [Enter]';
      default:
        return '';
    }
  };

  const prompt = lineText(step);

  const handleTyped = useCallback(() => {
    if (isInput(step)) {
      setAccepting(true);
      inputRef.current?.focus();
    } else {
      setHistory((h) => [...h, lineText(step)]);
      if (isFinal(step)) setFinished(true);
      else setStep((s) => s + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, name, gender]);

  const { shown, done } = useTypewriter(prompt, 26, handleTyped);

  const commit = () => {
    if (finished) {
      onEnter?.();
      return;
    }
    if (!accepting || !isInput(step)) return;
    const value = buffer.trim();
    if (step === 0) setName(value);
    if (step === 1) setGender(value);
    setHistory((h) => [...h, lineText(step) + value]);
    setBuffer('');
    setAccepting(false);
    setStep((s) => s + 1);
  };

  const onKeyDown = (e) => {
    if (e.nativeEvent?.isComposing || composing.current) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, shown, buffer, finished]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active, accepting, finished]);

  if (!active) return null;

  return (
    <Crt
      $fontPx={FONT_PX}
      onMouseDown={(e) => {
        e.preventDefault();
        inputRef.current?.focus();
      }}
    >
      <Scanlines />
      <CrtScreen ref={scrollRef}>
        {history.map((ln, i) => (
          <CrtLine key={i}>{ln || ' '}</CrtLine>
        ))}

        {!finished && (
          <CrtLine>
            {isInput(step) && accepting ? (
              <>
                {prompt}
                {buffer}
                <Cursor />
              </>
            ) : (
              <>
                {shown}
                {!done && <Cursor />}
              </>
            )}
          </CrtLine>
        )}

        {finished && (
          <CrtLine $blink>
            <Cursor />
          </CrtLine>
        )}
      </CrtScreen>

      <CrtInput
        ref={inputRef}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={(e) => {
          composing.current = false;
          setBuffer(e.target.value);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="터미널 입력"
      />
    </Crt>
  );
}
