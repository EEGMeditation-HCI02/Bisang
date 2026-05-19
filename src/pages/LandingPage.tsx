import "./css/LandingPage.css";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { BrainIcon } from "../components/icons/BrainIcon";
import { MeditationIcon } from "../components/icons/MeditationIcon";
import { ProgressIcon } from "../components/icons/ProgressIcon";
import { useEffect, useRef } from "react";

function LandingPage() {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // ✅ ref를 로컬 변수에 복사
    const currentSections = sectionsRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 },
    );

    // 모든 section 관찰
    if (currentSections) {
      currentSections.forEach((section) => {
        if (section) observer.observe(section);
      });
    }

    // ✅ cleanup에서 로컬 변수 사용
    return () => {
      if (currentSections) {
        currentSections.forEach((section) => {
          if (section) observer.unobserve(section);
        });
      }
    };
  }, []);

  return (
    <>
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
        <div className="landing-right">
          <div className="landing-orb-container">
            <div className="landing-orb"></div>
          </div>
        </div>
      </div>

      <div
        className="service-section"
        ref={(el) => {
          if (el) sectionsRef.current[0] = el;
        }}
      >
        <div className="service-container">
          <h2 className="service-title">
            Where Mindfulness Meets Neuroscience
          </h2>
          <div className="service-cards">
            <div className="service-card">
              <div className="service-icon">
                <BrainIcon />
              </div>
              <h3>Brain Wave Detection</h3>
              <p>
                Advanced brain wave sensors detect and analyze your brain state
                in real-time with cutting-edge technology.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <MeditationIcon />
              </div>
              <h3>Meditation Programs</h3>
              <p>
                Science-based personalized meditation to relieve stress and
                enhance your focus and clarity.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <ProgressIcon />
              </div>
              <h3>Progress Tracking</h3>
              <p>
                Detailed analytics to visualize and monitor your personal growth
                journey over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="service-section service-section-alt"
        ref={(el) => {
          if (el) sectionsRef.current[1] = el;
        }}
      >
        <div className="service-container">
          <h2 className="service-title">Start Your Meditation Journey</h2>
          <div className="service-features">
            <div className="service-feature">
              <h3>Personalized Experience</h3>
              <p>
                AI-powered meditation programs tailored to your unique brain
                wave patterns for optimal results.
              </p>
            </div>
            <div className="service-feature">
              <h3>Real-time Feedback</h3>
              <p>
                Detect brain wave changes during meditation and receive instant
                guidance to deepen your practice.
              </p>
            </div>
            <div className="service-feature">
              <h3>Community</h3>
              <p>
                Grow and share experiences with a global community of mindful
                practitioners on the same journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
