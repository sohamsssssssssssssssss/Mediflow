import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate('/upload');
  };

  return (
    <div className="landing">
      {/* ── Header ── */}
      <header className="landing-header">
        <div className="container landing-header-inner">
          <div className="landing-logo">
            <svg className="landing-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6M12 9v6" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="landing-logo-text">MediFlow</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">Hackathon Project — PS6</div>
            <h1 className="hero-title">
              One timeline for <span className="hero-highlight">every doctor</span>,
              <br />every prescription, every visit.
            </h1>
            <p className="hero-subtitle">
              Patients juggling multiple doctors end up with fragmented records,
              missed follow-ups, and unnoticed medication overlaps. MediFlow builds
              one unified, AI-powered timeline and flags conflicts automatically.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={handleCTA}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload a Document
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-illustration">
              <div className="hero-card hero-card-1">
                <div className="hero-card-dot green" />
                <div className="hero-card-text">
                  <span className="hero-card-label">Crocin 650mg</span>
                  <span className="hero-card-date">Jul 8</span>
                </div>
              </div>
              <div className="hero-card hero-card-2">
                <div className="hero-card-dot green" />
                <div className="hero-card-text">
                  <span className="hero-card-label">CBC Panel</span>
                  <span className="hero-card-date">Jul 12</span>
                </div>
              </div>
              <div className="hero-card hero-card-3">
                <div className="hero-card-dot amber" />
                <div className="hero-card-text">
                  <span className="hero-card-label">Dolo 650mg</span>
                  <span className="hero-card-date">Jul 15</span>
                </div>
              </div>
              <div className="hero-conflict-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                ⚠️ Conflict Detected
              </div>
              <div className="hero-line" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="disclaimer-section">
        <div className="container">
          <div className="disclaimer-card">
            <svg className="disclaimer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="disclaimer-text">
              <strong>MediFlow is an administrative coordination tool, not a diagnostic system.</strong>
              {' '}It does not provide medical advice — always verify flagged information with your physician.
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <div className="landing-footer-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M9 12h6M12 9v6" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            MediFlow
          </div>
          <p className="landing-footer-text">
            Built for Codebenders AI Hackathon — PS6: Patient Care Coordination
          </p>
        </div>
      </footer>
    </div>
  );
}
