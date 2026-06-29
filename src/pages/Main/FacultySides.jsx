import { useState } from 'react';
import styled from 'styled-components';
import { FACULTY } from './faculty';
import { CARD_TOP_VH } from './styles';

/**
 * 교수진 사이드 배치 — 영상 좌우 흰 여백에 교수 명함, 스크롤로 더 보임.
 *
 * - 플립 카드. 앞면 = 민미경 카드뉴스 레이아웃을 HTML 로 그대로 재현(가로형 명함):
 *     좌측 accent 아바타(images/<이름>.svg) /
 *     우측 상단(우측정렬): 이름 · "학위 + PROFESSOR" · "서경대학교 교수진" /
 *     우측 가장자리 accent 바 / 가운데 구분선 / 하단(좌측정렬): 전공분야·연구실·Email
 *   뒷면 = 유리 느낌 + "○○ 교수님한테서 살아남는 선배들의 꿀팁!" + tips. 클릭하면 뒤집힌다.
 * - 포인트 컬러(accent)는 교수별 색.
 */

const imgModules = import.meta.glob('../../assets/images/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const baseName = (p) => p.split('/').pop().normalize('NFC');
const imgByName = {};
for (const path in imgModules) imgByName[baseName(path)] = imgModules[path];
const photoOf = (name) => imgByName[`${name}.svg`.normalize('NFC')];

const LEFT = FACULTY.filter((_, i) => i % 2 === 0);
const RIGHT = FACULTY.filter((_, i) => i % 2 === 1);

function Card({ a }) {
  const [flipped, setFlipped] = useState(false);
  const photo = photoOf(a.name);
  return (
    <Flip
      type="button"
      className={flipped ? 'flipped' : ''}
      style={{ '--a': a.accent, '--b': a.accent2 }}
      onClick={() => setFlipped((f) => !f)}
      aria-label={`${a.name} 교수 — 클릭하면 꿀팁`}
    >
      <Inner>
        {/* 앞면 — 민미경 카드뉴스 레이아웃 */}
        <Face className="front">
          <BarTop aria-hidden="true" />
          <BarBottom aria-hidden="true" />

          <TopRow>
            {photo ? (
              <Avatar src={photo} alt={`${a.name} 교수`} loading="lazy" draggable={false} />
            ) : (
              <AvatarFallback>{a.initial}</AvatarFallback>
            )}
            <Who>
              <Name>{a.name}</Name>
              <DegreeLine>
                <span className="deg">{a.degree}</span> <span className="prof">PROFESSOR</span>
              </DegreeLine>
              <Univ>서경대학교 교수진</Univ>
            </Who>
          </TopRow>

          <Divider aria-hidden="true">
            <span className="acc" />
            <span className="rest" />
          </Divider>

          <Info>
            <p><b>전공분야</b> : {a.fields.join(' · ')}</p>
            <p><b>연구실</b> : {a.lab} · {a.phone}</p>
            <p><b>Email</b> : {a.email}</p>
          </Info>
        </Face>

        {/* 뒷면 — 꿀팁 */}
        <Face className="back">
          <BackTitle>{a.name} 교수님한테서 살아남는 선배들의 꿀팁!</BackTitle>
          <Tips>
            {a.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </Tips>
          <Foot>↻ 눌러서 앞면으로</Foot>
        </Face>
      </Inner>
    </Flip>
  );
}

export default function FacultySides() {
  return (
    <>
      <Col className="left" aria-label="교수진 (좌)">
        {LEFT.map((a) => (
          <Card key={a.name} a={a} />
        ))}
      </Col>
      <Col className="right" aria-label="교수진 (우)">
        {RIGHT.map((a) => (
          <Card key={a.name} a={a} />
        ))}
      </Col>
    </>
  );
}

/* ───── styled ───── */
const COL_W = 'calc((100vw - 56.25vh) / 2)';

const Col = styled.div`
  position: absolute;
  top: 0;
  width: ${COL_W};
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 5vh;
  padding: ${CARD_TOP_VH + 6}vh 1.6vw 12vh;
  box-sizing: border-box;

  &.left {
    left: 0;
    align-items: flex-end;
  }
  &.right {
    right: 0;
    align-items: flex-start;
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;

const Flip = styled.button`
  appearance: none;
  border: 0;
  padding: 0;
  margin: 0;
  background: none;
  cursor: pointer;
  width: min(720px, 100%); /* 전체 크게 (폰트도 cqw 라 비례 확대) */
  aspect-ratio: 1100 / 680; /* 큰 폰트가 들어가도록 세로 약간 여유 */
  container-type: inline-size;
  perspective: 1600px;
  font-family: 'Poppins', 'Pretendard', system-ui, sans-serif;
  &:focus-visible {
    outline: 3px solid #6366f1;
    outline-offset: 3px;
    border-radius: 20px;
  }
`;
const Inner = styled.span`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.5, 0.06, 0.2, 1);
  .flipped & {
    transform: rotateY(180deg);
  }
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.12s;
  }
