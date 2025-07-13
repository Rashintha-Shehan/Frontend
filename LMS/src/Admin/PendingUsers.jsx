import { useEffect, useState } from 'react';
import api from '../component/api';
import { FaEye } from 'react-icons/fa';
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

  const filterSysAdminAndSelf = (users) =>
    users.filter(u => u.role !== 'SYS_ADMIN' && u.id !== currentUserId);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users/all');
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
      const res = await api.get('/admin/users/pending');
      setPendingUsers(filterSysAdminAndSelf(res.data));
    } catch (err) {
      setError('Failed to load pending users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'allUsers') fetchAllUsers();
    else fetchPendingUsers();
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

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <div>
      <div className="mb-4">
        <ul className="nav nav-tabs" style={{ borderBottom: '2px solid #800000' }}>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold ${activeTab === 'allUsers' ? 'active' : ''}`}
              onClick={() => setActiveTab('allUsers')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'allUsers' ? '#800000' : 'transparent',
                color: activeTab === 'allUsers' ? '#FFD700' : '#800000',
                borderRadius: '8px 8px 0 0',
                padding: '12px 24px',
                marginRight: '4px'
              }}
            >
              <i className="fas fa-users me-2"></i>
              All Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-bold ${activeTab === 'pendingUsers' ? 'active' : ''}`}
              onClick={() => setActiveTab('pendingUsers')}
              style={{
                border: 'none',
                backgroundColor: activeTab === 'pendingUsers' ? '#800000' : 'transparent',
                color: activeTab === 'pendingUsers' ? '#FFD700' : '#800000',
                borderRadius: '8px 8px 0 0',
                padding: '12px 24px',
                marginLeft: '4px'
              }}
            >
              <i className="fas fa-clock me-2"></i>
              Pending Users
            </button>
          </li>
        </ul>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text" style={{ backgroundColor: '#800000', color: '#FFD700', borderColor: '#800000' }}>
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name, email, or staff ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ borderColor: '#800000' }}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        <div className="col-md-4 d-flex justify-content-end align-items-center">
          <div className="text-muted small">
            <i className="fas fa-users me-1"></i>
            {activeTab === 'allUsers' ? `${filteredAllUsers.length} users` : `${filteredPendingUsers.length} pending`}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {activeTab === 'pendingUsers' && !loading && !error && (
        <>
          {filteredPendingUsers.length === 0 ? (
            <p className="text-center text-muted fst-italic">No pending users.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {filteredPendingUsers.map(u => (
                <div className="col" key={u.id}>
                  <div className="card shadow-sm border-0 h-100" onClick={() => handleUserClick(u)} style={{ cursor: 'pointer' }}>
                    <div className="card-body text-center">
                      <div className="rounded-circle mx-auto mb-3" style={{
                        width: '90px', height: '90px', overflow: 'hidden',
                        border: '3px solid #FFD700', boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                      }}>
                        <img
                          src={getImageSrc(u.image)}
                          alt={u.username}
                          className="img-fluid"
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                      <h5 className="fw-bold text-maroon mb-1">{formatName(u)}</h5>
                      <p className="text-muted small mb-3">{u.email}</p>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm px-3"
                          style={{ backgroundColor: '#FFD700', color: '#800000', fontWeight: 600, border: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(u.id);
                          }}
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(u.id);
                          }}
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'allUsers' && !loading && !error && (
        <>
          {filteredAllUsers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <p className="text-muted fst-italic">No users found matching your search.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <table className="table table-hover align-middle" style={{ minWidth: '600px' }}>
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '60px' }}>Photo</th>
                    <th>Name</th>
                    <th>Job Title</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllUsers.map(u => (
                    <tr key={u.id} onClick={() => handleUserClick(u)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="rounded-circle" style={{
                          width: '45px', height: '45px', overflow: 'hidden',
                          border: '2px solid #FFD700', backgroundColor: '#f8f9fa'
                        }}>
                          <img
                            src={getImageSrc(u.image)}
                            alt={u.username}
                            className="img-fluid"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>
                      </td>
                      <td><div className="fw-bold text-maroon">{formatName(u)}</div></td>
                      <td><div className="text-muted small">{u.jobTitle || '-'}</div></td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(u);
                          }}
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(u);
                          }}
                          title="Edit"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-warning">
              <div className="modal-header" style={{ backgroundColor: '#800000' }}>
                <h5 className="modal-title text-gold fw-bold">User Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)} />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <img
                      src={getImageSrc(selectedUser.image)}
                      alt="User"
                      className="rounded-circle mb-3"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid #FFD700' }}
                    />
                    <h5 className="text-maroon">{formatName(selectedUser)}</h5>
                    <p className="text-muted small">{selectedUser.email}</p>
                  </div>
                  <div className="col-md-8">
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr><th>ID:</th><td>{selectedUser.id}</td></tr>
                        <tr><th>First Name:</th><td>{selectedUser.firstName || '-'}</td></tr>
                        <tr><th>Last Name:</th><td>{selectedUser.lastName || '-'}</td></tr>
                        <tr><th>Faculty:</th><td>{selectedUser.faculty || '-'}</td></tr>
                        {selectedUser.faculty !== 'Information Technology Center' && (
                          <tr><th>Department:</th><td>{selectedUser.department || '-'}</td></tr>
                        )}
                        <tr><th>Job Title:</th><td>{selectedUser.jobTitle || '-'}</td></tr>
                        <tr><th>Role:</th><td>{selectedUser.role || '-'}</td></tr>
                      </tbody>
                    </table>
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
