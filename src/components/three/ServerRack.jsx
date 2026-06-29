// ============================================
// 서버랙 3D 컴포넌트 (개선판)
// - 화면 중앙 배치
// - 사선 각도(약 25도 Y축 회전)로 입체감 표현
// - 유리+금속 복합 재질로 가시성 강화
// - 마우스 패럴랙스 + 스크롤 전진/페이드
// ============================================

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

// 컬러 상수
const COLOR_INDIGO = new THREE.Color('#4f46e5');
const COLOR_PURPLE = new THREE.Color('#7c3aed');
const COLOR_CYAN   = new THREE.Color('#06b6d4');
const COLOR_TEAL   = new THREE.Color('#0d9488');
const COLOR_GREEN  = new THREE.Color('#10b981');

const LED_COLORS = [
  COLOR_INDIGO, COLOR_PURPLE, COLOR_CYAN,
  COLOR_GREEN,  COLOR_INDIGO, COLOR_TEAL,
  COLOR_CYAN,   COLOR_PURPLE,
];

// ============================================
// 개별 서버 유닛 슬롯
// ============================================
function ServerUnit({ yPos, colorIndex, slotIndex }) {
  const ledRef    = useRef();
  const glowRef   = useRef();
  const led2Ref   = useRef();
  const lightRef  = useRef();
  const barRef    = useRef();
  const ledColor  = LED_COLORS[colorIndex % LED_COLORS.length];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const phase = t * 1.8 + slotIndex * 0.65;

    // ── 4가지 깜빡임 패턴 ──────────────────────────────
    let ledI;
    const p = slotIndex % 4;
    if (p === 0) {
      // 불규칙 플리커: 랜덤 타이밍으로 순간 최대 밝기
      const f1 = Math.sin(t * 17.3 + slotIndex * 5.1);
      const f2 = Math.sin(t *  8.7 + slotIndex * 2.9);
      ledI = f1 > 0.65 ? 6.0 : f2 > 0.5 ? 2.2 : 0.2;
    } else if (p === 1) {
      // 빠른 2진 깜빡임 (데이터 전송)
      ledI = Math.sin(t * 16 + slotIndex * 4.3) > 0.15 ? 5.0 : 0.08;
    } else if (p === 2) {
      // 느린 부드러운 펄스 (상태 LED)
      ledI = 1.5 + Math.sin(phase) * 3.5;
    } else {
      // 빠른 정현파 (활성 처리)
      ledI = 1.0 + Math.abs(Math.sin(t * 11 + slotIndex * 2.7)) * 4.0;
    }

    if (ledRef.current)   ledRef.current.material.emissiveIntensity   = ledI;
    if (glowRef.current)  glowRef.current.material.emissiveIntensity  = ledI * 0.35;
    if (led2Ref.current)  led2Ref.current.material.emissiveIntensity  = 0.8 + Math.sin(phase + Math.PI * 0.6) * 2.0;
    if (lightRef.current) lightRef.current.intensity                  = ledI * 0.55;
    if (barRef.current) {
      barRef.current.material.emissiveIntensity =
        0.6 + Math.abs(Math.sin(t * 3.2 + slotIndex * 0.9)) * 2.5;
      barRef.current.scale.x = 0.08 + Math.abs(Math.sin(t * 1.6 + slotIndex * 0.5)) * 0.92;
    }
  });

  return (
    <group position={[0, yPos, 0]}>
      {/* 유닛 본체 */}
      <mesh>
        <boxGeometry args={[1.72, 0.135, 0.88]} />
        <meshStandardMaterial color="#111122" metalness={0.9} roughness={0.12} />
      </mesh>
      {/* 전면 패널 */}
      <mesh position={[0, 0, 0.445]}>
        <boxGeometry args={[1.68, 0.125, 0.008]} />
        <meshStandardMaterial color="#191930" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* 통풍구 */}
      {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.452]}>
          <boxGeometry args={[0.1, 0.038, 0.003]} />
          <meshStandardMaterial color="#080815" />
        </mesh>
      ))}
      {/* 주 LED (크기 대폭 증가) */}
      <mesh ref={ledRef} position={[-0.74, 0, 0.455]}>
        <boxGeometry args={[0.07, 0.07, 0.014]} />
        <meshStandardMaterial
          color={ledColor} emissive={ledColor}
          emissiveIntensity={3.0} toneMapped={false}
        />
      </mesh>
      {/* LED 글로우 헤일로 (반투명 큰 사각형) */}
      <mesh ref={glowRef} position={[-0.74, 0, 0.458]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshStandardMaterial
          color={ledColor} emissive={ledColor}
          emissiveIntensity={1.2} transparent opacity={0.28}
          toneMapped={false} depthWrite={false}
        />
      </mesh>
      {/* 보조 LED (크기/강도 증가) */}
      <mesh ref={led2Ref} position={[-0.65, 0, 0.455]}>
        <boxGeometry args={[0.05, 0.05, 0.012]} />
        <meshStandardMaterial
          color={COLOR_CYAN} emissive={COLOR_CYAN}
          emissiveIntensity={2.5} toneMapped={false}
        />
      </mesh>
      {/* 활성 데이터 바 (두껍고 밝게) */}
      <mesh ref={barRef} position={[0.5, 0, 0.455]}>
        <boxGeometry args={[0.38, 0.026, 0.010]} />
        <meshStandardMaterial
          color={ledColor} emissive={ledColor}
          emissiveIntensity={2.5} toneMapped={false}
        />
      </mesh>
      {/* 슬롯 구분선 */}
      <mesh position={[0, -0.072, 0]}>
        <boxGeometry args={[1.76, 0.003, 0.9]} />
        <meshStandardMaterial color="#0a0a20" />
      </mesh>
      {/* 포인트 라이트 (강도 5배 증가) */}
      <pointLight
        ref={lightRef}
        color={ledColor}
        intensity={2.8}
        distance={2.8}
        decay={2}
        position={[-0.74, 0, 0.75]}
      />
    </group>
  );
}

