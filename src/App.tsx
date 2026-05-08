import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import './App.css'

import LandingPage from "./pages/LandingPage"
import HowtoGuidePage from "./pages/HowtoGuidePage"
import DashboardPage from "./pages/DashboardPage"
import MeditationPage from "./pages/MeditationPage"
import MeditationSetupPage from "./pages/MeditationSetupPage"
import TestGuidePage from "./pages/TestGuidePage"
import UserSettingPage from "./pages/UserSettingPage" 
import SettingGuidePage from "./pages/SettingGuidePage"

import GoogleLoginButton from "./components/GoogleLoginButton"
import Header from "./components/Header"
import Footer from "./components/Footer"

// 헤더/푸터를 숨길 경로 목록
const HIDE_LAYOUT_PATHS = ["/meditation", "/meditationsetup"];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideLayout = HIDE_LAYOUT_PATHS.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      <main style={{ paddingTop: hideLayout ? 0 : '96.5px' }}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/googleloginbutton" element={<GoogleLoginButton />} />
          <Route path="/howtoguide" element={<HowtoGuidePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meditation" element={<MeditationPage />} />
          <Route path="/meditationsetup" element={<MeditationSetupPage />} />
          <Route path="/testguide" element={<TestGuidePage />} />
          <Route path="/usersetting" element={<UserSettingPage />} />
          <Route path="/settingguide" element={<SettingGuidePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;