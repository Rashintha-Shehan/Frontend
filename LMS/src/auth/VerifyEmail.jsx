import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import { toast } from 'react-toastify';
import api from '../component/api';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      toast.error('Invalid verification link.');
      return;
    }

    async function verify() {
      try {
        const res = await api.get(`/auth/verify?token=${token}`);
        setStatus('success');
        toast.success(res.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
      } catch (err) {
        setStatus('error');
        toast.error(err.response?.data?.message || 'Verification failed or token expired.');
      }
    }

    verify();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        {status === 'pending' && (
          <>
            <FaSpinner className="text-primary mb-3" size={48} style={{ animation: 'spin 1s linear infinite' }} />
            <h2 className="auth-title">Verifying Email</h2>
            <p className="text-muted">Please wait while we verify your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <FaCheckCircle className="text-success mb-3" size={48} />
            <h2 className="auth-title">Verification Successful!</h2>
            <p className="text-muted">Your university staff account has been activated.</p>
            <p>Redirecting to login page...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <FaTimesCircle className="text-danger mb-3" size={48} />
            <h2 className="auth-title">Verification Failed</h2>
            <p className="text-muted">The verification link is invalid or has expired.</p>
            <Link to="/" className="btn btn-primary mt-3">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
