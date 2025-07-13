import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../component/api';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import UniversityLogo from '../assets/images/uop.png';
import CEITLogo from '../assets/images/ceit.png';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // ✅ correct


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('faculty', data.user.faculty || '');
      localStorage.setItem('department', data.user.department || '');
      localStorage.setItem('username', data.user.firstName);

      toast.success(`Welcome back, ${data.user.firstName}`);

      if (data.user.role === 'SYS_ADMIN') navigate('/SysAdminDashboard');
      else if (data.user.role === 'ADMIN') navigate('/admin');
      else navigate('/user');
    } catch (err) {
      toast.error(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        toast.error('No credential received from Google');
        return;
      }

      const { data } = await api.post('/auth/google-auto-login', { token: credential });

      localStorage.setItem('token', data.jwt);

      const decoded = jwtDecode(data.jwt);
      localStorage.setItem('username', decoded.sub || '');
      const role = decoded.authorities?.[0]?.replace('ROLE_', '') || '';
      localStorage.setItem('role', role);

      // --- Fetch user profile and store faculty/department ---
      try {
        const profileRes = await api.get('/auth/user/profile');
        localStorage.setItem('faculty', profileRes.data.faculty || '');
        localStorage.setItem('department', profileRes.data.department || '');
      } catch (e) {
        localStorage.setItem('faculty', '');
        localStorage.setItem('department', '');
      }
      // --- End profile fetch ---

      // Check if this is a new user (created via Google login)
      const isNewUser = data.isNewUser;
      
      if (isNewUser) {
        toast.success(`Welcome! Your account has been created successfully. Please complete your profile information.`);
      } else {
        toast.success(`Welcome back, ${decoded.sub || 'user'}`);
      }
      
      // Navigate to appropriate dashboard based on role
      if (role === 'SYS_ADMIN') navigate('/SysAdminDashboard');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/user');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  const colors = {
    maroon: '#800000',
    gold: '#FFD700',
    goldHover: '#FFEA70',
    bgLight: '#f5f5f5',
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center" style={{ backgroundColor: colors.bgLight }}>
      <div className="container-fluid px-0">
        <div className="row g-0 min-vh-100 w-100 mx-0">
          {/* Left Side - Branding */}
          <div
            className="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5"
            style={{
              backgroundColor: colors.maroon,
              backgroundImage: 'linear-gradient(to bottom right, #800000, #5a0000)',
            }}
          >
            <div className="text-center">
              <img src={UniversityLogo} alt="UOP Logo" style={{ height: '70px', marginBottom: '1rem' }} />
              <img src={CEITLogo} alt="CEIT Logo" style={{ height: '60px', marginBottom: '1.5rem' }} />
              <h3 className="fw-bold mb-2">University of Peradeniya</h3>
              <p className="lead opacity-75">Information Technology Center</p>
              <p className="small mt-4">© {new Date().getFullYear()} CEIT | Leave Management System</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-3 p-md-5 bg-white">
            <div className="w-100" style={{ maxWidth: '400px' }}>
              <div className="mb-4 text-center">
                <h4 className="fw-bold" style={{ color: colors.maroon }}>
                  Leave Management System
                </h4>
                <p className="text-muted small">Academic Staff Login</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label small fw-semibold text-muted text-uppercase">
                    University Email
                  </label>
                  <div className="input-group shadow-sm rounded">
                    <span className="input-group-text bg-white border-end-0" style={{ color: colors.maroon }}>
                      <FaEnvelope />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="form-control border-start-0"
                      placeholder="e.g. staff@uop.ac.lk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="password" className="form-label small fw-semibold text-muted text-uppercase mb-0">
                      Password
                    </label>
                    <Link to="/reset-password" className="small" style={{ color: colors.maroon }}>
                      Forgot?
                    </Link>
                  </div>
                  <div className="input-group shadow-sm rounded">
                    <span className="input-group-text bg-white border-end-0" style={{ color: colors.maroon }}>
                      <FaLock />
                    </span>
                    <input
                      id="password"
                      type="password"
                      className="form-control border-start-0"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3"
                  disabled={isLoading}
                  style={{
                    backgroundColor: colors.gold,
                    color: colors.maroon,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.goldHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.gold)}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login <FaArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Google Login */}
              <div className="text-center mt-3">
                <p className="small text-muted mb-2">or login with university email</p>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => toast.error('Google login failed')}
                  useOneTap
                  auto_select
                  uxMode="popup"
                />
              </div>

              <div className="text-center small text-muted mt-3">
                Don't have an account?{' '}
                <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: colors.maroon }}>
                  Request Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//282762518419-ibun96uo5fn9m9b7ov3tn41ac68s587b.apps.googleusercontent.com