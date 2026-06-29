import * as THREE from 'three'

/**
 * SVG/PNG 를 캔버스로 래스터화해 THREE.CanvasTexture 로 만든다.
 *
 * - three 의 TextureLoader 는 SVG 를 직접 못 읽으므로, Image 로 로드한 뒤
 *   canvas 에 그려서 텍스처를 만든다.
 * - 원본 종횡비(aspect = w/h)를 함께 돌려줘 Plane 비율 계산에 쓴다.
 * - 모듈 레벨 캐시에 Promise 를 저장해 React <Suspense> 와 호환되게 한다.
 *   (status === 'pending' 이면 Promise 를 throw → Suspense 가 fallback 표시)
 */

const cache = new Map()

function rasterize(url, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      let w = img.naturalWidth || img.width
      let h = img.naturalHeight || img.height
      // 일부 SVG 는 내장 크기가 없을 수 있다 → 안전한 기본값.
      if (!w || !h) {
        w = 512
        h = 512
      }
      const aspect = w / h
      const scale = Math.min(1, maxSize / Math.max(w, h))
      const cw = Math.max(1, Math.round(w * scale))
      const ch = Math.max(1, Math.round(h * scale))

      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, 0, 0, cw, ch)

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = 8
      texture.needsUpdate = true

      resolve({ texture, aspect, width: w, height: h })
    }
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

function getEntry(url, maxSize) {
  const key = `${url}@${maxSize}`
  let entry = cache.get(key)
  if (!entry) {
    entry = { status: 'pending', result: null, error: null }
    entry.promise = rasterize(url, maxSize).then(
      (result) => {
        entry.status = 'done'
        entry.result = result
      },
      (error) => {
        entry.status = 'error'
        entry.error = error
      },
    )
    cache.set(key, entry)
  }
  return entry
}

/**
 * @returns {{ texture: THREE.Texture, aspect: number, width: number, height: number }}
 */
export function useSpriteTexture(url, maxSize = 1024) {
  const entry = getEntry(url, maxSize)
  if (entry.status === 'pending') throw entry.promise
  if (entry.status === 'error') {
    // 깨진 텍스처 대신 빈 결과를 주어 화면이 죽지 않게 한다.
    console.error('useSpriteTexture: failed to load', url, entry.error)
    return { texture: null, aspect: 1, width: 1, height: 1 }
  }
  return entry.result
}
