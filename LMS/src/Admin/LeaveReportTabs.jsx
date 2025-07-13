import React, { useState } from 'react';
import EmployeeLeaveReport from '../services/EmployeeLeaveReport';
import MonthlyLeaveReport from '../MonthlyLeaveReport/MonthlyLeaveReport';

const LeaveReportTabs = () => {
  const [activeSubTab, setActiveSubTab] = useState('employee');

  const tabStyle = (isActive) => ({
    padding: '10px 24px',
    cursor: 'pointer',
    fontWeight: 600,
    backgroundColor: isActive ? '#800000' : '#fff',
    color: isActive ? '#FFD700' : '#800000',
    border: '2px solid #800000',
    borderBottom: isActive ? 'none' : '2px solid #800000',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    transition: 'all 0.2s ease-in-out',
  });

  return (
    <div
      className="container"
      style={{
        maxWidth: '1100px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div className="d-flex justify-content-center gap-2">
        <div
          style={tabStyle(activeSubTab === 'employee')}
          onClick={() => setActiveSubTab('employee')}
        >
          Employee Report
        </div>
        <div
          style={tabStyle(activeSubTab === 'monthly')}
          onClick={() => setActiveSubTab('monthly')}
        >
          Monthly Report
        </div>
      </div>

      <div
        className="p-4 bg-white rounded-bottom shadow-sm border"
        style={{ borderTop: 'none', minHeight: 'auto' }}
      >
        {activeSubTab === 'employee' ? <EmployeeLeaveReport /> : <MonthlyLeaveReport />}
      </div>
    </div>
  );
};

export default LeaveReportTabs;
