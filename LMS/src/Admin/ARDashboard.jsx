import React, { useEffect, useState } from 'react';
import api from '../component/api';
import PendingRequests from './PendingRequests';
import PendingUsers from './PendingUsers';
import AdminProfile from './AdminProfile';
import AdminUserEditModal from './AdminUserEditModal';
import { FaPlay, FaFileAlt, FaUsers, FaUserCircle, FaBars, FaTimes, FaBell, FaSignOutAlt } from 'react-icons/fa';
import GuidedTour from '../components/GuidedTour';

const ARDashboard = () => {
  const token = localStorage.getItem('token');
  const [faculty, setFaculty] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [leaveStatusTab, setLeaveStatusTab] = useState('PENDING');
  const [notifications, setNotifications] = useState({
    pendingUsers: false,
    pending: false,
  });
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on large screens
  useEffect(() => {
    if (windowWidth >= 768) setSidebarOpen(false);
  }, [windowWidth]);

  // Fetch pending leaves
  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaves/ar/requests', { params: { faculty } });
      setLeaves(data);
      setNotifications((prev) => ({
        ...prev,
        pending: data.some(l => l.status === 'PENDING'),
      }));
      setError(null);
    } catch {
      setError('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const storedFaculty = localStorage.getItem('faculty') || '';
    setFaculty(storedFaculty);
    if (storedFaculty) fetchPendingLeaves();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [userRes, leaveRes] = await Promise.all([
          api.get('/ar/users/pending/count'),
          api.get('/ar/leaves/pending/count'),
        ]);
        setNotifications({
          pendingUsers: userRes.data.count > 0,
          pending: leaveRes.data.count > 0,
        });
      } catch {}
    };
    fetchNotifications();
  }, []);

  // Approve/reject leave
  const approveLeave = async (id) => {
    try {
      await api.put(`/leaves/ar/${id}/approve`);
      await fetchPendingLeaves();
      setError(null);
    } catch {
      setError('Failed to approve leave');
    }
  };

  const rejectLeave = async (id, reason) => {
    try {
      await api.put(`/leaves/ar/${id}/reject`, { rejectionReason: reason });
      await fetchPendingLeaves();
      setError(null);
    } catch {
      setError('Failed to reject leave');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const res = await api.get('/ar/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setEditModalOpen(false);
      setError(null);
    } catch {
      setError('Failed to refresh users');
    }
  };

  // Fetch users when user management tab active
  useEffect(() => {
    if (activeTab === 'pendingUsers') {
      setLoading(true);
      async function fetchUsers() {
        try {
          const res = await api.get('/ar/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data);
          setError(null);
        } catch {
          setError('Failed to fetch users');
        } finally {
          setLoading(false);
        }
      }
      fetchUsers();
    }
  }, [activeTab, token]);

  const statusTabs = [{ key: 'PENDING', label: 'Pending' }];
  const filteredLeaves = leaves.filter(l => l.status === leaveStatusTab);

  const navItems = [
    { key: 'pending', label: 'Leave Requests', icon: <FaFileAlt />, notification: notifications.pending },
    { key: 'pendingUsers', label: 'User Management', icon: <FaUsers />, notification: notifications.pendingUsers },
    { key: 'myProfile', label: 'My Profile', icon: <FaUserCircle /> },
  ];

  return (
    <div className="dashboard-container" style={{
      display: 'flex',
      height: '100vh',           // full height viewport
      backgroundColor: '#f8f9fa',
      fontFamily: "'Inter', sans-serif",
      color: '#1a1a1a',
      overflow: 'hidden',        // prevent double scrollbars
    }}>
      
      {/* Sidebar */}
      <aside style={{
        position: windowWidth < 768 ? 'fixed' : 'relative',
        left: sidebarOpen ? 0 : windowWidth < 768 ? '-280px' : 0,
        top: 0,
        zIndex: 2000,
        width: 280,
        height: '100%',           // fill vertical space
        background: 'rgba(128, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#FFD700',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRight: '1px solid rgba(255, 215, 0, 0.1)',
        overflowY: 'auto'         // sidebar scrollable independently
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontWeight: '700',
            fontSize: '1.5rem',
            letterSpacing: '0.5px',
            margin: 0,
            background: 'linear-gradient(90deg, #FFD700, #FFFFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AR Dashboard
          </h2>
          {windowWidth < 768 && (
            <button 
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFD700',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
              aria-label="Close sidebar"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div style={{
          marginBottom: '1.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'rgba(255, 215, 0, 0.8)'
          }}>Faculty</p>
          <p style={{
            margin: '0.25rem 0 0',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#FFD700'
          }}>{faculty || '...'}</p>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1 }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {navItems.map(({ key, label, icon, notification }) => (
              <li key={key}>
                <button
                  onClick={() => {
                    setActiveTab(key);
                    setError(null);
                    if (key === 'pending') setLeaveStatusTab('PENDING');
                    if (windowWidth < 768) setSidebarOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === key ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                    color: activeTab === key ? '#FFD700' : 'rgba(255, 215, 0, 0.8)',
                    fontWeight: '500',
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.1rem', opacity: activeTab === key ? 1 : 0.8 }}>{icon}</span>
                  <span>{label}</span>
                  {notification && (
                    <span style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#FF5252',
                      boxShadow: '0 0 0 2px rgba(128, 0, 0, 0.9)'
                    }} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255, 215, 0, 0.9)',
              color: '#800000',
              fontWeight: '600',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && windowWidth < 768 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1500,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Main Content (Scrollable) */}
      <main style={{
        flex: 1,
        padding: windowWidth < 768 ? '1.5rem 1rem' : '2rem 2.5rem',
        overflowY: 'auto',   // scrollable independently
        background: '#ffffff',
        transition: 'all 0.3s ease',
        height: '100%'       // fill vertical space
      }}>
        {/* Mobile Header */}
        {windowWidth < 768 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#800000',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#800000',
              margin: 0
            }}>
              AR Dashboard
            </h1>
            <div style={{ width: '24px' }}></div>
          </div>
        )}

        {/* Page Header */}
        <header style={{
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            color: '#800000',
            margin: '0 0 0.25rem',
            fontWeight: '700',
            fontSize: windowWidth < 768 ? '1.5rem' : '1.75rem',
            lineHeight: '1.3'
          }}>
            {activeTab === 'pending' && 'Leave Requests'}
            {activeTab === 'pendingUsers' && 'User Management'}
            {activeTab === 'myProfile' && 'My Profile'}
          </h1>
          <p style={{
            color: '#666',
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: '500'
          }}>
            Faculty: {faculty || '...'}
          </p>
        </header>

        {/* Status Tabs (only pending for AR) */}
        {activeTab === 'pending' && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {statusTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setLeaveStatusTab(tab.key)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #800000',
                  background: leaveStatusTab === tab.key ? '#800000' : 'transparent',
                  color: leaveStatusTab === tab.key ? '#FFD700' : '#800000',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FaBell />
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        )}

        {/* Main Section Scrollable Content */}
        <section style={{ minHeight: 'calc(100% - 120px)' }}>
          {activeTab === 'pending' && (
            <PendingRequests
              leaves={filteredLeaves}
              loading={loading}
              refreshLeaves={fetchPendingLeaves}
              onApprove={leaveStatusTab === 'PENDING' ? approveLeave : undefined}
              onReject={leaveStatusTab === 'PENDING' ? rejectLeave : undefined}
            />
          )}

          {activeTab === 'pendingUsers' && (
            <PendingUsers onEditClick={handleEditClick} />
          )}

          {activeTab === 'myProfile' && <AdminProfile />}
        </section>
      </main>

      {/* Edit User Modal */}
      <AdminUserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
        token={token}
      />

      {/* Guided Tour */}
      <GuidedTour
        isVisible={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
        userRole="ASSISTANT_REGISTRAR"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        html, body {
          height: 100%;
          margin: 0;
          overflow: hidden; /* no double scrollbars */
        }
        * { box-sizing: border-box; }
        button { cursor: pointer; transition: all 0.2s ease; }
        button:focus-visible { outline: 2px solid #800000; outline-offset: 2px; }
        button:hover { opacity: 0.9; }
        @media (max-width: 768px) {
          main { padding: 1.25rem; }
        }
      `}</style>
    </div>
  );
};

export default ARDashboard;
