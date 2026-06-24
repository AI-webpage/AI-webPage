import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { useTypewriter } from '../hooks/useTypewriter'
import '../ui/terminal.css'

/**
 * ★실시간 CRT 터미널★ — 모니터 빈 화면 위에 겹쳐지는 HTML 오버레이.
 *
 * C 의 scanf 흐름을 흉내:
 *   0) "이름을 입력하세요: "  → 입력(Enter) = name
 *   1) "성별을 입력하세요: "  → 입력(Enter) = gender
 *   2) "안녕하세요, {name}님!"          (출력)
 *   3) "(성별: {gender})"               (출력)
 *   4) "> SOFTWARE 월드로 입장하려면 [Enter]"  (출력, Enter 로 입장)
 *
 * 위치/크기는 store.screenRect(ScreenRectBridge 가 투영한 픽셀 사각형)에 맞춘다.
 * 한글 IME 와 모바일 키보드를 위해 실제 <input> 으로 입력을 받는다.
 */

const isInput = (i) => i < 2
const isFinal = (i) => i === 4

export default function Terminal() {
  const rect = useStore((s) => s.screenRect)
  const phase = useStore((s) => s.phase)
  const enterWorld = useStore((s) => s.enterWorld)
  const setUser = useStore((s) => s.setUser)

  const [history, setHistory] = useState([]) // 확정된 줄들
  const [step, setStep] = useState(0) // 현재 스크립트 인덱스
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [buffer, setBuffer] = useState('') // 입력 중 텍스트
  const [accepting, setAccepting] = useState(false) // 입력 받는 중
  const [finished, setFinished] = useState(false) // 마지막 줄 대기(Enter→입장)

  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const composing = useRef(false)

  // 현재 스크립트 줄 텍스트
  const lineText = (i) => {
    switch (i) {
      case 0:
        return '이름을 입력하세요: '
      case 1:
        return '성별을 입력하세요: '
      case 2:
        return `안녕하세요, ${name || '익명'}님!`
      case 3:
        return `(성별: ${gender || '-'})`
      case 4:
        return '> SOFTWARE 월드로 입장하려면 [Enter]'
      default:
        return ''
    }
  }

  const prompt = lineText(step)

  // 타이핑 끝났을 때 처리
  const handleTyped = useCallback(() => {
    if (isInput(step)) {
      setAccepting(true)
      inputRef.current?.focus()
    } else {
      // 출력 줄 → history 에 확정하고 다음으로
      setHistory((h) => [...h, lineText(step)])
      if (isFinal(step)) {
        setFinished(true)
      } else {
        setStep((s) => s + 1)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, name, gender])

  const { shown, done } = useTypewriter(prompt, 26, handleTyped)

  // 입력 확정 (Enter)
  const commit = () => {
    if (finished) {
      // 마지막: 입장
      setUser(name, gender)
      enterWorld()
      return
    }
    if (!accepting || !isInput(step)) return
    const value = buffer.trim()
    if (step === 0) setName(value)
    if (step === 1) setGender(value)
    setHistory((h) => [...h, lineText(step) + value])
    setBuffer('')
    setAccepting(false)
    setStep((s) => s + 1)
  }

  const onKeyDown = (e) => {
    // IME 조합 중 Enter 는 무시 (조합 확정용)
    if (e.nativeEvent?.isComposing || composing.current) return
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    }
  }

  // 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history, shown, buffer, finished])

  // 랜딩에 들어올 때 입력 포커스
  useEffect(() => {
    if (phase === 'landing') inputRef.current?.focus()
  }, [phase, accepting, finished])

  if (!rect || phase !== 'landing') return null

  const fontPx = Math.max(11, Math.round(rect.h * 0.11))

  return (
    <div
      className="crt"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.w,
        height: rect.h,
        fontSize: `${fontPx}px`,
      }}
      onMouseDown={(e) => {
        // 텍스트 선택 막고 입력에 포커스 (모바일 키보드 올리기)
        e.preventDefault()
        inputRef.current?.focus()
      }}
    >
      <div className="crt-scanlines" />
      <div className="crt-screen" ref={scrollRef}>
        {history.map((ln, i) => (
          <div className="crt-line" key={i}>
            {ln || ' '}
          </div>
        ))}

        {/* 현재 활성 줄 */}
        {!finished && (
          <div className="crt-line">
            {isInput(step) && accepting ? (
              <>
                {prompt}
                {buffer}
                <span className="crt-cursor" />
              </>
            ) : (
              <>
                {shown}
                {!done && <span className="crt-cursor" />}
              </>
            )}
          </div>
        )}

        {finished && (
          <div className="crt-line crt-blink-line">
            <span className="crt-cursor" />
          </div>
        )}
      </div>

      {/* IME/모바일용 실제 입력 — 화면 위에 투명하게 깔아 탭 포커스를 받는다 */}
      <input
        ref={inputRef}
        className="crt-input"
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={(e) => {
          composing.current = false
          setBuffer(e.target.value)
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="터미널 입력"
      />
    </div>
  )
}
