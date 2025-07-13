import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaChartBar, 
  FaCog, 
  FaQuestionCircle,
  FaPlay,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import './GuidedTour.css';

const GuidedTour = ({ isVisible, onComplete, userRole = 'STAFF' }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Define tour steps for different user roles
  const tourSteps = {
    STAFF: [
      {
        target: '.dashboard-header',
        content: (
          <div className="tour-step-content">
            <h4>🎉 Welcome to Your Dashboard!</h4>
            <p>This is your personal dashboard where you can manage all your leave requests and view your information.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>You can see your name, faculty, and current time here.</span>
            </div>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
        spotlightClicks: false,
        styles: {
          options: {
            zIndex: 10000,
          },
        },
      },
      {
        target: '.nav-link[data-tour="profile"]',
        content: (
          <div className="tour-step-content">
            <h4>👤 My Profile</h4>
            <p>View and update your personal information, profile picture, and account details.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Click here to see your profile card and edit your information.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="leave-request"]',
        content: (
          <div className="tour-step-content">
            <h4>📝 Leave Request Form</h4>
            <p>Submit new leave requests with detailed information and supporting documents.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>This is where you'll spend most of your time submitting leave requests.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="leave-log"]',
        content: (
          <div className="tour-step-content">
            <h4>📋 Leave History</h4>
            <p>Track all your submitted leave requests and their current approval status.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Check here to see if your requests have been approved or need changes.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="leave-summary"]',
        content: (
          <div className="tour-step-content">
            <h4>📊 Leave Summary</h4>
            <p>View your leave balance, usage statistics, and remaining days for each leave type.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Keep track of how many leave days you have left.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="account-settings"]',
        content: (
          <div className="tour-step-content">
            <h4>⚙️ Account Settings</h4>
            <p>Update your personal information, contact details, and account preferences.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Important: Complete your faculty and department information here.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="help-center"]',
        content: (
          <div className="tour-step-content">
            <h4>❓ Help Center</h4>
            <p>Access FAQs, tutorials, and contact support when you need assistance.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>You can replay this tutorial anytime from the Help Center.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="tour-step-content">
            <h4>🎯 You're All Set!</h4>
            <p>You've completed the guided tour. You now know how to navigate your dashboard and use all the features.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Remember: You can always access the Help Center for more assistance.</span>
            </div>
            <div className="tour-actions">
              <p><strong>Next steps:</strong></p>
              <ul>
                <li>Complete your profile in Account Settings</li>
                <li>Submit your first leave request</li>
                <li>Check your leave balance</li>
              </ul>
            </div>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: false,
      }
    ],
    ADMIN: [
      {
        target: '.dashboard-header',
        content: (
          <div className="tour-step-content">
            <h4>🎉 Welcome to Admin Dashboard!</h4>
            <p>As an administrator, you have access to manage leave requests and user accounts for your department.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>You can see your faculty and department information here.</span>
            </div>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
        spotlightClicks: false,
      },
      {
        target: '.nav-link[data-tour="pending"]',
        content: (
          <div className="tour-step-content">
            <h4>📋 Pending Leave Requests</h4>
            <p>Review and approve/reject leave requests from staff members in your department.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>This is where you'll spend most of your time managing leave requests.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="pendingUsers"]',
        content: (
          <div className="tour-step-content">
            <h4>👥 Pending User Accounts</h4>
            <p>Review and approve new user registrations for your department.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>New staff members need your approval to access the system.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="leaveReport"]',
        content: (
          <div className="tour-step-content">
            <h4>📊 Leave Reports</h4>
            <p>Generate and view detailed reports on leave usage and statistics.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Use these reports to track leave patterns and make informed decisions.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="analytics"]',
        content: (
          <div className="tour-step-content">
            <h4>📈 Analytics Dashboard</h4>
            <p>View comprehensive analytics and insights about leave management.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Monitor trends and patterns in leave requests.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="profile"]',
        content: (
          <div className="tour-step-content">
            <h4>⚙️ My Profile</h4>
            <p>Manage your admin profile and account settings.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Update your contact information and preferences here.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="tour-step-content">
            <h4>🎯 You're Ready to Administer!</h4>
            <p>You've completed the admin dashboard tour. You now know how to manage leave requests and user accounts effectively.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Remember: Your role is crucial for smooth leave management in your department.</span>
            </div>
            <div className="tour-actions">
              <p><strong>Key responsibilities:</strong></p>
              <ul>
                <li>Review and approve leave requests</li>
                <li>Manage user accounts</li>
                <li>Generate reports</li>
                <li>Monitor leave patterns</li>
              </ul>
            </div>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: false,
      }
    ],
    SYS_ADMIN: [
      {
        target: '.dashboard-header',
        content: (
          <div className="tour-step-content">
            <h4>🎉 Welcome to System Admin Dashboard!</h4>
            <p>As a system administrator, you have full control over the entire leave management system.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>You can manage all users, faculties, and system settings.</span>
            </div>
          </div>
        ),
        placement: 'bottom',
        disableBeacon: true,
        spotlightClicks: false,
      },
      {
        target: '.nav-link[data-tour="users"]',
        content: (
          <div className="tour-step-content">
            <h4>👥 User Management</h4>
            <p>Manage all users across the system, assign admin roles, and monitor user activities.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>You can assign admin roles to users for specific faculties/departments.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="audit"]',
        content: (
          <div className="tour-step-content">
            <h4>📋 Audit Logs</h4>
            <p>View detailed audit logs of all system activities and user actions.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Monitor system security and track user activities.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '.nav-link[data-tour="settings"]',
        content: (
          <div className="tour-step-content">
            <h4>⚙️ System Settings</h4>
            <p>Configure system-wide settings, manage faculties, and control system behavior.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Configure system parameters and manage organizational structure.</span>
            </div>
          </div>
        ),
        placement: 'right',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: '[data-tour="form-builder"]',
        content: (
          <div className="tour-step-content">
            <h4>🔧 Form Builder</h4>
            <p>Customize the leave request form by adding, editing, or removing fields to match your organization's needs.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>This powerful tool allows you to create custom forms without coding.</span>
            </div>
          </div>
        ),
        placement: 'left',
        disableBeacon: true,
        spotlightClicks: true,
      },
      {
        target: 'body',
        content: (
          <div className="tour-step-content">
            <h4>🎯 System Administration Complete!</h4>
            <p>You've completed the system admin dashboard tour. You now have full control over the leave management system.</p>
            <div className="tour-tip">
              <FaInfoCircle />
              <span>Remember: You have the highest level of access and responsibility.</span>
            </div>
            <div className="tour-actions">
              <p><strong>System admin responsibilities:</strong></p>
              <ul>
                <li>Manage all users and roles</li>
                <li>Monitor system security</li>
                <li>Configure system settings</li>
                <li>Maintain system integrity</li>
              </ul>
            </div>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
        spotlightClicks: false,
      }
    ]
  };

  const steps = tourSteps[userRole] || tourSteps.STAFF;

  useEffect(() => {
    if (isVisible) {
      setRun(true);
      setStepIndex(0);
    } else {
      setRun(false);
    }
  }, [isVisible]);

  const handleCallback = (data) => {
    const { status, type, index } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      onComplete();
      localStorage.setItem('guidedTourCompleted', 'true');
    }

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  const handleStart = () => {
    setRun(true);
    setStepIndex(0);
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip the guided tour? You can replay it later from the Help Center.')) {
      setRun(false);
      onComplete();
      localStorage.setItem('guidedTourSkipped', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        showCloseButton={true}
        callback={handleCallback}
        styles={{
          options: {
            primaryColor: '#800000',
            backgroundColor: '#fff',
            textColor: '#333',
            arrowColor: '#fff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            spotlightPadding: 8,
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 8,
            fontSize: 14,
          },
          tooltipTitle: {
            color: '#800000',
            fontSize: 18,
            fontWeight: 'bold',
          },
          tooltipContent: {
            color: '#333',
            fontSize: 14,
            lineHeight: 1.5,
          },
          buttonNext: {
            backgroundColor: '#800000',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 'bold',
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#800000',
            fontSize: 14,
            fontWeight: 'bold',
            padding: '8px 16px',
          },
          buttonSkip: {
            color: '#666',
            fontSize: 14,
            padding: '8px 16px',
          },
          buttonClose: {
            color: '#666',
            fontSize: 14,
            padding: '8px 16px',
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip',
        }}
      />
      
      {/* Tour Controls */}
      <div className="tour-controls">
        <button 
          className="tour-control-btn tour-start-btn"
          onClick={handleStart}
          title="Start Guided Tour"
        >
          <FaPlay />
          Start Tour
        </button>
        <button 
          className="tour-control-btn tour-skip-btn"
          onClick={handleSkip}
          title="Skip Tour"
        >
          <FaTimes />
          Skip
        </button>
      </div>
    </>
  );
};

export default GuidedTour; 