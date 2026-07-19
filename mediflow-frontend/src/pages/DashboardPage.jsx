import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ContinuityScoreBadge from '../components/ContinuityScoreBadge';
import { fetchTimeline } from '../services/api';
import './DashboardPage.css';

const SEEDED_MEDICATIONS = [
  { name: 'Crocin 500mg', dosage: '1 tablet', frequency: 'As needed' },
  { name: 'Dolo 650mg', dosage: '1 tablet', frequency: 'Twice daily' },
  { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'With breakfast' },
];

const SEEDED_APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Priya Sharma', specialty: 'Cardiology', date: '2026-07-22', time: '10:30 AM' },
  { id: 2, doctor: 'Dr. Rajesh Patel', specialty: 'Orthopedics', date: '2026-07-28', time: '2:00 PM' },
  { id: 3, doctor: 'Dr. Anjali Mehta', specialty: 'General Medicine', date: '2026-08-05', time: '9:00 AM' },
];

const SEEDED_FOLLOWUPS = [
  { title: 'Follow-up with Dr. Sharma', due: 'Jul 22, 10:30 AM' },
  { title: 'CBC Blood Test', due: 'Jul 25, 7:00 AM' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchTimeline();
        if (cancelled) return;
        setEntries(data.entries || []);
        setConflicts(data.conflicts || []);
      } catch {
        // silently fail — seeded data still shows
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const hasRealData = entries.length > 0;
  const labs = entries.filter(e => e.document_type === 'lab_report' && e.tests_mentioned?.length > 0);

  return (
    <div className="page dashboard-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your care at a glance</p>
          </div>

          <ContinuityScoreBadge entries={entries} conflicts={conflicts} />

          {conflicts.length > 0 && (
            <div className="dashboard-alert card" onClick={() => navigate('/timeline')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0, color: 'var(--accent-amber)' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div className="dashboard-alert-body">
                <strong>{conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected</strong>
                <span>View details on the Timeline</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--text-muted)' }}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}

          <div className="dashboard-grid">
            <div className="dashboard-section card">
              <div className="dashboard-section-header">
                <h2>Active Medications</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/provider-view')}>View All</button>
              </div>
              <div className="dashboard-meds">
                {SEEDED_MEDICATIONS.map((m, i) => (
                  <div key={i} className="dashboard-med-item">
                    <div className="dashboard-med-name">{m.name}</div>
                    <div className="dashboard-med-detail">{m.dosage} · {m.frequency}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section card">
              <div className="dashboard-section-header">
                <h2>Upcoming Appointments</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>View All</button>
              </div>
              <div className="dashboard-appts">
                {SEEDED_APPOINTMENTS.map(a => (
                  <div key={a.id} className="dashboard-appt-item">
                    <div className="dashboard-appt-doctor">{a.doctor}</div>
                    <div className="dashboard-appt-detail">{a.specialty} · {a.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section card">
              <div className="dashboard-section-header">
                <h2>Pending Follow-ups</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reminders')}>View All</button>
              </div>
              <div className="dashboard-followups">
                {SEEDED_FOLLOWUPS.map((f, i) => (
                  <div key={i} className="dashboard-followup-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: 'var(--accent-amber)' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <div>
                      <div className="dashboard-followup-title">{f.title}</div>
                      <div className="dashboard-followup-due">{f.due}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section card">
              <div className="dashboard-section-header">
                <h2>Completed Consultations</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/timeline')}>View All</button>
              </div>
              {hasRealData ? (
                <div className="dashboard-consultations">
                  {entries.slice().reverse().map((e, i) => (
                    <div key={e.id || i} className="dashboard-consult-item">
                      <div className="dashboard-consult-dot" />
                      <div>
                        <div className="dashboard-consult-title">{e.doctor_name || 'Unknown doctor'}</div>
                        <div className="dashboard-consult-meta">{formatDate(e.date)} · {e.document_type?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty">
                  <p>No consultations yet — upload your first document.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>Upload a Document</button>
                </div>
              )}
            </div>

            <div className="dashboard-section card dashboard-section-wide">
              <div className="dashboard-section-header">
                <h2>Diagnostic History</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/timeline')}>View All</button>
              </div>
              {labs.length > 0 ? (
                <div className="dashboard-labs">
                  {labs.map((e, i) => (
                    <div key={e.id || i} className="dashboard-lab-item">
                      <span className="dashboard-lab-date">{formatDate(e.date)}</span>
                      <div className="dashboard-lab-tests">
                        {e.tests_mentioned.map((t, ti) => (
                          <span key={ti} className="badge badge-teal">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty">
                  <p>No lab reports uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