`;
const Face = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 18px;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  box-shadow: 0 16px 40px rgba(10, 12, 24, 0.26);

  &.front {
    background: #ffffff;
    border: 1px solid #ececec;
    color: #111;
    padding: 5.5cqw; /* 상하·좌우 여백 동일 */
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 윗 공백 = 밑 공백 (가장자리 대칭) */
  }
  &.back {
    /* 효과 없이 원래 포인트 컬러(accent) + 완전 중앙정렬 */
    transform: rotateY(180deg);
    background: linear-gradient(150deg, var(--a), var(--b));
    color: #fff;
    padding: 5cqw;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 세로 중앙 */
    align-items: center; /* 가로 중앙 */
    text-align: center;
  }
`;

/* 우측 가장자리 accent 바 (상단/하단 코너) */
const BarTop = styled.span`
  position: absolute;
  top: 0;
  right: 3.5cqw;
  width: 1.4cqw;
  height: 30%;
  background: var(--a);
`;
const BarBottom = styled.span`
  position: absolute;
  bottom: 0; /* 카드 끝까지 닿게 (밑 공백 X) */
  right: 3.5cqw;
  width: 1.4cqw;
  height: 16%;
  background: var(--a);
`;

/* 상단: 아바타 + 우측 텍스트 */
const TopRow = styled.div`
  display: flex;
  align-items: flex-start; /* 이름 top 이 사진 top 라인과 맞음 */
  justify-content: space-between;
  gap: 4cqw;
`;
const Avatar = styled.img`
  width: 20cqw;
  aspect-ratio: 1;
  border-radius: 2.4cqw;
  object-fit: cover;
  flex: none;
`;
const AvatarFallback = styled.div`
  width: 20cqw;
  aspect-ratio: 1;
  border-radius: 2.4cqw;
  display: grid;
  place-items: center;
  font-size: 8cqw;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--a), var(--b));
  flex: none;
`;
const Who = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 좌측 정렬 */
  text-align: left;
  gap: 1.2cqw;
`;
const Name = styled.div`
  font-size: 7.3cqw;
  font-weight: 700; /* 살짝 얇게 */
  line-height: 1.05;
  color: #111;
`;
const DegreeLine = styled.div`
  font-size: 4.7cqw;
  font-weight: 600; /* 살짝 얇게 */
  .deg {
    color: var(--a);
  }
  .prof {
    color: #111;
  }
`;
const Univ = styled.div`
  margin-top: 1.2cqw;
  font-size: 3.8cqw;
  font-weight: 600;
  color: #666;
`;

/* 가운데 구분선 (좌 accent + 우 얇은 검정) */
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 0; /* 여백은 space-between 이 분배 */
  .acc {
    width: 26%;
    height: 0.8cqw;
    background: var(--a);
    border-radius: 2px;
  }
  .rest {
    flex: 1;
    height: 1px;
    background: #222;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.6cqw;
  text-align: left;
  p {
    margin: 0;
    font-size: 3.5cqw;
    font-weight: 500; /* 값은 얇게 */
    line-height: 1.35;
    color: #111;
    white-space: nowrap; /* 카테고리별 한 줄에 */
  }
  b {
    font-weight: 700; /* 전공분야·연구실·Email 라벨만 볼드 */
  }
`;

/* 뒷면 */
const BackTitle = styled.div`
  font-size: 5.7cqw;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
  margin-bottom: 3.5cqw;
`;
const Tips = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3cqw;
  list-style: none; /* 중앙정렬이라 불릿 제거 */
  text-align: center;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  li {
    font-size: 3.9cqw;
    font-weight: 500;
    line-height: 1.45;
    word-break: keep-all;
  }
`;
const Foot = styled.div`
  margin-top: 3cqw;
  font-size: 3.4cqw;
  font-weight: 600;
  opacity: 0.9;
  text-align: center;
`;
