import { useEffect, useRef, useState } from 'react'

/**
 * 타자기 효과. target 문자열을 speed(ms/글자) 간격으로 한 글자씩 드러낸다.
 * target 이 바뀌면 처음부터 다시 타이핑한다. 다 치면 onDone() 1회 호출.
 *
 * @returns {{ shown: string, done: boolean }}
 */
export function useTypewriter(target, speed = 26, onDone) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    setShown('')
    setDone(false)
    const str = target ?? ''
    if (str.length === 0) {
      setDone(true)
      onDoneRef.current?.()
      return
    }
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(str.slice(0, i))
      if (i >= str.length) {
        clearInterval(id)
        setDone(true)
        onDoneRef.current?.()
      }
    }, speed)
    return () => clearInterval(id)
  }, [target, speed])

  return { shown, done }
}
