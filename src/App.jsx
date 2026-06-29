import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyle } from './styles/GlobalStyle';
import RootLayout from './layout/RootLayout';
import Landing from './pages/Landing/Landing';
import Loading from './pages/Loading/Loading';
import Main from './pages/Main/Main';
import Campus3D from './pages/Campus3D/Campus3D';

/**
 * 라우팅 정의만 담당 (비즈니스 로직·스타일 없음).
 *
 * 기본 흐름:  / (랜딩) → 다이브 → /main (키보드)
 *   - 랜딩 터미널 [Enter] → 다이브 후 /main 으로 이동 (로딩 불필요 시 로딩 건너뜀)
 * /loading (로딩 영상) 은 로딩이 필요한 경우에만 사용하는 별도 라우트.
 *   - 로딩 영상 종료(또는 폴백) → /main 으로 이동
 */
export default function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/main" element={<Main />} />
            <Route path="/campus3d" element={<Campus3D />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
