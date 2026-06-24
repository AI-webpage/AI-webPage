import { create } from 'zustand'

/**
 * 전역 상태.
 *
 * phase 흐름:
 *   landing  → (입장) → toWorld  → world
 *   world    → (돌아가기) → toLanding → landing
 *
 * toWorld / toLanding 은 CameraRig 의 gsap 타임라인이 도는 "전환 중" 구간이다.
 */
export const useStore = create((set, get) => ({
  // 'landing' | 'toWorld' | 'world' | 'toLanding'
  phase: 'landing',

  // 선택된 캐릭터 id (characters.js 참고). 기본값: skon
  character: 'skon',

  // 흰색 페이드 오버레이 (0 = 투명, 1 = 완전 흰색)
  fade: 0,

  // 포털 발광용 Bloom intensity 부스트 (0..1)
  flash: 0,

  // 최초 텍스처 로딩 완료 여부 (로더 표시용)
  ready: false,
  setReady: () => set({ ready: true }),

  // 모니터 CRT(터미널) 영역의 화면 픽셀 사각형 {left, top, w, h}
  // ScreenRectBridge 가 매 resize/zoom 마다 갱신, Terminal 오버레이가 사용.
  screenRect: null,
  setScreenRect: (r) => set({ screenRect: r }),

  // 터미널에서 입력받은 사용자 정보
  userName: '',
  userGender: '',
  setUser: (userName, userGender) => set({ userName, userGender }),

  setCharacter: (id) => set({ character: id }),
  setFade: (v) => set({ fade: v }),
  setFlash: (v) => set({ flash: v }),
  setPhase: (p) => set({ phase: p }),

  // 입장하기
  enterWorld: () => {
    if (get().phase !== 'landing') return
    set({ phase: 'toWorld' })
  },

  // 돌아가기
  exitToLanding: () => {
    if (get().phase !== 'world') return
    set({ phase: 'toLanding' })
  },
}))
