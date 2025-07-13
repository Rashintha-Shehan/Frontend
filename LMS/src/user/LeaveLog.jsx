import React, { useEffect, useState } from 'react';
import api from '../component/api';
import { toast } from 'react-toastify';
import LeaveRequestForm from './LeaveRequestForm';
import { FaEdit, FaCheck, FaTimes, FaSpinner, FaEye, FaArrowLeft } from 'react-icons/fa';
import dayjs from 'dayjs';

export default function LeaveLog() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [editingLeave, setEditingLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingLeaveIds, setUpdatingLeaveIds] = useState(new Set());

  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'ADMIN');
    fetchLeaves();
  }, []);

  const fetchLeaves = async (fromDate = '', toDate = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = '/leaves';
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await api.get(url);
      setLeaves(response.data);
      setFilteredLeaves(response.data);
    } catch (err) {
      setError('Failed to fetch leaves. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!filterFromDate || !filterToDate) {
      toast.error('Please select both From Date and To Date for filtering.');
      return;
    }
    if (filterToDate < filterFromDate) {
      toast.error('To Date cannot be before From Date.');
      return;
    }
    fetchLeaves(filterFromDate, filterToDate);
  };

  const clearFilter = () => {
    setFilterFromDate('');
    setFilterToDate('');
    setFilteredLeaves(leaves);
  };

  const transformLeaveData = (leave) => {
    return {
      id: leave.id,
      staffCategory: leave.staffCategory || '',
      leaveType: leave.leaveType || '',
      faculty: leave.faculty || '',
      department: leave.department || '',
      fromDate: leave.fromDate || '',
      toDate: leave.toDate || '',
      numberOfDays: leave.numberOfDays || '',
      purpose: leave.purpose || '',
      arrangementName: leave.arrangementName || '',
      arrangementAddress: leave.arrangementAddress || '',
      arrangementPhone: leave.arrangementPhone || '',
      arrangementEmail: leave.arrangementEmail || '',
      addressDuringLeave: leave.addressDuringLeave || '',
      status: leave.status || 'PENDING',
      shortLeaveDate: leave.shortLeaveDate || '',
      shortLeaveStartTime: leave.shortLeaveStartTime || '08:00',
      shortLeaveEndTime: leave.shortLeaveEndTime || '16:00'
    };
  };

  const handleEdit = (leave) => {
    setEditingLeave(transformLeaveData(leave));
  };

  const handleUpdate = async (updatedData) => {
    try {
      if (updatedData.status !== 'PENDING') {
        toast.error('Only pending leaves can be edited');
        return;
      }

      await api.put(`/leaves/${updatedData.id}`, updatedData);
      toast.success('Leave request updated successfully!');
      setEditingLeave(null);
      fetchLeaves(filterFromDate, filterToDate);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave request');
      console.error(err);
    }
  };

  const handleStatusChange = async (leaveId, status) => {
    setUpdatingLeaveIds(prev => new Set(prev).add(leaveId));
    try {
      await api.patch(`/leaves/${leaveId}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()}!`);
      fetchLeaves(filterFromDate, filterToDate);
    } catch (err) {
      toast.error(`Failed to ${status.toLowerCase()} leave`);
      console.error(err);
    } finally {
      setUpdatingLeaveIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge bg-success">Approved</span>;
      case 'REJECTED':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  const formatDate = (dateStr) => 
    dateStr ? dayjs(dateStr).format('MMM D, YYYY') : '';

  const formatLeaveDuration = (leave) => {
    if (leave.leaveType === 'Short Leave') {
      return `${leave.numberOfDays} day(s) (${leave.shortLeaveStartTime} - ${leave.shortLeaveEndTime})`;
    }
    return `${leave.numberOfDays} day(s)`;
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{
        maxWidth: 900,
        margin: '32px auto',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: 32,
        minHeight: 400,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--primary-color)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{editingLeave ? 'Leave Request Details' : 'Your Leave Applications'}</span>
          {!editingLeave && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div>
                <label htmlFor="filterFromDate" style={{ fontWeight: 600, marginRight: 6 }}>From:</label>
                <input
                  type="date"
                  id="filterFromDate"
                  style={{ borderRadius: 6, border: '1px solid #ccc', padding: '2px 8px', fontSize: 15 }}
                  value={filterFromDate}
                  onChange={e => setFilterFromDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filterToDate" style={{ fontWeight: 600, marginRight: 6 }}>To:</label>
                <input
                  type="date"
                  id="filterToDate"
                  style={{ borderRadius: 6, border: '1px solid #ccc', padding: '2px 8px', fontSize: 15 }}
                  value={filterToDate}
                  onChange={e => setFilterToDate(e.target.value)}
                />
              </div>
              <button style={{ borderRadius: 6, background: 'var(--secondary-color)', color: '#fff', border: 'none', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={applyFilter}>Filter</button>
              <button style={{ borderRadius: 6, background: '#eee', color: '#800000', border: 'none', padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={clearFilter}>Clear</button>
            </div>
          )}
          {editingLeave && (
            <button 
              style={{ borderRadius: 6, background: '#eee', color: '#800000', border: 'none', padding: '6px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setEditingLeave(null)}
            >
              <FaArrowLeft style={{ marginRight: 6 }} /> Back to List
            </button>
          )}
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <FaSpinner className="fa-spin me-2" />
              Loading leave requests...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : editingLeave ? (
            <LeaveRequestForm
              onSuccess={handleUpdate}
              initialData={editingLeave}
              onCancel={() => setEditingLeave(null)}
              isEditing={editingLeave.status === 'PENDING'}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead className="bg-gold text-maroon">
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No leave requests found
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.leaveType}</td>
                        <td>
                          {(leave.leaveType === 'Short Leave' || leave.leaveType === 'Half Day')
                            ? formatDate(leave.shortLeaveDate)
                            : `${formatDate(leave.fromDate)} - ${formatDate(leave.toDate)}`
                          }
                        </td>
                        <td>{formatLeaveDuration(leave)}</td>
                        <td>
                          {getStatusBadge(leave.status)}
                          {leave.status === 'REJECTED' && leave.rejectionReason && (
                            <div className="text-danger small mt-1">
                              <strong>Reason:</strong> {leave.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(leave)}
                              title={leave.status === 'PENDING' ? 'Edit Leave' : 'View Leave'}
                            >
                              <FaEye className="me-1" /> {leave.status === 'PENDING' ? 'View/Edit' : 'View'}
                            </button>

                            {isAdmin && leave.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  disabled={updatingLeaveIds.has(leave.id)}
                                  onClick={() => handleStatusChange(leave.id, 'APPROVED')}
                                  title="Approve Leave"
                                >
                                  {updatingLeaveIds.has(leave.id) ? (
                                    <FaSpinner className="fa-spin" />
                                  ) : (
                                    <FaCheck />
                                  )}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  disabled={updatingLeaveIds.has(leave.id)}
                                  onClick={() => handleStatusChange(leave.id, 'REJECTED')}
                                  title="Reject Leave"
                                >
                                  {updatingLeaveIds.has(leave.id) ? (
                                    <FaSpinner className="fa-spin" />
                                  ) : (
                                    <FaTimes />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
