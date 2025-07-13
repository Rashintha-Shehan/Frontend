import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../component/api';

// Same constants as AccountSettings
const FACULTIES = [
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

const DEPARTMENTS_BY_FACULTY = {
  'Faculty of Agriculture': ['Agricultural Biology', 'Agricultural Economics & Business Management', 'Agricultural Engineering', 'Agricultural Extension', 'Animal Science', 'Crop Science', 'Food Science & Technology', 'Soil Science'],
  'Faculty of Allied Health Sciences': ['Medical Laboratory Science', 'Nursing', 'Physiotherapy', 'Radiography/Radiotherapy', 'Pharmacy', 'Basic Sciences'],
  'Faculty of Arts': ['Arabic & Islamic Civilization', 'Archaeology', 'Classical Languages', 'Economics & Statistics', 'Education', 'English', 'English Language Teaching', 'Fine Arts', 'Geography', 'History', 'Information Technology', 'Law', 'Philosophy', 'Psychology', 'Political Science', 'Pali & Buddhist Studies', 'Sinhala', 'Sociology', 'Tamil'],
  'Faculty of Dental Sciences': ['Basic Sciences', 'Community Dental Health', 'Comprehensive Oral Health Care', 'Oral Medicine & Periodontology', 'Oral Pathology', 'Prosthetic Dentistry', 'Restorative Dentistry', 'Oral & Maxillofacial Surgery'],
  'Faculty of Engineering': ['Chemical & Process Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical & Electronic Engineering', 'Engineering Management', 'Engineering Mathematics', 'Mechanical Engineering', 'Manufacturing & Industrial Engineering'],
  'Faculty of Management': ['Business Finance', 'Human Resource Management', 'Management Studies', 'Marketing Management', 'Operations Management'],
  'Faculty of Medicine': ['Anatomy', 'Anaesthesiology and Critical Care', 'Biochemistry', 'Community Medicine', 'Family Medicine', 'Forensic Medicine', 'Medical Education', 'Medicine', 'Microbiology', 'Obstetrics & Gynecology', 'Paediatrics', 'Parasitology', 'Pathology', 'Pharmacology', 'Physiology', 'Psychiatry', 'Radiology', 'Surgery'],
  'Faculty of Science': ['Botany', 'Chemistry', 'Environmental & Industrial Sciences', 'Geology', 'Mathematics', 'Molecular Biology & Biotechnology', 'Physics', 'Statistics & Computer Science', 'Zoology'],
  'Faculty of Veterinary Medicine & Animal Science': ['Basic Veterinary Sciences', 'Farm Animal Production & Health', 'Veterinary Clinical Sciences', 'Veterinary Pathobiology', 'Veterinary Public Health & Pharmacology'],
  'Information Technology Center': ['ITC'],
  // Faculties that don't require departments
  'Center for Quality Assurance': [],
  'Financial Administration': [],
  'Internal Audit Division': [],
  'Library': [],
  'Senate House': [],
  'Test faculty': []
};

const TYPE_OF_REGISTRATION_OPTIONS = ['Academic', 'Non-Academic', 'Academic Support', 'Other'];
const STAFF_CATEGORY_OPTIONS = ['Permanent', 'Temporary', 'On Contract', 'Other'];

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    mobile: '',
    personalEmail: '',
    email: '',
    role: 'ADMIN',
    staffCategory: '',
    jobTitle: '',
    faculty: '',
    department: '',
    typeOfRegistration: '',
    image: ''
  });

 useEffect(() => {
  api.get('/admin/me')
    .then(res => {
      setUser(res.data);
        setFormData({
          id: res.data.id || '',
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          mobile: res.data.mobile || '',
          personalEmail: res.data.personalEmail || '',
          email: res.data.email || '',
          role: res.data.role || 'ADMIN',
          staffCategory: res.data.staffCategory || '',
          jobTitle: res.data.jobTitle || '',
          faculty: res.data.faculty || '',
          department: res.data.department || '',
          typeOfRegistration: res.data.typeOfRegistration || '',
          image: res.data.image || ''
        });
    })
    .catch(err => {
      console.error('Failed to load profile:', err);
        toast.error('Failed to load profile data.');
    })
    .finally(() => setLoading(false));
}, []);

  // Reset job title when dependent fields change
  useEffect(() => {
    if (isEditing) {
      const currentJobTitles = getJobTitles();
      if (formData.jobTitle && !currentJobTitles.includes(formData.jobTitle)) {
        handleInputChange('jobTitle', '');
      }
    }
  }, [formData.faculty, formData.typeOfRegistration, formData.staffCategory, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Job title logic
  const getJobTitles = () => {
    const { faculty, typeOfRegistration, staffCategory } = formData;

    // For Information Technology Center
    if (faculty === 'Information Technology Center') {
      return [
        'Director', 'Deputy Director', 'System Analyst Cum Programmer', 'Computer Programmer',
        'Electronic Engineer', 'Instructor',
        'Secretary to the Director', 'Computer Application Assistant',
        'Labourer', 'Trainee', 'Intern'
      ];
    }

    // For Academic registration
    if (typeOfRegistration === 'Academic') {
      if (staffCategory === 'Permanent') {
        return ['Professor', 'Lecturer', 'Other'];
      } else if (staffCategory === 'Temporary') {
        return ['Demonstrator', 'Research Assistant', 'Assistant Lecturer', 'Lecturer', 'Other'];
      } else if (staffCategory === 'On Contract') {
        return ['Lecturer', 'Assistant Lecturer', 'Other'];
      } else {
        return ['Professor', 'Lecturer', 'Assistant Lecturer', 'Demonstrator', 'Research Assistant', 'Other'];
      }
    } 
    // For Non-Academic registration
    else if (typeOfRegistration === 'Non-Academic') {
      return [
        'Network Manager', 'Programmer Cum System Analyst', 'Computer Programmer',
        'Technical Officer', 'AR', 'SAR', 'AB', 'SAB', 'CAA', 'Clerk',
        'MA', 'LA', 'LIA', 'BB', 'LIBA', 'WA', 'Other'
      ];
    }
    // For Academic Support
    else if (typeOfRegistration === 'Academic Support') {
      return [
        'Librarian', 'Laboratory Assistant', 'Technical Assistant', 'Administrative Assistant',
        'IT Support', 'Other'
      ];
    }
    // For Other or when type is not selected
    else {
      return [
        'Administrative Officer', 'Technical Officer', 'Clerk', 'Assistant',
        'Coordinator', 'Manager', 'Other'
      ];
    }
  };

  const jobTitleOptions = getJobTitles();

  // Validation function
  const validateForm = () => {
    const errors = [];
    
    // Basic required fields that admins can edit
    if (!formData.id?.trim()) errors.push('Staff ID');
    if (!formData.firstName?.trim()) errors.push('First Name');
    if (!formData.lastName?.trim()) errors.push('Last Name');
    if (!formData.mobile?.trim()) errors.push('Mobile');
    if (!formData.email?.trim()) errors.push('Email');
    
    // Note: Faculty, Department, Staff Category, Type of Registration, and Job Title
    // are managed by system administrators and not validated here
    
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(`Please fill in all required fields: ${validationErrors.join(', ')}`);
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      // Only send fields that admins can edit
      const updateData = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        personalEmail: formData.personalEmail,
        image: formData.image
        // Note: Faculty, Department, Staff Category, Type of Registration, and Job Title
        // are not included as they are managed by system administrators
      };

      const profileRes = await api.put('/admin/extended-profile', updateData);
      
      setUser(profileRes.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: user?.id || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      mobile: user?.mobile || '',
      personalEmail: user?.personalEmail || '',
      email: user?.email || '',
      role: user?.role || 'ADMIN',
      staffCategory: user?.staffCategory || '',
      jobTitle: user?.jobTitle || '',
      faculty: user?.faculty || '',
      department: user?.department || '',
      typeOfRegistration: user?.typeOfRegistration || '',
      image: user?.image || ''
    });
    setIsEditing(false);
  };

  const Label = ({ children, required }) => (
    <label className="form-label fw-semibold" style={{ color: '#5A0000' }}>
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (!formData.image) return 'https://via.placeholder.com/150x150?text=No+Image';
    
    if (formData.image.startsWith('http')) {
      return formData.image;
    } else if (formData.image.startsWith('/uploads/')) {
      return `http://localhost:8080${formData.image}`;
    } else {
      return `http://localhost:8080/uploads/${formData.image}`;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="card" style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ color: '#800000', fontWeight: 700 }}>
            <i className="fas fa-user-shield me-2"></i>
            Admin Profile Settings
            <span className="badge bg-primary ms-2" title="Admin Account">
              <i className="fas fa-crown me-1"></i>Administrator
            </span>
      </h4>
          {!isEditing && (
            <button 
              className="btn btn-outline-primary"
              onClick={() => setIsEditing(true)}
              disabled={updating}
              style={{ borderColor: '#800000', color: '#800000' }}
            >
              <i className="fas fa-edit me-2"></i>
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Image Section */}
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <img
              src={getProfileImageUrl()}
              alt="Profile"
              className="rounded-circle"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                border: '4px solid #800000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
            {isEditing && (
              <div className="position-absolute bottom-0 end-0">
                <label className="btn btn-sm btn-primary rounded-circle" style={{ width: '35px', height: '35px', cursor: 'pointer' }}>
                  <i className="fas fa-camera"></i>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
                    onChange={async (e) => {
              const file = e.target.files[0];
                      if (!file) return;
                      setIsUploadingImage(true);

                      try {
                        const formDataFile = new FormData();
                        formDataFile.append('file', file);

                        const token = localStorage.getItem('token');
                        const res = await fetch('http://localhost:8080/api/auth/user/profile/image-upload', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formDataFile
                        });

                        if (res.ok) {
                          const data = await res.json();
                          handleInputChange('image', data.imageUrl);
                          toast.success('Profile image updated successfully!');
                        } else {
                          toast.error('Image upload failed');
                        }
                      } catch {
                        toast.error('Image upload failed');
                      } finally {
                        setIsUploadingImage(false);
            }
          }}
        />
                </label>
              </div>
            )}
          </div>
          {isEditing && (
            <p className="text-muted mt-2 small">
              <i className="fas fa-info-circle me-1"></i>
              Click the camera icon to change your profile picture
            </p>
          )}
      </div>

        <div className="row g-4">
          {/* Left column - Editable Fields */}
          <div className="col-md-6">
            <div className="mb-3">
              <Label required>Staff ID</Label>
              {isEditing ? (
                <input
                  className="form-control"
                  placeholder="e.g., ADMIN001"
                  value={formData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  style={{ borderColor: '#800000' }}
                />
              ) : (
                <p className="form-control-plaintext fw-semibold">{formData.id || 'Not provided'}</p>
              )}
            </div>

            <div className="mb-3">
              <Label required>First Name</Label>
              {isEditing ? (
                <input
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  style={{ borderColor: '#800000' }}
                />
              ) : (
                <p className="form-control-plaintext fw-semibold">{formData.firstName || 'Not provided'}</p>
              )}
            </div>

            <div className="mb-3">
              <Label required>Last Name</Label>
              {isEditing ? (
                <input
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  style={{ borderColor: '#800000' }}
                />
              ) : (
                <p className="form-control-plaintext fw-semibold">{formData.lastName || 'Not provided'}</p>
              )}
            </div>

            <div className="mb-3">
              <Label required>Mobile</Label>
              {isEditing ? (
                <input
                  className="form-control"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  style={{ borderColor: '#800000' }}
                />
              ) : (
                <p className="form-control-plaintext fw-semibold">{formData.mobile || 'Not provided'}</p>
              )}
            </div>

            <div className="mb-3">
              <Label>Personal Email</Label>
              {isEditing ? (
            <input
                  type="email"
              className="form-control"
                  value={formData.personalEmail}
                  onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                  style={{ borderColor: '#800000' }}
                />
              ) : (
                <p className="form-control-plaintext fw-semibold">{formData.personalEmail || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Right column - More Fields */}
          <div className="col-md-6">
            {/* Read-only Critical Fields */}
            <div className="mb-3">
              <Label>University Email</Label>
              <p className="form-control-plaintext text-muted fw-semibold">
                <i className="fas fa-lock me-2 text-warning"></i>
                {formData.email}
              </p>
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Email cannot be changed for security reasons
              </small>
            </div>

            <div className="mb-3">
              <Label>Role</Label>
              <p className="form-control-plaintext text-muted fw-semibold">
                <i className="fas fa-lock me-2 text-warning"></i>
                {formData.role}
              </p>
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Role is managed by system administrators
              </small>
            </div>

            <div className="mb-3">
              <Label>Faculty</Label>
              <p className="form-control-plaintext text-muted fw-semibold">
                <i className="fas fa-lock me-2 text-warning"></i>
                {formData.faculty || 'Not provided'}
              </p>
            </div>

            {DEPARTMENTS_BY_FACULTY[formData.faculty] && formData.faculty !== 'Information Technology Center' && (
              <div className="mb-3">
                <Label>Department</Label>
                <p className="form-control-plaintext text-muted fw-semibold">
                  <i className="fas fa-lock me-2 text-warning"></i>
                  {formData.department || 'Not provided'}
                </p>
              </div>
            )}

            {/* Show ITC department when Information Technology Center is selected */}
            {formData.faculty === 'Information Technology Center' && (
              <div className="mb-3">
                <Label>Department</Label>
                <p className="form-control-plaintext text-muted fw-semibold">
                  <i className="fas fa-lock me-2 text-warning"></i>
                  ITC
                  <span className="text-muted ms-2">
                    <i className="fas fa-info-circle"></i> Auto-assigned
                  </span>
                </p>
              </div>
            )}

            <div className="mb-3">
              <Label>Type of Registration</Label>
              <p className="form-control-plaintext text-muted fw-semibold">
                <i className="fas fa-lock me-2 text-warning"></i>
                {formData.typeOfRegistration || 'Not provided'}
              </p>
            </div>

            <div className="mb-3">
              <Label>Staff Category</Label>
              <p className="form-control-plaintext text-muted fw-semibold">
                <i className="fas fa-lock me-2 text-warning"></i>
                {formData.staffCategory || 'Not provided'}
              </p>
            </div>

            {jobTitleOptions.length > 0 && (
              <div className="mb-3">
                <Label>Job Title</Label>
                <p className="form-control-plaintext text-muted fw-semibold">
                  <i className="fas fa-lock me-2 text-warning"></i>
                  {formData.jobTitle || 'Not provided'}
                </p>
              </div>
            )}

            {/* Show message when job title is not available */}
            {jobTitleOptions.length === 0 && formData.faculty && formData.typeOfRegistration && formData.staffCategory && (
              <div className="mb-3">
                <Label>Job Title</Label>
                <div className="alert alert-warning small">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>No job title assigned</strong> for the current faculty and registration type.
                  Please contact the system administrator to assign an appropriate job title.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Status Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info" style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3' }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-shield-alt me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
                <div>
                  <h6 className="mb-1 fw-bold text-primary">Account Status</h6>
                  <p className="mb-0">
                    <span className="badge bg-success me-2">
                      <i className="fas fa-check-circle me-1"></i>Active Administrator
                    </span>
                    Your account is fully active with administrative privileges.
                  </p>
          </div>
          </div>
          </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleCancel}
              disabled={updating || isUploadingImage}
            >
              <i className="fas fa-times me-2"></i>
              Cancel
            </button>
          <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={updating || isUploadingImage}
              style={{ backgroundColor: '#800000', borderColor: '#800000' }}
            >
              {updating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </>
              )}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
