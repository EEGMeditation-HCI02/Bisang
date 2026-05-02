/* eslint-disable */
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
