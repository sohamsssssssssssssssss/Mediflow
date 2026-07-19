import Header from '../components/Header';
import './AnalyticsPage.css';

const STATS = [
  {
    label: 'Missed Follow-up Rate',
    value: '18%',
    icon: 'missed',
    color: 'var(--accent-coral)',
    bg: 'var(--accent-coral-bg)',
    desc: '3 of 17 patients missed last scheduled follow-up',
  },
  {
    label: 'Avg. Treatment Timeline',
    value: '12 days',
    icon: 'timeline',
    color: 'var(--accent-blue)',
    bg: 'var(--accent-blue-bg)',
    desc: 'Average duration from diagnosis to treatment plan',
  },
  {
    label: 'Patient Compliance',
    value: '82%',
    icon: 'compliance',
    color: 'var(--accent-green)',
    bg: 'var(--accent-green-bg)',
    desc: 'Patients adhering to prescribed medication schedule',
  },
  {
    label: 'Appointment Bottleneck',
    value: 'Cardiology',
    icon: 'bottleneck',
    color: 'var(--accent-purple)',
    bg: 'var(--accent-purple-bg)',
    desc: 'Avg 6 day wait time — highest across all departments',
  },
  {
    label: 'Total Patients (YTD)',
    value: '1,247',
    icon: 'patients',
    color: 'var(--accent-teal)',
    bg: 'var(--accent-teal-bg)',
    desc: 'Year-to-date unique patient visits recorded',
  },
  {
    label: 'Avg. Satisfaction Score',
    value: '4.3 / 5',
    icon: 'satisfaction',
    color: 'var(--accent-amber)',
    bg: 'var(--accent-amber-bg)',
    desc: 'Based on post-visit patient surveys',
  },
];

const iconMap = {
  missed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  timeline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  compliance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><polyline points="20 6 9 17 4 12"/></svg>,
  bottleneck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  patients: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  satisfaction: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
};

export default function AnalyticsPage() {
  return (
    <div className="page analytics-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Hospital Analytics</h1>
              <p className="page-subtitle">Aggregate clinical metrics and operational insights</p>
            </div>
          </div>

          <div className="analytics-grid">
            {STATS.map((stat, i) => (
              <div key={i} className="analytics-card card">
                <div className="analytics-card-icon" style={{ background: stat.bg, color: stat.color }}>
                  {iconMap[stat.icon]}
                </div>
                <div className="analytics-card-body">
                  <span className="analytics-value">{stat.value}</span>
                  <span className="analytics-label">{stat.label}</span>
                </div>
                <p className="analytics-desc">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
