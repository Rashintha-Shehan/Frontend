import React, { useEffect, useState } from 'react';
import api from '../component/api';
import Sidebar from '../component/Sidebar';
import PendingRequests from './PendingRequests';
import PendingUsers from './PendingUsers';
import AdminReports from './AdminReports';
import AdminProfile from './AdminProfile';
import LeaveReportTabs from '../Admin/LeaveReportTabs';
import GuidedTour from '../components/GuidedTour';
import { FaPlay } from 'react-icons/fa';
import AdminUserEditModal from './AdminUserEditModal';


const AdminDashboard = () => {
  const token = localStorage.getItem('token');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [notifications, setNotifications] = useState({
    pendingUsers: false,
    pending: false,
  });
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Responsive sidebar toggle
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Move fetchPendingLeaves outside useEffect so it can be reused
  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaves/admin/pending', {
        params: { faculty, department },
      });
      setLeaves(data);
      setNotifications((prev) => ({ ...prev, pending: data.length > 0 }));
    } catch {
      setError('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  // useEffect for initial load
  useEffect(() => {
    const storedFaculty = localStorage.getItem('faculty') || '';
    const storedDepartment = localStorage.getItem('department') || '';
    setFaculty(storedFaculty);
    setDepartment(storedDepartment);
    if (storedFaculty && storedDepartment) {
      fetchPendingLeaves();
    }
  }, []);

  // Fetch notification counts every 30 seconds
 const [pendingUserCount, setPendingUserCount] = useState(0);
const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const [userRes, leaveRes] = await Promise.all([
        api.get('/admin/pending-users/count'),
        api.get('/admin/pending-leaves/count'),
      ]);
      setPendingUserCount(userRes.data.count);
      setPendingLeaveCount(leaveRes.data.count);
      setNotifications({
        pendingUsers: userRes.data.count > 0,
        pending: leaveRes.data.count > 0,
      });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  fetchNotifications();

  // Optional: refresh every 30s

  
}, []);



  // Approve/reject now refresh from backend
  const approveLeave = async (id) => {
    try {
      await api.put(`/leaves/admin/${id}/approve`);
      await fetchPendingLeaves();
    } catch {
      setError('Failed to approve leave');
    }
  };

  const rejectLeave = async (id, reason) => {
    try {
      await api.put(`/leaves/admin/${id}/reject`, { rejectionReason: reason });
      await fetchPendingLeaves();
    } catch {
      setError('Failed to reject leave');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleSidebarLinkClick = (tab) => {
    setActiveTab(tab);
    setError(null);
    if (isMobile) setSidebarOpen(false);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    // Refresh user list after edit
    const res = await fetch('/api/admin/users/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data);
    setEditModalOpen(false);
  };

  // Fetch users on mount or when user management tab is active
  useEffect(() => {
    if (activeTab === 'userManagement') {
      setLoading(true);
      async function fetchUsers() {
        try {
          const res = await fetch('/api/admin/users/all', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setUsers(data);
        } catch (e) {
          setError('Failed to fetch users');
        } finally {
          setLoading(false);
        }
      }
      fetchUsers();
    }
  }, [activeTab, token]);

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <>
            <h4 className="mb-4 fw-semibold" style={{ color: '#800000' }}>
              Pending Leave Requests
            </h4>
            <PendingRequests
              leaves={leaves}
              loading={loading}
              refreshLeaves={fetchPendingLeaves}
              onApprove={approveLeave}
              onReject={rejectLeave}
            />
          </>
        );
      case 'pendingUsers':
        return (
          <>
            <h4 className="mb-4 fw-semibold" style={{ color: '#800000' }}>
              Pending User Accounts
            </h4>
            <PendingUsers />
          </>
        );
   case 'leaveReport':
  return (
    <>
      <h4 className="mb-4 fw-semibold" style={{ color: '#800000' }}>
        Leave Reports
      </h4>
      <LeaveReportTabs />
    </>
  );

      case 'Analytics':
        return <AdminReports />;
      case 'Myprofile':
        return <AdminProfile />;
      default:
        return null;
    }
  };

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1040,
          }}
        />
      )}

      <div className="d-flex" style={{ backgroundColor: '#f9f9f9', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <Sidebar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          faculty={faculty}
          onLogout={handleLogout}
          onLinkClick={handleSidebarLinkClick}
          activeTab={activeTab}
          notifications={notifications} // Pass notifications here
        />

        <main className="flex-grow-1 p-4" style={{ 
          height: '100vh', 
          overflowY: 'auto', 
          paddingBottom: '2rem',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {isMobile && (
            <button
              className="btn mb-3"
              style={{
                backgroundColor: '#800000',
                color: '#FFD700',
                fontWeight: '700',
                borderRadius: 6,
                border: 'none',
              }}
              onClick={() => setSidebarOpen(true)}
            >
              ☰ Menu
            </button>
          )}

          <div
            className="dashboard-header mb-4 p-4 rounded shadow-sm"
            style={{
              backgroundColor: '#fff',
              borderLeft: '8px solid #800000',
              borderRadius: '12px',
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="fw-bold mb-1" style={{ color: '#800000' }}>
                  Leave Management System
                </h2>
                <p style={{ color: '#5A0000', marginBottom: 0 }}>
                  {faculty ? `Faculty: ${faculty}` : 'Faculty: ...'}
                  {faculty !== 'Information Technology Center' && (
                    <>
                      <br />
                      {department ? `Department: ${department}` : 'Department: ...'}
                    </>
                  )}
                </p>
              </div>
              
              {/* Start Tutorial Button */}
              <button
                onClick={() => setShowGuidedTour(true)}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #800000, #A52A2A)',
                  color: '#FFD700',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                title="Start Interactive Tutorial"
              >
                <FaPlay />
                Start Tutorial
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger rounded shadow-sm mb-4">{error}</div>
          )}

          <div
            className="p-4 bg-white rounded shadow-sm"
            style={{ minHeight: 'auto', flex: 1 }}
          >
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Guided Tour */}
      <GuidedTour 
        isVisible={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
        userRole="ADMIN"
      />
      <AdminUserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
        token={token}
      />
    </>
  );
};

export default AdminDashboard;
