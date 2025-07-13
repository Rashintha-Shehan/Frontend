// VerificationNotice.jsx
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';

export default function VerificationNotice() {
  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <div className="mb-4">
          <FaEnvelope className="text-primary" size={48} />
        </div>
        <h2 className="auth-title">Verify Your Email</h2>
        <p className="text-muted mb-4">
          We've sent a verification link to your university email address.
          Please check your inbox and click the link to activate your staff account.
        </p>
        <div className="d-flex align-items-center justify-content-center mb-3">
          <FaCheckCircle className="text-success me-2" />
          <span>Check your email inbox</span>
        </div>
        <div className="d-flex align-items-center justify-content-center mb-4">
          <FaCheckCircle className="text-success me-2" />
          <span>Click the verification link</span>
        </div>
        <Link to="/" className="btn btn-primary btn-lg w-100">
          Return to Login
        </Link>
      </div>
    </div>
  );
}