import React, { useState, useEffect } from 'react';
import api from '../component/api';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaUserTie, 
  FaUniversity, 
  FaBuilding, 
  FaPaperPlane,
  FaInfoCircle,
} from 'react-icons/fa';
import { format, parseISO, isBefore } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const colors = {
  goldYellow: 'var(--secondary-color)',
  maroonRed: 'var(--primary-color)',
  darkRed: '#A52A2A',
  lightBackground: '#fff3e6',
  white: 'var(--background-color)',
  grayLight: '#f8f9fa',
  errorRed: '#dc3545',
};

const staffCategories = ['Academic', 'Academic Supportive', 'Non-Academic','other'];

const leaveTypes = [
  'Casual Leave',
  'Sick Leave',
  'Duty Leave',
  'Half Day',
  'Short Leave',
];

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
];

const departments = {
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

const initialForm = {
  staffCategory: '',
  leaveType: '',
  faculty: '',
  department: '',
  fromDate: '',
  toDate: '',
  numberOfDays: '',
  purpose: '',
  arrangementName: '',
  arrangementAddress: '',
  arrangementPhone: '',
  arrangementEmail: '',
  addressDuringLeave: '',
  shortLeaveDate: '',
  shortLeaveStartTime: '08:00',
  shortLeaveEndTime: '16:00',
  jobTitle: '',
};

const getTimeDifferenceInHours = (start, end) => {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  const diff = (endHour + endMin / 60) - (startHour + startMin / 60);
  return diff;
};

const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  today.setHours(0,0,0,0);
  date.setHours(0,0,0,0);
  return date < today;
};

