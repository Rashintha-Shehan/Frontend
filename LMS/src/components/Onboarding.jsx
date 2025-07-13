import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaChartBar, 
  FaCog, 
  FaCheck, 
  FaTimes, 
  FaArrowRight, 
  FaArrowLeft,
  FaPlay,
  FaPause,
  FaInfoCircle,
  FaGraduationCap,
  FaHandshake,
  FaShieldAlt
} from 'react-icons/fa';
import './Onboarding.css';

const Onboarding = ({ isVisible, onComplete, userRole = 'STAFF' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    showTooltips: true,
    autoPlay: false,
    theme: 'light'
  });

  const onboardingSteps = {
    STAFF: [
      {
        id: 'welcome',
        title: 'Welcome to Leave Management System',
        description: 'Let\'s get you started with managing your leave requests efficiently.',
        icon: <FaGraduationCap />,
        content: (
          <div className="onboarding-content">
            <div className="welcome-section">
              <h3>🎉 Welcome to the University of Peradeniya Leave Management System</h3>
              <p>This system helps you manage your academic leave requests digitally with ease.</p>
              <div className="feature-highlights">
                <div className="feature-item">
                  <FaCalendarAlt />
                  <span>Submit leave requests</span>
                </div>
                <div className="feature-item">
                  <FaClipboardList />
                  <span>Track your leave history</span>
                </div>
                <div className="feature-item">
                  <FaChartBar />
                  <span>View leave statistics</span>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'dashboard',
        title: 'Your Dashboard',
        description: 'Learn how to navigate your personal dashboard.',
        icon: <FaUser />,
        content: (
          <div className="onboarding-content">
            <div className="dashboard-tour">
              <h4>Dashboard Overview</h4>
              <div className="tour-item">
                <div className="tour-icon">
                  <FaUser />
                </div>
                <div className="tour-text">
                  <h5>Profile Section</h5>
                  <p>View and update your personal information, profile picture, and account settings.</p>
                </div>
              </div>
              <div className="tour-item">
                <div className="tour-icon">
                  <FaCalendarAlt />
                </div>
                <div className="tour-text">
                  <h5>Leave Request Form</h5>
                  <p>Submit new leave requests with detailed information and supporting documents.</p>
                </div>
              </div>
              <div className="tour-item">
                <div className="tour-icon">
                  <FaClipboardList />
                </div>
                <div className="tour-text">
                  <h5>Leave History</h5>
                  <p>Track all your submitted leave requests and their current status.</p>
                </div>
              </div>
              <div className="tour-item">
                <div className="tour-icon">
                  <FaChartBar />
                </div>
                <div className="tour-text">
                  <h5>Leave Summary</h5>
                  <p>View your leave balance and usage statistics.</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'leave-request',
        title: 'Submitting Leave Requests',
        description: 'Learn how to submit leave requests properly.',
        icon: <FaCalendarAlt />,
        content: (
          <div className="onboarding-content">
            <div className="leave-request-guide">
              <h4>How to Submit a Leave Request</h4>
              <div className="step-guide">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>Fill Personal Information</h5>
                    <p>Ensure your faculty, department, and job title are correctly filled.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>Select Leave Type</h5>
                    <p>Choose from: Casual Leave, Sick Leave, Vacation Leave, Duty Leave, Half Day, or Short Leave.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>Set Dates and Duration</h5>
                    <p>Select from and to dates. For short leaves, specify start and end times.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h5>Provide Purpose</h5>
                    <p>Explain the reason for your leave request clearly.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h5>Add Arrangement Details</h5>
                    <p>Specify who will handle your duties during your absence.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'leave-types',
        title: 'Understanding Leave Types',
        description: 'Learn about different types of leave and their requirements.',
        icon: <FaInfoCircle />,
        content: (
          <div className="onboarding-content">
            <div className="leave-types-guide">
              <h4>Leave Types and Requirements</h4>
              <div className="leave-types-grid">
                <div className="leave-type-card">
                  <div className="leave-type-header">
                    <FaCalendarAlt />
                    <h5>Casual Leave</h5>
                  </div>
                  <p>For personal matters and emergencies</p>
                  <ul>
                    <li>Maximum 7 days per year</li>
                    <li>Requires prior approval</li>
                    <li>Cannot be combined with other leaves</li>
                  </ul>
                </div>
                <div className="leave-type-card">
                  <div className="leave-type-header">
                    <FaShieldAlt />
                    <h5>Sick Leave</h5>
                  </div>
                  <p>For medical reasons and health issues</p>
                  <ul>
                    <li>Requires medical certificate</li>
                    <li>No maximum limit</li>
                    <li>Can be extended with approval</li>
                  </ul>
                </div>
                <div className="leave-type-card">
                  <div className="leave-type-header">
                    <FaHandshake />
                    <h5>Vacation Leave</h5>
                  </div>
                  <p>For annual holidays and personal time</p>
                  <ul>
                    <li>Based on years of service</li>
                    <li>Requires advance notice</li>
                    <li>Subject to department approval</li>
                  </ul>
                </div>
                <div className="leave-type-card">
                  <div className="leave-type-header">
                    <FaGraduationCap />
                    <h5>Duty Leave</h5>
                  </div>
                  <p>For official duties and conferences</p>
                  <ul>
                    <li>Requires official documentation</li>
                    <li>No impact on leave balance</li>
                    <li>Must be work-related</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'tracking',
        title: 'Tracking Your Requests',
        description: 'Learn how to monitor your leave request status.',
        icon: <FaClipboardList />,
        content: (
          <div className="onboarding-content">
            <div className="tracking-guide">
              <h4>How to Track Your Leave Requests</h4>
              <div className="status-guide">
                <div className="status-item">
                  <div className="status-badge pending">Pending</div>
                  <p>Your request is under review by your department admin.</p>
                </div>
                <div className="status-item">
                  <div className="status-badge approved">Approved</div>
                  <p>Your leave request has been approved. You can proceed with your leave.</p>
                </div>
                <div className="status-item">
                  <div className="status-badge rejected">Rejected</div>
                  <p>Your request was not approved. Check the comments for details.</p>
                </div>
                <div className="status-item">
                  <div className="status-badge completed">Completed</div>
                  <p>Your leave period has ended and the request is archived.</p>
                </div>
              </div>
              <div className="tracking-tips">
                <h5>Pro Tips:</h5>
                <ul>
                  <li>Check your email for status updates</li>
                  <li>Monitor the dashboard for real-time status changes</li>
                  <li>Contact your admin if approval is taking too long</li>
                  <li>Keep copies of supporting documents</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'completion',
        title: 'You\'re All Set!',
        description: 'Congratulations! You\'re ready to use the system.',
        icon: <FaCheck />,
        content: (
          <div className="onboarding-content">
            <div className="completion-section">
              <div className="completion-icon">
                <FaCheck />
              </div>
              <h3>🎉 Welcome to the Team!</h3>
              <p>You've successfully completed the onboarding process. You're now ready to manage your leave requests efficiently.</p>
              <div className="next-steps">
                <h4>What's Next?</h4>
                <div className="next-steps-grid">
                  <div className="next-step-item">
                    <FaCalendarAlt />
                    <span>Submit your first leave request</span>
                  </div>
                  <div className="next-step-item">
                    <FaClipboardList />
                    <span>Review your leave history</span>
                  </div>
                  <div className="next-step-item">
                    <FaCog />
                    <span>Update your profile information</span>
                  </div>
                  <div className="next-step-item">
                    <FaChartBar />
                    <span>Check your leave balance</span>
                  </div>
                </div>
              </div>
              <div className="support-info">
                <h4>Need Help?</h4>
                <p>If you have any questions or need assistance, you can:</p>
                <ul>
                  <li>Check the FAQ section</li>
                  <li>Contact your department admin</li>
                  <li>Reach out to IT support</li>
                  <li>Replay this tutorial anytime</li>
                </ul>
              </div>
            </div>
          </div>
        )
      }
    ],
    ADMIN: [
      {
        id: 'admin-welcome',
        title: 'Admin Dashboard Overview',
        description: 'Welcome to the admin interface for managing leave requests.',
        icon: <FaUser />,
        content: (
          <div className="onboarding-content">
            <div className="admin-welcome">
              <h3>👨‍💼 Welcome, Administrator!</h3>
              <p>You have access to manage leave requests for your department. Let's explore your admin capabilities.</p>
              <div className="admin-features">
                <div className="admin-feature">
                  <FaClipboardList />
                  <h5>Pending Requests</h5>
                  <p>Review and approve/reject leave requests from staff members.</p>
                </div>
                <div className="admin-feature">
                  <FaUser />
                  <h5>User Management</h5>
                  <p>Manage user accounts and approve new registrations.</p>
                </div>
                <div className="admin-feature">
                  <FaChartBar />
                  <h5>Reports & Analytics</h5>
                  <p>Generate reports and view department leave statistics.</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'admin-approval',
        title: 'Approving Leave Requests',
        description: 'Learn how to efficiently review and approve leave requests.',
        icon: <FaCheck />,
        content: (
          <div className="onboarding-content">
            <div className="approval-guide">
              <h4>Leave Request Approval Process</h4>
              <div className="approval-steps">
                <div className="approval-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>Review Request Details</h5>
                    <p>Check the leave type, dates, purpose, and arrangement details.</p>
                  </div>
                </div>
                <div className="approval-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>Verify Supporting Documents</h5>
                    <p>Ensure medical certificates or other required documents are attached.</p>
                  </div>
                </div>
                <div className="approval-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>Check Leave Balance</h5>
                    <p>Verify the staff member has sufficient leave balance.</p>
                  </div>
                </div>
                <div className="approval-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h5>Make Decision</h5>
                    <p>Approve, reject, or request additional information.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    ]
  };

  const steps = onboardingSteps[userRole] || onboardingSteps.STAFF;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps([...completedSteps, currentStep]);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingPreferences', JSON.stringify(userPreferences));
    toast.success('Onboarding completed successfully!');
    onComplete();
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip the onboarding? You can replay it later from settings.')) {
      localStorage.setItem('onboardingSkipped', 'true');
      onComplete();
    }
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
    setUserPreferences({ ...userPreferences, autoPlay: !isPlaying });
  };

  const toggleTooltips = () => {
    setShowTooltips(!showTooltips);
    setUserPreferences({ ...userPreferences, showTooltips: !showTooltips });
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="onboarding-controls">
            <button 
              className="control-btn"
              onClick={toggleTooltips}
              title={showTooltips ? 'Hide Tooltips' : 'Show Tooltips'}
            >
              <FaInfoCircle />
            </button>
            <button 
              className="control-btn"
              onClick={toggleAutoPlay}
              title={isPlaying ? 'Pause Auto-play' : 'Start Auto-play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button 
              className="control-btn close-btn"
              onClick={handleSkip}
              title="Skip Onboarding"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="onboarding-body">
          <div className="step-header">
            <div className="step-icon">
              {currentStepData.icon}
            </div>
            <div className="step-info">
              <h2>{currentStepData.title}</h2>
              <p>{currentStepData.description}</p>
            </div>
          </div>
          
          <div className="step-content">
            {currentStepData.content}
          </div>
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <div className="step-indicators">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-indicator ${index === currentStep ? 'active' : ''} ${completedSteps.includes(index) ? 'completed' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                {completedSteps.includes(index) ? <FaCheck /> : index + 1}
              </div>
            ))}
          </div>
          
          <div className="step-actions">
            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <FaArrowLeft />
              Previous
            </button>
            
            <button
              className="btn btn-primary"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Complete
                  <FaCheck />
                </>
              ) : (
                <>
                  Next
                  <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 