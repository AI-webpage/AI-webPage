// 시드 기반 난수 (mulberry32) — 배치 재현성 보장.
// const rnd = seededRandom(1234); rnd() -> 0..1

export function seededRandom(seed) {
  let s = seed >>> 0
  return function () {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 편의: [min, max) 범위
export function randRange(rnd, min, max) {
  return min + (max - min) * rnd()
}
