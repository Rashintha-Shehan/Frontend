import React, { useState } from 'react';
import EmployeeLeaveReport from '../services/EmployeeLeaveReport';
import MonthlyLeaveReport from '../MonthlyLeaveReport/MonthlyLeaveReport';
import AnnualLeaveReport from '../MonthlyLeaveReport/AnnualLeaveReport';
import AcademicSupportMonthlyReport from '../MonthlyLeaveReport/AcademicSupportMonthlyReport';

const LeaveReportTabs = () => {
  const [mainTab, setMainTab] = useState('academic');
  const [academicSubTab, setAcademicSubTab] = useState('employee');

  const mainTabStyle = (isActive) => ({
    padding: '10px 32px',
    cursor: 'pointer',
    fontWeight: 700,
    backgroundColor: isActive ? '#800000' : '#fff',
    color: isActive ? '#FFD700' : '#800000',
    border: '2px solid #800000',
    borderBottom: isActive ? 'none' : '2px solid #800000',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    fontSize: '1.1rem',
    transition: 'all 0.2s ease-in-out',
  });

  const subTabStyle = (isActive) => ({
    padding: '6px 16px',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? '#f8f9fa' : '#fff',
    color: isActive ? '#800000' : '#555',
    border: isActive ? '1.5px solid #FFD700' : '1.5px solid #ddd',
    borderBottom: isActive ? 'none' : '1.5px solid #ddd',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    fontSize: '0.98rem',
    boxShadow: isActive ? '0 2px 8px rgba(128,0,0,0.07)' : 'none',
    marginBottom: isActive ? '-1.5px' : 0,
    transition: 'all 0.2s',
  });

  return (
    <div className="container" style={{ maxWidth: '1100px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Main Tabs */}
      <div className="d-flex justify-content-center gap-2 mb-2">
        <div style={mainTabStyle(mainTab === 'academic')} onClick={() => setMainTab('academic')}>All Employees</div>
        <div style={mainTabStyle(mainTab === 'nonAcademic')} onClick={() => setMainTab('nonAcademic')}>Annual Report</div>
        <div style={mainTabStyle(mainTab === 'academicSupport')} onClick={() => setMainTab('academicSupport')}>Academic Support</div>
      </div>

      {/* Sub Tabs for Academic */}
      {mainTab === 'academic' && (
        <div className="d-flex justify-content-center gap-2 mb-2">
          <div style={subTabStyle(academicSubTab === 'employee')} onClick={() => setAcademicSubTab('employee')}>Employee Report</div>
          <div style={subTabStyle(academicSubTab === 'monthly')} onClick={() => setAcademicSubTab('monthly')}>Monthly Report</div>
        </div>
      )}

      <div className="p-4 bg-white rounded-bottom shadow-sm border" style={{ borderTop: 'none', minHeight: 'auto' }}>
        {mainTab === 'academic' && (
          academicSubTab === 'employee' ? <EmployeeLeaveReport /> : <MonthlyLeaveReport />
        )}
        {mainTab === 'nonAcademic' && <AnnualLeaveReport />}
        {mainTab === 'academicSupport' && <AcademicSupportMonthlyReport />}
      </div>
    </div>
  );
};

export default LeaveReportTabs;