const LeaveRequestForm = ({ initialData, onSuccess, onCancel, isEditing }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [touched, setTouched] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Handle standalone usage (for Google users)
  const isStandalone = !initialData && !onSuccess && !onCancel && !isEditing;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/auth/user/profile');
        const user = res.data;

        setForm(prev => ({
          ...initialData || initialForm,
          staffCategory: initialData?.staffCategory || user.typeOfRegistration || '',
          faculty: initialData?.faculty || user.faculty || '',
          department: initialData?.department || user.department || '',
          jobTitle: initialData?.jobTitle || '',
        }));
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        toast.error('Could not load your profile data');
      } finally {
        setLoading(false);
      }
    };

    if (isEditing && initialData) {
      setForm(initialData);
      setIsInitialized(true);
      setLoading(false);
    } else {
      fetchUserProfile();
    }
  }, [initialData, isEditing]);

  useEffect(() => {
    // Only clear department if faculty was manually changed by user after initialization
    if (isInitialized && touched.faculty) {
      setForm(prev => ({ ...prev, department: '' }));
    }
  }, [form.faculty, !!touched.faculty, isInitialized]);

  // Recalculate numberOfDays when short leave times or leaveType changes
  useEffect(() => {
    if (form.leaveType === 'Short Leave') {
      const duration = getTimeDifferenceInHours(form.shortLeaveStartTime, form.shortLeaveEndTime);
      if (duration > 0 && duration <= 8) {
        const calculatedDays = +(duration / 8).toFixed(3); // round to 3 decimals
        setForm(prev => ({ ...prev, numberOfDays: calculatedDays }));
        setErrors(prev => ({ ...prev, numberOfDays: '' }));
      } else {
        setErrors(prev => ({ ...prev, numberOfDays: 'Duration must be between 0 and 8 hours' }));
        setForm(prev => ({ ...prev, numberOfDays: '' }));
      }
    } else if (form.leaveType === 'Half Day') {
      // Automatically set numberOfDays to 0.5 for Half Day
      setForm(prev => ({ ...prev, numberOfDays: 0.5 }));
      setErrors(prev => ({ ...prev, numberOfDays: '' }));
    }
  }, [form.shortLeaveStartTime, form.shortLeaveEndTime, form.leaveType]);

  useEffect(() => {
    if (form.faculty === 'Information Technology Center') {
      setForm(prev => ({ ...prev, department: 'ITC' }));
    }
  }, [form.faculty]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'arrangementEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'arrangementPhone':
        if (value && !/^[0-9+\- ]+$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'toDate':
        if (form.fromDate && value && isBefore(parseISO(value), parseISO(form.fromDate))) {
          error = 'To date cannot be before from date';
        }
        break;
      case 'numberOfDays':
        if (value === '' || isNaN(value)) {
          error = 'Number of days must be a number';
        } else if (value <= 0) {
          error = 'Number of days must be greater than zero';
        }
        break;
      case 'shortLeaveEndTime':
        if (form.shortLeaveStartTime && value && value <= form.shortLeaveStartTime) {
          error = 'End time must be after start time';
        }
        break;
      default:
        if (!value && field !== 'arrangementEmail' && field !== 'arrangementAddress') {
          error = 'This field is required';
        }
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Basic required fields
    const requiredFields = [
      'staffCategory',
      'leaveType',
      'faculty',
      'purpose',
      'arrangementName',
      'arrangementPhone',
      'addressDuringLeave',
    ];

    requiredFields.forEach(field => {
      if (!form[field] || form[field].trim() === '') {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Department validation - only required if faculty has departments
    if (form.faculty && departments[form.faculty] && departments[form.faculty].length > 0) {
      if (!form.department || form.department.trim() === '') {
        newErrors.department = 'Department is required for this faculty';
        isValid = false;
      }
    }

    // Date validation based on leave type
    if (form.leaveType === 'Short Leave' || form.leaveType === 'Half Day') {
      if (!form.shortLeaveDate) {
        newErrors.shortLeaveDate = 'Date is required';
        isValid = false;
      } else if (isPastDate(form.shortLeaveDate)) {
        newErrors.shortLeaveDate = 'Date cannot be in the past';
        isValid = false;
      }
    } else {
      if (!form.fromDate) {
        newErrors.fromDate = 'From date is required';
        isValid = false;
      }
      if (!form.toDate) {
        newErrors.toDate = 'To date is required';
        isValid = false;
      }
      // Auto-calculate numberOfDays for regular leave
      if (form.fromDate && form.toDate) {
        const from = new Date(form.fromDate);
        const to = new Date(form.toDate);
        if (to < from) {
          newErrors.toDate = 'To date cannot be before from date';
          isValid = false;
        } else {
          // Calculate inclusive days
          const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
          if (diff > 0) {
            form.numberOfDays = diff;
          } else {
            newErrors.numberOfDays = 'Number of days must be greater than 0';
            isValid = false;
          }
        }
      }
    }

    // Time validation for Half Day
    if (form.leaveType === 'Half Day') {
      if (!form.shortLeaveStartTime || !form.shortLeaveEndTime) {
        newErrors.shortLeaveStartTime = 'Start time is required';
        newErrors.shortLeaveEndTime = 'End time is required';
        isValid = false;
      } else {
        const duration = getTimeDifferenceInHours(form.shortLeaveStartTime, form.shortLeaveEndTime);
        if (duration <= 0 || duration > 4) {
          newErrors.shortLeaveEndTime = 'Duration must be between 0 and 4 hours';
          isValid = false;
        }
      }
    }

    // Time validation for Short Leave
    if (form.leaveType === 'Short Leave') {
      if (!form.shortLeaveStartTime || !form.shortLeaveEndTime) {
        newErrors.shortLeaveStartTime = 'Start time is required';
        newErrors.shortLeaveEndTime = 'End time is required';
        isValid = false;
      } else {
        const duration = getTimeDifferenceInHours(form.shortLeaveStartTime, form.shortLeaveEndTime);
        if (duration <= 0 || duration > 8) {
          newErrors.shortLeaveEndTime = 'Duration must be between 0 and 8 hours';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (!validateForm()) {
      console.log('Validation errors:', errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      let leaveData = { ...form };
      // Trim all string fields before submission
      Object.keys(leaveData).forEach(key => {
        if (typeof leaveData[key] === 'string') {
          leaveData[key] = leaveData[key].trim();
        }
      });
      // Remove fromDate and toDate for Half Day and Short Leave
      if (leaveData.leaveType === 'Half Day' || leaveData.leaveType === 'Short Leave') {
        delete leaveData.fromDate;
        delete leaveData.toDate;
      }

      if (form.leaveType === 'Half Day') {
        leaveData.numberOfDays = 0.5;
      }

      if (isEditing) {
        await onSuccess(leaveData);
      } else {
        await api.post('/leaves', leaveData);
        toast.success('Leave request submitted successfully!');

        if (isStandalone) {
          // For Google users, show success and stay on the form
          setForm({
            ...initialForm,
            staffCategory: form.staffCategory,
            faculty: form.faculty,
            department: form.department,
            jobTitle: form.jobTitle,
          });
          setTouched({});
        } else {
          // For regular users, call the onSuccess callback
          if (onSuccess) {
            await onSuccess(leaveData);
          }
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Your account is not approved yet. Please wait for admin approval.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to submit leave request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (field, label, icon, type = 'text', readOnly = false) => (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ color: colors.maroonRed }}>
        {icon && <span className="me-2" style={{ color: colors.maroonRed }}>{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        name={field}
        value={form[field]}
        onChange={handleChange}
        onBlur={() => handleBlur(field)}
        className={`form-control shadow-sm ${errors[field] ? 'is-invalid' : ''}`}
        required={!readOnly && field !== 'arrangementEmail' && field !== 'arrangementAddress'}
        readOnly={readOnly}
        min={type === 'date' ? format(new Date(), 'yyyy-MM-dd') : undefined}
        style={{
          borderColor: errors[field] ? colors.errorRed : colors.maroonRed,
          borderRadius: '6px',
          backgroundColor: readOnly ? colors.grayLight : colors.white,
        }}
      />
      {errors[field] && (
        <div className="invalid-feedback d-flex align-items-center gap-1">
          <FaInfoCircle />
          {errors[field]}
        </div>
      )}
    </div>
  );

  const renderSelectField = (field, label, options, icon, disabled = false) => (
    <div className="mb-3">
      <label className="form-label fw-semibold" style={{ color: colors.maroonRed }}>
        {icon && <span className="me-2" style={{ color: colors.maroonRed }}>{icon}</span>}
        {label}
      </label>
      <select
        name={field}
        value={form[field]}
        onChange={handleChange}
        onBlur={() => handleBlur(field)}
        className={`form-select shadow-sm ${errors[field] ? 'is-invalid' : ''}`}
        required
        disabled={disabled}
        style={{
          borderColor: errors[field] ? colors.errorRed : colors.maroonRed,
          borderRadius: '6px',
          backgroundColor: disabled ? colors.grayLight : colors.white,
        }}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {errors[field] && (
        <div className="invalid-feedback d-flex align-items-center gap-1">
          <FaInfoCircle />
          {errors[field]}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading form data...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        borderRadius: 0,
        boxShadow: 'none',
        padding: '32px 48px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
        <div className="card p-lg mb-lg" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', width: '100%', background: 'transparent' }}>
        <div
          className="card-header"
          style={{
              background: 'transparent',
              color: colors.maroonRed,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 24,
              border: 'none',
              textAlign: 'left',
          }}
        >
            <h2 className="fw-bold mb-md mt-lg" style={{ fontSize: 'var(--font-size-xl)', color: colors.maroonRed, textAlign: 'left', margin: 0 }}>Leave Request</h2>
        </div>

          <div className="card-body p-0" style={{ width: '100%' }}>
            <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
            <div className="row">
              <div className="col-md-6">
                {renderSelectField('staffCategory', 'Staff Category', staffCategories, <FaUserTie />, true)}
                {renderSelectField('leaveType', 'Leave Type', leaveTypes, <FaCalendarAlt />)}
                {renderSelectField('faculty', 'Faculty', faculties, <FaUniversity />, true)}

                {form.faculty && departments[form.faculty] && form.faculty !== 'Information Technology Center' ? (
                  renderSelectField('department', 'Department', departments[form.faculty], <FaBuilding />, true)
                ) : form.faculty && form.faculty !== 'Information Technology Center' ? (
                  renderInputField('department', 'Department', <FaBuilding />, 'text', true)
                ) : null}

                {(form.leaveType === 'Short Leave' || form.leaveType === 'Half Day') && (
                  <>
                    {renderInputField('shortLeaveDate', 'Date of Leave', <FaCalendarAlt />, 'date')}
                    <div className="row mb-3">
                      <div className="col">
                        {renderInputField('shortLeaveStartTime', 'Start Time', null, 'time')}
                      </div>
                      <div className="col">
                        {renderInputField('shortLeaveEndTime', 'End Time', null, 'time')}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="col-md-6">
                {form.leaveType !== 'Short Leave' && form.leaveType !== 'Half Day' && (
                  <>
                    {renderInputField('fromDate', 'From Date', <FaCalendarAlt />, 'date')}
                    {renderInputField('toDate', 'To Date', <FaCalendarAlt />, 'date')}
                    {renderInputField('numberOfDays', 'Number of Days', null, 'number')}
                  </>
                )}

                {(form.leaveType === 'Half Day') ? (
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: colors.maroonRed }}>
                      Number of Days
                    </label>
                    <input
                      type="number"
                      name="numberOfDays"
                      value={0.5}
                      className="form-control shadow-sm"
                      readOnly
                      style={{
                        backgroundColor: colors.grayLight,
                        color: colors.maroonRed,
                        borderColor: colors.maroonRed,
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                ) : form.leaveType === 'Short Leave' ? (
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: colors.maroonRed }}>
                      Number of Days
                    </label>
                    <input
                      type="number"
                      name="numberOfDays"
                      value={form.numberOfDays || ''}
                      className={`form-control shadow-sm ${errors.numberOfDays ? 'is-invalid' : ''}`}
                      readOnly
                      style={{
                        backgroundColor: colors.grayLight,
                        color: colors.maroonRed,
                        borderColor: errors.numberOfDays ? colors.errorRed : colors.maroonRed,
                        borderRadius: '6px',
                      }}
                    />
                    {errors.numberOfDays && (
                      <div className="invalid-feedback d-flex align-items-center gap-1">
                        <FaInfoCircle />
                        {errors.numberOfDays}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: colors.maroonRed }}>
                Purpose of Leave
              </label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                onBlur={() => handleBlur('purpose')}
                className={`form-control shadow-sm ${errors.purpose ? 'is-invalid' : ''}`}
                rows={3}
                required
                style={{
                  borderColor: errors.purpose ? colors.errorRed : colors.maroonRed,
                  borderRadius: '6px',
                }}
              />
              {errors.purpose && (
                <div className="invalid-feedback d-flex align-items-center gap-1">
                  <FaInfoCircle />
                  {errors.purpose}
                </div>
              )}
            </div>

            <fieldset className="card mb-3" style={{ borderColor: colors.maroonRed }}>
              <legend className="card-header bg-light" style={{ color: colors.maroonRed }}>
                Arrangement During Leave
              </legend>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    {renderInputField('arrangementName', 'Person in Charge')}
                    {renderInputField('arrangementPhone', 'Contact Number', null, 'tel')}
                  </div>
                  <div className="col-md-6">
                    {renderInputField('arrangementEmail', 'Email', null, 'email')}
                    {renderInputField('arrangementAddress', 'Address')}
                  </div>
                </div>
              </div>
            </fieldset>

            {renderInputField('addressDuringLeave', 'Your Address During Leave')}

            <div className="d-flex justify-content-between mt-4">
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-lg"
                  onClick={onCancel}
                  style={{
                    backgroundColor: colors.grayLight,
                    color: colors.maroonRed,
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                >
                  Cancel
                </button>
              )}
             <button
  type="submit"
  className="btn mt-md"
  disabled={isSubmitting}
  style={{
    fontSize: 'var(--font-size-md)',
    borderRadius: '8px',
    backgroundColor: '#800000',  // maroon
    color: '#FFD700',            // gold
    border: 'none',
  }}
>
  {isSubmitting ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" style={{ borderTopColor: '#FFD700', borderRightColor: '#FFD700' }} />
      {isEditing ? 'Updating...' : 'Submitting...'}
    </>
  ) : (
    isEditing ? 'Update Request' : 'Submit Request'
  )}
</button>

            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
