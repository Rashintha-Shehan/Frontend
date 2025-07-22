import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import zxcvbn from 'zxcvbn';
import Cropper from 'react-easy-crop';

// Exact same constants as RegisterForm
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
  'Information Technology Center': ['ITC']
};

const TYPE_OF_REGISTRATION_OPTIONS = ['Academic', 'Non-Academic', 'Academic Support', 'Other'];
const STAFF_CATEGORY_OPTIONS = ['Permanent', 'Temporary', 'On Contract', 'Other'];

export default function AccountSettings({ user, isGoogleUser, onUpdate, updating }) {
  const [formData, setFormData] = useState({
    id: user?.id || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    mobile: user?.mobile || '',
    personalEmail: user?.personalEmail || '',
    email: user?.email || '',
    role: user?.role || 'STAFF',
    staffCategory: user?.staffCategory || '',
    jobTitle: user?.jobTitle || '',
    faculty: user?.faculty || '',
    department: user?.department || '',
    typeOfRegistration: user?.typeOfRegistration || '',
    image: user?.image || '',
    newPassword: '',
    confirmPassword: '',
    hasPassword: !user?.id?.startsWith('GOOGLE_') || user?.hasPassword || false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.image || null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [inlineErrors, setInlineErrors] = useState({});
  const [validation, setValidation] = useState({ email: true, mobile: true });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const fileInputRef = useRef();

  // Auto-save form progress in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accountSettingsDraft');
    if (saved) {
      setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('accountSettingsDraft', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Exact same job title logic as RegisterForm
  const getJobTitles = () => {
    const { faculty, typeOfRegistration, staffCategory } = formData;

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

  // Improved validation function
  const validateForm = () => {
    const errors = [];
    
    // Basic required fields that users can edit
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
    // Debug: Log all form data to identify missing fields
    console.log('Form data for validation:', {
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      email: formData.email,
      staffCategory: formData.staffCategory,
      faculty: formData.faculty,
      department: formData.department,
      typeOfRegistration: formData.typeOfRegistration,
      jobTitle: formData.jobTitle,
      jobTitleOptions: jobTitleOptions,
      departmentsForFaculty: DEPARTMENTS_BY_FACULTY[formData.faculty]
    });

    // Use improved validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.log('Missing required fields:', validationErrors);
      toast.error(`Please fill in all required fields: ${validationErrors.join(', ')}`);
      return;
    }

    // Validate password if provided
    if (isGoogleUser && formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }
    }

    try {

      // Send all editable fields, including faculty and department
      const updateData = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        personalEmail: formData.personalEmail,
        image: formData.image,
        faculty: formData.faculty,
        department: formData.department
      };

      // Add password only if provided
      if (formData.newPassword && formData.newPassword.trim() !== '') {
        updateData.newPassword = formData.newPassword;
      }

      const result = await onUpdate(updateData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
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
      role: user?.role || 'STAFF',
      staffCategory: user?.staffCategory || '',
      jobTitle: user?.jobTitle || '',
      faculty: user?.faculty || '',
      department: user?.department || '',
      typeOfRegistration: user?.typeOfRegistration || '',
      image: user?.image || '',
      newPassword: '',
      confirmPassword: '',
      hasPassword: !user?.id?.startsWith('GOOGLE_') || user?.hasPassword || false
    });
    setIsEditing(false);
  };

  // Add a helper for avatar fallback
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Live avatar preview
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setShowCropper(true);

      // Upload to backend
      try {
        const token = localStorage.getItem('token');
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await axios.post('http://localhost:8080/api/auth/user/profile/image-upload', formDataUpload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data && res.data.imageUrl) {
          setFormData(prev => ({ ...prev, image: res.data.imageUrl }));
        }
      } catch (err) {
        toast.error('Failed to upload image.');
      }
    }
  };

  // Cropper logic
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Helper to get cropped image as data URL
  const getCroppedImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  }

  const handleCropSave = async () => {
    if (previewImage && croppedAreaPixels) {
      const croppedImgUrl = await getCroppedImg(previewImage, croppedAreaPixels);
      setPreviewImage(croppedImgUrl);
      setShowCropper(false);

      // Convert data URL to blob
      const response = await fetch(croppedImgUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      // Upload to backend
      try {
        const token = localStorage.getItem('token');
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await axios.post('http://localhost:8080/api/auth/user/profile/image-upload', formDataUpload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data && res.data.imageUrl) {
          setFormData(prev => ({ ...prev, image: res.data.imageUrl }));
        }
      } catch (err) {
        toast.error('Failed to upload cropped image.');
      }
    }
  };

  // Validation
  useEffect(() => {
    setValidation({
      email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.personalEmail),
      mobile: /^\d{10,15}$/.test(formData.mobile),
    });
  }, [formData.personalEmail, formData.mobile]);

  useEffect(() => {
    if (formData.newPassword) {
      setPasswordStrength(zxcvbn(formData.newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.newPassword]);

  const validateInline = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'First name is required.';
    if (!formData.lastName) errors.lastName = 'Last name is required.';
    if (!validation.mobile) errors.mobile = 'Please enter a valid mobile number (10-15 digits).';
    if (formData.personalEmail && !validation.email) errors.personalEmail = 'Please enter a valid email address.';
    if (isEditing && isGoogleUser && formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setInlineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <section
      aria-labelledby="profile-settings-title"
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        background: '#fff',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '2rem',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
      }}
    >
      <h2 id="profile-settings-title" className="fw-bold text-maroon mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>
        My Profile
      </h2>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          {previewImage ? (
            <img
              src={previewImage}
              alt={user?.firstName ? `${user.firstName} ${user.lastName} Avatar` : 'User Avatar'}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--secondary-color)',
                background: '#f8f8f8',
              }}
              tabIndex={0}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--secondary-color)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 700,
                border: '3px solid var(--secondary-color)',
              }}
              tabIndex={0}
              aria-label="User initials avatar"
            >
              {getInitials(user?.firstName, user?.lastName)}
            </div>
          )}
          {isEditing && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
                aria-label="Upload avatar"
              />
              <button
                type="button"
                className="btn btn-outline-gold"
                style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 12, padding: '0.25rem 0.75rem', borderRadius: 8 }}
                onClick={() => fileInputRef.current.click()}
                aria-label="Change Avatar"
              >
                Change
            </button>
            </>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-color)' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ color: '#666', fontSize: '1rem' }}>{user?.email}</div>
        </div>
        {!isEditing && (
          <button
            className="btn btn-gold ms-auto"
            style={{ borderRadius: 8, fontWeight: 600, padding: '0.5rem 1.25rem' }}
            onClick={() => setIsEditing(true)}
            aria-label="Edit Profile"
          >
            Edit Profile
          </button>
        )}
                </div>
      {/* Avatar Cropper Modal */}
      {showCropper && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, maxWidth: 350, width: '100%' }}>
            <h4 style={{ marginBottom: 16 }}>Crop Avatar</h4>
            <div style={{ position: 'relative', width: 250, height: 250, background: '#eee', margin: '0 auto' }}>
              <Cropper
                image={previewImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline-gold" onClick={() => setShowCropper(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleCropSave}>Save</button>
            </div>
            </div>
            </div>
      )}
      {/* Section: Personal Info */}
      <h3 style={{ fontSize: 18, color: 'var(--primary-color)', marginBottom: 8 }}>Personal Info</h3>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        onSubmit={e => { e.preventDefault(); if (validateInline()) handleSave(); }}
        aria-disabled={!isEditing}
      >
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="staffId" className="form-label" title="Your official staff/employee ID">
              Staff ID <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              id="staffId"
              className="form-control focus-highlight"
              type="text"
              value={formData.id}
              onChange={e => handleInputChange('id', e.target.value)}
              disabled={!isEditing}
              required
              aria-required="true"
              aria-label="Staff ID"
              tabIndex={0}
              placeholder="e.g. ENG123, MED456"
            />
            {isGoogleUser && !formData.id && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                Please enter your official Staff ID to complete your profile.
              </div>
            )}
            {inlineErrors.id && <div className="invalid-feedback" style={{ display: 'block' }}>{inlineErrors.id}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="firstName" className="form-label" title="Your given name">First Name</label>
            <input
              id="firstName"
              className="form-control focus-highlight"
              type="text"
              value={formData.firstName}
              onChange={e => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              required
              aria-required="true"
              aria-label="First Name"
              tabIndex={0}
            />
            {inlineErrors.firstName && <div className="invalid-feedback" style={{ display: 'block' }}>{inlineErrors.firstName}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="lastName" className="form-label" title="Your family name">Last Name</label>
            <input
              id="lastName"
              className="form-control focus-highlight"
              type="text"
              value={formData.lastName}
              onChange={e => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              required
              aria-required="true"
              aria-label="Last Name"
              tabIndex={0}
            />
            {inlineErrors.lastName && <div className="invalid-feedback" style={{ display: 'block' }}>{inlineErrors.lastName}</div>}
          </div>
        </div>
        {/* Section: Faculty & Department (Required) */}
        <h3 style={{ fontSize: 18, color: 'var(--primary-color)', marginBottom: 8 }}>Work Info</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="faculty" className="form-label" title="Your faculty">
              Faculty <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              id="faculty"
              className="form-control focus-highlight"
              value={formData.faculty}
              onChange={e => handleInputChange('faculty', e.target.value)}
              disabled={!isEditing}
              required
              aria-required="true"
              aria-label="Faculty"
              tabIndex={0}
            >
              <option value="">Select Faculty</option>
              {FACULTIES.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
            {isGoogleUser && !formData.faculty && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                Please select your Faculty to complete your profile.
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="department" className="form-label" title="Your department">
              Department <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              id="department"
              className="form-control focus-highlight"
              value={formData.department}
              onChange={e => handleInputChange('department', e.target.value)}
              disabled={!isEditing || !formData.faculty}
              required
              aria-required="true"
              aria-label="Department"
              tabIndex={0}
            >
              <option value="">Select Department</option>
              {(DEPARTMENTS_BY_FACULTY[formData.faculty] || []).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            {isGoogleUser && !formData.department && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                Please select your Department to complete your profile.
              </div>
            )}
          </div>
        </div>
        {/* Section: Contact Info */}
        <h3 style={{ fontSize: 18, color: 'var(--primary-color)', marginBottom: 8 }}>Contact Info</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="mobile" className="form-label" title="Enter a valid mobile number (10-15 digits)">Mobile</label>
            <input
              id="mobile"
              className={`form-control focus-highlight${!validation.mobile ? ' is-invalid' : ''}`}
              type="text"
              value={formData.mobile}
              onChange={e => handleInputChange('mobile', e.target.value)}
              disabled={!isEditing}
              required
              aria-required="true"
              aria-label="Mobile"
              tabIndex={0}
            />
            {!validation.mobile && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                Please enter a valid mobile number (10-15 digits).
              </div>
            )}
            {inlineErrors.mobile && <div className="invalid-feedback" style={{ display: 'block' }}>{inlineErrors.mobile}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <label htmlFor="personalEmail" className="form-label" title="Enter a valid email address">Personal Email</label>
                <input
              id="personalEmail"
              className={`form-control focus-highlight${!validation.email ? ' is-invalid' : ''}`}
              type="email"
              value={formData.personalEmail}
              onChange={e => handleInputChange('personalEmail', e.target.value)}
              disabled={!isEditing}
              aria-label="Personal Email"
              tabIndex={0}
            />
            {!validation.email && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                Please enter a valid email address.
              </div>
            )}
            {inlineErrors.personalEmail && <div className="invalid-feedback" style={{ display: 'block' }}>{inlineErrors.personalEmail}</div>}
          </div>
        </div>
        {/* Section: Security (for Google users) */}
        {isEditing && isGoogleUser && (
          <>
            <h3 style={{ fontSize: 18, color: 'var(--primary-color)', marginBottom: 8 }}>Security</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="newPassword"
                    className="form-control focus-highlight"
                    type="password"
                    value={formData.newPassword}
                    onChange={e => handleInputChange('newPassword', e.target.value)}
                    disabled={!isEditing}
                    aria-label="New Password"
                    tabIndex={0}
                  />
                </div>
                {passwordStrength && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <span>Password strength: </span>
                    <span style={{ color: ['#d32f2f', '#fbc02d', '#388e3c', '#388e3c', '#388e3c'][passwordStrength.score] }}>
                      {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength.score]}
                  </span>
              </div>
            )}
              </div>
              <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    className="form-control focus-highlight"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    disabled={!isEditing}
                    aria-label="Confirm Password"
                    tabIndex={0}
                  />
                </div>
                {inlineErrors.confirmPassword && <div className="invalid-feedback" style={{ display: 'block' }}>{inlineErrors.confirmPassword}</div>}
              </div>
            </div>
          </>
        )}
        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              className="btn btn-gold"
              style={{ borderRadius: 8, fontWeight: 600, padding: '0.5rem 1.5rem' }}
              type="submit"
              disabled={updating || Object.keys(inlineErrors).length > 0}
              aria-label="Save changes"
              tabIndex={0}
            >
              {updating ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Save'}
            </button>
            <button 
              className="btn btn-outline-gold"
              style={{ borderRadius: 8, fontWeight: 600, padding: '0.5rem 1.5rem' }}
              type="button"
              onClick={handleCancel}
              disabled={updating}
              aria-label="Cancel editing"
              tabIndex={0}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
      {/* Focus highlight style */}
      <style>{`
        .focus-highlight:focus {
          outline: 2px solid var(--secondary-color);
          box-shadow: 0 0 0 2px var(--secondary-color, #FFD700);
        }
      `}</style>
    </section>
  );
} 