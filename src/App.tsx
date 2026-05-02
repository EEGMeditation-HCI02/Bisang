import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'

import LandingPage from "./pages/LandingPage"
import GoogleLoginButton from "./components/GoogleLoginButton"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/googleloginbutton" element={<GoogleLoginButton />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
