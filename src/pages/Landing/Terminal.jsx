import { useCallback, useEffect, useRef, useState } from 'react';
import { useTypewriter } from './hooks/useTypewriter';
import { LANDING } from '../../styles/theme';
import { TERM_FRAC } from './config';
import { Crt, CrtScreen, CrtLine, Cursor, Scanlines, CrtInput } from './styles';

/**
 * CRT 터미널 — C 소스 코드를 "타자 치듯" 한 글자씩 찍어 내려간다.
 *   A) 코드 앞부분을 타이핑 → scanf("  자리에서 멈춤
 *   B) 따옴표 안에 이름 입력 → [Enter]
 *   C) 나머지 코드 + 실행 결과 + 입학 축하를 이어서 타이핑
 *   D) [Enter] → 메인 입장(onEnter)
 *
 * DesignStage 안에 있어 스테이지와 함께 그대로 스케일된다(별도 좌표 측정 불필요).
 *
 * props
 *   - active : true 일 때만 표시/입력 (다이브 시작 시 false 로 숨김)
 *   - onEnter: 마지막 Enter 시 호출 (모니터 다이브 입장)
 */

// 코드가 여러 줄 들어가야 하므로 글자 크기를 터미널 높이의 5.2% 로(가장 긴 코드 줄이 안 깨지게)
const FONT_PX = Math.max(
  9,
  Math.round((TERM_FRAC.bottom - TERM_FRAC.top) * LANDING.MONITOR_H * 0.052),
);

const TYPE_SPEED = 16; // ms/글자

// scanf 자리에 들어갈 안내 문구(이름 입력 전 표시)
const PLACEHOLDER = '여기에 이름을 입력하시오';

// 코드 앞부분 — scanf(" 직전까지 타이핑하고 멈춘다
const CODE_PRE = `#include <stdio.h>
int main() {
    char name[20];
    printf("이름을 입력하세요: ");
    scanf("`;

// 이름 입력 뒤 이어서 타이핑할 나머지 코드 + 실행 결과 + 입학 축하
const codePost = (name) => `", name);
    printf("입력한 이름: %s\\n", name);
    return 0;
}

$ ./a.out
입력한 이름: ${name}
${name}님, 서경대학교 소프트웨어에 입학하신 걸 축하드립니다!
> [Enter] 로 입장`;

export default function Terminal({ active = true, onEnter }) {
  const [name, setName] = useState('');
  const [accepting, setAccepting] = useState(false); // 코드 앞부분 다 친 뒤 = 이름 입력 받는 중
  const [submitted, setSubmitted] = useState(false); // 이름 확정 → 나머지 코드/결과 타이핑
  const [finished, setFinished] = useState(false); // 전체 타이핑 끝 → Enter 로 입장

  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const composing = useRef(false);

  // A) 코드 앞부분 타이핑 → 다 치면 이름 입력 받기
  const onPreDone = useCallback(() => setAccepting(true), []);
  const { shown: shownPre, done: donePre } = useTypewriter(CODE_PRE, TYPE_SPEED, onPreDone);

  // C) 제출 후 나머지 코드/결과 타이핑 → 다 치면 입장 대기
  const onPostDone = useCallback(() => {
    if (submitted) setFinished(true);
  }, [submitted]);
  const { shown: shownPost } = useTypewriter(
    submitted ? codePost(name) : '',
    TYPE_SPEED,
    onPostDone,
  );

  const commit = () => {
    if (finished) {
      onEnter?.(); // 마지막 Enter → 메인 입장
      return;
    }
    if (!accepting || submitted) return; // 코드 타이핑 중엔 무시
    const trimmed = name.trim();
    if (!trimmed) return; // 이름이 비면 무시(따옴표 안에 입력해야 진행)
    setName(trimmed);
    setSubmitted(true); // 첫 Enter → 나머지 코드/결과 타이핑 시작
  };

  const onKeyDown = (e) => {
    if (e.nativeEvent?.isComposing || composing.current) return; // 한글 조합 중 Enter 무시
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  // 글자가 늘어나면 맨 아래로 스크롤(타이핑/결과가 따라 보이게)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shownPre, shownPost, name, submitted]);

  useEffect(() => {
    if (active && accepting && !submitted) inputRef.current?.focus();
  }, [active, accepting, submitted]);

  if (!active) return null;

  // 입력 자리 표시: 입력 대기 중엔 placeholder/이름, 제출 후엔 이름(고정)
  const showInputSlot = donePre;
  const inputEmpty = accepting && !submitted && !name;

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
        <CrtLine>
          {/* A) 코드 앞부분 (타이핑) */}
          {donePre ? CODE_PRE : shownPre}

          {/* B) scanf 따옴표 안 이름 입력 자리 */}
          {showInputSlot &&
            (inputEmpty ? (
              <span style={{ opacity: 0.45 }}>{PLACEHOLDER}</span>
            ) : (
              name
            ))}

          {/* C) 제출 후 나머지 코드 + 실행 결과 + 입학 축하 (타이핑) */}
          {submitted && shownPost}

          {/* 커서는 항상 현재 타이핑 끝(=입력 위치)에 */}
          <Cursor />
        </CrtLine>
      </CrtScreen>

      {/* 키 입력 캡처용 투명 input (한글 IME 조합 지원) */}
      <CrtInput
        ref={inputRef}
        value={name}
        maxLength={18}
        readOnly={!accepting || submitted}
        onChange={(e) => {
          if (accepting && !submitted) setName(e.target.value);
        }}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={(e) => {
          composing.current = false;
          if (accepting && !submitted) setName(e.target.value);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="이름 입력"
      />
    </Crt>
  );
}
