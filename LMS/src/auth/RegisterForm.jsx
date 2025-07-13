import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../component/api';
import UniversityLogo from "../assets/images/uop.png";
import CEITLogo from "../assets/images/ceit.png";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    mobile: '',
    personalEmail: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
    staffCategory: '',
    jobTitle: '',
    faculty: '',
    department: '',
    typeOfRegistration: '',
    image: ''
  });

  const faculties = [
    'Faculty of Agriculture',
    'Faculty of Allied Health Sciences',
    'Faculty of Arts',
    'Faculty of Dental Sciences',
    'Faculty of Engineering',
    'Faculty of Management',
    'Faculty of Medicine',
    'Faculty of Science',
    'Faculty of Veterinary Medicine & Animal Science',
    'Center for Quality Assurance',
    'Financial Administration',
    'Information Technology Center',
    'Internal Audit Division',
    'Library',
    'Senate House',
    'Test faculty'
  ];

  const departmentsByFaculty = {
    'Faculty of Agriculture': ['Agricultural Biology', 'Agricultural Economics & Business Management', 'Agricultural Engineering', 'Agricultural Extension', 'Animal Science', 'Crop Science', 'Food Science & Technology', 'Soil Science'],
    'Faculty of Allied Health Sciences': ['Medical Laboratory Science', 'Nursing', 'Physiotherapy', 'Radiography/Radiotherapy', 'Pharmacy', 'Basic Sciences'],
    'Faculty of Arts': ['Arabic & Islamic Civilization', 'Archaeology', 'Classical Languages', 'Economics & Statistics', 'Education', 'English', 'English Language Teaching', 'Fine Arts', 'Geography', 'History', 'Information Technology', 'Law', 'Philosophy', 'Psychology', 'Political Science', 'Pali & Buddhist Studies', 'Sinhala', 'Sociology', 'Tamil'],
    'Faculty of Dental Sciences': ['Basic Sciences', 'Community Dental Health', 'Comprehensive Oral Health Care', 'Oral Medicine & Periodontology', 'Oral Pathology', 'Prosthetic Dentistry', 'Restorative Dentistry', 'Oral & Maxillofacial Surgery'],
    'Faculty of Engineering': ['Chemical & Process Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical & Electronic Engineering', 'Engineering Management', 'Engineering Mathematics', 'Mechanical Engineering', 'Manufacturing & Industrial Engineering'],
    'Faculty of Management': ['Business Finance', 'Human Resource Management', 'Management Studies', 'Marketing Management', 'Operations Management'],
    'Faculty of Medicine': ['Anatomy', 'Anaesthesiology and Critical Care', 'Biochemistry', 'Community Medicine', 'Family Medicine', 'Forensic Medicine', 'Medical Education', 'Medicine', 'Microbiology', 'Obstetrics & Gynecology', 'Paediatrics', 'Parasitology', 'Pathology', 'Pharmacology', 'Physiology', 'Psychiatry', 'Radiology', 'Surgery'],
    'Faculty of Science': ['Botany', 'Chemistry', 'Environmental & Industrial Sciences', 'Geology', 'Mathematics', 'Molecular Biology & Biotechnology', 'Physics', 'Statistics & Computer Science', 'Zoology'],
    'Faculty of Veterinary Medicine & Animal Science': ['Basic Veterinary Sciences', 'Farm Animal Production & Health', 'Veterinary Clinical Sciences', 'Veterinary Pathobiology', 'Veterinary Public Health & Pharmacology'],
    'Information Technology Center': ['ITC'] // Single department for ITC since it doesn't have multiple departments
  };

  const typeOfRegistrationOptions = ['Academic', 'Non-Academic', 'Academic Support', 'Other'];
  const staffCategoryOptions = ['Permanent', 'Temporary', 'On Contract', 'Other'];

  const getJobTitles = () => {
    const { faculty, typeOfRegistration, staffCategory } = user;

    if (faculty === 'Information Technology Center') {
      return [
        'Director', 'Deputy Director', 'System Analyst Cum Programmer', 'Computer Programmer',
        'Electronic Engineer', 'Instructor',
        'Secretary to the Director', 'Computer Application Assistant',
        'Labourer', 'Trainee', 'Intern'
      ];
    }

    if (typeOfRegistration === 'Academic') {
      if (staffCategory === 'Permanent') {
        return ['Professor', 'Lecturer', 'Other'];
      } else if (staffCategory === 'Temporary') {
        return ['Demonstrator', 'Research Assistant', 'Assistant Lecturer', 'Lecturer', 'Other'];
      }
    } else if (typeOfRegistration === 'Non-Academic') {
      return [
        'Network Manager', 'Programmer Cum System Analyst', 'Computer Programmer',
        'Technical Officer', 'AR', 'SAR', 'AB', 'SAB', 'CAA', 'Clerk',
        'MA', 'LA', 'LIA', 'BB', 'LIBA', 'WA', 'Other'
      ];
    }

    return [];
  };

  const jobTitleOptions = getJobTitles();

  const handleRegister = async () => {
    if (
      !user.id || !user.firstName || !user.lastName || !user.mobile || !user.email ||
      !user.password || !user.confirmPassword || !user.staffCategory ||
      (departmentsByFaculty[user.faculty]?.length > 0 && !user.department) ||
      !user.typeOfRegistration || (jobTitleOptions.length > 0 && !user.jobTitle) || !user.faculty
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', user);
      toast.success('Registration successful! Check your email.');
      navigate('/verify-notice');
    } catch (err) {
      const errorMessage = err.response?.data || 'Registration failed.';
      
      // Check if this is a Google account error
      if (errorMessage.includes('already registered via Google login')) {
        toast.error(
          <div>
            <strong>Google Account Detected!</strong><br />
            This email is already registered via Google login.<br />
            Please use the Google login button instead, or contact an administrator.
          </div>,
          { autoClose: 8000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Label = ({ children, required }) => (
    <label className="form-label fw-semibold">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #4b0000 100%)',
      }}
    >
      <div
        className="card shadow-sm w-100"
        style={{
          maxWidth: '1100px',
          borderRadius: '1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid #4b000033',
          backgroundColor: 'var(--background-color)',
        }}
      >
        <div className="card-body p-3 p-md-5">
          {/* Logos and Heading */}
          <div className="row align-items-center mb-4">
            <div className="col-3 text-start">
              <img
                src={UniversityLogo}
                alt="University Logo"
                style={{ maxHeight: '60px', width: 'auto' }}
              />
            </div>
            <div className="col-6 text-center">
              <h4
                className="fw-bold"
                style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}
              >
                Leave Management System
              </h4>
            </div>
            <div className="col-3 text-end">
              <img
                src={CEITLogo}
                alt="CEIT Logo"
                style={{ maxHeight: '60px', width: 'auto' }}
              />
            </div>
          </div>

          <h5
            className="text-center mb-4"
            style={{ color: '#555', fontWeight: '500' }}
          >
            User Registration Form
          </h5>

          <div className="row g-3 g-md-4">
            {/* Left column */}
            <div className="col-md-6">
              <div className="mb-3">
                <Label required>Staff ID</Label>
                <input
                  className="form-control"
                  placeholder="e.g., MED1234"
                  value={user.id}
                  onChange={(e) => setUser({ ...user, id: e.target.value })}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                />
              </div>

              <div className="mb-3">
                <Label required>First Name</Label>
                <input
                  className="form-control"
                  value={user.firstName}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                />
              </div>

              <div className="mb-3">
                <Label required>Last Name</Label>
                <input
                  className="form-control"
                  value={user.lastName}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                />
              </div>

              <div className="mb-3">
                <Label required>Mobile</Label>
                <input
                  className="form-control"
                  value={user.mobile}
                  onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                />
              </div>

              <div className="mb-3">
                <Label required>University Email</Label>
                <input
                  type="email"
                  className="form-control"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                />
              </div>

              <div className="mb-3">
                <Label required>Password</Label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-3">
                <Label required>Confirm Password</Label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={user.confirmPassword}
                  onChange={(e) =>
                    setUser({ ...user, confirmPassword: e.target.value })
                  }
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showPasswordCheck"
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="showPasswordCheck"
                  style={{ userSelect: 'none' }}
                >
                  Show Password
                </label>
              </div>
            </div>

            {/* Right column */}
            <div className="col-md-6">
              <div className="mb-3">
                <Label>Profile Image (optional)</Label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  disabled={isUploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setIsUploadingImage(true);

                    try {
                      const formData = new FormData();
                      formData.append('file', file);

                      // Use temporary image upload for registration
                      const res = await api.post('/auth/temp-image-upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });

                      setUser((prev) => ({ ...prev, image: res.data.imageUrl }));
                      toast.success('Image uploaded successfully');
                    } catch {
                      toast.error('Image upload failed');
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }}
                />
              </div>

              <div className="mb-3">
                <Label required>Faculty</Label>
                <select
                  className="form-select"
                  value={user.faculty}
                  onChange={(e) => {
                    const selectedFaculty = e.target.value;
                    setUser({
                      ...user,
                      faculty: selectedFaculty,
                      department: selectedFaculty === 'Information Technology Center' ? 'ITC' : '',
                      jobTitle: '',
                    });
                  }}
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                >
                  <option value="">Choose...</option>
                  {faculties.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>

              {departmentsByFaculty[user.faculty] && user.faculty !== 'Information Technology Center' && (
                <div className="mb-3">
                  <Label required>Department</Label>
                  <select
                    className="form-select"
                    value={user.department}
                    onChange={(e) =>
                      setUser({ ...user, department: e.target.value })
                    }
                    style={{
                      borderColor: 'var(--primary-color)',
                      transition: 'border-color 0.3s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                    aria-required="true"
                  >
                    <option value="">Choose...</option>
                    {departmentsByFaculty[user.faculty].map((dep) => (
                      <option key={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <Label required>Type of Registration</Label>
                <select
                  className="form-select"
                  value={user.typeOfRegistration}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      typeOfRegistration: e.target.value,
                      jobTitle: '',
                    })
                  }
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                >
                  <option value="">Choose...</option>
                  {typeOfRegistrationOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <Label required>Staff Category</Label>
                <select
                  className="form-select"
                  value={user.staffCategory}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      staffCategory: e.target.value,
                      jobTitle: '',
                    })
                  }
                  style={{
                    borderColor: 'var(--primary-color)',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                  aria-required="true"
                >
                  <option value="">Choose...</option>
                  {staffCategoryOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {jobTitleOptions.length > 0 && (
                <div className="mb-3">
                  <Label required>Job Title</Label>
                  <select
                    className="form-select"
                    value={user.jobTitle}
                    onChange={(e) =>
                      setUser({ ...user, jobTitle: e.target.value })
                    }
                    style={{
                      borderColor: 'var(--primary-color)',
                      transition: 'border-color 0.3s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#b22222')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--primary-color)')}
                    aria-required="true"
                  >
                    <option value="">Choose...</option>
                    {jobTitleOptions.map((jt) => (
                      <option key={jt}>{jt}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              className="btn btn-primary px-5 py-2"
              onClick={handleRegister}
              disabled={isLoading || isUploadingImage}
              style={{
                fontSize: '1.1rem',
                borderRadius: '0.5rem',
                minWidth: '150px',
                backgroundColor: '#800000',
                borderColor: '#800000',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#b22222')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#800000')}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>

          <div className="mt-3 text-center" style={{ fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#b22222', fontWeight: '600' }}>
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
