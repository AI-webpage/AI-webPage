import styled from 'styled-components';
import { COLORS } from '../../styles/theme';

export const LoadingRoot = styled.div`
  position: fixed;
  inset: 0;
  background: ${COLORS.black};
  overflow: hidden;
`;

/* 로딩 영상 — 화면 비율이 달라도 빈 공간 없이 채움 */
export const LoadingVideoEl = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/* 로딩 문구 — clamp 로 가독성 있게 스케일 */
export const LoadingText = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(36px, 9vh, 90px);
  text-align: center;
  color: ${COLORS.white};
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: clamp(16px, 2.4vw, 22px);
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  white-space: pre; /* 점 개수 변화 시 너비 흔들림 방지 */
`;
