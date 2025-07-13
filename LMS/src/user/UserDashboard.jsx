import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import LeaveRequestForm from '../user/LeaveRequestForm';
import LeaveLog from '../user/LeaveLog';
import api from '../component/api';
import UniversityLogo from "../assets/images/uop.png";
import CEITLogo from "../assets/images/ceit.png";
import LeaveSummary from './LeaveSummary';
import AccountSettings from './AccountSettings';
import HelpCenter from '../components/HelpCenter';
import GuidedTour from '../components/GuidedTour';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../component/api';
import { FaEdit, FaSave, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaUser, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaQuestionCircle, FaPlay } from 'react-icons/fa';
import { toast } from "react-toastify";
import NotificationBell from '../components/NotificationBell';

const colors = {
  goldYellow: 'var(--secondary-color)',
  maroonRed: 'var(--primary-color)',
  darkRed: '#A52A2A',
  lightBackground: '#fff3e6',
  white: 'var(--background-color)'
};

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('leave-request');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      navigate('/login');
      return;
    }
    axios.get('http://localhost:8080/api/auth/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setUser(res.data);
        setPreviewImage(res.data.image || null);
        // Check if this is a Google user
        setIsGoogleUser(res.data.id && res.data.id.startsWith('GOOGLE_'));
      })
      .catch(() => setError('Failed to fetch user profile. Please login again.'));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      let imageUrl = user.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const imageRes = await axios.post(
          'http://localhost:8080/api/auth/user/profile/image-upload',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        imageUrl = imageRes.data.imageUrl;
      }

      const updateData = {
        firstName: user.firstName,
        lastName: user.lastName,
        image: imageUrl,
      };

      const profileRes = await axios.put(
        'http://localhost:8080/api/auth/user/profile',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUser(profileRes.data);
      setIsEditing(false);
      setImageFile(null);
      setPreviewImage(profileRes.data.image);

    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setPreviewImage(user?.image || null);
  };

  const handleExtendedProfileUpdate = async (updatedData) => {
    if (!user) return;

    setUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create update data with only the fields that should be sent to the backend
      const updateData = {
        id: updatedData.id,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        mobile: updatedData.mobile,
        faculty: updatedData.faculty,
        department: updatedData.department,
        staffCategory: updatedData.staffCategory,
        jobTitle: updatedData.jobTitle,
        personalEmail: updatedData.personalEmail,
        typeOfRegistration: updatedData.typeOfRegistration,
        image: updatedData.image
      };

      // Add password only if provided
      if (updatedData.newPassword && updatedData.newPassword.trim() !== '') {
        updateData.newPassword = updatedData.newPassword;
      }

      const profileRes = await axios.put(
        'http://localhost:8080/api/auth/user/extended-profile',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update the user state with the response data
      setUser(profileRes.data);
      setPreviewImage(profileRes.data.image || null);
      
      // Update Google user status based on new ID
      setIsGoogleUser(profileRes.data.id && profileRes.data.id.startsWith('GOOGLE_'));
      
      return { success: true, data: profileRes.data };

    } catch (err) {
      setError('Failed to update profile. Please try again.');
      return { success: false, error: err.response?.data || 'Update failed' };
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Helper for profile completion
  const requiredFields = [
    user?.id, 
    user?.firstName, 
    user?.lastName, 
    user?.email
    // Note: mobile is optional but recommended for better profile completion
  ];
  
  const optionalFields = [
    user?.mobile
  ];
  
  const completedRequiredFields = requiredFields.filter(Boolean);
  const completedOptionalFields = optionalFields.filter(Boolean);
  
  // Calculate completion: 100% for required fields, bonus for optional fields
  const requiredCompletion = Math.round((completedRequiredFields.length / requiredFields.length) * 100);
  const optionalBonus = completedOptionalFields.length > 0 ? 20 : 0; // 20% bonus for mobile
  const profileCompletion = Math.min(100, requiredCompletion + optionalBonus);
  const isProfileComplete = requiredCompletion === 100;

  // Debug: Log profile completion details
  

  // Sidebar navigation items
  const navItems = [
    { key: 'profile', label: 'My Profile', icon: <FaUser />, tourId: 'profile' },
    { key: 'leave-request', label: 'Leave Request', icon: <FaClipboardList />, tourId: 'leave-request' },
    { key: 'leave-log', label: 'Leave Log', icon: <FaUser />, tourId: 'leave-log' },
    { key: 'leave-summary', label: 'Leave Summary', icon: <FaChartBar />, tourId: 'leave-summary' },
    { key: 'account-settings', label: 'Account Settings', icon: <FaCog />, tourId: 'account-settings' },
    { key: 'help-center', label: 'Help Center', icon: <FaQuestionCircle />, tourId: 'help-center' },
  ];

  if (error) return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: colors.lightBackground }}>
      <div className="alert alert-danger text-center w-75" style={{ color: colors.maroonRed, borderColor: colors.maroonRed }}>
        {error}
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: colors.lightBackground }}>
      <div className="spinner-border" style={{ color: colors.maroonRed }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100vh', display: 'flex', fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: colors.lightBackground, overflow: 'hidden' }}>
      {/* Notification Bell and Start Tutorial in top right corner */}
      <div style={{ position: 'fixed', top: 18, right: 32, zIndex: 2000, display: 'flex', alignItems: 'center', gap: 16 }}>
        <NotificationBell />
        <button
          onClick={() => setShowGuidedTour(true)}
          style={{
            background: '#fff',
            color: '#800000',
            border: '1px solid #eee',
            borderRadius: 6,
            padding: '6px 10px',
            marginLeft: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: 13,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            transition: 'all 0.2s',
            outline: 'none',
          }}
          title="Start Interactive Tutorial"
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f8e6e0';
            e.currentTarget.style.color = '#800000';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(128,0,0,0.10)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.color = '#800000';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
            e.currentTarget.style.outline = 'none';
          }}
          onMouseDown={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #800000, #A52A2A)';
            e.currentTarget.style.color = '#FFD700';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(128,0,0,0.15)';
            e.currentTarget.style.outline = '2px solid #FFD700';
          }}
          onMouseUp={e => {
            e.currentTarget.style.background = '#f8e6e0';
            e.currentTarget.style.color = '#800000';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(128,0,0,0.10)';
            e.currentTarget.style.outline = 'none';
          }}
        >
          <FaPlay size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {!isMobile && 'Start Tutorial'}
        </button>
      </div>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
        />
      )}
      {/* Sidebar */}
      <aside style={{
        width: isMobile ? '280px' : 240,
        background: `linear-gradient(135deg, ${colors.maroonRed}, ${colors.darkRed})`,
        color: colors.goldYellow,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '16px 0' : '32px 0',
        boxShadow: '2px 0 12px rgba(0,0,0,0.07)',
        position: isMobile ? 'fixed' : 'sticky',
        zIndex: 1050,
        top: isMobile ? 0 : 0,
        left: isMobile ? (sidebarOpen ? 0 : '-280px') : 'auto',
        height: '100vh',
        overflowY: 'auto',
        transition: isMobile ? 'left 0.3s ease-in-out' : 'none',
      }}>
        <div style={{ 
          marginBottom: 32, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          width: '100%'
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'absolute',
                top: -8,
                right: 16,
                background: 'none',
                border: 'none',
                color: colors.goldYellow,
                fontSize: 24,
                cursor: 'pointer',
                padding: 4,
                zIndex: 1
              }}
            >
              ×
            </button>
          )}
          <img src={UniversityLogo} alt="University Logo" style={{ height: isMobile ? 40 : 48, marginBottom: 8, display: 'block' }} />
          <img src={CEITLogo} alt="CEIT Logo" style={{ height: isMobile ? 40 : 48, display: 'block' }} />
        </div>
        <nav style={{ width: '100%' }}>
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-link ${activeTab === item.key ? 'active' : ''}`}
              data-tour={item.tourId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 8 : 12,
                width: '100%',
                background: 'none',
                border: 'none',
                color: activeTab === item.key ? colors.goldYellow : '#fff',
                fontWeight: activeTab === item.key ? 700 : 500,
                fontSize: isMobile ? 16 : 18,
                padding: isMobile ? '12px 16px' : '14px 32px',
                cursor: 'pointer',
                borderLeft: activeTab === item.key ? `6px solid ${colors.goldYellow}` : '6px solid transparent',
                transition: 'background 0.2s, color 0.2s',
                outline: 'none',
                marginBottom: 4,
              }}
              onClick={() => {
                if (item.key === 'help-center') {
                  setShowHelpCenter(true);
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                } else {
                  setActiveTab(item.key);
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ flexGrow: 1 }} />
        <button
     className="btn"
     style={{
            fontSize: isMobile ? 14 : 16,
            borderRadius: 8,
            backgroundColor: '#800000',
            color: '#FFD700',
       border: 'none',
       padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.2rem',
       cursor: 'pointer',
            marginBottom: 16,
            width: isMobile ? '90%' : '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 8 : 10,
          }}
     onClick={handleLogout}
   >
          <FaSignOutAlt /> Logout
   </button>
      </aside>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        marginLeft: isMobile ? 0 : 0,
        width: isMobile ? '100%' : 'auto',
        overflow: 'hidden'
      }}>
        {/* Header with banner */}
        <header className="dashboard-header" style={{
          width: '100%',
          minHeight: isMobile ? 100 : 140,
          background: `linear-gradient(90deg, ${colors.goldYellow} 0%, #fffbe6 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 48px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: colors.maroonRed,
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              ☰
            </button>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontWeight: 800, 
              fontSize: isMobile ? 20 : 32, 
              color: colors.maroonRed, 
              margin: 0,
              lineHeight: isMobile ? 1.2 : 1.4
            }}>
              {isMobile ? 'LMS' : 'Leave Management System'}
            </h1>
            <div style={{ 
              color: '#555', 
              fontSize: isMobile ? 14 : 18, 
              marginTop: 4,
              lineHeight: 1.3
            }}>
              Welcome, <strong>{user.firstName}</strong>
              {!isMobile && (
                <>
                  {' '}from <strong>{user.faculty}</strong>
                  {isGoogleUser && (
                    <span className="badge bg-info ms-2" title="Google Account" style={{ marginLeft: 8 }}>
                      <i className="fab fa-google me-1"></i>Google User
                    </span>
                  )}
                </>
              )}
            </div>
            <div style={{ 
              fontWeight: 500, 
              color: '#888', 
              fontSize: isMobile ? 12 : 15 
            }}>
              {currentTime.toLocaleDateString()} &nbsp; {currentTime.toLocaleTimeString()}
            </div>
          </div>
          
          {/* Start Tutorial Button */}
          {/* This button is now moved to the top right corner */}
        </header>

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '16px 0' : '32px 0', 
          background: '#f8f9fa', 
          minHeight: 'calc(100vh - 140px)',
          overflowY: 'auto'
        }}>
          <div style={{ 
            maxWidth: 1100, 
            margin: '0 auto', 
            display: 'flex', 
            gap: isMobile ? 16 : 32, 
            alignItems: 'flex-start', 
            flexWrap: 'wrap',
            padding: isMobile ? '0 16px' : '0'
          }}>
            {/* Main Tab Content */}
            <div style={{ 
              flex: 1, 
              minWidth: isMobile ? '100%' : 320, 
              background: '#fff', 
              borderRadius: isMobile ? 12 : 18, 
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)', 
              padding: isMobile ? 16 : 32, 
              minHeight: isMobile ? 300 : 420 
            }}>
              {/* Alerts for Google user/profile completion */}
        {isGoogleUser && !isProfileComplete && (
          <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Profile Incomplete:</strong> Please complete your profile information in <strong>Account Settings</strong> before you can submit leave requests.
            {!user?.mobile && (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                💡 Adding your mobile number will help complete your profile.
              </div>
            )}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}
        {isGoogleUser && user?.id?.startsWith('GOOGLE_') && (
          <div className="alert alert-info alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Update Your Employee ID:</strong> Please update your Staff ID to your actual employee ID 
            (e.g., ENG123, MED456) in <strong>Account Settings</strong> for proper reporting and administration.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}
        {isGoogleUser && isProfileComplete && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            <strong>Profile Complete:</strong> Your account information is complete. You can now submit leave requests.
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}
              {activeTab === 'profile' && (
  <div className="container py-4">
    <div className="row g-4">
      {/* Avatar & Basic Info */}
      <div className="col-md-4 text-center">
        <div className="position-relative d-inline-block">
          <img
            src={
              previewImage
                ? previewImage.startsWith('http')
                  ? previewImage
                  : `http://localhost:8080${previewImage}`
                : '/default-profile.png'
            }
            alt="Profile"
            className="rounded-circle border shadow"
            style={{ width: 120, height: 120, objectFit: 'cover' }}
          />
          <button
            className="btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0"
            onClick={() => fileInputRef.current.click()}
            title="Upload Profile Picture"
          >
            <FaEdit />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="mt-3">
          {isEditing ? (
            <div className="d-flex justify-content-center gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                value={user.firstName}
                placeholder="First Name"
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
                style={{ maxWidth: 110 }}
              />
              <input
                type="text"
                className="form-control form-control-sm"
                value={user.lastName}
                placeholder="Last Name"
                onChange={(e) =>
                  setUser({ ...user, lastName: e.target.value })
                }
                style={{ maxWidth: 110 }}
              />
            </div>
          ) : (
            <h4 className="mt-2">{user.firstName} {user.lastName}</h4>
          )}

          <div className="text-muted">{user.email}</div>

          <div className="mt-2 d-flex justify-content-center gap-2">
            <button
              className={`btn btn-sm ${isEditing ? 'btn-outline-danger' : 'btn-outline-primary'}`}
              onClick={() => {
                if (isEditing) handleCancelEdit();
                else setIsEditing(true);
              }}
            >
              {isEditing ? <><FaTimesCircle /> Cancel</> : <><FaEdit /> Edit</>}
            </button>
            {isEditing && (
              <button
                className="btn btn-sm btn-success"
                onClick={handleSaveProfile}
                disabled={updating}
              >
                <FaSave /> Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="col-md-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3 text-maroon">Profile Details</h5>

            <div className="row mb-2">
              <div className="col-md-6"><strong>Staff ID:</strong> {user.id || <span className="text-danger">Required</span>}</div>
              <div className="col-md-6"><strong>Faculty:</strong> {user.faculty || <span className="text-danger">Required</span>}</div>
            </div>
            {user.faculty !== 'Information Technology Center' && (
              <div className="mb-2"><strong>Department:</strong> {user.department || <span className="text-danger">Required</span>}</div>
            )}
            <div className="mb-2"><strong>Job Title:</strong> {user.jobTitle || <span className="text-muted">N/A</span>}</div>
            <div className="mb-2"><strong>Mobile:</strong> {user.mobile || <span className="text-muted">Not added</span>}</div>

            <div className="mb-3">
              <strong>Account Status:</strong>{' '}
              {user.approved ? (
                <span className="badge bg-success"><FaCheckCircle className="me-1" /> Approved</span>
              ) : (
                <span className="badge bg-danger"><FaExclamationTriangle className="me-1" /> Not Approved</span>
              )}
            </div>

            {/* Profile Completion */}
            <div className="mb-2">
              <strong>Profile Completion:</strong> {profileCompletion}%
              <div className="progress mt-1" style={{ height: '10px' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${profileCompletion}%`, backgroundColor: '#FFD700' }}
                />
              </div>
              {!isProfileComplete && (
                <small className="text-danger">
                  Please complete your profile in <strong>Account Settings</strong>.
                </small>
              )}
            </div>

            {isGoogleUser && user?.id?.startsWith('GOOGLE_') && (
              <div className="alert alert-info mt-3">
                <FaInfoCircle className="me-2" />
                Please update your Staff ID in <strong>Account Settings</strong>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

          {activeTab === 'leave-request' && (
            user.approved ? (
              isGoogleUser && !isProfileComplete ? (
                <div className="alert alert-warning text-center p-4" style={{ borderColor: colors.maroonRed, backgroundColor: '#fff3cd', color: colors.maroonRed }}>
                  <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                  <h5>Profile Completion Required</h5>
                  <p>You must complete your faculty and department information before submitting leave requests.</p>
                  <button 
                    className="btn btn-warning mt-2"
                    onClick={() => setActiveTab('account-settings')}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Complete Profile Now
                  </button>
                </div>
              ) : (
                <LeaveRequestForm />
              )
            ) : (
              <div className="alert alert-warning" style={{ borderColor: colors.maroonRed, backgroundColor: '#fff3cd', color: colors.maroonRed }}>
                Your account is not approved yet. Leave Request form is disabled.
              </div>
            )
          )}
          {activeTab === 'leave-log' && <LeaveLog />}
          {activeTab === 'leave-summary' && <LeaveSummary />}
          {activeTab === 'account-settings' && (
            <AccountSettings 
              user={user} 
              isGoogleUser={isGoogleUser}
              onUpdate={handleExtendedProfileUpdate}
              updating={updating}
            />
          )}

            </div>
        </div>
      </main>

      {/* Help Center Modal */}
      {showHelpCenter && (
        <HelpCenter 
          isVisible={showHelpCenter} 
          onClose={() => setShowHelpCenter(false)} 
        />
      )}

      {/* Guided Tour */}
      <GuidedTour 
        isVisible={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
        userRole="STAFF"
      />

      {/* Footer */}
        <footer className="py-3 text-center" style={{ 
          backgroundColor: colors.maroonRed, 
          color: colors.goldYellow, 
          marginTop: 'auto',
          fontSize: isMobile ? 12 : 14
        }}>
        <div className="container">
          © {new Date().getFullYear()} Leave Management System · Developed by CEIT
        </div>
      </footer>
      </div>
    </div>
  );
}
