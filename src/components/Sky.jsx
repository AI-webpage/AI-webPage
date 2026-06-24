import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 그라데이션 하늘 배경 (원경 Plane).
 *
 * 비율 제어: 화면 좌표가 아니라 "월드 Y" 를 기준으로 색을 섞는다.
 *   - yBottom : 이 월드 Y 이하는 100% bottom 색
 *   - yTop    : 이 월드 Y 이상은 100% top 색
 *   - bias    : 0~1. 클수록 top(민트)이 더 넓게, 작을수록 bottom(라벤더)이 넓게.
 * plane 은 화면을 항상 덮도록 크게 두되, 색 전환 구간은 위 월드 Y 범위로 고정되어
 * plane 크기와 무관하게 비율이 예측 가능하다.
 */
export default function Sky({
  top = "#6cffe4",
  bottom = "#b9a8ff",
  position = [0, 0, -10],
  size = [80, 60],
  yBottom = -4,
  yTop = 4,
  bias = 0.5,
}) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color(top) },
        uBottom: { value: new THREE.Color(bottom) },
        uY0: { value: yBottom },
        uY1: { value: yTop },
        uBias: { value: bias },
      },
      vertexShader: /* glsl */ `
        varying float vWorldY;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldY = wp.y;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vWorldY;
        uniform vec3 uTop;
        uniform vec3 uBottom;
        uniform float uY0;
        uniform float uY1;
        uniform float uBias;
        void main() {
          float t = clamp((vWorldY - uY0) / (uY1 - uY0), 0.0, 1.0);
          // bias: 0.5 = 선형, >0.5 면 top 색이 더 넓게 깔린다
          float k = (1.0 - uBias) / max(uBias, 0.001);
          t = pow(t, k);
          vec3 col = mix(uBottom, uTop, t);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
      toneMapped: false,
    });
  }, [top, bottom]);

  // props 변경 시 uniform 갱신 (재컴파일 없이)
  useFrame(() => {
    material.uniforms.uY0.value = yBottom;
    material.uniforms.uY1.value = yTop;
    material.uniforms.uBias.value = bias;
  });

  return (
    <mesh position={position} material={material} renderOrder={-10}>
      <planeGeometry args={size} />
    </mesh>
  );
}
