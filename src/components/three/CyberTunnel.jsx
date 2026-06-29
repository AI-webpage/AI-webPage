// ============================================
// 사이버 터널 컴포넌트
// 무한 루프 사각형 프레임 배열로 구성된 가상 터널
// 스크롤 진행도에 동기화되어 카메라가 빨려 들어가는 연출
// ============================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

// 매 프레임 재사용할 방향 벡터 (GC 방지)
const _dir = new THREE.Vector3();

// 터널 파라미터 상수
const FRAME_COUNT = 32;          // 총 프레임 수
const FRAME_SPACING = 6;         // 프레임 간격 (Z축) - 좁혀서 더 조밀한 터널감
const TOTAL_DEPTH = FRAME_COUNT * FRAME_SPACING; // 전체 터널 깊이 = 192
// pages=4 기준: Section2 중앙 offset=0.33에서 터널 종료
// 실제 스크롤 거리: 0.23 × 3×innerHeight = 69vh (pages=3 시절 64vh와 거의 동일)
const TUNNEL_START_SCROLL = 0.10; // (was 0.18)
const TUNNEL_SCROLL_RANGE = 0.23; // 0.10~0.33 구간 (was 0.32, end was 0.50)

// 프레임 색상 사이클 - 인디고/퍼플/시안 순환
const FRAME_COLORS = [
  new THREE.Color('#4f46e5'),  // 인디고
  new THREE.Color('#7c3aed'),  // 퍼플
  new THREE.Color('#06b6d4'),  // 시안
  new THREE.Color('#6366f1'),  // 라이트 인디고
  new THREE.Color('#8b5cf6'),  // 바이올렛
];

