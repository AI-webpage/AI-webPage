import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 공통 레이아웃 — 페이지 전환(페이드) + <Outlet />.
 *
 * 라우트가 바뀌면 key(pathname) 가 바뀌어 새 페이지가 검정 위로 페이드 인된다.
 *  - 랜딩 → 로딩 : 랜딩의 다이브가 화면을 검정으로 덮은 뒤 전환 → 로딩이 페이드 인.
 *  - 로딩 → 메인 : 로딩 종료 후 메인이 페이드 인.
 *
 * 이 경험(랜딩/로딩/메인 풀스크린)에는 디자인상 헤더가 없어 Header 를 두지 않는다.
 * (라우팅/레이아웃과 페이지 관심사 분리는 유지 — 비즈니스 로직·스타일은 각 페이지에)
 */
export default function RootLayout() {
  const location = useLocation();
  return (
    <motion.main
      key={location.pathname}
      style={{ position: 'fixed', inset: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <Outlet />
    </motion.main>
  );
}
