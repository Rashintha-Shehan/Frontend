import React, { useState, useRef, useMemo } from 'react';
import { getMonthlyLeaveReport, getLeaveReportByDateRange } from '../services/monthlyReport';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getShortLeaveHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  return (end - start) / (1000 * 60 * 60);
};

const convertShortLeaveToDays = (hours) => hours / 8;

// Utility to load image as base64 and get its dimensions
function getImageDataAndSize(url, targetHeight = 32) {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const width = targetHeight * aspectRatio;
          resolve({ base64: reader.result, width, height: targetHeight });
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

const MonthlyLeaveReport = () => {
  const [employeeFilter, setEmployeeFilter] = useState('academic'); // 'academic' or 'all'
  const months = [...Array(12)].map((_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const [useDateRange, setUseDateRange] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  const handleFetch = async () => {
    setError('');
    if (useDateRange) {
      if (!startDate || !endDate) return setError('Please select both start and end dates');
      if (new Date(startDate) > new Date(endDate)) return setError('Start date cannot be after end date');
    } else {
      if (!month || !year) return setError('Please select both month and year');
    }

    setLoading(true);
    try {
      const data = useDateRange
        ? await getLeaveReportByDateRange(startDate, endDate)
        : await getMonthlyLeaveReport(parseInt(month), parseInt(year));

      let filtered = data || [];
      if (employeeFilter === 'academic') {
        filtered = filtered.filter(lr => lr.user && (lr.user.typeOfRegistration || lr.user.staffCategory) !== 'Non-Academic' && (lr.user.typeOfRegistration || lr.user.staffCategory) !== 'Academic Support');
      }
      // If 'all', do not filter
      setReportData(filtered);

      if (filtered.length > 0 && filtered[0].user) {
        setFaculty(filtered[0].user.faculty || '');
        setDepartment(filtered[0].user.department || '');
      } else {
        setFaculty('');
        setDepartment('');
      }
    } catch (err) {
      setError('Failed to fetch leave report. Please try again.');
      setReportData([]);
      setFaculty('');
      setDepartment('');
    } finally {
      setLoading(false);
    }
  };

  const aggregatedData = useMemo(() => {
    const map = {};
    
    console.log('Raw report data:', reportData);
    
    reportData.forEach((leave) => {
      if ((leave.status || '').toUpperCase() !== 'APPROVED') return;
      const user = leave.user || {};
      const empId = user.id || 'Unknown';
      
      console.log(`Processing leave for ${empId}:`, {
        leaveType: leave.leaveType,
        numberOfDays: leave.numberOfDays,
        status: leave.status
      });
      
      if (!map[empId]) {
        map[empId] = {
          employeeId: empId,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
          jobRole: user.jobTitle || 'N/A',
          casual: 0,
          sick: 0,
          halfDay: 0,
          shortLeave: 0,
          duty: 0,
          totalLeaveDays: 0,
          totalShortLeaveHours: 0,
          halfDayCount: 0, // Track count of half-day leaves
          shortLeaveCount: 0, // Track count of short leaves
        };
      }
      
      // Assign leave days to the correct type with flexible matching
      const leaveType = (leave.leaveType || '').trim();
      
      if (leaveType.toLowerCase().includes('short') || leaveType === 'Short Leave') {
        const shortLeaveDays = leave.numberOfDays || 0;
        map[empId].shortLeave += shortLeaveDays;
        map[empId].shortLeaveCount += 1;
        map[empId].totalShortLeaveHours += getShortLeaveHours(leave.shortLeaveStartTime, leave.shortLeaveEndTime);
        // Do NOT add short leave days to totalLeaveDays
      } else if (leaveType.toLowerCase().includes('half') || leaveType === 'Half Day') {
        const days = leave.numberOfDays || 0;
        map[empId].halfDay += days;
        map[empId].halfDayCount += 1;
        map[empId].totalLeaveDays += days;
      } else if (leaveType.toLowerCase().includes('casual') || leaveType === 'Casual') {
        const days = leave.numberOfDays || 0;
        map[empId].casual += days;
        map[empId].totalLeaveDays += days;
      } else if (leaveType.toLowerCase().includes('sick') || leaveType === 'Sick') {
        const days = leave.numberOfDays || 0;
        map[empId].sick += days;
        map[empId].totalLeaveDays += days;
      } else if (leaveType.toLowerCase().includes('duty') || leaveType === 'Duty') {
        const days = leave.numberOfDays || 0;
        map[empId].duty += days;
        map[empId].totalLeaveDays += days;
      }
    });
    
    console.log('Final aggregated map:', map);
    
    const result = Object.values(map).map(emp => {
      // Format leave type values
      const format = v => v && v > 0 ? v.toFixed(2) : '-';
      // totalLeaveDays already includes all leave types (including short leaves)
      const totalDays = emp.totalLeaveDays;
      const noPayDays = totalDays > 2 ? totalDays - 2 : 0;
      const formatted = {
        ...emp,
        casual: format(emp.casual),
        sick: format(emp.sick),
        halfDay: format(emp.halfDay), // Show total days for half-day leaves
        shortLeave: format(emp.shortLeave), // Show total days for short leaves
        duty: format(emp.duty),
        totalLeaveDays: totalDays.toFixed(2),
        noPayDays: noPayDays > 0 ? noPayDays.toFixed(2) : '-',
      };
      console.log(`Final result for ${emp.employeeId}:`, formatted);
      return formatted;
    });
    
    console.log('Final aggregated data:', result);
    return result;
  }, [reportData]);

  const exportToPDF = async () => {
    try {
      // Load logos and get their sizes (smaller height)
      const logoTargetHeight = 22;
      const leftLogo = await getImageDataAndSize('/uop.png', logoTargetHeight);
      const rightLogo = await getImageDataAndSize('/ceit.png', logoTargetHeight);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 38;
      const footerHeight = 38;

      // Prepare dynamic heading
      const heading = (faculty && faculty.trim().toLowerCase() === 'information technology center')
        ? 'Information Technology Center'
        : (faculty || 'Faculty/Center/Division');
      const university = 'University of Peradeniya';
      const reportTitle = 'MONTHLY LEAVE REPORT';
      const period = useDateRange
        ? `${startDate} to ${endDate}`
        : `${months.find(m => m.value == month)?.name} ${year}`;

      // --- Table: Multi-row header ---
      const head = [
        [
          { content: 'Employee Id', rowSpan: 2 },
          { content: 'Name', rowSpan: 2 },
          { content: 'Job Role', rowSpan: 2 },
          { content: 'Leave Type', colSpan: 6, styles: { halign: 'center' } },
          { content: 'Total Approved Leave (Days)', rowSpan: 2 },
          { content: 'No Pay Days', rowSpan: 2 },
        ],
        [
          { content: 'Casual' },
          { content: 'Sick' },
          { content: 'Half Day' },
          { content: 'Short Leave' },
          { content: 'Duty' },
          { content: 'Vacation' },
        ]
      ];
      const rows = aggregatedData.map(emp => [
        emp.employeeId,
        emp.name,
        emp.jobRole,
        emp.casual || '-',
        emp.sick || '-',
        emp.halfDay || '-',
        emp.shortLeave || '-',
        emp.duty || '-',
        emp.vacation || '-',
        emp.totalLeaveDays,
        emp.noPayDays
      ]);

      // --- Header/Footer Drawing Function ---
      function drawHeaderFooter(data) {
        // Header
        let y = margin + 2;
        // Left logo
        doc.addImage(leftLogo.base64, 'PNG', margin, y, leftLogo.width, leftLogo.height);
        // Right logo
        doc.addImage(rightLogo.base64, 'PNG', pageWidth - margin - rightLogo.width, y, rightLogo.width, rightLogo.height);
        // Centered text block
        let textY = y + 2;
        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text(heading, pageWidth / 2, textY, { align: 'center' });
        textY += 7;
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(university, pageWidth / 2, textY, { align: 'center' });
        textY += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text(reportTitle, pageWidth / 2, textY, { align: 'center' });
        textY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(period, pageWidth / 2, textY, { align: 'center' });
        // Red line below header
        doc.setDrawColor(200, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(margin, headerHeight, pageWidth - margin, headerHeight);

        // --- Faculty/Center/Division and Generated on ---
        const infoBlockY = headerHeight + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Faculty/Center/Division: ${faculty || '-'}`, margin, infoBlockY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const now = new Date();
        const timestamp = `Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        doc.text(timestamp, margin, infoBlockY + 6);

        // Footer
        let fy = pageHeight - footerHeight + 8;
        doc.setDrawColor(200, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(200, 0, 0);
        doc.text('*This is a system-generated report issued by the University Leave Management System.', pageWidth / 2, fy, { align: 'center' });
        fy += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.text('© 2025 Leave Management System · Developed by CEIT', margin, fy);
        doc.text('Phone: +94 (0) 81 2384848', pageWidth - margin - 60, fy);
        fy += 4;
        doc.text('Address: Information Technology Center', margin, fy);
        doc.text('+94 (0) 81 2392070', pageWidth - margin - 60, fy);
        fy += 4;
        doc.text('University of Peradeniya', margin, fy);
        doc.text('+94 (0) 81 2392090', pageWidth - margin - 60, fy);
        fy += 4;
        doc.text('Peradeniya, Sri Lanka', margin, fy);
        doc.text('Ext: 2900', pageWidth - margin - 60, fy);
        fy += 4;
        doc.text('Email: info@ceit.pdn.ac.lk / info.ceit@gs.pdn.ac.lk', margin, fy);
        doc.text('Web: www.ceit.pdn.ac.lk', pageWidth - margin - 60, fy);
        // Page number
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0);
        const pageNum = doc.internal.getNumberOfPages();
        const pageLabel = `Page ${data.pageNumber} of ${data.totalPages}`;
        doc.text(pageLabel, pageWidth / 2, pageHeight - 6, { align: 'center' });
      }

      // --- Table ---
      autoTable(doc, {
        startY: headerHeight + 24,
        head: head,
        body: rows,
        styles: { fontSize: 10, valign: 'middle', halign: 'center' },
        headStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold', lineWidth: 0.5, lineColor: [0,0,0] },
        theme: 'grid',
        margin: { left: margin, right: margin },
        tableLineColor: [0,0,0],
        tableLineWidth: 0.5,
        didDrawPage: function (data) {
          drawHeaderFooter({
            pageNumber: doc.internal.getCurrentPageInfo().pageNumber,
            totalPages: doc.internal.getNumberOfPages(),
          });
        },
        pageBreak: 'auto',
      });

      // Set page numbers for all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        drawHeaderFooter({ pageNumber: i, totalPages: pageCount });
      }

      const fileName = useDateRange ? `LeaveSummary_${startDate}_to_${endDate}.pdf` : `LeaveSummary_${month}_${year}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    }
  };

  const printReport = () => {
    const title = useDateRange
      ? `Department Leave Summary from ${startDate} to ${endDate}`
      : `Department Leave Summary for ${months.find(m => m.value == month)?.name} ${year}`;

    const original = document.body.innerHTML;
    const content = reportRef.current.innerHTML;
    document.body.innerHTML = `
      <div style="padding:20px; font-family: Arial, sans-serif;">
        <h2 style="text-align:center; color:var(--primary-color);">${title}</h2>
        <div style="text-align:center; margin-bottom:15px; font-weight:600;">
          Faculty: ${faculty} | Department: ${department}
        </div>
        ${content}
        <div style="margin-top:30px; text-align:right; font-size:12px;">
          Report Generated: ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  const exportToExcel = () => {
    const wsData = aggregatedData.map(({ employeeId, name, jobRole, casual, sick, halfDay, shortLeave, duty, vacation, totalLeaveDays, noPayDays }) => ({
      'Employee ID': employeeId,
      'Employee Name': name,
      'Job Role': jobRole,
      'Casual': casual,
      'Sick': sick,
      'Half Day': halfDay,
      'Short Leave': shortLeave,
      'Duty': duty,
      'Vacation': vacation,
      'Total Approved Leaves (Days)': totalLeaveDays,
      'No Pay Days': noPayDays,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Summary");
    const fileName = useDateRange ? `LeaveSummary_${startDate}_to_${endDate}.xlsx` : `LeaveSummary_${month}_${year}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToCSV = () => {
    const wsData = aggregatedData.map(({ employeeId, name, jobRole, casual, sick, halfDay, shortLeave, duty, vacation, totalLeaveDays, noPayDays }) => ({
      'Employee ID': employeeId,
      'Employee Name': name,
      'Job Role': jobRole,
      'Casual': casual,
      'Sick': sick,
      'Half Day': halfDay,
      'Short Leave': shortLeave,
      'Duty': duty,
      'Vacation': vacation,
      'Total Approved Leaves (Days)': totalLeaveDays,
      'No Pay Days': noPayDays,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = useDateRange ? `LeaveSummary_${startDate}_to_${endDate}.csv` : `LeaveSummary_${month}_${year}.csv`;
    saveAs(blob, fileName);
  };

  return (
    <div className="container mt-4 p-lg rounded shadow" style={{ maxWidth: 1200, backgroundColor: 'var(--background-color)', border: '3px solid var(--primary-color)' }}>
      <div className="d-flex justify-content-end mb-2">
        <label className="me-2">Show:</label>
        <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="form-select" style={{ maxWidth: 200 }}>
          <option value="academic">Academic Only</option>
          <option value="all">All Employees</option>
        </select>
      </div>
      <h3 className="mb-1 text-center" style={{ color: 'var(--primary-color)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-md)' }}>
        Department Leave Summary Report
      </h3>
      {faculty && department && (
        <div className="text-center mb-3" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
          Faculty: {faculty} | Department: {department}
        </div>
      )}
      <div className="form-check form-switch mb-3 d-flex justify-content-center">
        <input className="form-check-input" type="checkbox" id="toggleDateRange" checked={useDateRange} onChange={() => {
          setUseDateRange(!useDateRange);
          setError('');
          setReportData([]);
          setMonth('');
          setYear('');
          setStartDate('');
          setEndDate('');
        }} />
        <label className="form-check-label" htmlFor="toggleDateRange">Use Custom Date Range</label>
      </div>
      {!useDateRange ? (
        <div className="row mb-3 justify-content-center align-items-end">
          <div className="col-md-3">
            <select className="form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Select Month</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Select Year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <button onClick={handleFetch} className="btn" style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--secondary-color)',
              fontWeight: '700',
              padding: '0.5rem 1.5rem',
              whiteSpace: 'nowrap',
              boxShadow: loading ? '0 0 10px var(--secondary-color)' : 'none',
              transition: 'background-color 0.3s',
              cursor: loading ? 'not-allowed' : 'pointer',
            }} disabled={loading}>{loading ? 'Loading...' : 'Generate Report'}</button>
          </div>
        </div>
      ) : (
        <div className="row mb-3 justify-content-center align-items-end">
          <div className="col-md-3">
            <input type="date" className="form-control" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <button onClick={handleFetch} className="btn" style={{
              backgroundColor: 'var(--primary-color)',
              color: 'var(--secondary-color)',
              fontWeight: '700',
              padding: '0.5rem 1.5rem',
              whiteSpace: 'nowrap',
              boxShadow: loading ? '0 0 10px var(--secondary-color)' : 'none',
              transition: 'background-color 0.3s',
              cursor: loading ? 'not-allowed' : 'pointer',
            }} disabled={loading}>{loading ? 'Loading...' : 'Generate Report'}</button>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger text-center">{error}</div>}
      {aggregatedData.length > 0 && (
        <>
          <div className="d-flex justify-content-end mb-3 gap-2 flex-wrap">
            <button onClick={printReport} className="btn btn-outline-secondary btn-sm">Print</button>
            <button onClick={exportToExcel} className="btn btn-outline-success btn-sm">Excel</button>
            <button onClick={exportToCSV} className="btn btn-outline-primary btn-sm">CSV</button>
            <button onClick={exportToPDF} className="btn btn-outline-danger btn-sm">PDF</button>
          </div>
          
          {/* Desktop Table View */}
          <div className="d-none d-lg-block" ref={reportRef}>
            <div style={{
              border: '1px solid var(--primary-color)',
              borderRadius: 4,
              overflowX: 'auto',
            }}>
              <table className="table table-bordered mb-0" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0, width: '100%', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ minWidth: '80px', width: '10%' }}>Employee Id</th>
                    <th rowSpan={2} style={{ minWidth: '120px', width: '15%' }}>Name</th>
                    <th rowSpan={2} style={{ minWidth: '100px', width: '12%' }}>Job Role</th>
                    <th colSpan={6} style={{ textAlign: 'center', width: '48%' }}>Leave Type</th>
                    <th rowSpan={2} style={{ minWidth: '100px', width: '10%' }}>Total Approved Leave (Days)</th>
                    <th rowSpan={2} style={{ minWidth: '80px', width: '5%' }}>No Pay Days</th>
                  </tr>
                  <tr>
                    <th style={{ minWidth: '60px', width: '8%' }}>Casual</th>
                    <th style={{ minWidth: '60px', width: '8%' }}>Sick</th>
                    <th style={{ minWidth: '60px', width: '8%' }}>Half Day</th>
                    <th style={{ minWidth: '60px', width: '8%' }}>Short Leave</th>
                    <th style={{ minWidth: '60px', width: '8%' }}>Duty</th>
                    <th style={{ minWidth: '60px', width: '8%' }}>Vacation</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedData.map(emp => (
                    <tr key={emp.employeeId}>
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.jobRole}</td>
                      <td>{emp.casual || '-'}</td>
                      <td>{emp.sick || '-'}</td>
                      <td>{emp.halfDay || '-'}</td>
                      <td>{emp.shortLeave || '-'}</td>
                      <td>{emp.duty || '-'}</td>
                      <td>{emp.vacation || '-'}</td>
                      <td>{emp.totalLeaveDays}</td>
                      <td>{emp.noPayDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-lg-none">
            {aggregatedData.map(emp => (
              <div key={emp.employeeId} className="card mb-3" style={{ border: '1px solid var(--primary-color)' }}>
                <div className="card-header" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--secondary-color)', fontWeight: '600' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{emp.name}</span>
                    <small>{emp.employeeId}</small>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6 mb-2">
                      <strong>Job Role:</strong> {emp.jobRole}
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Total Leave:</strong> {emp.totalLeaveDays} days
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <strong>Casual:</strong> {emp.casual || '-'}
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Sick:</strong> {emp.sick || '-'}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <strong>Half Day:</strong> {emp.halfDay || '-'}
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Short Leave:</strong> {emp.shortLeave || '-'}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <strong>Duty:</strong> {emp.duty || '-'}
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Vacation:</strong> {emp.vacation || '-'}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <strong>No Pay Days:</strong> {emp.noPayDays}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyLeaveReport;