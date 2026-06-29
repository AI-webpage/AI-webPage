import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import GLBCharacter from './character/GLBCharacter';
import Mascot from './character/Mascot';
import ErrorBoundary from './character/ErrorBoundary';
import { SKON } from './data/characters';
import { SKON_ANCHOR } from './config';

/**
 * skon(GLB 3D 캐릭터)을 모니터 위에 "DOM 앵커링" 하는 풀스크린 투명 캔버스.
 *
 * ★ 핵심: 캔버스는 transform 스테이지 "밖"의 풀스크린(viewport)으로 두고,
 *   매 프레임 모니터 DOM 의 실제 화면 좌표(getBoundingClientRect)를 읽어
 *   캐릭터의 위치·크기를 그 비율(SKON_ANCHOR)대로 맞춘다.
 *   → 모니터가 어떤 화면 크기/비율에서 어떻게 스케일·이동하든, 캐릭터는 실측값을
 *     따라가므로 모니터 위 동일한 상대 위치·크기에 항상 고정된다.
 *
 * OrthographicCamera 는 R3F 기본값(프러스텀 = 뷰포트 픽셀, 1 world unit = 1 px)을 쓰므로
 * 모니터의 화면 픽셀 좌표를 그대로 월드 좌표로 변환해 배치할 수 있다.
 *  - pointer-events:none → 아래 터미널 입력/클릭은 그대로 통과.
 *  - 캐릭터 베이스 키 = 1 world unit → 그룹 scale 로 "목표 픽셀 키" 를 만든다.
 */
function SkonTracker({ monitorRef }) {
  const ref = useRef();
  const size = useThree((s) => s.size); // 뷰포트 픽셀 (캔버스 = 풀스크린)

  useFrame(() => {
    const el = monitorRef.current;
    const g = ref.current;
    if (!el || !g) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;

    // 모니터 내 앵커점(화면 픽셀) → 월드 좌표(중심 원점, y 위쪽 +)
    const screenX = r.left + SKON_ANCHOR.x * r.width;
    const screenY = r.top + SKON_ANCHOR.y * r.height;
    g.position.x = screenX - size.width / 2;
    g.position.y = size.height / 2 - screenY;

    // 캐릭터 키 = 모니터 높이 × 비율 (베이스 키 1 → scale = 목표 픽셀 키)
    g.scale.setScalar(SKON_ANCHOR.height * r.height);
  });

  const sprite = <Mascot url={SKON.url} height={1} position={[0, 0, 0]} wave sway={0.03} renderOrder={10} />;

  return (
    <group ref={ref}>
      <ErrorBoundary fallback={sprite}>
        <Suspense fallback={sprite}>
          <GLBCharacter url={SKON.glb} position={[0, 0, 0]} height={1} renderOrder={10} />
        </Suspense>
      </ErrorBoundary>
    </group>
  );
}

export default function ForegroundCharacter({ monitorRef }) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      // 캐릭터를 크게 스케일해도 깊이(z) 클리핑이 없도록 카메라를 멀리 두고 far 를 넓힌다.
      camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 5000 }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 5, // 모니터/터미널(스테이지) 위, 다이브 검정(10) 아래
        pointerEvents: 'none',
      }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-4, 2, 3]} intensity={0.35} />

      {/* 절차적 환경맵(IBL) — KHR_materials_specular/ior 재질이 입체적으로 보이도록.
          네트워크/외부 HDR 불필요(Lightformer 로 큐브맵을 한 번 생성). */}
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={3} position={[0, 4, 6]} scale={[12, 12, 1]} />
          <Lightformer intensity={1.3} color="#cfe0ff" position={[-7, 2, 3]} scale={[8, 8, 1]} />
          <Lightformer intensity={1.3} color="#ffe2bd" position={[7, 1, 3]} scale={[8, 8, 1]} />
          <Lightformer intensity={0.8} position={[0, -5, -5]} scale={[12, 12, 1]} />
        </Environment>
      </Suspense>

      <SkonTracker monitorRef={monitorRef} />
    </Canvas>
  );
}
