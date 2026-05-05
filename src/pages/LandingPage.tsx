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
            <div className="landing-divider-wrap">
              <div className="landing-divider-line">
                <div className="landing-divider-bar"></div>
              </div>
              <div className="landing-divider-label-wrap">
                <div className="landing-divider-label">Or</div>
              </div>
            </div>
            <div className="landing-email-btn">
              <div className="landing-email-label">Continue with Email</div>
            </div>
            <div className="landing-auth-desc">
              <div className="landing-auth-desc-label">
                By signing in, you agree to our Terms and Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="landing-right">
        <div className="landing-visual-box">
          <img
            className="landing-visual-img"
            src="https://placehold.co/510x638"
            alt="visual"
          />
          <div className="landing-visual-gradient"></div>
          <div className="landing-visual-content">
            <div className="landing-visual-avatar">
              <div className="landing-visual-avatar-bg"></div>
              <div className="landing-visual-avatar-icon-wrap">
                <div className="landing-visual-avatar-icon"></div>
              </div>
            </div>
            <div className="landing-visual-title-wrap">
              <div className="landing-visual-title">Find Your Resonance</div>
            </div>
            <div className="landing-visual-desc-wrap">
              <div className="landing-visual-desc">
                Synchronize your mind with nature.
              </div>
            </div>
          </div>
        </div>
        <div className="landing-visual-circle">
          <div className="landing-visual-circle-bg"></div>
          <div className="landing-visual-circle-icon-wrap">
            <div className="landing-visual-circle-icon"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
