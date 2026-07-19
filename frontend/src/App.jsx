import React, { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8000'

// ===== PAGE 1: LANDING PAGE =====

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="header-left">
          <a href="/" className="logo-wrapper">
            <span className="logo-icon">🩺</span>
            <div>
              <span className="logo-text">MediFlow</span>
              <span className="logo-tagline">Care Coordination Timeline</span>
            </div>
          </a>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={onGetStarted}>Try the Demo</button>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">One timeline for every doctor, every prescription, every visit.</h1>
            <p className="hero-tagline">Patients juggling multiple doctors end up with fragmented records, missed follow-ups, and unnoticed medication overlaps. MediFlow builds one unified, AI-powered timeline and flags conflicts automatically.</p>
            <button className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }} onClick={onGetStarted}>
              Upload Your First Document
            </button>
          </div>
          <div className="hero-visual">
            <div className="timeline-preview">
              <div className="preview-card">
                <div className="preview-badge">💊</div>
                <div className="preview-line" />
              </div>
              <div className="preview-card">
                <div className="preview-badge">🧪</div>
                <div className="preview-line" />
              </div>
              <div className="preview-card">
                <div className="preview-badge conflict">💊</div>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📄</div>
              <h3 className="step-title">Upload Documents</h3>
              <p className="step-description">Upload prescriptions, lab reports, or discharge summaries — JPG, PNG, or PDF</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🤖</div>
              <h3 className="step-title">AI Extraction</h3>
              <p className="step-description">AI reads and structures every document into a single chronological timeline</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">⚠️</div>
              <h3 className="step-title">Conflict Detection</h3>
              <p className="step-description">Automatic flagging when different doctors prescribe the same active ingredient</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">📋</div>
              <h3 className="step-title">Doctor Brief</h3>
              <p className="step-description">One-click clinical summary formatted for your physician's quick review</p>
            </div>
          </div>
        </section>

        <section className="features">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">📋</div>
              <h3 className="feature-title">Visual Timeline</h3>
              <p className="feature-description">See your whole care history at a glance — vertical, chronological, connected</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">⚠️</div>
              <h3 className="feature-title">Conflict Detection</h3>
              <p className="feature-description">Flags overlapping medications across different doctors automatically</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">🎯</div>
              <h3 className="feature-title">Confidence-Aware</h3>
              <p className="feature-description">Every extracted field tagged by confidence — nothing silently misread</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">👨‍⚕️</div>
              <h3 className="feature-title">Doctor Brief</h3>
              <p className="feature-description">One-click clinical shorthand summary for your physician</p>
            </div>
          </div>
        </section>

        <section className="disclaimer">
          <p>
            <strong>Disclaimer:</strong> MediFlow is an administrative coordination tool, not a 
            diagnostic system. It does not provide medical advice — always verify flagged 
            information with your physician.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ===== PAGE 2: UPLOAD SCREEN =====

