import { useState, useCallback } from 'react';
import Header from '../components/Header';
import './NearbyFacilitiesPage.css';

const FACILITIES = [
  { id: 1, name: 'Apollo Diagnostics', type: 'diagnostic', distance: '1.2 km', address: 'Linking Road, Bandra West, Mumbai', phone: '022-2643-1000' },
  { id: 2, name: 'MedPlus Pharmacy', type: 'pharmacy', distance: '0.5 km', address: 'Hill Road, Bandra West, Mumbai', phone: '022-2642-5000' },
  { id: 3, name: 'Hinduja Hospital', type: 'hospital', distance: '2.8 km', address: 'Veer Savarkar Marg, Mahim, Mumbai', phone: '022-2445-2222' },
  { id: 4, name: 'Lilavati Hospital', type: 'hospital', distance: '1.5 km', address: 'A-791, Bandra Reclamation, Bandra West, Mumbai', phone: '022-2642-1111' },
  { id: 5, name: 'Wellness Diagnostic Centre', type: 'diagnostic', distance: '0.8 km', address: 'Pali Hill, Bandra West, Mumbai', phone: '022-2640-3000' },
  { id: 6, name: 'Apollo Pharmacy', type: 'pharmacy', distance: '0.3 km', address: 'Chapel Road, Bandra West, Mumbai', phone: '022-2644-7000' },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'diagnostic', label: 'Diagnostic Centers' },
  { key: 'pharmacy', label: 'Pharmacies' },
  { key: 'hospital', label: 'Hospitals' },
];

const typeLabel = {
  diagnostic: 'Diagnostic Center',
  pharmacy: 'Pharmacy',
  hospital: 'Hospital',
};

export default function NearbyFacilitiesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = useCallback((id, phone) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);

  const filtered = activeTab === 'all'
    ? FACILITIES
    : FACILITIES.filter(f => f.type === activeTab);

  return (
    <div className="page facilities-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Nearby Facilities</h1>
              <p className="page-subtitle">Healthcare facilities near Bandra, Mumbai</p>
            </div>
          </div>

          <div className="facility-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="facility-list">
            {filtered.map(f => (
              <div key={f.id} className="facility-card card">
                <div className="facility-card-icon">
                  {f.type === 'hospital' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><path d="M3 3h18v18H3z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  ) : f.type === 'pharmacy' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="15" y2="6"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><rect x="4" y="7" width="16" height="14" rx="2"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="8" y1="19" x2="12" y2="19"/></svg>
                  )}
                </div>
                <div className="facility-card-body">
                  <div className="facility-card-top">
                    <span className="facility-name">{f.name}</span>
                    <span className={`badge ${f.type === 'hospital' ? 'badge-coral' : f.type === 'pharmacy' ? 'badge-teal' : 'badge-purple'}`}>
                      {typeLabel[f.type]}
                    </span>
                  </div>
                  <div className="facility-card-details">
                    <span className="facility-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {f.distance}
                    </span>
                    <span className="facility-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      {f.address}
                    </span>
                    <span className="facility-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {f.phone}
                    </span>
                  </div>

                  <div className="facility-actions">
                    <a href={`tel:${f.phone}`} className="facility-action-btn" title="Call">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Call
                    </a>
                    <button
                      className="facility-action-btn"
                      onClick={() => handleCopy(f.id, f.phone)}
                      title="Copy Number"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      {copiedId === f.id ? 'Copied!' : 'Copy'}
                    </button>
                    <a href={`sms:${f.phone}`} className="facility-action-btn" title="Text">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Text
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
