// 캐릭터 / 배경 에셋 정의.
// Vite 에서 svg/png/glb import 는 해당 파일의 URL 문자열을 돌려준다.
// (파일명에 공백·한글이 포함돼 있어도 Vite 가 처리한다.)

import dmoUrl from "../assets/images/D-MO.svg";
import artiUrl from "../assets/images/arti.svg";
import bartUrl from "../assets/images/b-art.svg";
import converUrl from "../assets/images/conver.svg";
import skonUrl from "../assets/images/skon 1.svg";

import grassUrl from "../assets/images/풀밭.png";
import monitorUrl from "../assets/images/모니터_빈화면.svg";

// GLB 모션. 현재 저장소엔 skon.glb 만 존재 → 나머지는 svg 스프라이트로 자동 대체.
// (?url 로 강제 에셋 처리 — Vite 가 .glb 를 모듈로 파싱하지 않게 한다.)
import skonGlb from "../assets/motion/skon.glb?url";

// 5종 마스코트.
//  - url : 2D 스프라이트(SVG). 썸네일/월드/그리고 GLB 미존재 시 대체용.
//  - glb : 3D 모델 URL (없으면 null → 스프라이트로 대체).
export const CHARACTERS = [
  { id: "skon", name: "SKON", url: skonUrl, glb: skonGlb, accent: "#5fbf6a" },
  { id: "dmo", name: "D-MO", url: dmoUrl, glb: null, accent: "#ff7ab8" },
  { id: "arti", name: "ARTI", url: artiUrl, glb: null, accent: "#ff9a3c" },
  { id: "bart", name: "B-ART", url: bartUrl, glb: null, accent: "#3fc7c2" },
  {
    id: "conver",
    name: "CONVER",
    url: converUrl,
    glb: null,
    accent: "#ffae42",
  },
];

export const CHARACTER_MAP = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
);

export const ASSETS = {
  grass: grassUrl,
  monitor: monitorUrl, // 모니터_빈화면.png (코드 없는 빈 CRT)
};
