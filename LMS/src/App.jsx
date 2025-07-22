import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPage from './pages/LandingPage';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import AdminDashboard from './Admin/AdminDashboard';
import UserDashboard from './user/UserDashboard';
import VerificationNotice from './auth/VerificationNotice';
import VerifyEmailPage from './auth/VerifyEmailPage';
import ChangePassword from './component/ChangePassword';
import LeaveRequestForm from './user/LeaveRequestForm';
import LeaveLog from './user/LeaveLog';
import AdminReports from './Admin/AdminReports';
import EmployeeLeaveReport from './services/EmployeeLeaveReport';
import MonthlyLeaveReport from './MonthlyLeaveReport/MonthlyLeaveReport';
import SysAdminDashboard from './SystemAdmin/SysAdminDashboard';
import AdminProfile from './Admin/AdminProfile';
import PendingUsers from './Admin/PendingUsers';
import Footer from './component/Footer';
import AuditLogPanel from './SystemAdmin/AuditLogPanel';
import ARDashboard from './Admin/ARDashboard';

import { OnboardingProvider } from './context/OnboardingContext';

function App() {
  // ✅ Use "/" for dev, "/Frontend" only in production
  const basename = import.meta.env.MODE === 'production' ? '/Frontend' : '/';

  return (
    <OnboardingProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          {/* ✅ Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* ✅ Auth routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-notice" element={<VerificationNotice />} />
          <Route path="/reset-password" element={<ChangePassword />} />

          {/* ✅ User/Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/leave-request" element={<LeaveRequestForm />} />
          <Route path="/leave-log" element={<LeaveLog />} />

          {/* ✅ Reports */}
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/employee-report" element={<EmployeeLeaveReport />} />
          <Route path="/admin/monthly-report" element={<MonthlyLeaveReport />} />

          {/* ✅ System Admin */}
          <Route path="/SysAdminDashboard" element={<SysAdminDashboard />} />
          <Route path="/AdminProfile" element={<AdminProfile />} />
          <Route path="/pending" element={<PendingUsers />} />
          <Route path="/Footer" element={<Footer />} />
          <Route path="/AuditLogPanel" element={<AuditLogPanel />} />
          <Route path="/ar/dashboard" element={<ARDashboard />} />

          {/* ✅ Catch-all route to prevent "No routes matched" */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </OnboardingProvider>
  );
}

export default App;
