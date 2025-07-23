import React, { useState, useEffect } from 'react';
import {
  faculties,
  departmentsByFaculty,
  typeOfRegistrationOptions,
  staffCategoryOptions,
  getJobTitles
} from '../utils/registrationOptions';

export default function AdminUserEditModal({ user, isOpen, onClose, onSave, token }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form when modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        mobile: user.mobile || '',
        faculty: user.faculty || '',
        department: user.department || '',
        staffCategory: user.staffCategory || '',
        jobTitle: user.jobTitle || '',
        personalEmail: user.personalEmail || '',
        typeOfRegistration: user.typeOfRegistration || '',
        image: user.image || ''
      });
      setError('');
    }
  }, [user, isOpen]);

  // Handle input/select changes
  const handleChange = e => {
    const { name, value } = e.target;

    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // Clear department & jobTitle if faculty changes
      if (name === 'faculty') {
        updated.department = '';
        updated.jobTitle = '';
      }

      // Clear jobTitle if typeOfRegistration or staffCategory changes
      if (name === 'typeOfRegistration' || name === 'staffCategory') {
        updated.jobTitle = '';
      }

      // Ensure jobTitle is valid for current form state
      const validJobTitles = getJobTitles(updated);
      if (!validJobTitles.includes(updated.jobTitle)) {
        updated.jobTitle = '';
      }

      return updated;
    });
  };

  // No required fields for admin edit; always return true
  const isFormValid = () => true;

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();



    setLoading(true);
    setError('');

    // Prepare filtered form to avoid overwriting with empty strings
    const filteredForm = Object.entries(form)
      .filter(([_, value]) => value !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    try {
      const response = await fetch(`/api/admin/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(filteredForm)
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(`Failed to update user profile: ${errorText}`);
        setLoading(false);
        return;
      }

      setLoading(false);
      onSave();
    } catch (err) {
      setError('An error occurred while updating user profile.');
      setLoading(false);
      console.error(err);
    }
  };

  if (!isOpen || !user) return null;

  const jobTitleOptions = getJobTitles(form);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          width: '90%',
          maxWidth: 600,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <h4 className="mb-3 text-maroon">Edit User Profile</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="row g-3" noValidate>
          <div className="col-md-6">
            <input
              className="form-control"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <input
              className="form-control"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <input
              className="form-control"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile"
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <input
              className="form-control"
              name="personalEmail"
              value={form.personalEmail}
              onChange={handleChange}
              placeholder="Personal Email"
              disabled={loading}
            />
          </div>

          <div className="col-md-6">
            <select
              className="form-select"
              name="faculty"
              value={form.faculty}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Faculty</option>
              {faculties.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {departmentsByFaculty[form.faculty] && form.faculty !== 'Information Technology Center' && (
            <div className="col-md-6">
              <select
                className="form-select"
                name="department"
                value={form.department}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departmentsByFaculty[form.faculty].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-6">
            <select
              className="form-select"
              name="typeOfRegistration"
              value={form.typeOfRegistration}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Type of Registration</option>
              {typeOfRegistrationOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <select
              className="form-select"
              name="staffCategory"
              value={form.staffCategory}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Staff Category</option>
              {staffCategoryOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {jobTitleOptions.length > 0 && (
            <div className="col-md-12">
              <select
                className="form-select"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Job Title</option>
                {jobTitleOptions.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
