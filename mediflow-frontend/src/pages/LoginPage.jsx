import { useState } from 'react';
import { useAuth } from '../AuthContext';
import './LoginPage.css';
import './LandingPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg className="login-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6M12 9v6" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="login-logo-text">MediFlow</span>
          </div>
          <p className="login-subtitle">Patient Care Coordination</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="email">Email or Username</label>
            <input
              id="email"
              type="text"
              placeholder="doctor@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg login-btn">
            Log In
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button className="btn btn-secondary btn-lg login-guest-btn" onClick={login}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Continue as Guest
        </button>

        <p className="login-disclaimer">
          This is a demo application for the Codebenders AI Hackathon.
          No real authentication is performed.
        </p>
      </div>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Four simple steps to get your unified health timeline</p>
          </div>
          <div className="steps-grid">
            <div className="step-card card">
              <div className="step-number">1</div>
              <div className="step-icon-wrapper">
                <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="step-title">Upload Documents</h3>
              <p className="step-desc">Upload your prescriptions, lab reports, or discharge summaries. We support JPG, PNG, and PDF.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">2</div>
              <div className="step-icon-wrapper">
                <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 className="step-title">AI Extraction</h3>
              <p className="step-desc">Our AI extracts medications, dates, diagnoses, and doctors — each field tagged by extraction confidence.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">3</div>
              <div className="step-icon-wrapper">
                <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="step-title">Conflict Detection</h3>
              <p className="step-desc">Automatically detects when two doctors prescribed the same active ingredient under different brand names.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">4</div>
              <div className="step-icon-wrapper">
                <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="step-title">Doctor Brief</h3>
              <p className="step-desc">One-click export of a clinical-shorthand summary for your next physician appointment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Key Features</h2>
            <p className="section-subtitle">What makes MediFlow different</p>
          </div>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <polyline points="17 5 12 1 7 5" />
                  <polyline points="17 19 12 23 7 19" />
                </svg>
              </div>
              <h3 className="feature-title">Visual Timeline</h3>
              <p className="feature-desc">See your complete care history at a glance — a chronological, package-tracker-style timeline that organizes every visit, prescription, and lab result.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="feature-title">Conflict Detection</h3>
              <p className="feature-desc">Flags overlapping medications across different doctors — powered by a deterministic ingredient lookup, not an LLM guess.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className="feature-title">Confidence-Aware Extraction</h3>
              <p className="feature-desc">Every extracted field is tagged green/yellow/red by confidence. Low-confidence fields are clickable to verify against the source document.</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon" style={{ background: '#f0f0ff', color: '#7c3aed' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="feature-title">Doctor Brief</h3>
              <p className="feature-desc">One-click clinical summary in medical shorthand — ready to share with your physician at your next appointment.</p>
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
