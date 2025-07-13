import React, { useEffect, useState } from 'react';
import api from '../component/api';
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCalendarCheck,
} from 'react-icons/fa';

const palette = {
  maroon: 'var(--primary-color)',
  gold: 'var(--secondary-color)',
  background: 'var(--background-color, #fff)',
  border: 'var(--border-color, #eee)',
  text: '#2c2c2c',
};

export default function LeaveSummary() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get current month & year for filtering and display
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based
  const currentYear = now.getFullYear();

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/leaves', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter leaves to only those in current month and year
        const filtered = res.data.filter((leave) => {
          const fromDate = new Date(leave.fromDate || leave.shortLeaveDate);
          return (
            fromDate.getMonth() === currentMonth &&
            fromDate.getFullYear() === currentYear
          );
        });

        setLeaves(filtered);
      } catch (err) {
        setError('Failed to load leave requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaves();
  }, [currentMonth, currentYear]);

  if (loading)
    return <div className="text-center p-4">Loading leave summary...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const total = leaves.length;
  const approved = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejected = leaves.filter((l) => l.status === 'REJECTED').length;
  const pending = leaves.filter((l) => l.status === 'PENDING').length;
  const totalDays = leaves
    .filter((l) => l.status === 'APPROVED')
    .reduce((acc, leave) => acc + (leave.numberOfDays || 0), 0);

  const Box = ({ icon: Icon, label, value, color }) => (
    <div
      className="dashboard-card"
      style={{
        flex: '1 1 180px',
        background: palette.background,
        borderRadius: 'var(--border-radius-lg, 1rem)',
        boxShadow: 'var(--shadow-md, 0 8px 16px rgba(0,0,0,0.05))',
        border: `1px solid ${palette.border}`,
        minWidth: '160px',
        margin: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
      }}
    >
      <Icon size={28} style={{ color, marginBottom: '0.5rem' }} />
      <div style={{ fontWeight: '600', fontSize: '1rem', color: palette.maroon }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color }}>{value}</div>
    </div>
  );

  return (
    <section
      aria-labelledby="leave-summary-title"
      style={{
        background: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '32px 0',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#fff',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: 32,
        }}
      >
        <h2 id="leave-summary-title" className="fw-bold text-maroon mb-md mt-lg" style={{ fontSize: 'var(--font-size-lg)' }}>
          <FaClipboardList className="me-2" />
          Leave Summary - {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        {total === 0 ? (
          <div className="text-center text-muted p-4" style={{ fontSize: '1.1rem' }}>
            <FaHourglassHalf style={{ marginRight: 8, color: '#FFA500' }} />
            No leave requests for this month yet.
          </div>
        ) : (
          <div
            className="d-flex flex-wrap justify-content-start align-items-stretch dashboard-summary-row"
            style={{ gap: '1rem', marginTop: '1rem' }}
          >
          <Box icon={FaClipboardList} label="Total Requests" value={total} color={palette.maroon} />
          <Box icon={FaCheckCircle} label="Approved" value={approved} color="green" />
          <Box icon={FaTimesCircle} label="Rejected" value={rejected} color="red" />
          <Box icon={FaHourglassHalf} label="Pending" value={pending} color="#FFA500" />
          <Box icon={FaCalendarCheck} label="Total Days" value={totalDays.toFixed(2)} color="#007BFF" />
        </div>
        )}
      </div>
      {/* Responsive styles for summary row */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-summary-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .dashboard-card {
            min-width: 0 !important;
            width: 100% !important;
            margin: 0.5rem 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
