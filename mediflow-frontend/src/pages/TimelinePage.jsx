import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DoctorBriefModal from '../components/DoctorBriefModal';
import ContinuityScoreBadge from '../components/ContinuityScoreBadge';
import { fetchTimeline, fetchDoctorBrief } from '../services/api';
import './TimelinePage.css';

export default function TimelinePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefContent, setBriefContent] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [confidenceModal, setConfidenceModal] = useState(null);

  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTimeline();
      setEntries(data.entries || []);
      
      // Dedupe conflicts by stable_id/conflict_id so the same clinical issue never renders twice
      const rawConflicts = data.conflicts || [];
      const seenConflictIds = new Set();
      const deduplicatedConflicts = [];
      
      for (const conflict of rawConflicts) {
        const conflictId = conflict.conflict_id
          || conflict.stable_id
          || `${conflict.conflict_type}:${conflict.shared_generic || conflict.shared_test || 'unknown'}`;
        
        if (!seenConflictIds.has(conflictId)) {
          seenConflictIds.add(conflictId);
          deduplicatedConflicts.push({ ...conflict, conflict_id: conflictId });
        }
      }
      
      setConflicts(deduplicatedConflicts);
    } catch (err) {
      console.error('Failed to load timeline:', err);
      setError('Could not load timeline. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);


  const handleExportBrief = useCallback(async () => {
    setBriefModalOpen(true);
    setBriefLoading(true);
    try {
      const brief = await fetchDoctorBrief();
      setBriefContent(brief);
    } catch {
      setBriefContent('Failed to generate doctor brief. Please try again.');
    } finally {
      setBriefLoading(false);
    }
  }, []);

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'prescription':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="9" y1="6" x2="10" y2="6" />
            <line x1="14" y1="6" x2="15" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="16" y2="16" />
          </svg>
        );
      case 'lab_report':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3h6v4H9z" />
            <rect x="4" y="7" width="16" height="14" rx="2" />
            <line x1="8" y1="11" x2="16" y2="11" />
            <line x1="8" y1="15" x2="16" y2="15" />
            <line x1="8" y1="19" x2="12" y2="19" />
          </svg>
        );
      case 'discharge_summary':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
    }
  };

  const getDocIconClass = (type) => {
    switch (type) {
      case 'prescription': return 'icon-prescription';
      case 'lab_report': return 'icon-lab_report';
      case 'discharge_summary': return 'icon-discharge_summary';
      default: return 'icon-default';
    }
  };

  const getDocCardClass = (type) => {
    switch (type) {
      case 'prescription': return 'doc-prescription';
      case 'lab_report': return 'doc-lab_report';
      case 'discharge_summary': return 'doc-discharge_summary';
      default: return '';
    }
  };

  const getConfidenceBadge = (confidence) => {
    const classMap = {
      green: 'badge-green',
      yellow: 'badge-yellow',
      red: 'badge-red',
    };
    return classMap[confidence] || 'badge-yellow';
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'prescription': return 'Prescription';
      case 'lab_report': return 'Lab Report';
      case 'discharge_summary': return 'Discharge Summary';
      default: return type || 'Document';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="timeline-page">
        <Header />
        <main className="timeline-main">
          <div className="timeline-empty">
            <div className="spinner-lg" />
            <p>Loading your timeline...</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="timeline-page">
        <Header />
        <main className="timeline-main">
          <div className="timeline-empty">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2>Could not load timeline</h2>
            <p>{error}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" onClick={loadTimeline}>Retry</button>
              <button className="btn btn-secondary" onClick={() => navigate('/upload')}>
                Upload Documents
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Empty State ── */
  if (entries.length === 0) {
    return (
      <div className="timeline-page">
        <Header />
        <main className="timeline-main">
          <div className="timeline-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h2>No documents yet</h2>
            <p>Upload medical documents to build your health timeline.</p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              Upload Documents
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      <Header onExportBrief={handleExportBrief} hasEntries={entries.length > 0} />

      <main className="timeline-main">
        {/* ── Continuity of Care Score ── */}
        <div className="container">
          <ContinuityScoreBadge entries={entries} conflicts={conflicts} />
        </div>

        {/* ── Conflict Banner ── */}
        {conflicts.length > 0 && (() => {
          const medConflicts = conflicts.filter(c => c.conflict_type !== 'duplicate_test').length;
          const testConflicts = conflicts.filter(c => c.conflict_type === 'duplicate_test').length;
          const summaryParts = [];
          if (medConflicts > 0) {
            summaryParts.push(`${medConflicts} medication overlap${medConflicts !== 1 ? 's' : ''}`);
          }
          if (testConflicts > 0) {
            summaryParts.push(`${testConflicts} duplicate test${testConflicts !== 1 ? 's' : ''}`);
          }
          const summaryText = summaryParts.length > 0 ? `${summaryParts.join(' and ')} detected` : 'No conflicts detected';

          return (
            <div className="conflict-banner">
              <div className="container">
                <div className="conflict-banner-summary" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px dashed rgba(146, 64, 14, 0.25)', fontWeight: 700, fontSize: '0.9375rem', color: '#78350f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px', color: '#d97706', flexShrink: 0 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{summaryText}</span>
                </div>
                {conflicts.map((conflict, idx) => (
                  <div key={conflict.conflict_id || `${conflict.entry_a?.entry_id}-${conflict.entry_b?.entry_id}-${idx}`} className="conflict-banner-inner" style={{ marginBottom: idx < conflicts.length - 1 ? '1.25rem' : '0' }}>

                    <div className="conflict-banner-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>
                        {conflict.conflict_type === 'duplicate_ingredient' ? 'Duplicate Ingredient Detected' : 
                         conflict.conflict_type === 'duplicate_test' ? 'Duplicate Test Detected' :
                         'Same Drug Class Detected'}
                      </span>
                    </div>
                    
                    {conflict.conflict_type === 'duplicate_test' ? (
                      <>
                        <p className="conflict-banner-desc">
                          <strong>{conflict.entry_a.test_name}</strong> ({formatDate(conflict.entry_a.date)}, {conflict.entry_a.doctor})
                          {' '}and{' '}
                          <strong>{conflict.entry_b.test_name}</strong> ({formatDate(conflict.entry_b.date)}, {conflict.entry_b.doctor})
                          {' '}— same diagnostic test ordered {conflict.days_apart} days apart
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="conflict-banner-desc">
                          <strong>{conflict.entry_a.medication}</strong> ({formatDate(conflict.entry_a.date)}, {conflict.entry_a.doctor})
                          {' '}and{' '}
                          <strong>{conflict.entry_b.medication}</strong> ({formatDate(conflict.entry_b.date)}, {conflict.entry_b.doctor})
                          {' '}share the same active ingredient: <strong>{conflict.shared_generic}</strong>
                        </p>
                      </>
                    )}

                    
                    {conflict.explanation && (
                      <p className="conflict-banner-explanation">{conflict.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Timeline Title ── */}
        <div className="timeline-header-section">
          <div className="container">
            <h1 className="timeline-title">Care Timeline</h1>
            <p className="timeline-subtitle">
              {entries.length} document{entries.length !== 1 ? 's' : ''} · {(() => {
                const medConflicts = conflicts.filter(c => c.conflict_type !== 'duplicate_test').length;
                const testConflicts = conflicts.filter(c => c.conflict_type === 'duplicate_test').length;
                const parts = [];
                if (medConflicts > 0) {
                  parts.push(`${medConflicts} medication overlap${medConflicts !== 1 ? 's' : ''}`);
                }
                if (testConflicts > 0) {
                  parts.push(`${testConflicts} duplicate test${testConflicts !== 1 ? 's' : ''}`);
                }
                if (parts.length === 0) {
                  return 'no conflicts detected';
                }
                return `${parts.join(' and ')} detected`;
              })()}
            </p>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="timeline-track">
          {entries.map((entry, idx) => (
            <div key={entry.id || idx} className="timeline-entry" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="timeline-line-connector">
                <div className={`timeline-dot ${conflicts.length > 0 && entry.medications?.some(m => m.confidence === 'yellow' || m.confidence === 'red') ? 'dot-warning' : 'dot-primary'}`} />
                {idx < entries.length - 1 && <div className="timeline-line" />}
              </div>

              <div className={`timeline-card card ${getDocCardClass(entry.document_type)}`}>
                <div className="timeline-card-header">
                  <div className="timeline-card-left">
                    <div className={`doc-type-icon ${getDocIconClass(entry.document_type)}`}>
                      {getDocumentIcon(entry.document_type)}
                    </div>
                    <div className="timeline-card-meta">
                      <span className="timeline-date">{formatDate(entry.date)}</span>
                      <span className="timeline-doc-badge">{getDocumentTypeLabel(entry.document_type)}</span>
                    </div>
                  </div>
                  {entry.doctor_name && (
                    <div className="timeline-doctor">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {entry.doctor_name}
                    </div>
                  )}
                </div>

                {/* Medications */}
                {entry.medications && entry.medications.length > 0 && (
                  <div className="timeline-medications">
                    <h4 className="timeline-section-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="9" y1="6" x2="10" y2="6" />
                        <line x1="14" y1="6" x2="15" y2="6" />
                      </svg>
                      Medications
                    </h4>
                    <div className="medication-list">
                      {entry.medications.map((med, midx) => (
                        <div
                          key={midx}
                          className={`medication-item ${med.confidence !== 'green' ? 'clickable' : ''}`}
                          onClick={() => {
                            if (med.confidence !== 'green') {
                              setConfidenceModal(med);
                            }
                          }}
                        >
                          <div className="medication-info">
                            <span className="medication-name">{med.brand_name}</span>
                            {med.dosage && <span className="medication-dosage">{med.dosage}</span>}
                            {med.frequency && <span className="medication-frequency">{med.frequency}</span>}
                          </div>
                          <div className="confidence-indicator">
                            <span className={`confidence-dot dot-${med.confidence === 'green' ? 'green' : med.confidence === 'yellow' ? 'yellow' : 'red'}`} />
                            <span className="confidence-label">{med.confidence}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                {entry.diagnosis_mentioned && (
                  <div className="timeline-detail">
                    <h4 className="timeline-section-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6M12 9v6" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      Diagnosis
                    </h4>
                    <p className="timeline-detail-text">{entry.diagnosis_mentioned}</p>
                  </div>
                )}

                {/* Tests */}
                {entry.tests_mentioned && entry.tests_mentioned.length > 0 && (
                  <div className="timeline-detail">
                    <h4 className="timeline-section-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="7" width="16" height="14" rx="2" />
                        <line x1="8" y1="11" x2="16" y2="11" />
                        <line x1="8" y1="15" x2="16" y2="15" />
                        <line x1="8" y1="19" x2="12" y2="19" />
                      </svg>
                      Tests Ordered
                    </h4>
                    <div className="tests-list">
                      {entry.tests_mentioned.map((test, tidx) => (
                        <span key={tidx} className="test-chip">{test}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                {entry.follow_up_date && (
                  <div className="timeline-detail follow-up">
                    <h4 className="timeline-section-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Follow-up
                    </h4>
                    <p className="timeline-detail-text">{formatDate(entry.follow_up_date)}</p>
                  </div>
                )}

                {/* Extraction Notes */}
                {entry.extraction_notes && (
                  <div className="timeline-notes">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    {entry.extraction_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Doctor Brief Modal ── */}
      <DoctorBriefModal
        isOpen={briefModalOpen}
        onClose={() => setBriefModalOpen(false)}
        content={briefContent}
        loading={briefLoading}
      />

      {/* ── Confidence Detail Modal ── */}
      {confidenceModal && (
        <div className="modal-overlay" onClick={() => setConfidenceModal(null)}>
          <div className="modal-content confidence-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConfidenceModal(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="confidence-modal-header">
              <h3>Low-Confidence Extraction</h3>
              <span className={`badge ${getConfidenceBadge(confidenceModal.confidence)}`}>
                <span className={`confidence-dot dot-${confidenceModal.confidence === 'green' ? 'green' : confidenceModal.confidence === 'yellow' ? 'yellow' : 'red'}`} />
                {confidenceModal.confidence}
              </span>
            </div>

            <div className="confidence-modal-body">
              <div className="confidence-field">
                <label>Brand Name</label>
                <span>{confidenceModal.brand_name}</span>
              </div>
              {confidenceModal.dosage && (
                <div className="confidence-field">
                  <label>Dosage</label>
                  <span>{confidenceModal.dosage}</span>
                </div>
              )}
              {confidenceModal.frequency && (
                <div className="confidence-field">
                  <label>Frequency</label>
                  <span>{confidenceModal.frequency}</span>
                </div>
              )}
              <div className="confidence-field">
                <label>Raw Text from Document</label>
                <span className="confidence-raw">{confidenceModal.raw_text}</span>
              </div>
            </div>

            <div className="confidence-modal-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              This field was flagged as <strong>{confidenceModal.confidence}</strong> confidence. Please verify against the original document.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
