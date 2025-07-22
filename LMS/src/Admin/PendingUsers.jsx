// ✅ Updated to a more work-friendly, corporate-style UI
// - Cleaner tab bar
// - Compact search & summary
// - Professional user cards & table
// - HR-style user details modal with two-column layout
//
// NOTE: Using same functional logic, just UI structure improved

import { useEffect, useState } from 'react';
import api from '../component/api';
import { FaEye, FaEdit, FaTimes } from 'react-icons/fa';
import AdminUserEditModal from './AdminUserEditModal';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('allUsers');
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;

  const filterSysAdminAndSelf = (users) => users.filter(u => u.role !== 'SYS_ADMIN' && u.id !== currentUserId);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const role = localStorage.getItem('role');
      const url = role === 'ASSISTANT_REGISTRAR' ? '/ar/users' : '/admin/users/all';
      const res = await api.get(url);
      setAllUsers(filterSysAdminAndSelf(res.data));
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const role = localStorage.getItem('role');
      if (role === 'ASSISTANT_REGISTRAR') {
        const res = await api.get('/ar/users');
        const pending = res.data.filter(u => u.approved === false);
        setPendingUsers(filterSysAdminAndSelf(pending));
      } else {
        const res = await api.get('/admin/users/pending');
        setPendingUsers(filterSysAdminAndSelf(res.data));
      }
    } catch (err) {
      setError('Failed to load pending users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    activeTab === 'allUsers' ? fetchAllUsers() : fetchPendingUsers();
  }, [activeTab]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this user?')) return;
    setLoading(true);
    try {
      await api.post(`/admin/users/${id}/approve`);
      await fetchPendingUsers();
    } catch (err) {
      alert('Failed to approve user.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this user?')) return;
    setLoading(true);
    try {
      await api.post(`/admin/users/${id}/reject`);
      await fetchPendingUsers();
    } catch (err) {
      alert('Failed to reject user.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const getImageSrc = (image) => {
    if (!image) return '/default-avatar.png';
    if (image.startsWith('data:') || image.startsWith('http')) return image;
    return `/uploads/${image}`;
  };

  const filterUsers = (users) => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter(u => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
      return fullName.includes(term) || (u.email || '').toLowerCase().includes(term);
    });
  };

  const filteredAllUsers = filterUsers(allUsers);
  const filteredPendingUsers = filterUsers(pendingUsers);

  const formatName = (u) => {
    const name = u.firstName ? `${u.firstName} ${u.lastName}` : u.username || 'Unnamed';
    return u.id === currentUserId ? `${name} (me)` : name;
  };

  const DetailRow = ({ label, value }) => (
    <div className="d-flex mb-2">
      <div className="fw-bold" style={{ width: '140px', color: '#800000' }}>{label}:</div>
      <div className="flex-grow-1 text-muted">{value || '-'}</div>
    </div>
  );

  return (
    <div className="container-fluid">
      {/* Tabs */}
      <div className="d-flex mb-3 border-bottom" style={{ borderColor: '#800000' }}>
        {['allUsers', 'pendingUsers'].map(tab => (
          <button
            key={tab}
            className={`btn fw-bold me-2 ${activeTab === tab ? 'text-gold' : 'text-maroon'}`}
            style={{
              backgroundColor: activeTab === tab ? '#800000' : 'transparent',
              border: '1px solid #800000',
              borderBottom: activeTab === tab ? '2px solid #FFD700' : 'none',
              borderRadius: '6px 6px 0 0',
              padding: '10px 20px'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'allUsers' ? 'All Users' : 'Pending Users'}
          </button>
        ))}
      </div>

      {/* Search + Summary */}
      <div className="row mb-3">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text" style={{ backgroundColor: '#800000', color: '#FFD700' }}>
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>
        <div className="col-md-4 text-end text-muted small d-flex align-items-center justify-content-end">
          <i className="fas fa-users me-2"></i>
          {activeTab === 'allUsers' ? `${filteredAllUsers.length} users` : `${filteredPendingUsers.length} pending`}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-4"><div className="spinner-border text-primary" /></div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Pending Users: HR-style cards */}
      {activeTab === 'pendingUsers' && !loading && !error && (
        filteredPendingUsers.length === 0 ? (
          <p className="text-center text-muted">No pending users.</p>
        ) : (
          <div className="row g-3">
            {filteredPendingUsers.map(u => (
              <div className="col-md-4" key={u.id}>
                <div className="card h-100 shadow-sm border-light">
                  <div className="card-body text-center">
                    <img src={getImageSrc(u.image)} className="rounded-circle mb-3" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #FFD700' }} />
                    <h6 className="fw-bold text-maroon">{formatName(u)}</h6>
                    <small className="text-muted">{u.email}</small>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-sm btn-outline-primary" title="View Details" onClick={() => setSelectedUser(u)}><FaEye /></button>
                      <button className="btn btn-sm btn-success" onClick={() => handleApprove(u.id)}>Approve</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleReject(u.id)}>Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* All Users: compact professional table */}
      {activeTab === 'allUsers' && !loading && !error && (
        filteredAllUsers.length === 0 ? (
          <p className="text-center text-muted">No users found.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#800000', color: '#FFD700' }}>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Job Title</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <img src={getImageSrc(u.image)} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFD700' }} />
                    </td>
                    <td className="fw-semibold text-maroon">{formatName(u)}</td>
                    <td className="text-muted small">{u.jobTitle || '-'}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setSelectedUser(u)} title="View"><FaEye /></button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleEditClick(u)} title="Edit"><FaEdit /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ✅ User Details Modal - work-friendly HR style */}
      {selectedUser && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: '#800000', color: '#FFD700' }}>
                <h5 className="modal-title">User Profile</h5>
                <button className="btn-close" onClick={() => setSelectedUser(null)} />
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Left Column: Photo + Basic */}
                  <div className="col-md-4 text-center border-end">
                    <img src={getImageSrc(selectedUser.image)} className="rounded-circle mb-3" style={{ width: '100px', height: '100px', border: '3px solid #FFD700', objectFit: 'cover' }} />
                    <h6 className="fw-bold text-maroon">{formatName(selectedUser)}</h6>
                    <small className="text-muted">{selectedUser.email}</small>
                  </div>

                  {/* Right Column: Details */}
                  <div className="col-md-8">
                    <h6 className="fw-bold mb-3 text-maroon">User Information</h6>
                    <DetailRow label="ID" value={selectedUser.id} />
                    <DetailRow label="First Name" value={selectedUser.firstName} />
                    <DetailRow label="Last Name" value={selectedUser.lastName} />
                    <DetailRow label="Faculty" value={selectedUser.faculty} />
                    {selectedUser.faculty !== 'Information Technology Center' && (
                      <DetailRow label="Department" value={selectedUser.department} />
                    )}
                    <DetailRow label="Job Title" value={selectedUser.jobTitle} />
                    <DetailRow label="Role" value={selectedUser.role} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <AdminUserEditModal
          user={userToEdit}
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={() => {
            fetchAllUsers();
            fetchPendingUsers();
            setEditModalOpen(false);
          }}
          token={localStorage.getItem('token')}
        />
      )}
    </div>
  );
}
