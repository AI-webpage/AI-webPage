import MarqueeTitle from "../components/MarqueeTitle";
import Monitor from "../components/Monitor";
import ScreenRectBridge from "../components/ScreenRectBridge";

/**
 * Scene A — 랜딩(첫 화면).
 *
 * 배경 영상(landing.mp4, 하늘+풀밭 포함)은 App 의 HTML <video> 가 깔고, 캔버스는 투명.
 * 그 위에:
 *   ① MarqueeTitle "WELCOME TO SOFTWARE"
 *   ② 중앙 모니터(빈 화면) + HTML 터미널(ScreenRectBridge 가 정렬)
 *
 * skon.glb 는 터미널보다 위 레이어에 올라가야 해서 별도 캔버스
 * (ForegroundCharacter, App 에서 렌더)로 분리되어 있다.
 */
export default function LandingScene() {
  return (
    <group>
      <MarqueeTitle text="WELCOME TO SOFTWARE" />
      <Monitor />
      <ScreenRectBridge />
    </group>
  );
}
