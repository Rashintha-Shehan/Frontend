import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from '../component/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllEmployeeIds } from '../services/leaveService';

const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { start, end };
};

const tableHeaders = [
  'Employee Id', 'Name', 'Job Role', 'Casual', 'Sick', 'Half Day', 'Short Leave (Count)', 'Duty', 'Total Approved Leave (Days)', 'No Pay Days'
];

const AcademicSupportMonthlyReport = () => {
  const [employeeIds, setEmployeeIds] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(getCurrentMonthRange().start);
  const [endDate, setEndDate] = useState(getCurrentMonthRange().end);
  const reportRef = useRef();

  useEffect(() => {
    fetchEmployeeIds();
  }, []);

  useEffect(() => {
    if (employeeIds.length > 0) fetchReportData();
    // eslint-disable-next-line
  }, [employeeIds, startDate, endDate]);

  const fetchEmployeeIds = async () => {
    try {
      const ids = await getAllEmployeeIds();
      // Only Academic Support staff
      const filtered = ids.filter(e => (e.typeOfRegistration || e.staffCategory) === 'Academic Support');
      setEmployeeIds(filtered);
    } catch {
      setError('Failed to load employee list.');
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/leaves/admin/report/date-range?start=${startDate}&end=${endDate}`);
      const all = res.data || [];
      // Only Academic Support staff
      const filtered = all.filter(lr => lr.user && (lr.user.typeOfRegistration || lr.user.staffCategory) === 'Academic Support');
      setData(filtered);
    } catch {
      setError('Failed to fetch leave data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate leave data per employee (same as Monthly Report)
  const tableRows = useMemo(() => employeeIds.map(emp => {
    const leaves = data.filter(lr => lr.user && lr.user.id === emp.id && (lr.status || '').toUpperCase() === 'APPROVED');
    let casual = 0, sick = 0, halfDay = 0, shortLeaveCount = 0, duty = 0, total = 0;
    leaves.forEach(lr => {
      const type = (lr.leaveType || '').toUpperCase();
      if (type.includes('CASUAL')) { casual += lr.numberOfDays || 0; total += lr.numberOfDays || 0; }
      else if (type.includes('SICK')) { sick += lr.numberOfDays || 0; total += lr.numberOfDays || 0; }
      else if (type.includes('HALF')) { halfDay += lr.numberOfDays || 0; total += lr.numberOfDays || 0; }
      else if (type.includes('SHORT')) { shortLeaveCount += 1; /* do NOT add to total */ }
      else if (type.includes('DUTY')) { duty += lr.numberOfDays || 0; total += lr.numberOfDays || 0; }
    });
    // No Pay Days logic (same as Monthly Report)
    const noPayDays = total > 2 ? (total - 2).toFixed(2) : '-';
    const format = v => v && v > 0 ? v.toFixed(2) : '-';
    return [
      emp.id,
      `${emp.firstName} ${emp.lastName}`,
      emp.jobTitle,
      format(casual),
      format(sick),
      format(halfDay),
      shortLeaveCount === 0 ? '-' : shortLeaveCount,
      format(duty),
      total > 0 ? total.toFixed(2) : '-',
      noPayDays
    ];
  }), [employeeIds, data]);

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
        doc.text('MONTHLY LEAVE REPORT - Academic Support Staff', pageWidth / 2, textY, { align: 'center' });
        textY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, textY, { align: 'center' });
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
        head: [tableHeaders],
        body: tableRows,
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
      doc.save('AcademicSupportMonthlyReport.pdf');
    } catch (error) {
      alert('Failed to generate PDF. See console for details.');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Academic Support Report');
    XLSX.writeFile(wb, 'AcademicSupportMonthlyReport.xlsx');
  };

  const printReport = () => {
    const content = reportRef.current.innerHTML;
    const original = document.body.innerHTML;
    document.body.innerHTML = `
      <div style="padding:20px; font-family: Arial, sans-serif;">
        <h2 style="text-align:center; color:#800000;">Information Technology Center</h2>
        <h3 style="text-align:center;">University of Peradeniya</h3>
        <h4 style="text-align:center;">MONTHLY LEAVE REPORT - Academic Support Staff</h4>
        <div style='text-align:center; margin-bottom:10px;'>Period: ${startDate} to ${endDate}</div>
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
      <div className="row mb-3 align-items-end">
        <div className="col-md-3">
          <label>Date From</label>
          <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} max={endDate || undefined} />
        </div>
        <div className="col-md-3">
          <label>Date To</label>
          <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || undefined} />
        </div>
        <div className="col-md-3">
          <button onClick={fetchReportData} className="btn btn-primary">Generate Report</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-outline-primary" onClick={exportToPDF}>PDF</button>
        <button className="btn btn-outline-success" onClick={exportToExcel}>Excel</button>
        <button className="btn btn-outline-secondary" onClick={printReport}>Print</button>
      </div>
      <div ref={reportRef}>
        <table className="table table-bordered" style={{ width: '100%', textAlign: 'center', fontSize: 15 }}>
          <thead>
            <tr>
              {tableHeaders.map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}
    </div>
  );
};

export default AcademicSupportMonthlyReport; 