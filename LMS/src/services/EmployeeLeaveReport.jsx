import React, { useState, useEffect, useMemo, useRef } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format, parseISO, isValid } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getAllEmployeeIds,
  getLeaveReportByEmployeeId,
} from '../services/leaveService';

// --- Helper: format date like "1st March 2025" ---
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '-';

    // Day suffix logic
    const day = date.getDate();
    const daySuffix = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${day}${daySuffix(day)} ${format(date, 'MMMM yyyy')}`;
  } catch {
    return '-';
  }
};

// --- Format days number ---
const formatDays = (num) => {
  if (num == null) return '-';
  return Number.isInteger(num) ? num : num.toFixed(2);
};

// --- Calculate leave summary ---
const calculateSummary = (leaves) => {
  let totalDays = 0;
  let shortLeaveCount = 0;

  leaves.forEach((l) => {
    const type = (l.leaveType || '').toUpperCase();
    if (type.includes('SHORT')) {
      shortLeaveCount += 1; // or accumulate days if needed
    } else {
      totalDays += l.numberOfDays || 0;
    }
  });

  const noPay = totalDays > 2 ? totalDays - 2 : 0;

  return {
    totalDays,
    noPay,
    shortLeaveCount
  };
};

// Utility to load image as base64 and get its dimensions
function getImageDataAndSize(url, targetHeight = 22) {
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

// --- PDF Export Function ---
const exportToPDF = async (data, employee, fromDate, toDate) => {
  try {
    if (!employee || !employee.id || !data || !data.length) {
      alert('No data to generate PDF.');
      return;
    }

    // Load logos and get their sizes
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
    const heading = 'Information Technology Center';
    const university = 'University of Peradeniya';
    const reportTitle = 'EMPLOYEE LEAVE REPORT';
    const period = fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : 'All Time';

    const summary = calculateSummary(data);

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

      // --- Employee Info Block ---
      const infoBlockY = headerHeight + 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`${employee.firstName} ${employee.lastName}`, margin, infoBlockY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`ID: ${employee.id}`, margin, infoBlockY + 6);
      doc.text(`Email: ${employee.email}`, margin, infoBlockY + 12);
      doc.text(`Faculty/Center/Division: ${employee.faculty}`, margin, infoBlockY + 18);
      doc.text(`Job Title: ${employee.jobTitle}`, margin, infoBlockY + 24);

      // Footer
      let fy = pageHeight - footerHeight + 8;
      doc.setDrawColor(200, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(200, 0, 0);
      doc.text('*This is a System generated report. No signature is Required.', pageWidth / 2, fy, { align: 'center' });
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

    // Prepare table data
    const head = [
      ['Leave Type', 'From', 'To', 'Purpose', 'No. of Days']
    ];
    const rows = data.map(leave => [
      leave.leaveType,
      formatDate(leave.fromDate || leave.shortLeaveDate),
      formatDate(leave.toDate || leave.shortLeaveDate),
      leave.purpose,
      formatDays(leave.numberOfDays)
    ]);

    // Add summary rows
    rows.push(['', '', '', 'TOTAL', formatDays(summary.totalDays)]);
    rows.push(['', '', '', 'NO PAY DAYS', formatDays(summary.noPay)]);

    // --- Table ---
    autoTable(doc, {
      startY: headerHeight + 40,
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

    const fileName = `LeaveReport_${employee.id}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. See console for details.');
  }
};

// --- Employee Details Card ---
const EmployeeDetails = ({ employee }) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      padding: '15px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      backgroundColor: '#f9f9f9',
    },
    image: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #800000', // maroon
    },
    info: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '14px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
    },
    name: { fontWeight: '700', fontSize: '18px', color: '#800000' },
    label: { fontWeight: '600' },
  };

  return (
    <div style={styles.container}>
      <img
        src={employee.image || '/default-profile.png'}
        alt="Employee"
        style={styles.image}
        onError={(e) => (e.target.src = '/default-profile.png')}
      />
      <div style={styles.info}>
        <div style={styles.name}>
          {employee.firstName} {employee.lastName}
        </div>
        <div>
          <span style={styles.label}>Employee ID:</span> {employee.id}
        </div>
        <div>
          <span style={styles.label}>Email:</span> {employee.email}
        </div>
        <div>
          <span style={styles.label}>Faculty:</span> {employee.faculty}
        </div>
        <div>
          <span style={styles.label}>Department:</span> {employee.department}
        </div>
        <div>
          <span style={styles.label}>Job Title:</span> {employee.jobTitle}
        </div>
      </div>
    </div>
  );
};

// --- Leave Table Row ---
const LeaveTableRow = ({ leave }) => (
  <tr>
    <td>{leave.leaveType}</td>
    <td>{formatDate(leave.fromDate || leave.shortLeaveDate)}</td>
    <td>{formatDate(leave.toDate || leave.shortLeaveDate)}</td>
    <td>{leave.purpose}</td>
    <td>{formatDays(leave.numberOfDays)}</td>
  </tr>
);



