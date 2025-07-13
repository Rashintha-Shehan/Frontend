import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../component/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying your university email...');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const navigate = useNavigate();
  const verified = useRef(false); // prevent double invocation in dev

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link.');
      setStatus('error');
      toast.error('No verification token provided');
      return;
    }

    if (verified.current) return; // prevent double run
    verified.current = true;

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify?token=${token}`);
        toast.success(response.data.message || 'Email verified successfully!');
        setMessage(response.data.message || 'Your university email has been verified.');
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Verification failed. Link may have expired.';
        toast.error(errorMsg);
        setMessage(errorMsg);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          {status === 'loading' && (
            <>
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2 className="h3 mt-3">Verifying Email</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <FaCheckCircle className="text-success" style={{ fontSize: '3rem' }} />
              <h2 className="h3 mt-3">Verification Successful</h2>
            </>
          )}

          {status === 'error' && (
            <>
              <FaTimesCircle className="text-danger" style={{ fontSize: '3rem' }} />
              <h2 className="h3 mt-3">Verification Failed</h2>
            </>
          )}
        </div>

        <div className={`alert alert-${status === 'success' ? 'success' : status === 'error' ? 'danger' : 'info'}`}>
          {message}
        </div>

        {status === 'error' && (
          <button
            className="btn btn-primary w-100 mt-3"
            onClick={() => navigate('/register')}
          >
            Back to Registration
          </button>
        )}

        {status === 'success' && (
          <div className="progress mt-3" style={{ height: '4px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              style={{ width: '100%' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