// ============================================
// 터널 프레임 단위 (사각형 테두리 + 모서리 장식)
// ============================================
function TunnelFrame({ frameIndex, materialRef }) {
  const colorIdx = frameIndex % FRAME_COLORS.length;
  const frameColor = FRAME_COLORS[colorIdx];

  // 각 프레임마다 살짝 다른 크기 (원근감 강화)
  const baseSize = 3.8;
  const sizeVariant = baseSize + (frameIndex % 4) * 0.08;
  const half = sizeVariant / 2;

  // 개별 프레임 엣지 ref (발광 애니메이션)
  const edgeRefs = useRef([]);
  const cornerRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 프레임마다 위상차를 두어 순차적으로 빛나는 효과
    const phase = t * 1.2 + frameIndex * 0.18;
    const glowIntensity = 0.6 + Math.sin(phase) * 0.4;

    edgeRefs.current.forEach((edge) => {
      if (edge && edge.material) {
        edge.material.emissiveIntensity = glowIntensity;
      }
    });
    cornerRefs.current.forEach((corner, ci) => {
      if (corner && corner.material) {
        corner.material.emissiveIntensity = 1.0 + Math.sin(phase + ci * 0.5) * 0.8;
      }
    });
  });

  return (
    <group>
      {/* 상단 수평 엣지 */}
      <mesh ref={(el) => { edgeRefs.current[0] = el; }} position={[0, half, 0]}>
        <boxGeometry args={[sizeVariant, 0.03, 0.03]} />
        <meshStandardMaterial
          color={frameColor}
          emissive={frameColor}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* 하단 수평 엣지 */}
      <mesh ref={(el) => { edgeRefs.current[1] = el; }} position={[0, -half, 0]}>
        <boxGeometry args={[sizeVariant, 0.03, 0.03]} />
        <meshStandardMaterial
          color={frameColor}
          emissive={frameColor}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* 왼쪽 수직 엣지 */}
      <mesh ref={(el) => { edgeRefs.current[2] = el; }} position={[-half, 0, 0]}>
        <boxGeometry args={[0.03, sizeVariant, 0.03]} />
        <meshStandardMaterial
          color={frameColor}
          emissive={frameColor}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* 오른쪽 수직 엣지 */}
      <mesh ref={(el) => { edgeRefs.current[3] = el; }} position={[half, 0, 0]}>
        <boxGeometry args={[0.03, sizeVariant, 0.03]} />
        <meshStandardMaterial
          color={frameColor}
          emissive={frameColor}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* 4개 모서리 강조 큐브 */}
      {[
        [-half, half, 0],
        [half, half, 0],
        [-half, -half, 0],
        [half, -half, 0],
      ].map((pos, ci) => (
        <mesh
          key={ci}
          ref={(el) => { cornerRefs.current[ci] = el; }}
          position={pos}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial
            color={frameColor}
            emissive={frameColor}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* 내부 보조 라인 (중간 크기 프레임 - 중첩 효과) */}
      {[
        [0, half * 0.6, 0, [sizeVariant * 0.6, 0.015, 0.015]],
        [0, -half * 0.6, 0, [sizeVariant * 0.6, 0.015, 0.015]],
        [-half * 0.6, 0, 0, [0.015, sizeVariant * 0.6, 0.015]],
        [half * 0.6, 0, 0, [0.015, sizeVariant * 0.6, 0.015]],
      ].map(([px, py, pz, dims], li) => (
        <mesh key={li} position={[px, py, pz]}>
          <boxGeometry args={dims} />
          <meshStandardMaterial
            color={frameColor}
            emissive={frameColor}
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// 터널 파티클 (배경 점광 효과)
// ============================================
function TunnelParticles() {
  const particlesRef = useRef();
  const scroll = useScroll();

  // 파티클 위치 데이터 사전 계산
  const { positions, colors } = useMemo(() => {
    const count = 300;
    const posArr = new Float32Array(count * 3);
    const colArr = new Float32Array(count * 3);
    const palette = [
      [0.31, 0.27, 0.9],  // 인디고
      [0.49, 0.23, 0.93], // 퍼플
      [0.024, 0.71, 0.83], // 시안
    ];
    for (let i = 0; i < count; i++) {
      posArr[i * 3]     = (Math.random() - 0.5) * 10;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      posArr[i * 3 + 2] = -Math.random() * TOTAL_DEPTH;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colArr[i * 3]     = c[0];
      colArr[i * 3 + 1] = c[1];
      colArr[i * 3 + 2] = c[2];
    }
    return { positions: posArr, colors: colArr };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const offset = scroll.offset;
    if (offset < TUNNEL_START_SCROLL) return;

    const progress = (offset - TUNNEL_START_SCROLL) / TUNNEL_SCROLL_RANGE;
    const travelZ = progress * TOTAL_DEPTH * 2.0;

    const posAttr = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      let z = positions[i * 3 + 2] + travelZ;
      if (z > 2) z -= TOTAL_DEPTH;
      posAttr.setZ(i, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ============================================
// 터널 중앙 소실점 광원 효과
// ============================================
function TunnelVanishLight() {
  const lightRef = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    const offset = scroll.offset;
    const visible = offset > TUNNEL_START_SCROLL - 0.05;
    // 소실점 광원 강도 = 스크롤 + 시간 기반 펄스
    const progress = Math.max(0, (offset - TUNNEL_START_SCROLL) / TUNNEL_SCROLL_RANGE);
    lightRef.current.intensity = visible
      ? (3 + Math.sin(t * 0.7) * 1) * progress
      : 0;
  });

  return (
    <pointLight
      ref={lightRef}
      color="#4f46e5"
      intensity={0}
      distance={80}
      decay={1.2}
      position={[0, 0, -TOTAL_DEPTH * 0.5]}
    />
  );
}

// ============================================
// 메인 사이버 터널 컴포넌트
// ============================================
export default function CyberTunnel() {
  const scroll = useScroll();
  const groupRef = useRef();

  // 프레임 초기 Z 위치 및 그룹 ref 배열
  const frameGroupRefs = useRef([]);
  const initialZPositions = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => -(i + 1) * FRAME_SPACING),
    []
  );

  useFrame((state) => {
    const offset = scroll.offset;

    if (!groupRef.current) return;

    // 카메라 시선 벡터(normalized)를 구해 Z=0 평면과의 교차점을 계산
    // → 어떤 카메라 위치/각도에서도 항상 뷰포트 정중앙에 그룹을 배치
    state.camera.getWorldDirection(_dir);
    if (Math.abs(_dir.z) > 0.0001) {
      const t = -state.camera.position.z / _dir.z;
      groupRef.current.position.x = state.camera.position.x + _dir.x * t;
      groupRef.current.position.y = state.camera.position.y + _dir.y * t;
    }
    groupRef.current.position.z = 0;

    // 페이드 인/아웃 합산 opacity 계산
    const tunnelProgress = Math.min(1, Math.max(0, (offset - TUNNEL_START_SCROLL) / TUNNEL_SCROLL_RANGE));
    const fadeInProgress = Math.min(1, Math.max(0, (offset - 0.18) / 0.12));   // 0.18→0.30
    const fadeOutProgress = Math.min(1, Math.max(0, (tunnelProgress - 0.75) / 0.25)); // 마지막 25% 구간 페이드아웃
    const opacity = fadeInProgress * (1 - fadeOutProgress);

    groupRef.current.visible = opacity > 0;

    if (opacity < 1) {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = opacity;
        }
      });
    }

    // TUNNEL_START_SCROLL(=0.18)부터 즉시 이동 시작 — 멈춤 구간 없음
    // easeOut: 스크롤 초반에 빠르게 다가오고 후반에 안정화
    const easedProgress = 1 - Math.pow(1 - tunnelProgress, 2);

    const travelDistance = easedProgress * TOTAL_DEPTH * 2.5;

    // 각 프레임 Z 위치 업데이트 + 무한 루프
    frameGroupRefs.current.forEach((frame, i) => {
      if (!frame) return;
      let z = initialZPositions[i] + travelDistance;

      // 카메라 바로 앞(z=3)을 지나면 터널 뒤로 재배치
      while (z > 3) {
        z -= TOTAL_DEPTH;
      }

      frame.position.z = z;

      // 가까울수록 스케일 강조 (원근감 증폭)
      const depthScale = Math.max(0.4, 1 - Math.max(0, -z) / (TOTAL_DEPTH * 0.6) * 0.3);
      frame.scale.setScalar(depthScale);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* 터널 프레임 배열 */}
      {initialZPositions.map((initZ, i) => (
        <group
          key={i}
          ref={(el) => { frameGroupRefs.current[i] = el; }}
          position={[0, 0, initZ]}
        >
          <TunnelFrame frameIndex={i} />
        </group>
      ))}

      {/* 배경 파티클 */}
      <TunnelParticles />

      {/* 소실점 광원 */}
      <TunnelVanishLight />

      {/* 터널 측벽 앰비언트 라이트 */}
      <pointLight color="#7c3aed" intensity={2} distance={30} position={[-5, 0, -20]} decay={2} />
      <pointLight color="#4f46e5" intensity={2} distance={30} position={[5, 0, -20]} decay={2} />
    </group>
  );
}
