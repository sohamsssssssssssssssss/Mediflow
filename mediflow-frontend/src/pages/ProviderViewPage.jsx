import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { fetchTimeline } from '../services/api';
import './ProviderViewPage.css';

const SEEDED_MEDICATIONS = [
  { name: 'Crocin 500mg', dosage: '1 tablet', frequency: 'As needed', status: 'active' },
  { name: 'Dolo 650mg', dosage: '1 tablet', frequency: 'Twice daily', status: 'active' },
  { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'With breakfast', status: 'active' },
];

const SEEDED_BRIEF = '52yo male, Type 2 diabetes and hypertension. Active Rx: Metformin 500 mg (daily) for glycemic control; Crocin 500 mg (PRN) and Dolo 650 mg (BID) — both contain Paracetamol, duplication flagged. Last visit 12 Jul 2026, no acute concerns. CBC within normal limits. Follow-up scheduled in 4 weeks to reassess BP and HbA1c.';

export default function ProviderViewPage() {
  const [conflicts, setConflicts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const timeline = await fetchTimeline();
        if (!cancelled) {
          setConflicts(timeline.conflicts || []);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load conflict data from the backend.');
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page provider-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Provider View</h1>
              <p className="page-subtitle">Clinical summary for patient review</p>
            </div>
          </div>

          <div className="provider-patient card">
            <div className="provider-patient-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h2 className="provider-patient-name">Patient: Rajesh Kumar</h2>
              <span className="provider-patient-meta">Age: 52 · MRN: MF-2026-0042 · Last visit: Jul 12, 2026</span>
            </div>
          </div>

          <div className="provider-section">
            <h3 className="provider-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              AI-Generated Summary
            </h3>
            <div className="card provider-brief-card">
              <p className="provider-brief-text">{SEEDED_BRIEF}</p>
            </div>
          </div>

          <div className="provider-section">
            <h3 className="provider-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="15" y2="6"/></svg>
              Active Medications
            </h3>
            <div className="provider-meds">
              {SEEDED_MEDICATIONS.map((med, i) => (
                <div key={i} className="provider-med-card card">
                  <div className="provider-med-name">{med.name}</div>
                  <div className="provider-med-details">
                    <span>{med.dosage}</span>
                    <span className="provider-med-sep">·</span>
                    <span>{med.frequency}</span>
                  </div>
                  <span className="badge badge-green">Active</span>
                </div>
              ))}
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="provider-section">
              <h3 className="provider-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Flagged Conflicts
              </h3>
              <div className="provider-conflicts">
                {conflicts.map((c, i) => (
                  <div key={c.conflict_id || i} className="provider-conflict-card card">
                    <div className="provider-conflict-type">
                      {c.conflict_type === 'duplicate_test' ? 'Duplicate Test' : 'Medication Overlap'}
                    </div>
                    <p className="provider-conflict-desc">
                      {c.conflict_type === 'duplicate_test'
                        ? `${c.entry_a?.test_name} & ${c.entry_b?.test_name}`
                        : `${c.entry_a?.medication} & ${c.entry_b?.medication} — same ingredient: ${c.shared_generic}`
                      }
                    </p>
                    {c.explanation && <p className="provider-conflict-explain">{c.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="provider-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
