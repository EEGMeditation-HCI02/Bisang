import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import GoogleLoginButton from "./components/GoogleLoginButton";

function App() {
  return (
    <>
      <div className="counter">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/googleloginbutton" element={<GoogleLoginButton />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
