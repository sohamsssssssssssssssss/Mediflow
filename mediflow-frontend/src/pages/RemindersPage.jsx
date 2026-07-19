import { useState } from 'react';
import Header from '../components/Header';
import './RemindersPage.css';

const SEEDED_REMINDERS = [
  { id: 1, title: 'Take Crocin (500mg)', due: 'Today 8:00 AM', type: 'medication' },
  { id: 2, title: 'Follow-up with Dr. Sharma', due: 'Jul 22, 10:30 AM', type: 'followup' },
  { id: 3, title: 'CBC Blood Test', due: 'Jul 25, 7:00 AM', type: 'test' },
  { id: 4, title: 'Take Dolo (650mg)', due: 'Today 8:00 PM', type: 'medication' },
  { id: 5, title: 'Renew prescription — Metformin', due: 'Aug 1', type: 'medication' },
];

const typeIcon = {
  medication: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="15" y2="6"/></svg>,
  followup: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  test: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><rect x="4" y="7" width="16" height="14" rx="2"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="8" y1="19" x2="12" y2="19"/></svg>,
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState(
    SEEDED_REMINDERS.map(r => ({ ...r, done: false }))
  );

  const toggleDone = (id) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, done: !r.done } : r
    ));
  };

  const active = reminders.filter(r => !r.done);
  const completed = reminders.filter(r => r.done);

  return (
    <div className="page reminders-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Reminders</h1>
              <p className="page-subtitle">{active.length} pending · {completed.length} completed</p>
            </div>
          </div>

          {active.length > 0 && (
            <section className="reminder-section">
              <h2 className="reminder-section-title">Pending</h2>
              <div className="reminder-list">
                {active.map(r => (
                  <div key={r.id} className="reminder-card card">
                    <label className="reminder-check">
                      <input type="checkbox" checked={r.done} onChange={() => toggleDone(r.id)} />
                      <span className="check-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    </label>
                    <span className="reminder-icon">{typeIcon[r.type]}</span>
                    <div className="reminder-info">
                      <span className="reminder-title">{r.title}</span>
                      <span className="reminder-due">{r.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="reminder-section">
              <h2 className="reminder-section-title">Completed</h2>
              <div className="reminder-list">
                {completed.map(r => (
                  <div key={r.id} className="reminder-card card reminder-done">
                    <label className="reminder-check">
                      <input type="checkbox" checked={r.done} onChange={() => toggleDone(r.id)} />
                      <span className="check-box check-box-done">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    </label>
                    <span className="reminder-icon reminder-icon-done">{typeIcon[r.type]}</span>
                    <div className="reminder-info">
                      <span className="reminder-title reminder-title-done">{r.title}</span>
                      <span className="reminder-due">{r.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {reminders.length === 0 && (
            <div className="page-empty">
              <p>No reminders yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
