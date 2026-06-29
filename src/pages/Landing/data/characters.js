// 랜딩 주인공 캐릭터(skon) 에셋.
// 과거엔 5종 마스코트가 있었으나 실제 렌더되는 건 skon 뿐 → skon 만 유지.
// (?url 로 강제 에셋 처리 — Vite 가 .glb 를 모듈로 파싱하지 않게 한다.)
import skonUrl from '../../../assets/images/skon 1.svg';
import skonGlb from '../../../assets/motion/skon.glb?url';

//  - url : 2D 스프라이트(SVG). GLB 로드 실패 시 폴백.
//  - glb : 3D 모델 URL.
export const SKON = {
  id: 'skon',
  name: 'SKON',
  url: skonUrl,
  glb: skonGlb,
  accent: '#5fbf6a',
};
