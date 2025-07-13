import React, { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const PendingRequests = ({ leaves, loading, refreshLeaves, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New state for view modal & selected leave
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
                      style={{
                        borderColor: '#800000',
                        color: '#800000',
                        fontWeight: 600,
                        padding: '4px 8px',
                      }}
                      onClick={() => openViewModal(leave)}
                    >
                      {/* Eye icon SVG */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8z" />
                        <path d="M8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="white" />
                      </svg>
                    </button>

                    {/* Approve button */}
                    <button
                      className="btn btn-sm px-3"
                      style={{
                        backgroundColor: '#FFD700',
                        color: '#800000',
                        fontWeight: 600,
                        border: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                      onClick={() => handleApprove(leave.id)}
                    >
                      Approve
                    </button>

                    {/* Reject button */}
                    <button
                      className="btn btn-sm btn-outline-danger px-3"
                      style={{
                        borderColor: '#800000',
                        color: '#800000',
                        fontWeight: 600,
                      }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={closeRejectModal}
        >
          <div
            style={{
              background: 'white',
              padding: 20,
              borderRadius: 8,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: '1rem', color: '#800000' }}>Enter Rejection Reason</h5>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '1rem',
                resize: 'vertical',
                padding: '8px',
                borderColor: '#ccc',
                borderRadius: '4px',
              }}
              placeholder="Please provide a reason for rejection..."
            />
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  marginRight: 8,
                  padding: '6px 12px',
                  backgroundColor: '#f2f2f2',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                style={{
                  backgroundColor: '#800000',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Leave Details Modal */}
      {showViewModal && viewLeave && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: 20,
            overflowY: 'auto',
          }}
          onClick={closeViewModal}
        >
          <div
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 10,
              maxWidth: 900,
              width: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              color: '#333',
              minHeight: 350,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ color: '#800000', marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>
              Leave Request Details
            </h4>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {/* Left Column: Staff Info & Arrangement */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <h5 style={{ color: '#800000', marginBottom: 12 }}>Staff Information</h5>
                <div style={{ marginBottom: 8 }}><strong>Name:</strong> {viewLeave.user?.firstName} {viewLeave.user?.lastName}</div>
                <div style={{ marginBottom: 8 }}><strong>Staff ID:</strong> {viewLeave.user?.id}</div>
                <div style={{ marginBottom: 8 }}><strong>Job Title:</strong> {viewLeave.user?.jobTitle}</div>
                <div style={{ marginBottom: 8 }}><strong>Faculty:</strong> {viewLeave.faculty}</div>
                <div style={{ marginBottom: 8 }}><strong>Department:</strong> {viewLeave.department}</div>
                <div style={{ marginBottom: 8 }}><strong>Staff Category:</strong> {viewLeave.staffCategory}</div>
                <div style={{ marginBottom: 8 }}><strong>Mobile:</strong> {viewLeave.user?.mobile}</div>
                <div style={{ marginBottom: 8 }}><strong>Email:</strong> {viewLeave.user?.personalEmail || viewLeave.user?.email}</div>
                <h5 style={{ color: '#800000', margin: '20px 0 12px' }}>Arrangement Details</h5>
                <div style={{ marginBottom: 8 }}><strong>Name:</strong> {viewLeave.arrangementName}</div>
                <div style={{ marginBottom: 8 }}><strong>Address:</strong> {viewLeave.arrangementAddress}</div>
                <div style={{ marginBottom: 8 }}><strong>Phone:</strong> {viewLeave.arrangementPhone}</div>
                <div style={{ marginBottom: 8 }}><strong>Email:</strong> {viewLeave.arrangementEmail}</div>
              </div>
              {/* Right Column: Leave Details */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <h5 style={{ color: '#800000', marginBottom: 12 }}>Leave Details</h5>
                <div style={{ marginBottom: 8 }}><strong>Leave Type:</strong> {viewLeave.leaveType}</div>
                {(viewLeave.leaveType === 'Short Leave' || viewLeave.leaveType === 'Half Day') ? (
                  <>
                    <div style={{ marginBottom: 8 }}><strong>Date:</strong> {dayjs(viewLeave.shortLeaveDate).format('YYYY-MM-DD')}</div>
                    <div style={{ marginBottom: 8 }}><strong>Time:</strong> {viewLeave.shortLeaveStartTime} - {viewLeave.shortLeaveEndTime}</div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: 8 }}><strong>From:</strong> {dayjs(viewLeave.fromDate).format('YYYY-MM-DD')}</div>
                    <div style={{ marginBottom: 8 }}><strong>To:</strong> {dayjs(viewLeave.toDate).format('YYYY-MM-DD')}</div>
                  </>
                )}
                <div style={{ marginBottom: 8 }}><strong>Duration:</strong> {viewLeave.numberOfDays} day(s)</div>
                <div style={{ marginBottom: 8 }}><strong>Purpose:</strong> {viewLeave.purpose}</div>
                <div style={{ marginBottom: 8 }}><strong>Address During Leave:</strong> {viewLeave.addressDuringLeave}</div>
              </div>
            </div>
            <div style={{ marginTop: 32, textAlign: 'right' }}>
              <button
                onClick={closeViewModal}
                style={{
                  backgroundColor: '#800000',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingRequests;