// --- Main Component ---
const EmployeeLeaveReport = () => {
  const [userId, setUserId] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch employee list once on mount
  useEffect(() => {
    const fetchEmployeeIds = async () => {
      try {
        const ids = await getAllEmployeeIds();
        // Only Academic staff (exclude Non-Academic and Academic Support)
        const academic = ids.filter(e => (e.typeOfRegistration || e.staffCategory) !== 'Non-Academic' && (e.typeOfRegistration || e.staffCategory) !== 'Academic Support');
        setEmployeeIds(academic);
      } catch {
        setError('Failed to load employee list.');
      }
    };
    fetchEmployeeIds();
  }, []);

  // Fetch leave data for selected employee
  const handleFetchReport = async () => {
    if (!userId) {
      setError('Please select an Employee ID.');
      setReportData([]);
      setFilteredData([]);
      setEmployeeDetails({});
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await getLeaveReportByEmployeeId(userId);

      // Keep only approved leaves
      const approvedLeaves = data.filter((l) => l.status === 'APPROVED');

      setReportData(approvedLeaves);
      setFilteredData(approvedLeaves);

      const emp = employeeIds.find((e) => e.id === userId);
      if (emp) setEmployeeDetails(emp);
      else setEmployeeDetails({});
    } catch {
      setError('Failed to fetch leave report.');
      setReportData([]);
      setFilteredData([]);
      setEmployeeDetails({});
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by date range when fromDate/toDate or reportData changes
  useEffect(() => {
    if (!fromDate && !toDate) {
      setFilteredData(reportData);
      return;
    }
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = reportData.filter((leave) => {
      const leaveStart = new Date(leave.fromDate || leave.shortLeaveDate);
      const leaveEnd = new Date(leave.toDate || leave.shortLeaveDate);

      if (from && to) {
        return leaveEnd >= from && leaveStart <= to;
      } else if (from) {
        return leaveEnd >= from;
      } else if (to) {
        return leaveStart <= to;
      }
      return true;
    });

    setFilteredData(filtered);
  }, [fromDate, toDate, reportData]);

  // Memoize summary calculation
  const summary = useMemo(() => calculateSummary(filteredData), [filteredData]);

  // Export helpers
  const exportToExcel = () => {
    if (!filteredData.length) return;
    const exportData = filteredData.map((leave) => ({
      'Leave Type': leave.leaveType,
      From: formatDate(leave.fromDate || leave.shortLeaveDate),
      To: formatDate(leave.toDate || leave.shortLeaveDate),
      Purpose: leave.purpose,
      Days: leave.numberOfDays || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Report');
    XLSX.writeFile(workbook, `LeaveReport_${userId}.xlsx`);
  };

  const exportToCSV = () => {
    if (!filteredData.length) return;
    const exportData = filteredData.map((leave) => ({
      'Leave Type': leave.leaveType,
      From: formatDate(leave.fromDate || leave.shortLeaveDate),
      To: formatDate(leave.toDate || leave.shortLeaveDate),
      Purpose: leave.purpose,
      Days: leave.numberOfDays || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `LeaveReport_${userId}.csv`);
  };

  return (
    <div
      className="container mt-5"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: '900px',
      }}
    >
      <h3
        className="text-center"
        style={{ color: '#800000', marginBottom: '30px', fontWeight: '700' }}
      >
        Employee Leave Report
      </h3>

      {/* Controls */}
      <div className="d-flex flex-wrap gap-3 mb-3 align-items-center">
        <select
          aria-label="Select Employee"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="form-select"
          style={{ maxWidth: '320px' }}
          disabled={isLoading}
        >
          <option value="">Select Employee</option>
          {employeeIds.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} ({e.id})
            </option>
          ))}
        </select>

        <input
          type="date"
          aria-label="From Date"
          className="form-control"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ maxWidth: '150px' }}
          disabled={isLoading}
        />
        <input
          type="date"
          aria-label="To Date"
          className="form-control"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ maxWidth: '150px' }}
          disabled={isLoading}
        />

        <button
          className="btn btn-primary"
          onClick={handleFetchReport}
          disabled={isLoading}
          aria-label="Load Leave Report"
        >
          {isLoading ? 'Loading...' : 'Load Report'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Employee Info */}
      {employeeDetails && employeeDetails.id && (
        <EmployeeDetails employee={employeeDetails} />
      )}

      {/* Export Buttons */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        <button
          onClick={exportToExcel}
          className="btn btn-success"
          disabled={!filteredData.length}
          title="Export report as Excel"
        >
          Export Excel
        </button>
        <button
          onClick={exportToCSV}
          className="btn btn-info"
          disabled={!filteredData.length}
          title="Export report as CSV"
        >
          Export CSV
        </button>

        <button
          onClick={() => exportToPDF(filteredData, employeeDetails, fromDate, toDate)}
          className="btn btn-danger"
          disabled={!filteredData.length}
          title="Export report as PDF"
        >
          Download PDF
        </button>
      </div>

      {/* Report Duration Display */}
      {(fromDate || toDate) && (
        <div className="mb-2 fst-italic" style={{ color: '#555' }}>
          Report duration: {fromDate ? formatDate(fromDate) : '-'} to{' '}
          {toDate ? formatDate(toDate) : '-'}
        </div>
      )}

      {/* Leave Table */}
      {filteredData.length > 0 ? (
        <table className="table table-bordered" style={{ fontSize: '14px' }}>
          <thead className="table-light">
            <tr>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Purpose</th>
              <th>Number of Days</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((leave, i) => (
              <LeaveTableRow key={i} leave={leave} />
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-end fw-bold">
                Total Leave Days
              </td>
              <td>{formatDays(summary.totalDays)}</td>
            </tr>
           
            <tr>
              <td colSpan="4" className="text-end fw-bold text-danger">
                No Pay Days
              </td>
              <td className="text-danger">{formatDays(summary.noPay)}</td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div>No leave records found.</div>
      )}
    </div>
  );
};

export default EmployeeLeaveReport;
