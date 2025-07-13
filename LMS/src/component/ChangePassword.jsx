import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaKey, FaCheckCircle, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import publicApi from './publicApi';

const PasswordReset = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenFromUrl, setIsTokenFromUrl] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setStep(2);
      setIsTokenFromUrl(true);
    }
  }, [location]);

  const sendResetEmail = async () => {
    if (!email.includes('@')) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await publicApi.post('/auth/request-password-reset', { email });
      setStep(1.5);
      setMessage({ text: 'Reset link sent to your email', type: 'success' });
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to send reset email', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await publicApi.post('/auth/reset-password', { token, newPassword });
      setMessage({ text: 'Password reset successful!', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to reset password', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="card border-0 shadow-sm rounded-3 overflow-hidden"
              style={{ border: '1px solid #800000' }}
            >
              <div className="card-header py-3" style={{ backgroundColor: '#800000', color: '#FFD700' }}>
                <h2 className="text-center mb-0">
                  <FaKey className="me-2" />
                  Password Reset
                </h2>
              </div>
              
              <div className="card-body p-4">
                <AnimatePresence mode="wait">
                  {message.text && (
                    <motion.div
                      key={`message-${Date.now()}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-3">
                      <label className="form-label fw-semibold d-flex align-items-center">
                        <FaEnvelope className="me-2" style={{ color: '#800000' }} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      onClick={sendResetEmail}
                      disabled={!email || isLoading}
                      className="btn w-100 py-2 fw-bold"
                      style={{ backgroundColor: '#800000', color: '#FFD700' }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </motion.div>
                )}

                {step === 1.5 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#e6ffe6' }}>
                      <FaCheckCircle className="text-success mb-2" size={36} />
                      <h4 className="text-success fw-bold">Email Sent!</h4>
                      <p className="text-muted mb-2">Check your inbox for reset instructions</p>
                    </div>
                    <button 
                      onClick={() => setStep(1)}
                      className="btn btn-outline-secondary w-100"
                      style={{ borderColor: '#800000', color: '#800000' }}
                    >
                      <FaArrowLeft className="me-2" />
                      Back to Email
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {!isTokenFromUrl && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold d-flex align-items-center">
                          <FaCheckCircle className="me-2" style={{ color: '#800000' }} />
                          Verification Token
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your token"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          disabled={isLoading || isTokenFromUrl}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold d-flex align-items-center">
                        <FaKey className="me-2" style={{ color: '#800000' }} />
                        New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button 
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ borderColor: '#800000', color: '#800000' }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      <small className="text-muted">Minimum 8 characters</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold d-flex align-items-center">
                        <FaKey className="me-2" style={{ color: '#800000' }} />
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={resetPassword}
                      disabled={!token || !newPassword || !confirmPassword || isLoading}
                      className="btn w-100 py-2 fw-bold"
                      style={{ backgroundColor: '#800000', color: '#FFD700' }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="card-footer bg-transparent text-center py-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-link text-decoration-none"
                  style={{ color: '#800000' }}
                >
                  Remember your password? Sign in
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PasswordReset;