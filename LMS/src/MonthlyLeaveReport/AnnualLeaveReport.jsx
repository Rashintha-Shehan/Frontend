import React, { useEffect, useState, useRef } from 'react';
import api from '../component/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllEmployeeIds } from '../services/leaveService';

const ANNUAL_START = `${new Date().getFullYear()}-01-01`;
const ANNUAL_END = `${new Date().getFullYear()}-12-31`;

const englishHeaders = [
  'Month', 'Casual', 'Sick', 'Half Day', 'Short Leave (Count)', 'Duty', 'Vacation', 'Total (Excl. Short Leave)'
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const leaveTypes = ['CASUAL', 'SICK', 'HALF DAY', 'SHORT LEAVE', 'DUTY', 'VACATION'];

const AnnualLeaveReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employeeIds, setEmployeeIds] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    fetchEmployeeIds();
  }, []);

  useEffect(() => {
    if (selectedEmployee) fetchAnnualData(selectedEmployee);
  }, [selectedEmployee]);

  const fetchEmployeeIds = async () => {
    try {
      const ids = await getAllEmployeeIds();
      setEmployeeIds(ids);
    } catch {
      setError('Failed to load employee list.');
    }
  };

  const fetchAnnualData = async (empId) => {
    setLoading(true);
    setError('');
    setEmployeeDetails(null);
    try {
      const res = await api.get(`/leaves/admin/report/date-range?start=${ANNUAL_START}&end=${ANNUAL_END}`);
      const all = res.data || [];
      const filtered = all.filter(lr => lr.user && lr.user.id === empId);
      setData(filtered);
      const emp = employeeIds.find(e => e.id === empId);
      setEmployeeDetails(emp || null);
    } catch (err) {
      setError('Failed to fetch annual report data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate data by month and leave type for the selected employee
  const tableData = months.map((month, idx) => {
    const monthNum = idx + 1;
    const leaves = data.filter(lr => {
      const d = lr.fromDate || lr.shortLeaveDate;
      if (!d) return false;
      return new Date(d).getMonth() + 1 === monthNum;
    });
    // Count by leave type
    const counts = {
      CASUAL: 0,
      SICK: 0,
      'HALF DAY': 0,
      'SHORT LEAVE': 0,
      DUTY: 0,
      VACATION: 0,
      TOTAL: 0
    };
    leaves.forEach(lr => {
      const type = (lr.leaveType || '').toUpperCase();
      if (type.includes('SHORT')) {
        counts['SHORT LEAVE'] += 1;
        // Do NOT add to TOTAL
      } else if (type.includes('HALF')) {
        counts['HALF DAY'] += 1;
        counts.TOTAL += 1;
      } else if (type.includes('CASUAL')) {
        counts.CASUAL += 1;
        counts.TOTAL += 1;
      } else if (type.includes('SICK')) {
        counts.SICK += 1;
        counts.TOTAL += 1;
      } else if (type.includes('DUTY')) {
        counts.DUTY += 1;
        counts.TOTAL += 1;
      } else if (type.includes('VACATION')) {
        counts.VACATION += 1;
        counts.TOTAL += 1;
      }
    });
    return [month, counts.CASUAL, counts.SICK, counts['HALF DAY'], counts['SHORT LEAVE'], counts.DUTY, counts.VACATION, counts.TOTAL];
  });

  // Table footer (total)
  const totalRow = ['Total'];
  for (let i = 1; i < englishHeaders.length; i++) {
    let sum = 0;
    tableData.forEach(row => {
      const val = parseInt(row[i], 10);
      if (!isNaN(val)) sum += val;
    });
    totalRow.push(sum);
  }

  // Format value for table cell
  const formatCell = (val) => (val === 0 ? '-' : val);

  // Header/footer for PDF/print (with logos)
  const getImageDataAndSize = (url, targetHeight = 32) => {
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
  };

  const exportToPDF = async () => {
    try {
      const logoTargetHeight = 22;
      const leftLogo = await getImageDataAndSize('/uop.png', logoTargetHeight);
      const rightLogo = await getImageDataAndSize('/ceit.png', logoTargetHeight);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const headerHeight = 38;
      const footerHeight = 38;
      function drawHeaderFooter(data) {
        let y = margin + 2;
        doc.addImage(leftLogo.base64, 'PNG', margin, y, leftLogo.width, leftLogo.height);
        doc.addImage(rightLogo.base64, 'PNG', pageWidth - margin - rightLogo.width, y, rightLogo.width, rightLogo.height);
        let textY = y + 2;
        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text('Information Technology Center', pageWidth / 2, textY, { align: 'center' });
        textY += 7;
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text('University of Peradeniya', pageWidth / 2, textY, { align: 'center' });
        textY += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text('Annual Leave Report 2023', pageWidth / 2, textY, { align: 'center' });
        textY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0);
        if (employeeDetails) {
          doc.text(`Employee: ${employeeDetails.firstName} ${employeeDetails.lastName} (${employeeDetails.id})`, pageWidth / 2, textY, { align: 'center' });
        }
        doc.setDrawColor(200, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(margin, headerHeight, pageWidth - margin, headerHeight);
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
      autoTable(doc, {
        startY: headerHeight + 24,
        head: [englishHeaders],
        body: [...tableData, totalRow],
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
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        drawHeaderFooter({ pageNumber: i, totalPages: pageCount });
      }
      doc.save('AnnualLeaveReport.pdf');
    } catch (error) {
      alert('Failed to generate PDF. See console for details.');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([englishHeaders, ...tableData, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Annual Report');
    XLSX.writeFile(wb, 'AnnualLeaveReport.xlsx');
  };

  const printReport = () => {
    const content = reportRef.current.innerHTML;
    const original = document.body.innerHTML;
    document.body.innerHTML = `
      <div style="padding:20px; font-family: Arial, sans-serif;">
        <h2 style="text-align:center; color:#800000;">Information Technology Center</h2>
        <h3 style="text-align:center;">University of Peradeniya</h3>
        <h4 style="text-align:center;">Annual Leave Report 2023</h4>
        ${employeeDetails ? `<div style='text-align:center; margin-bottom:10px;'>Employee: ${employeeDetails.firstName} ${employeeDetails.lastName} (${employeeDetails.id})</div>` : ''}
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

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginTop: 16 }}>
      <div className="mb-3">
        <select
          className="form-select"
          value={selectedEmployee}
          onChange={e => setSelectedEmployee(e.target.value)}
          style={{ maxWidth: 320 }}
          disabled={loading}
        >
          <option value="">Select Employee</option>
          {employeeIds.map(e => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} ({e.id})
            </option>
          ))}
        </select>
      </div>
      {employeeDetails && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          backgroundColor: '#f9f9f9',
        }}>
          <img
            src={employeeDetails.image || '/default-profile.png'}
            alt="Employee"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #800000' }}
            onError={e => (e.target.src = '/default-profile.png')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#333' }}>
            <div style={{ fontWeight: '700', fontSize: '18px', color: '#800000' }}>
              {employeeDetails.firstName} {employeeDetails.lastName}
            </div>
            <div><span style={{ fontWeight: '600' }}>Employee ID:</span> {employeeDetails.id}</div>
            <div><span style={{ fontWeight: '600' }}>Email:</span> {employeeDetails.email}</div>
            <div><span style={{ fontWeight: '600' }}>Faculty:</span> {employeeDetails.faculty}</div>
            <div><span style={{ fontWeight: '600' }}>Department:</span> {employeeDetails.department}</div>
            <div><span style={{ fontWeight: '600' }}>Job Title:</span> {employeeDetails.jobTitle}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-outline-primary" onClick={exportToPDF} disabled={!selectedEmployee}>PDF</button>
        <button className="btn btn-outline-success" onClick={exportToExcel} disabled={!selectedEmployee}>Excel</button>
        <button className="btn btn-outline-secondary" onClick={printReport} disabled={!selectedEmployee}>Print</button>
      </div>
      <div ref={reportRef}>
        <table className="table table-bordered" style={{ width: '100%', textAlign: 'center', fontSize: 15 }}>
          <thead>
            <tr>
              {englishHeaders.map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{formatCell(cell)}</td>)}
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', background: '#f5f5f5' }}>
              {totalRow.map((cell, i) => <td key={i}>{formatCell(cell)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}
    </div>
  );
};

export default AnnualLeaveReport; 