function UploadScreen({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file) => {
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/extract`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setTimeout(() => onUploadComplete(), 500)
    } catch (e) {
      setError(e.message)
      setUploading(false)
    }
  }

  const handleTextExtract = async (text) => {
    setUploading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/extract-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_text: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Extraction failed')
      setTimeout(() => onUploadComplete(), 500)
    } catch (e) {
      setError(e.message)
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const onFileChange = (e) => {
    if (e.target.files[0]) handleUpload(e.target.files[0])
  }

  const onTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextExtract(e.target.value)
      e.target.value = ''
    }
  }

  return (
    <div className="upload-page">
      <header className="header">
        <div className="header-left" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
          <a href="/" className="logo-wrapper">
            <span className="logo-icon">🩺</span>
            <div>
              <span className="logo-text">MediFlow</span>
              <span className="logo-tagline">Care Coordination Timeline</span>
            </div>
          </a>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>← Back</button>
        </div>
      </header>

      <main className="upload-main">
        <div className="upload-container">
          <div className="upload-card" 
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={dragActive ? 'drag-active' : ''}>
            
            <div className="upload-icon">📄</div>
            <h2>Upload a Medical Document</h2>
            <p className="upload-hint">
              Drag & drop a prescription, lab report, or discharge summary (JPG, PNG)
            </p>
            
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              disabled={uploading}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn btn-primary">
              {uploading ? 'Processing...' : 'Choose File'}
            </label>
            
            <div className="or-divider">or</div>
            
            <textarea
              placeholder="Paste prescription text here..."
              onKeyDown={onTextKeyDown}
              disabled={uploading}
              className="text-input"
              rows={5}
            />
            
            {uploading && <div className="uploading-indicator">
              <div className="spinner" />
              <span>Processing document with AI...</span>
            </div>}
            
            {error && <div className="upload-error">{error}</div>}
          </div>

          <div className="demo-docs">
            <h3>Demo Documents (try these in order)</h3>
            <ul>
              <li><strong>Doc 1:</strong> Dr. Anjali Mehta — Crocin 650mg for fever (Jul 8)</li>
              <li><strong>Doc 2:</strong> PathCare CBC lab report (Jul 12)</li>
              <li><strong>Doc 3:</strong> Dr. Suresh Rao — Dolo 650mg for headache (Jul 15) → triggers paracetamol conflict</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ===== PAGE 3: TIMELINE =====

function TimelinePage() {
  const [timeline, setTimeline] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [briefText, setBriefText] = useState('')
  const [error, setError] = useState(null)
  const [mockMode, setMockMode] = useState(true)

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`${API_BASE}/timeline`)
      const data = await res.json()
      setTimeline(data.entries)

      // Defensive dedup: dedupe conflicts by conflict_id from backend
      const rawConflicts = data.conflicts || []
      const seenIds = new Set()
      const deduped = []
      for (const c of rawConflicts) {
        const id = c.conflict_id || `${c.entry_a?.entry_id}-${c.entry_b?.entry_id}-${c.conflict_type}`
        if (!seenIds.has(id)) {
          seenIds.add(id)
          deduped.push(c)
        }
      }
      setConflicts(deduped)
    } catch (e) {
      setError('Failed to load timeline')
    }
  }

  const handleDoctorBrief = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/doctor-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to generate brief')
      setBriefText(data.brief)
      setShowBrief(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown date'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getDocIcon = (type) => {
    switch (type) {
      case 'prescription': return '💊'
      case 'lab_report': return '🧪'
      case 'discharge_summary': return '🏥'
      default: return '📄'
    }
  }

  const getDocIconBg = (type) => {
    switch (type) {
      case 'prescription': return 'var(--accent-blue-bg)'
      case 'lab_report': return 'var(--accent-teal-bg)'
      case 'discharge_summary': return 'var(--accent-purple-bg)'
      default: return 'var(--accent-blue-bg)'
    }
  }

  const getDocIconColor = (type) => {
    switch (type) {
      case 'prescription': return 'var(--accent-blue)'
      case 'lab_report': return 'var(--accent-teal)'
      case 'discharge_summary': return 'var(--accent-purple)'
      default: return 'var(--accent-blue)'
    }
  }

  const getConfidenceColor = (conf) => {
    switch (conf) {
      case 'green': return 'var(--accent-green)'
      case 'yellow': return 'var(--accent-amber)'
      case 'red': return 'var(--accent-red)'
      default: return 'var(--text-muted)'
    }
  }

  const getEntryConflicts = (entry) => {
    const meds = entry.medications?.map(m => m.brand_name) || []
    return conflicts.filter(c => 
      meds.some(m => c.entry_a?.medication === m || c.entry_b?.medication === m)
    )
  }

  return (
    <div className="timeline-page">
      <header className="header">
        <div className="header-left" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
          <a href="/" className="logo-wrapper">
            <span className="logo-icon">🩺</span>
            <div>
              <span className="logo-text">MediFlow</span>
              <span className="logo-tagline">Care Coordination Timeline</span>
            </div>
          </a>
        </div>
        <div className="header-right">
          <label className="mock-toggle">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
            />
            <span>Demo Mode</span>
          </label>
          <button className="btn btn-primary" onClick={handleDoctorBrief} disabled={loading || timeline.length === 0}>
            {loading ? 'Generating...' : 'Doctor Brief'}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {conflicts.length > 0 && (
        <div className="conflict-banner">
          <span className="conflict-icon">⚠️</span>
          <div className="conflict-content">
            <strong>{conflicts.length} medication overlap{conflicts.length > 1 ? 's' : ''} detected</strong>
            <p>Click timeline entries to see details. Always verify with your physician.</p>
          </div>
        </div>
      )}

      <main className="timeline-main">
        <aside className="sidebar">
          <div className="upload-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Add Another Document</h3>
            <p className="upload-hint">Upload a prescription, lab report, or discharge summary</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
              className="file-input"
              style={{ marginBottom: '0.75rem' }}
            />
            <div className="or-divider">or</div>
            <textarea
              placeholder="Paste prescription text here..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleTextExtract(e.target.value), e.target.value = '')}
              className="text-input"
              rows={4}
            />
          </div>

          <div className="legend">
            <h4>Confidence</h4>
            <div className="legend-items">
              <span className="legend-item"><span className="legend-dot" style={{background: 'var(--accent-green)'}}/> Clear</span>
              <span className="legend-item"><span className="legend-dot" style={{background: 'var(--accent-amber)'}}/> Inferred</span>
              <span className="legend-item"><span className="legend-dot" style={{background: 'var(--accent-red)'}}/> Unclear</span>
            </div>
          </div>
        </aside>

        <section className="timeline-section">
          {timeline.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h2>No documents yet</h2>
              <p>Upload your first medical document to start building your care timeline</p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/upload'}>
                Upload a Document
              </button>
            </div>
          ) : (
            <div className="timeline">
              {timeline.map((entry, idx) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  conflicts={getEntryConflicts(entry)}
                  getDocIcon={getDocIcon}
                  getDocIconBg={getDocIconBg}
                  getDocIconColor={getDocIconColor}
                  getConfidenceColor={getConfidenceColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showBrief && (
        <div className="modal-overlay" onClick={() => setShowBrief(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Doctor Brief</h3>
              <button className="modal-close" onClick={() => setShowBrief(false)}>×</button>
            </div>
            <pre className="brief-content">{briefText}</pre>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(briefText)}>
                Copy to Clipboard
              </button>
              <button className="btn btn-primary" onClick={() => setShowBrief(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineEntry({ entry, index, conflicts, getDocIcon, getDocIconBg, getDocIconColor, getConfidenceColor, formatDate }) {
  const docIcon = getDocIcon(entry.document_type)
  const docIconBg = getDocIconBg(entry.document_type)
  const docIconColor = getDocIconColor(entry.document_type)

  return (
    <div className="timeline-entry">
      <div className="timeline-marker">
        <div className="timeline-dot" />
        <div className="timeline-line" />
      </div>
      <div className="timeline-card">
        <div className="card-header">
          <div 
            className="doc-icon-badge" 
            style={{ background: docIconBg, color: docIconColor }}
          >
            {docIcon}
          </div>
          <div className="doc-meta">
            <h4>{entry.document_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
            <div className="doc-details">
              <span>📅 {formatDate(entry.date)}</span>
              {entry.doctor_name && <span>👨‍⚕️ {entry.doctor_name}</span>}
            </div>
          </div>
          {conflicts.length > 0 && (
            <span className="conflict-badge">{conflicts.length} flag{conflicts.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {entry.diagnosis_mentioned && (
          <div className="diagnosis">
            <strong>Diagnosis:</strong> {entry.diagnosis_mentioned}
          </div>
        )}

        {entry.medications?.length > 0 && (
          <div className="medications">
            <h5>Medications</h5>
            {entry.medications.map((med, mi) => (
              <div key={mi} className="med-row">
                <div className="med-info">
                  <span className="med-name">{med.brand_name}</span>
                  <span className="med-dosage">{med.dosage} • {med.frequency}</span>
                </div>
                <span 
                  className="confidence-dot" 
                  style={{ background: getConfidenceColor(med.confidence) }}
                  title={med.confidence}
                />
              </div>
            ))}
          </div>
        )}

        {entry.tests_mentioned?.length > 0 && (
          <div className="tests">
            <strong>Tests:</strong> {entry.tests_mentioned.join(', ')}
          </div>
        )}

        {entry.follow_up_date && (
          <div className="followup">
            <strong>Follow-up:</strong> {formatDate(entry.follow_up_date)}
          </div>
        )}

        {entry.extraction_notes && (
          <div className="notes">{entry.extraction_notes}</div>
        )}

        {conflicts.length > 0 && (
          <div className="entry-conflicts">
            {conflicts.map((c, ci) => (
              <div key={ci} className="conflict-card">
                <span className="conflict-type">{c.conflict_type.replace('_', ' ')}</span>
                <p>{c.explanation}</p>
                {c.suggested_questions && c.suggested_questions.length > 0 && (
                  <div className="suggested-questions">
                    <span className="questions-label">Questions to ask your doctor:</span>
                    <ul>
                      {c.suggested_questions.map((q, qi) => (
                        <li key={qi}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ===== SHARED COMPONENTS =====

function Footer() {
  return (
    <footer className="footer">
      <p>Built for Codebenders AI Hackathon • PS6 • Team MediFlow</p>
    </footer>
  )
}

// ===== MAIN APP =====

function App() {
  const [page, setPage] = useState('landing')

  if (page === 'landing') {
    return <LandingPage onGetStarted={() => setPage('upload')} />
  }
  if (page === 'upload') {
    return <UploadScreen onUploadComplete={() => setPage('timeline')} />
  }
  return <TimelinePage />
}

export default App