// ============================================
// 랙 마운트 홀 (좌/우 측면)
// ============================================
function RackMountHoles({ side }) {
  const xPos = side === 'left' ? -0.91 : 0.91;
  const holes = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => 0.92 - i * 0.125),
    []
  );
  return (
    <group position={[xPos, 0, 0.22]}>
      {holes.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.045, 0.06, 0.035]} />
          <meshStandardMaterial color="#040410" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// 상단 로고/상태 패널
// ============================================
function TopPanel() {
  const powerRef    = useRef();
  const logoBarRef  = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // 전원 인디케이터: 빠른 깜빡임 (2진 ON/OFF)
    const pwrBlink = Math.sin(t * 13.5) > 0.1 ? 5.5 : 0.2;
    if (powerRef.current)   powerRef.current.material.emissiveIntensity   = pwrBlink;
    if (logoBarRef.current) logoBarRef.current.material.emissiveIntensity  = 1.8 + Math.sin(t * 0.6) * 1.2;
  });

  return (
    <group position={[0, 1.085, 0.445]}>
      {/* 패널 */}
      <mesh>
        <boxGeometry args={[1.68, 0.1, 0.008]} />
        <meshStandardMaterial color="#0c0c20" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* 브랜드 바 (더 넓고 밝게) */}
      <mesh ref={logoBarRef} position={[-0.38, 0, 0.006]}>
        <boxGeometry args={[0.58, 0.030, 0.006]} />
        <meshStandardMaterial color={COLOR_INDIGO} emissive={COLOR_INDIGO} emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      {/* 전원 인디케이터 (더 크게) */}
      <mesh ref={powerRef} position={[0.72, 0, 0.008]}>
        <cylinderGeometry args={[0.032, 0.032, 0.008, 16]} />
        <meshStandardMaterial color={COLOR_CYAN} emissive={COLOR_CYAN} emissiveIntensity={4.0} toneMapped={false} />
      </mesh>
      {/* 전원 글로우 */}
      <mesh position={[0.72, 0, 0.012]}>
        <planeGeometry args={[0.09, 0.09]} />
        <meshStandardMaterial color={COLOR_CYAN} emissive={COLOR_CYAN} emissiveIntensity={2.0} transparent opacity={0.3} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* 포인트 라이트 - 패널 */}
      <pointLight color={COLOR_INDIGO} intensity={3.5} distance={1.5} decay={2} position={[0, 0.1, 0.3]} />
    </group>
  );
}

