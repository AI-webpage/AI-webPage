import { Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import WorldScene from "./WorldScene";
import GS25Modal from "./modals/GS25Modal";
import BukakModal from "./modals/BukakModal";
import RightWingModal from "./modals/RightWingModal";
import Bus1164Modal from "./modals/Bus1164Modal";
import Bus2115Modal from "./modals/Bus2115Modal";
import CampusGuideModal from "./modals/CampusGuideModal";
import "./Campus3D.css";

/**
 * 3D 캠퍼스 맵 페이지.
 *
 * 원본(AI-webPage/feat) 의 World 씬·랜드마크·모달을 그대로 가져온 페이지.
 * - 캔버스: OrthographicCamera + OrbitControls 로 둘러보는 북학관/버스/편의점 맵.
 * - 좌상단 `?` → 캠퍼스 가이드, 우상단 `돌아가기` → 메인으로 복귀.
 * - 랜드마크 클릭 → 각 모달(GS25/북학관/우측동/버스).
 *
 * campusMove 영상이 끝나고 fade out 되면 Main 에서 이 라우트로 진입한다.
 */
export default function Campus3D() {
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [isGS25ModalOpen, setIsGS25ModalOpen] = useState(false);
  const [isBukakModalOpen, setIsBukakModalOpen] = useState(false);
  const [isRightWingModalOpen, setIsRightWingModalOpen] = useState(false);
  const [isBus1164ModalOpen, setIsBus1164ModalOpen] = useState(false);
  const [isBus2115ModalOpen, setIsBus2115ModalOpen] = useState(false);
  const [isCampusGuideModalOpen, setIsCampusGuideModalOpen] = useState(false);

  const closeGS25Modal = useCallback(() => setIsGS25ModalOpen(false), []);
  const closeBukakModal = useCallback(() => setIsBukakModalOpen(false), []);
  const closeRightWingModal = useCallback(
    () => setIsRightWingModalOpen(false),
    [],
  );

  const goBack = useCallback(() => navigate("/main"), [navigate]);

  return (
    <div className="campus3d">
      <Canvas
        className="campus3d-canvas"
        orthographic
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0, 100], zoom: 100, near: 0.1, far: 2000 }}
        style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}
      >
        <Suspense fallback={null}>
          <WorldScene
            onGS25Click={() => setIsGS25ModalOpen(true)}
            onBukakClick={() => setIsBukakModalOpen(true)}
            onRightWingClick={() => setIsRightWingModalOpen(true)}
            onBus1164Click={() => setIsBus1164ModalOpen(true)}
            onBus2115Click={() => setIsBus2115ModalOpen(true)}
          />
          <ReadySignal onReady={() => setReady(true)} />
        </Suspense>
      </Canvas>

      {/* 월드 브라운 비네트 (CSS) */}
      <div className="vignette" />

      {/* 오버레이 — 캠퍼스 가이드 / 돌아가기 버튼 */}
      <div className="overlay">
        <button
          className="btn btn-campus-guide"
          type="button"
          onClick={() => setIsCampusGuideModalOpen(true)}
          aria-label="3D 캠퍼스 투어 안내"
        >
          ?
        </button>
        <button className="btn btn-back" type="button" onClick={goBack}>
          돌아가기
        </button>
      </div>

      {/* 최초 텍스처 로딩 동안만 표시되는 로더 */}
      {!ready && (
        <div className="loader">
          <div className="spinner" />
          <div className="pct">로딩 중…</div>
          <div>WELCOME TO SOFTWARE</div>
        </div>
      )}

      {isCampusGuideModalOpen && (
        <CampusGuideModal onClose={() => setIsCampusGuideModalOpen(false)} />
      )}
      {isGS25ModalOpen && <GS25Modal onClose={closeGS25Modal} />}
      {isBukakModalOpen && <BukakModal onClose={closeBukakModal} />}
      {isRightWingModalOpen && <RightWingModal onClose={closeRightWingModal} />}
      <Bus1164Modal
        isOpen={isBus1164ModalOpen}
        onClose={() => setIsBus1164ModalOpen(false)}
      />
      <Bus2115Modal
        isOpen={isBus2115ModalOpen}
        onClose={() => setIsBus2115ModalOpen(false)}
      />
    </div>
  );
}

/**
 * Suspense 경계 안에서 모든 텍스처가 resolve 된 뒤에만 마운트되므로,
 * 마운트 시점에 ready 플래그를 올려 로더를 끈다. (원본 ReadySignal 동일 동작)
 */
function ReadySignal({ onReady }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}
