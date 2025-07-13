import React from 'react';
import UniversityLogo from "../assets/images/uop.png";

const Sidebar = ({
  isMobile,
  sidebarOpen,
  faculty,
  department,
  onLogout,
  onLinkClick,
  activeTab,
  notifications = {}, // notification flags per menu key
}) => {
  const palette = {
    maroon: 'var(--primary-color)',
    gold: 'var(--secondary-color)',
    maroonLight: '#A0522D',
    goldHover: '#FFE76B',
    lightShade: '#F8F4EF',
  };

  const sidebarStyle = {
    width: 260,
    height: '100vh',
    backgroundColor: palette.maroon,
    color: palette.gold,
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    zIndex: 1050,
    transition: 'transform 0.3s ease-in-out',
    transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 10px rgba(0,0,0,0.15)',
    overflowY: 'auto',
  };

  const headerStyle = {
    padding: '1rem',
    borderBottom: `1px solid ${palette.gold}`,
    display: 'flex',
    justifyContent: 'center',
  };

  const facultyStyle = {
    padding: '0.75rem 1rem',
    fontSize: 'var(--font-size-sm)',
    backgroundColor: 'rgba(255, 215, 0, 0.07)',
    borderBottom: `1px solid ${palette.gold}`,
  };

  const linkBaseStyle = {
    backgroundColor: 'transparent',
    color: palette.gold,
    border: 'none',
    textAlign: 'left',
    width: '100%',
    padding: 'var(--space-sm) var(--space-md)',
    fontSize: 'var(--font-size-md)',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const activeLinkStyle = {
    backgroundColor: palette.gold,
    color: palette.maroon,
    fontWeight: '700',
    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.15)',
  };

  const hoverFocusStyle = {
    backgroundColor: palette.goldHover,
    color: palette.maroon,
  };

  const logoutStyle = {
    backgroundColor: palette.gold,
    color: palette.maroon,
    fontWeight: '700',
    border: 'none',
    padding: 'var(--space-sm) var(--space-md)',
    width: '100%',
    borderRadius: '8px',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
    outline: 'none',
  };

  const menuItems = [
    { key: 'pendingUsers', label: 'User Management', tourId: 'pendingUsers' },
    { key: 'pending', label: 'Pending Requests', tourId: 'pending' },
    { key: 'leaveReport', label: 'Leave Report', tourId: 'leaveReport' },
    { key: 'Analytics', label: 'Analytics', tourId: 'analytics' },
    { key: 'Myprofile', label: 'My Profile', tourId: 'profile' },
  ];

  // Notification dot component
  const NotificationDot = () => (
    <span
      style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        backgroundColor: 'red',
        borderRadius: '50%',
        marginLeft: '8px',
        animation: 'ping 1.2s infinite ease-in-out',
      }}
    ></span>
  );

  return (
    <nav style={sidebarStyle} aria-label="Sidebar">
      {/* University Logo */}
      <div style={headerStyle}>
        <img src={UniversityLogo} alt="University Logo" style={{ height: 42 }} />
      </div>

      {/* Faculty & Department Info */}
      <div style={{ ...facultyStyle, padding: 'var(--space-sm) var(--space-md)' }}>
        <div><span className="fw-semibold">Faculty: </span><span>{faculty || 'Loading...'}</span></div>
        {department && faculty !== 'Information Technology Center' && (
          <div><span className="fw-semibold">Department: </span><span>{department}</span></div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-grow-1 px-2 mt-3">
        <ul
          className="nav flex-column gap-1"
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          {menuItems.map(({ key, label, tourId }) => (
            <li key={key} className="nav-item">
              <button
                className="nav-link"
                style={{
                  ...linkBaseStyle,
                  ...(activeTab === key ? activeLinkStyle : {}),
                }}
                onClick={() => onLinkClick(key)}
                onMouseEnter={(e) => {
                  if (activeTab !== key) {
                    Object.assign(e.currentTarget.style, hoverFocusStyle);
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== key) {
                    Object.assign(e.currentTarget.style, {
                      backgroundColor: 'transparent',
                      color: palette.gold,
                    });
                  }
                }}
                onFocus={(e) => {
                  if (activeTab !== key) {
                    Object.assign(e.currentTarget.style, hoverFocusStyle);
                  }
                }}
                onBlur={(e) => {
                  if (activeTab !== key) {
                    Object.assign(e.currentTarget.style, {
                      backgroundColor: 'transparent',
                      color: palette.gold,
                    });
                  }
                }}
                aria-current={activeTab === key ? 'page' : undefined}
                data-tour={tourId}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{label}</span>
                  {notifications[key] ? <NotificationDot /> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="mt-auto px-3 pb-4">
        <button
          style={{
            ...logoutStyle,
            fontSize: 'var(--font-size-md)',
            borderRadius: '8px',
            padding: 'var(--space-sm) var(--space-md)',
          }}
          onClick={onLogout}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = palette.goldHover)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = palette.gold)}
          onFocus={(e) => (e.currentTarget.style.backgroundColor = palette.goldHover)}
          onBlur={(e) => (e.currentTarget.style.backgroundColor = palette.gold)}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>

      {/* Notification dot keyframe for animation */}
      <style>
        {`
          @keyframes ping {
            0% { transform: scale(1); opacity: 1; }
            75% { transform: scale(1.5); opacity: 0; }
            100% { transform: scale(2); opacity: 0; }
          }
        `}
      </style>
    </nav>
  );
};

export default Sidebar;
