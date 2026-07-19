import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header({ onExportBrief, hasEntries }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isTimeline = location.pathname === '/timeline';

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <button className="app-logo" onClick={() => navigate('/')}>
          <svg className="app-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12h6M12 9v6" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="app-logo-text">MediFlow</span>
        </button>

        <nav className="app-nav">
          {isTimeline && onExportBrief && hasEntries && (
            <button className="btn btn-primary btn-sm" onClick={onExportBrief}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Doctor Brief
            </button>
          )}
          {!isTimeline && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/upload')}>
              Upload
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
