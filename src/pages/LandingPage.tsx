import "./css/LandingPage.css";
import GoogleLoginButton from "../components/GoogleLoginButton";

function LandingPage() {
  return (
    <div className="landing-root">
      <div className="landing-left">
        <div className="landing-title-wrap">
          <div className="landing-title">
            <span className="landing-title-main">
              Change your
              <br />
              life with
              <br />
            </span>
            <span className="landing-title-accent">clarity.</span>
          </div>
          <div className="landing-desc">
            Discover the intersection of ancient mindfulness and
            <br />
            cutting-edge neurotechnology. Enter the sanctuary.
          </div>
        </div>
        <div className="landing-auth-wrap">
          <div className="landing-auth-box">
            <GoogleLoginButton />
            <div className="landing-divider-wrap"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
