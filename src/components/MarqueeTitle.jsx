import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { COLORS, TITLE_Y, TITLE_Z } from "../data/layout";

/**
 * 배경 큰 글자 "WELCOME TO SOFTWARE".
 *  - 흰색 반투명(~40%), 모니터 뒤(z = TITLE_Z)에 깔린다.
 *  - 오른쪽 → 왼쪽으로 흘러가며 나타났다(가운데) 사라지는(가장자리) 동작을 무한반복.
 *  - 좌우 끝 글자가 화면 밖으로 잘려 나갈 만큼 크게.
 */
export default function MarqueeTitle({
  text = "WELCOME TO SOFTWARE",
  y = TITLE_Y,
  z = TITLE_Z,
  fontSize = 3,
  peakOpacity = 0.9,
  period = 9, // 한 번 가로지르는 데 걸리는 초
}) {
  const ref = useRef();
  const t = useRef(0);
  const textWidth = useRef(20);
  const { viewport } = useThree();

  useFrame((_, dt) => {
    const node = ref.current;
    if (!node) return;
    t.current += Math.min(dt, 0.05);
    const p = (t.current % period) / period; // 0..1

    // 이동 거리 = 화면 폭 + 글자 폭 (양끝이 완전히 화면 밖으로 나가도록)
    const span = viewport.width + textWidth.current;
    node.position.x = (0.5 - p) * span; // +span/2 (오른쪽) → -span/2 (왼쪽)

    // opacity 는 전체 구간에서 일정하게 유지 (가장자리 페이드 없음)
    if (node.material) {
      node.material.transparent = true;
      node.material.opacity = 1; // fillOpacity(peakOpacity) 와 곱해져 일정한 불투명도
    }
  });

  return (
    <Text
      ref={ref}
      position={[0, y, z]}
      fontSize={fontSize}
      color={COLORS.title}
      fillOpacity={peakOpacity}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.04}
      renderOrder={-5}
      depthOffset={1}
      onSync={(node) => {
        const bb = node.geometry?.boundingBox;
        if (bb) textWidth.current = bb.max.x - bb.min.x;
      }}
    >
      {text}
    </Text>
  );
}
