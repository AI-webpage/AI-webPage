// SOFTWARE 월드맵 공용 상수 — 팔레트 / 카메라 / 섬 치수.
// (이후 STEP 2~5 의 집·물·소품·캐릭터가 모두 이 값을 공유한다)

export const PALETTE = {
  bg: '#2A1E0E', // 배경(브라운 비네트)
  terraceTop: '#C9A26B', // 테라스 윗면
  terraceSide: '#9B7950', // 테라스 옆면
  grass: '#727272', // 잔디
  grassShade: '#4a4c4d', // 잔디 음영
  leaf: '#6E8B3D', // 잎
  leafDark: '#4A5E22', // 잎 진한
  trunk: '#8A6A45', // 줄기/흙
  roof: '#C96C4A', // 지붕
  roofShade: '#A45030', // 지붕 음영
  wall: '#E6D6BC', // 벽
  wallShade: '#C6AA86', // 벽 음영
  path: '#C49266', // 길
  pathDark: '#A6743F', // 길 진한
  water: '#5FB6A8', // 물
  waterBright: '#9BD7C8', // 물 하이라이트
  bubble: '#EFE3C7', // 말풍선
  bubbleEdge: '#9A7A50', // 말풍선 테두리
  ink: '#5A463A', // 글자/선
  lampGlow: '#FFD27A', // 램프 발광
}

// 아이소메트릭 OrthographicCamera 기본값
export const CAMERA = {
  position: [14, 13, 14],
  zoom: 30,
  near: 0.1,
  far: 150,
}

// 섬: 한 변 20유닛, 잔디 윗면 y = 0
export const ISLAND = {
  size: 30,
  topY: 0,
}
