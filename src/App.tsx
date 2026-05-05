import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'

import LandingPage from "./pages/LandingPage"
//import GoogleLoginButton from "./components/GoogleLoginButton"
import Header from "./components/Header"
import Footer from "./components/Footer"

//여기 추가함
import { lazy, Suspense } from "react";
const GoogleLoginButton = lazy(() => import("./components/GoogleLoginButton"))

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <main style={{ paddingTop: '96.5px' }}>
          {/* <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/googleloginbutton" element={<GoogleLoginButton />} />
          </Routes> */}
          <Suspense fallback={<div style={{ padding: "2rem" }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/googleloginbutton" element={<GoogleLoginButton />} />
            </Routes>
          </Suspense>
        </main> 
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
