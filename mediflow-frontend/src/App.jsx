import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import TimelinePage from './pages/TimelinePage';
import AppointmentsPage from './pages/AppointmentsPage';
import RemindersPage from './pages/RemindersPage';
import ExplainPrescriptionPage from './pages/ExplainPrescriptionPage';
import NearbyFacilitiesPage from './pages/NearbyFacilitiesPage';
import ProviderViewPage from './pages/ProviderViewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Sidebar from './Sidebar';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/explain-prescription" element={<ExplainPrescriptionPage />} />
          <Route path="/nearby-facilities" element={<NearbyFacilitiesPage />} />
          <Route path="/provider-view" element={<ProviderViewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
