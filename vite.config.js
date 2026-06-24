import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 3D 모델(.glb/.gltf)을 정적 에셋으로 취급 (import → URL 문자열)
  assetsInclude: ['**/*.glb', '**/*.gltf'],
})
