import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import AdminDashboard from './Admin/AdminDashboard';
import UserDashboard from './user/UserDashboard';
import VerificationNotice from './auth/VerificationNotice';
import VerifyEmailPage from './auth/VerifyEmailPage'; 
import ChangePassword from './component/ChangePassword';
import LeaveRequestForm from './user/LeaveRequestForm';
import LeaveLog from './user/LeaveLog';
import LandingPage from './pages/LandingPage';
import AdminReports from './Admin/AdminReports';
import EmployeeLeaveReport from './services/EmployeeLeaveReport';
import MonthlyLeaveReport from './MonthlyLeaveReport/MonthlyLeaveReport';
import './index.css';
import SysAdminDashboard from './SystemAdmin/SysAdminDashboard';
import AdminProfile from './Admin/AdminProfile';
import PendingUsers from './Admin/PendingUsers';
import Footer from './component/Footer';
import AuditLogPanel from './SystemAdmin/AuditLogPanel';

// Onboarding Components
import { OnboardingProvider } from './context/OnboardingContext';
import Onboarding from './components/Onboarding';
import HelpCenter from './components/HelpCenter';
import Tooltip, { InfoTooltip, HelpTooltip, FieldTooltip } from './components/Tooltip';

function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/verify-notice" element={<VerificationNotice />} />
          <Route path="/reset-password" element={<ChangePassword />} />
          <Route path="/leave-request" element={<LeaveRequestForm />} />
          <Route path="/leave-log" element={<LeaveLog />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/employee-report" element={<EmployeeLeaveReport />} />
          <Route path='/admin/monthly-report' element={<MonthlyLeaveReport/>}/>
          <Route path='/SysAdminDashboard' element={<SysAdminDashboard/>}/>
          <Route path='/AdminProfile' element={<AdminProfile/>}/>
          <Route path='/pending' element={<PendingUsers/>}/>
          <Route path='/Footer' element={<Footer/>}/>
          <Route path='/AuditLogPanel' element={<AuditLogPanel/>}/>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </OnboardingProvider>
  );
}

export default App;