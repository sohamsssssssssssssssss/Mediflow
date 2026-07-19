import { useState } from 'react';
import Header from '../components/Header';
import './AppointmentsPage.css';

const SEEDED_APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Priya Sharma', specialty: 'Cardiology', date: '2026-07-22', time: '10:30 AM', urgency: 'urgent' },
  { id: 2, doctor: 'Dr. Rajesh Patel', specialty: 'Orthopedics', date: '2026-07-28', time: '2:00 PM', urgency: 'normal' },
  { id: 3, doctor: 'Dr. Anjali Mehta', specialty: 'General Medicine', date: '2026-08-05', time: '9:00 AM', urgency: 'routine' },
  { id: 4, doctor: 'Dr. Vikram Joshi', specialty: 'Neurology', date: '2026-08-12', time: '11:30 AM', urgency: 'normal' },
];

const SPECIALTIES = ['Cardiology', 'Orthopedics', 'General Medicine', 'Neurology', 'Dermatology', 'Pediatrics'];

const TIME_SLOTS = [
  '2026-07-25 9:00 AM',
  '2026-07-25 10:30 AM',
  '2026-07-25 2:00 PM',
  '2026-07-26 9:00 AM',
  '2026-07-26 11:00 AM',
  '2026-07-26 3:00 PM',
  '2026-07-29 10:00 AM',
  '2026-07-29 1:00 PM',
  '2026-07-29 4:00 PM',
];

const urgencyLabel = {
  urgent: 'Urgent',
  normal: 'Normal',
  routine: 'Routine',
};

const urgencyClass = {
  urgent: 'badge-coral',
  normal: 'badge-amber',
  routine: 'badge-teal',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(SEEDED_APPOINTMENTS);
  const [specialty, setSpecialty] = useState('');
  const [slot, setSlot] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleBook = () => {
    if (!specialty || !slot) return;
    const docNames = ['Dr. Sunil Kapoor', 'Dr. Neha Singh', 'Dr. Arvind Gupta', 'Dr. Deepa Iyer'];
    const newAppt = {
      id: Date.now(),
      doctor: docNames[Math.floor(Math.random() * docNames.length)],
      specialty,
      date: slot.split(' ')[0],
      time: slot.split(' ').slice(1).join(' '),
      urgency: 'normal',
    };
    setAppointments(prev => [...prev, newAppt]);
    setSpecialty('');
    setSlot('');
    setShowForm(false);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2500);
  };

  return (
    <div className="page appointments-page">
      <Header />
      <main className="page-main">
        <div className="container">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Appointments & Scheduling</h1>
              <p className="page-subtitle">{appointments.length} upcoming appointment{appointments.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Book New Appointment'}
            </button>
          </div>

          {confirmed && (
            <div className="appt-confirmed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><polyline points="20 6 9 17 4 12"/></svg>
              Appointment booked successfully!
            </div>
          )}

          {showForm && (
            <div className="appt-form card">
              <h3>Book New Appointment</h3>
              <div className="appt-form-fields">
                <label>
                  <span>Specialty</span>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  <span>Available Slot</span>
                  <select value={slot} onChange={e => setSlot(e.target.value)}>
                    <option value="">Select time slot</option>
                    {TIME_SLOTS.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                  </select>
                </label>
                <button className="btn btn-primary" onClick={handleBook} disabled={!specialty || !slot}>
                  Confirm Booking
                </button>
              </div>
            </div>
          )}

          <div className="appt-list">
            {appointments.map(appt => (
              <div key={appt.id} className="appt-card card">
                <div className="appt-card-top">
                  <div className="appt-doctor">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {appt.doctor}
                  </div>
                  <span className={`badge ${urgencyClass[appt.urgency]}`}>{urgencyLabel[appt.urgency]}</span>
                </div>
                <div className="appt-card-details">
                  <div className="appt-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {appt.specialty}
                  </div>
                  <div className="appt-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {appt.date}
                  </div>
                  <div className="appt-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {appt.time}
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