// ============================================
// 내부 케이블 (데이터 흐름)
// ============================================
function DataCables() {
  const refs = useRef([]);
  const cables = useMemo(() => [
    { x: -0.62, color: COLOR_INDIGO },
    { x: -0.42, color: COLOR_PURPLE },
    { x:  0.58, color: COLOR_CYAN   },
    { x:  0.76, color: COLOR_INDIGO },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((c, i) => {
      if (c) c.material.emissiveIntensity = 0.8 + Math.abs(Math.sin(t * 3.5 + i * 1.4)) * 2.5;
    });
  });

  return (
    <group position={[0, 0, -0.32]}>
      {cables.map((cable, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[cable.x, 0, 0]}>
          <boxGeometry args={[0.016, 2.05, 0.016]} />
          <meshStandardMaterial color={cable.color} emissive={cable.color} emissiveIntensity={0.2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// 바닥 반사 플레이트 (서버랙 아래)
// ============================================
function BaseReflection() {
  return (
    <mesh position={[0, -1.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.5, 2.0]} />
      <meshStandardMaterial
        color="#080818"
        metalness={0.95}
        roughness={0.08}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// ============================================
// 메인 서버랙 컴포넌트
// ============================================
export default function ServerRack({ mouseRef }) {
  const groupRef = useRef();
  const scroll   = useScroll();

  // 8개 유닛 슬롯 데이터
  const serverUnits = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      yPos:       0.82 - i * 0.19,
      colorIndex: i,
      slotIndex:  i,
    })),
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const offset = scroll.offset;

    // ── 마우스 패럴랙스 (초기 회전각에 더해짐) ──
    const mouse = mouseRef.current;
    // 목표 회전: 초기 사선 각도(Y: 0.42 rad ≈ 24도) + 마우스 오프셋
    const targetY = 0.42 + mouse.x * 0.18;
    const targetX = -0.08 + mouse.y * 0.10;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 4.5 * delta;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 4.5 * delta;

    // ── 스크롤: 전진 + 페이드 아웃 ──
    // pages=4 기준: 터널 시작(0.10) 전에 완전히 사라져야 함
    const zStart = 0.02;
    const zEnd   = 0.12;
    const zProg  = Math.max(0, Math.min(1, (offset - zStart) / (zEnd - zStart)));

    // Z축 전진 (카메라 방향으로) - 초기 위치 Z=-2에서 시작
    groupRef.current.position.z = -2 + zProg * 18;
    // Y는 바닥(Y=-1.65) 기준 고정: 랙 중심 Y=-0.3 → 0으로 살짝 상승
    groupRef.current.position.y = -0.3 + zProg * 0.3;
    // 스케일 증가
    groupRef.current.scale.setScalar(1 + zProg * 0.9);

    // 페이드 아웃: zProg 0.5에서 시작해 1.0에서 완전히 사라짐
    // 실제 offset 구간: 0.07~0.12 (터널 시작 0.10 직전 완료)
    const opacity = Math.max(0, 1 - Math.max(0, zProg - 0.5) / 0.5);
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity     = opacity;
      }
    });
  });

  return (
    /*
     * 초기 위치: 화면 중앙(x=0), 약간 아래(y=-0.3), 카메라와 거리 2(z=-2)
     * 초기 회전: Y축 24도 → 사선 각도로 서버랙 입체감 표현
     *            X축 -8도 → 살짝 위에서 내려다보는 시점
     */
    <group
      ref={groupRef}
      position={[0, -0.3, -2]}
      rotation={[(-Math.PI / 180) * 8, (Math.PI / 180) * 24, 0]}
    >
      {/* ── 랙 외부 케이스 (어두운 금속 + 약한 투과) ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.05, 2.5, 1.15]} />
        <meshPhysicalMaterial
          color="#1e1c3a"
          metalness={0.75}
          roughness={0.22}
          transmission={0.05}
          thickness={0.5}
          reflectivity={0.55}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* ── 전면 유리 패널 (약한 투명) ── */}
      <mesh position={[0, 0, 0.585]}>
        <boxGeometry args={[1.95, 2.42, 0.02]} />
        <meshPhysicalMaterial
          color="#a5b4fc"
          transmission={0.75}
          roughness={0.04}
          thickness={0.15}
          ior={1.45}
          reflectivity={0.4}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 상단 테두리 엣지 (밝은 하이라이트) ── */}
      <mesh position={[0, 1.26, 0]}>
        <boxGeometry args={[2.08, 0.055, 1.18]} />
        <meshStandardMaterial color="#252545" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* ── 하단 테두리 엣지 ── */}
      <mesh position={[0, -1.26, 0]}>
        <boxGeometry args={[2.08, 0.055, 1.18]} />
        <meshStandardMaterial color="#1a1a38" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* ── 좌측 베젤 ── */}
      <mesh position={[-0.975, 0, 0]}>
        <boxGeometry args={[0.06, 2.5, 1.18]} />
        <meshStandardMaterial color="#2e2b5a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* ── 우측 베젤 ── */}
      <mesh position={[0.975, 0, 0]}>
        <boxGeometry args={[0.06, 2.5, 1.18]} />
        <meshStandardMaterial color="#2e2b5a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── 전면 엣지 강조 라인 (상단/하단) ── */}
      <mesh position={[0, 1.24, 0.59]}>
        <boxGeometry args={[2.06, 0.016, 0.016]} />
        <meshStandardMaterial color={COLOR_INDIGO} emissive={COLOR_INDIGO} emissiveIntensity={3.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.24, 0.59]}>
        <boxGeometry args={[2.06, 0.016, 0.016]} />
        <meshStandardMaterial color={COLOR_PURPLE} emissive={COLOR_PURPLE} emissiveIntensity={3.0} toneMapped={false} />
      </mesh>

      {/* ── 마운트 홀 ── */}
      <RackMountHoles side="left" />
      <RackMountHoles side="right" />

      {/* ── 상단 패널 ── */}
      <TopPanel />

      {/* ── 내부 케이블 ── */}
      <DataCables />

      {/* ── 서버 유닛 8슬롯 ── */}
      {serverUnits.map((u, i) => (
        <ServerUnit key={i} {...u} />
      ))}

      {/* ── 하단 플레이트 ── */}
      <mesh position={[0, -1.16, 0]}>
        <boxGeometry args={[1.94, 0.04, 1.02]} />
        <meshStandardMaterial color="#09081c" metalness={0.98} roughness={0.04} />
      </mesh>

      {/* ── 바닥 반사면 ── */}
      <BaseReflection />

      {/* ── 내부 조명 ── */}
      <pointLight color={COLOR_INDIGO} intensity={5}   distance={3}   decay={2} position={[ 0.0,  0.0, -0.3]} />
      <pointLight color={COLOR_PURPLE} intensity={3.5} distance={2.2} decay={2} position={[ 0.6,  0.5, -0.2]} />
      <pointLight color={COLOR_CYAN}   intensity={2.5} distance={2.0} decay={2} position={[-0.6, -0.4, -0.2]} />
    </group>
  );
}
