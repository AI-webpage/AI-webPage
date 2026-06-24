import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useStore } from '../store'

/**
 * 후처리: 평상시엔 약한 Bloom 으로 화사하게, 포털 전환 절정에선
 * store.flash(0..1) 만큼 intensity 를 확 올렸다 내린다.
 */
const BASE_BLOOM = 0.32
const FLASH_BLOOM = 2.6

export default function Effects() {
  const bloomRef = useRef()

  useFrame(() => {
    const flash = useStore.getState().flash
    if (bloomRef.current) {
      bloomRef.current.intensity = BASE_BLOOM + flash * FLASH_BLOOM
    }
  })

  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom
        ref={bloomRef}
        intensity={BASE_BLOOM}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.32} />
    </EffectComposer>
  )
}
