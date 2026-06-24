import * as THREE from 'three'

/**
 * 가벼운 toon 물 셰이더 머티리얼.
 *  - 반투명 청록 + 흐르는 잔물결(sin) + 밝은 하이라이트 줄무늬.
 *  - uFlow 로 흐름 방향/속도 지정(해자=약한 수평, 폭포=강한 수직).
 *  - 정점 변형 없음(가벼움). uTime 만 매 프레임 갱신.
 *
 * uScale 은 지오메트리 uv 범위에 맞춰 조절:
 *  - ShapeGeometry(월드좌표 uv) → 0.25~0.35
 *  - Plane/Circle(0..1 uv)      → 4~6
 */
export function createToonWater({
  color = '#5FB6A8',
  bright = '#9BD7C8',
  opacity = 0.82,
  flow = [0.04, 0.03],
  scale = 0.3,
  emissive = 0.0,
} = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uBright: { value: new THREE.Color(bright) },
      uOpacity: { value: opacity },
      uFlow: { value: new THREE.Vector2(flow[0], flow[1]) },
      uScale: { value: scale },
      uEmissive: { value: emissive },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uBright;
      uniform float uOpacity;
      uniform vec2 uFlow;
      uniform float uScale;
      uniform float uEmissive;
      void main() {
        vec2 uv = vUv * uScale + uFlow * uTime;
        float w = sin(uv.x * 3.0 + uTime * 1.2) * 0.5
                + sin(uv.y * 2.3 - uTime * 1.6) * 0.5;
        float ripple = sin((uv.x + uv.y) * 4.0 + w);
        // 토온 밴딩 하이라이트
        float hi = smoothstep(0.55, 1.0, ripple);
        float hi2 = smoothstep(0.92, 1.0, ripple);
        vec3 col = mix(uColor, uBright, hi * 0.55 + hi2 * 0.45 + uEmissive);
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
  })
}
