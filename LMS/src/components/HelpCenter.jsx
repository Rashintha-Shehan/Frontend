import React, { useState } from 'react';
import { 
  FaSearch, 
  FaQuestionCircle, 
  FaBook, 
  FaVideo, 
  FaEnvelope, 
  FaPhone, 
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaPlay,
  FaDownload,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useOnboarding } from '../context/OnboardingContext';
import './HelpCenter.css';

const HelpCenter = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const { startOnboarding, getHelpContent } = useOnboarding();

  const faqData = [
    {
      id: 1,
      question: "How do I submit a leave request?",
      answer: "Navigate to the Leave Request Form tab, fill in all required fields including leave type, dates, purpose, and arrangement details. Click 'Submit Request' to send it for approval.",
      category: "leave-requests"
    },
    {
      id: 2,
      question: "What types of leave are available?",
      answer: "The system supports Casual Leave, Sick Leave, Vacation Leave, Duty Leave, Half Day, and Short Leave. Each type has specific requirements and approval processes.",
      category: "leave-types"
    },
    {
      id: 3,
      question: "How long does approval take?",
      answer: "Approval typically takes 1-3 business days depending on your department's workload. You'll receive email notifications when your request is approved or rejected.",
      category: "approval-process"
    },
    {
      id: 4,
      question: "Can I cancel a submitted request?",
      answer: "You can only cancel requests that are still pending approval. Once approved, you'll need to contact your department administrator to make changes.",
      category: "leave-requests"
    },
    {
      id: 5,
      question: "What documents do I need for sick leave?",
      answer: "Sick leave requires a medical certificate from a registered medical practitioner. The certificate should include the diagnosis, recommended leave period, and doctor's signature.",
      category: "documents"
    },
    {
      id: 6,
      question: "How do I check my leave balance?",
      answer: "Your leave balance is displayed on the Leave Summary tab. It shows your available leave days for each leave type and your usage history.",
      category: "leave-balance"
    },
    {
      id: 7,
      question: "What if I forget my password?",
      answer: "Use the 'Forgot Password' link on the login page to reset your password. You'll receive a reset link via email to create a new password.",
      category: "account"
    },
    {
      id: 8,
      question: "How do I update my profile information?",
      answer: "Go to the Account Settings tab to update your personal information, contact details, and profile picture. Changes are saved automatically.",
      category: "profile"
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: "Getting Started with Leave Management",
      description: "Learn the basics of using the leave management system",
      duration: "5 min",
      type: "video",
      url: "#"
    },
    {
      id: 2,
      title: "Submitting Your First Leave Request",
      description: "Step-by-step guide to submitting leave requests",
      duration: "8 min",
      type: "video",
      url: "#"
    },
    {
      id: 3,
      title: "Understanding Leave Types and Requirements",
      description: "Detailed explanation of different leave types",
      duration: "10 min",
      type: "video",
      url: "#"
    },
    {
      id: 4,
      title: "Managing Your Leave History",
      description: "How to track and manage your leave requests",
      duration: "6 min",
      type: "video",
      url: "#"
    },
    {
      id: 5,
      title: "User Guide PDF",
      description: "Complete user manual in PDF format",
      duration: "30 min",
      type: "pdf",
      url: "#"
    }
  ];

  const supportContacts = [
    {
      name: "IT Support",
      email: "it.support@uop.ac.lk",
      phone: "+94 (0) 81 2392900",
      description: "Technical issues and system problems"
    },
    {
      name: "HR Department",
      email: "hr@uop.ac.lk",
      phone: "+94 (0) 81 2384848",
      description: "Leave policy and HR-related questions"
    },
    {
      name: "Department Admin",
      email: "admin@ceit.pdn.ac.lk",
      phone: "+94 (0) 81 2392070",
      description: "Leave approval and department-specific issues"
    }
  ];

  const filteredFaq = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleStartTutorial = () => {
    onClose();
    startOnboarding();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="help-tab-content">
            <div className="search-section">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="faq-list">
              {filteredFaq.length > 0 ? (
                filteredFaq.map(faq => (
                  <div key={faq.id} className="faq-item">
                    <button
                      className="faq-question"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <span>{faq.question}</span>
                      {expandedFaq === faq.id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <FaQuestionCircle />
                  <p>No FAQ items found for "{searchQuery}"</p>
                  <p>Try searching with different keywords or browse all FAQ items.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'tutorials':
        return (
          <div className="help-tab-content">
            <div className="tutorials-header">
              <h3>Video Tutorials & Guides</h3>
              <p>Learn how to use the system effectively with our step-by-step tutorials</p>
            </div>
            
            <div className="tutorials-grid">
              {tutorials.map(tutorial => (
                <div key={tutorial.id} className="tutorial-card">
                  <div className="tutorial-icon">
                    {tutorial.type === 'video' ? <FaPlay /> : <FaDownload />}
                  </div>
                  <div className="tutorial-content">
                    <h4>{tutorial.title}</h4>
                    <p>{tutorial.description}</p>
                    <div className="tutorial-meta">
                      <span className="duration">{tutorial.duration}</span>
                      <span className="type">{tutorial.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <button className="tutorial-action">
                    {tutorial.type === 'video' ? 'Watch' : 'Download'}
                    <FaExternalLinkAlt />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="tutorials-cta">
              <button className="btn btn-primary" onClick={handleStartTutorial}>
                <FaPlay />
                Start Interactive Tutorial
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="help-tab-content">
            <div className="contact-header">
              <h3>Get Support</h3>
              <p>Contact our support team for assistance with any issues</p>
            </div>
            
            <div className="contact-grid">
              {supportContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-info">
                    <h4>{contact.name}</h4>
                    <p>{contact.description}</p>
                    <div className="contact-details">
                      <div className="contact-item">
                        <FaEnvelope />
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </div>
                      <div className="contact-item">
                        <FaPhone />
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="contact-extra">
              <h4>Additional Resources</h4>
              <div className="resource-links">
                <a href="#" className="resource-link">
                  <FaBook />
                  User Manual
                </a>
                <a href="#" className="resource-link">
                  <FaDownload />
                  Quick Start Guide
                </a>
                <a href="#" className="resource-link">
                  <FaExternalLinkAlt />
                  University Policies
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="help-center-overlay">
      <div className="help-center-modal">
        {/* Header */}
        <div className="help-center-header">
          <div className="help-center-title">
            <FaQuestionCircle />
            <h2>Help Center</h2>
          </div>
          <button className="help-center-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <div className="help-center-nav">
          <button
            className={`nav-tab ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            <FaQuestionCircle />
            FAQ
          </button>
          <button
            className={`nav-tab ${activeTab === 'tutorials' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutorials')}
          >
            <FaVideo />
            Tutorials
          </button>
          <button
            className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <FaEnvelope />
            Contact
          </button>
        </div>

        {/* Content */}
        <div className="help-center-body">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter; 