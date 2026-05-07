import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'

import LandingPage from "./pages/LandingPage"
import HowtoGuidePage from "./pages/HowtoGuidePage"
import DashboardPage from "./pages/DashboardPage"

import GoogleLoginButton from "./components/GoogleLoginButton"
import Header from "./components/Header"
import Footer from "./components/Footer"

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <main style={{ paddingTop: '96.5px' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/googleloginbutton" element={<GoogleLoginButton />} />
            <Route path="/howtoguide" element={<HowtoGuidePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main> 
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App 

