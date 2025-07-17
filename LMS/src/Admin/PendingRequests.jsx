import React, { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const PendingRequests = ({ leaves, loading, refreshLeaves, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);

  const openRejectModal = (id) => {
    setRejectLeaveId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setRejectLeaveId(null);
  };

  const handleRejectSubmit = async () => {
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      toast.error('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);
      await onReject(rejectLeaveId, trimmedReason);
      toast.success('Leave rejected successfully');
    } catch (err) {
      toast.error('Failed to reject leave.');
    } finally {
      setActionLoading(false);
      closeRejectModal();
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await onApprove(id);
      toast.success('Leave approved successfully');
    } catch (err) {
      toast.error('Failed to approve leave.');
    } finally {
      setActionLoading(false);
    }
  };

  const openViewModal = (leave) => {
    setViewLeave(leave);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setViewLeave(null);
    setShowViewModal(false);
  };

  if (loading || actionLoading)
    return <p className="text-muted fst-italic">Loading pending leave requests...</p>;
  if (!leaves || leaves.length === 0)
    return <p className="text-muted fst-italic">No pending leave requests.</p>;

  return (
    <>
      {/* Pending Leave Table */}
      <div className="table-responsive rounded shadow-sm" style={{ overflowX: 'auto' }}>
        <table className="table table-hover align-middle mb-0">
          <thead
            className="text-uppercase small"
            style={{ backgroundColor: '#800000', color: '#FFD700' }}
          >
            <tr>
              <th>#</th>
              <th>Staff Name</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To / Time</th>
              <th>Duration</th>
              <th>Purpose</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave, index) => (
              <tr key={leave.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td>{index + 1}</td>
                <td className="fw-semibold" style={{ color: '#800000' }}>
                  {leave.user?.firstName} {leave.user?.lastName}
                </td>
                <td>{leave.leaveType}</td>

                {(leave.leaveType === 'Short Leave' || leave.leaveType === 'Half Day') ? (
                  <>
                    <td>{dayjs(leave.shortLeaveDate).format('YYYY-MM-DD')}</td>
                    <td>
                      {leave.shortLeaveStartTime} - {leave.shortLeaveEndTime}
                    </td>
                  </>
                ) : (
                  <>
                    <td>{dayjs(leave.fromDate).format('YYYY-MM-DD')}</td>
                    <td>{dayjs(leave.toDate).format('YYYY-MM-DD')}</td>
                  </>
                )}

                <td>{leave.numberOfDays} day(s)</td>
                <td
                  className="text-truncate"
                  style={{ maxWidth: '180px' }}
                  title={leave.purpose}
                >
                  {leave.purpose}
                </td>

                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2 align-items-center">
                    {/* View button */}
                    <button
                      title="View Details"
                      className="btn btn-sm btn-outline-primary"
                      style={{ borderColor: '#800000', color: '#800000', fontWeight: 600, padding: '4px 8px' }}
                      onClick={() => openViewModal(leave)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z" />
                        <path d="M8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="white" />
                      </svg>
                    </button>

                    {/* Approve button */}
                    <button
                      className="btn btn-sm px-3"
                      style={{ backgroundColor: '#FFD700', color: '#800000', fontWeight: 600, border: 'none' }}
                      onClick={() => handleApprove(leave.id)}
                    >
                      Approve
                    </button>

                    {/* Reject button */}
                    <button
                      className="btn btn-sm btn-outline-danger px-3"
                      style={{ borderColor: '#800000', color: '#800000', fontWeight: 600 }}
                      onClick={() => openRejectModal(leave.id)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-backdrop" style={backdropStyle} onClick={closeRejectModal}>
          <div style={rejectModalStyle} onClick={(e) => e.stopPropagation()}>
            <h5 style={{ marginBottom: '1rem', color: '#800000' }}>Enter Rejection Reason</h5>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem', resize: 'vertical', padding: '8px', borderColor: '#ccc', borderRadius: '4px' }}
              placeholder="Please provide a reason for rejection..."
            />
            <div style={{ textAlign: 'right' }}>
              <button onClick={closeRejectModal} style={cancelButtonStyle}>Cancel</button>
              <button onClick={handleRejectSubmit} style={submitButtonStyle}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* View Leave Details Modal */}
      {showViewModal && viewLeave && (
        <div className="modal-backdrop" style={backdropStyle} onClick={closeViewModal}>
          <div style={viewModalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#800000', marginBottom: 20, textAlign: 'center' }}>Leave Request Details</h3>
            
            {/* Two-column grid for a structured office-style layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', fontSize: '14px' }}>
              {/* Staff Information */}
              <div>
                <h5 style={sectionHeaderStyle}>Staff Information</h5>
                <Detail label="Name" value={`${viewLeave.user?.firstName} ${viewLeave.user?.lastName}`} />
                <Detail label="Staff ID" value={viewLeave.user?.id} />
                <Detail label="Job Title" value={viewLeave.user?.jobTitle} />
                <Detail label="Faculty" value={viewLeave.faculty} />
                <Detail label="Department" value={viewLeave.department} />
                <Detail label="Staff Category" value={viewLeave.staffCategory} />
                <Detail label="Mobile" value={viewLeave.user?.mobile} />
                <Detail label="Email" value={viewLeave.user?.personalEmail || viewLeave.user?.email} />
              </div>

              {/* Leave Details */}
              <div>
                <h5 style={sectionHeaderStyle}>Leave Details</h5>
                <Detail label="Leave Type" value={viewLeave.leaveType} />
                {(viewLeave.leaveType === 'Short Leave' || viewLeave.leaveType === 'Half Day') ? (
                  <>
                    <Detail label="Date" value={dayjs(viewLeave.shortLeaveDate).format('YYYY-MM-DD')} />
                    <Detail label="Time" value={`${viewLeave.shortLeaveStartTime} - ${viewLeave.shortLeaveEndTime}`} />
                  </>
                ) : (
                  <>
                    <Detail label="From" value={dayjs(viewLeave.fromDate).format('YYYY-MM-DD')} />
                    <Detail label="To" value={dayjs(viewLeave.toDate).format('YYYY-MM-DD')} />
                  </>
                )}
                <Detail label="Duration" value={`${viewLeave.numberOfDays} day(s)`} />
                <Detail label="Purpose" value={viewLeave.purpose} />
                <Detail label="Address During Leave" value={viewLeave.addressDuringLeave} />
              </div>
            </div>

            {/* Arrangement Details */}
            <div style={{ marginTop: 30 }}>
              <h5 style={sectionHeaderStyle}>Arrangement Details</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <Detail label="Name" value={viewLeave.arrangementName} />
                <Detail label="Address" value={viewLeave.arrangementAddress} />
                <Detail label="Phone" value={viewLeave.arrangementPhone} />
                <Detail label="Email" value={viewLeave.arrangementEmail} />
              </div>
            </div>

            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <button onClick={closeViewModal} style={closeButtonStyle}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* Helper Component for Cleaner Layout */
const Detail = ({ label, value }) => (
  <div style={{ marginBottom: 8 }}>
    <strong style={{ width: 140, display: 'inline-block', color: '#555' }}>{label}:</strong>
    <span style={{ color: '#222' }}>{value || '-'}</span>
  </div>
);

/* Styles */
const backdropStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: 20,
  overflowY: 'auto',
};

const viewModalStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '8px',
  maxWidth: '900px',
  width: '100%',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
};

const rejectModalStyle = {
  background: 'white',
  padding: 20,
  borderRadius: 8,
  maxWidth: 400,
  width: '90%',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
};

const cancelButtonStyle = {
  marginRight: 8,
  padding: '6px 12px',
  backgroundColor: '#f2f2f2',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
};

const submitButtonStyle = {
  backgroundColor: '#800000',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
};

const closeButtonStyle = {
  backgroundColor: '#800000',
  color: 'white',
  border: 'none',
  padding: '8px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
};

const sectionHeaderStyle = {
  color: '#800000',
  marginBottom: '10px',
  borderBottom: '1px solid #ddd',
  paddingBottom: '5px',
};

export default PendingRequests;
