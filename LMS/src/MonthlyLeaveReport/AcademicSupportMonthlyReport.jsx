import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import api from '../component/api'; // Assuming this is your axios instance or similar
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // Not strictly needed for XLSX.writeFile, but good practice if you use saveAs elsewhere
import { getAllEmployeeIds } from '../services/leaveService'; // Assuming this service fetches all employee IDs

// Helper function to get the current month's start and end dates
const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { start, end };
};

// Define table headers for the report
const tableHeaders = [
  'UPF. No', 'Name', 'Designation', 'Casual Leave', 'Sick Leave', 'Short Leave'
];

const AcademicSupportMonthlyReport = () => {
  const [employeeIds, setEmployeeIds] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(getCurrentMonthRange().start);
  const [endDate, setEndDate] = useState(getCurrentMonthRange().end);
  const [reportGenerated, setReportGenerated] = useState(false); // New state to control display
  const reportRef = useRef();

  // Memoized function to fetch all employee IDs and filter for Academic Support staff
  const fetchAcademicSupportEmployeeIds = useCallback(async () => {
    setError(''); // Clear previous errors
    try {
      const ids = await getAllEmployeeIds();
      const filtered = ids.filter(e =>
        (e.typeOfRegistration || '').toUpperCase() === 'ACADEMIC SUPPORT' ||
        (e.staffCategory || '').toUpperCase() === 'ACADEMIC SUPPORT'
      );
      setEmployeeIds(filtered);
      return filtered; // Return filtered IDs for direct use
    } catch (err) {
      console.error("Failed to load employee list:", err);
      setError('Failed to load employee list.');
      return [];
    }
  }, []);

  // Function to fetch leave data for the selected date range and filter
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError('');
    setData([]); // Clear previous data
    setReportGenerated(false); // Hide previous report

    let currentEmployeeIds = employeeIds;
    if (currentEmployeeIds.length === 0) {
      // If employee IDs are not yet loaded, fetch them first
      currentEmployeeIds = await fetchAcademicSupportEmployeeIds();
      if (currentEmployeeIds.length === 0 && error) { // If there was an error fetching IDs, stop
        setLoading(false);
        return;
      }
    }

    if (currentEmployeeIds.length === 0) {
      setError('No Academic Support employee IDs found.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/leaves/admin/report/date-range?start=${startDate}&end=${endDate}`);
      const allLeaveRecords = res.data || [];

      const filteredAcademicSupportLeaves = allLeaveRecords.filter(lr => {
        const isApproved = (lr.status || '').toUpperCase() === 'APPROVED';
        const hasUser = !!lr.user;
        const isAcademicSupport =
          (lr.staffCategory || '').toUpperCase() === 'ACADEMIC SUPPORT' ||
          (lr.user && (lr.user.typeOfRegistration || '').toUpperCase() === 'ACADEMIC SUPPORT') ||
          (lr.user && (lr.user.staffCategory || '').toUpperCase() === 'ACADEMIC SUPPORT');

        return isApproved && hasUser && isAcademicSupport;
      });

      setData(filteredAcademicSupportLeaves);
      setReportGenerated(true); // Show the report
    } catch (err) {
      console.error("Failed to fetch leave data:", err);
      setError('Failed to fetch leave data.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, employeeIds, fetchAcademicSupportEmployeeIds, error]); // Add error to dependency for re-evaluating the current error state

  // No automatic data fetching on date change. It will only happen on button click.
  // We still fetch employee IDs once on mount, as they are a prerequisite for any report.
  useEffect(() => {
    fetchAcademicSupportEmployeeIds();
  }, [fetchAcademicSupportEmployeeIds]);

  // Memoized aggregation of leave data into table rows
  const tableRows = useMemo(() => {
    const aggregatedData = {};

    employeeIds.forEach(emp => {
      aggregatedData[emp.id] = {
        casual: 0,
        sick: 0,
        halfDay: 0,
        shortLeaveCount: 0,
        duty: 0,
        total: 0,
        employee: emp
      };
    });

    data.forEach(lr => {
      const empId = lr.user ? lr.user.id : null;
      if (empId && aggregatedData[empId]) {
        const type = (lr.leaveType || '').toUpperCase();
        if (type.includes('CASUAL')) {
          aggregatedData[empId].casual += lr.numberOfDays || 0;
          aggregatedData[empId].total += lr.numberOfDays || 0;
        } else if (type.includes('SICK')) {
          aggregatedData[empId].sick += lr.numberOfDays || 0;
          aggregatedData[empId].total += lr.numberOfDays || 0;
        } else if (type.includes('HALF')) {
          aggregatedData[empId].halfDay += lr.numberOfDays || 0;
          aggregatedData[empId].total += lr.numberOfDays || 0;
        } else if (type.includes('SHORT')) {
          aggregatedData[empId].shortLeaveCount += 1;
        } else if (type.includes('DUTY')) {
          aggregatedData[empId].duty += lr.numberOfDays || 0;
          aggregatedData[empId].total += lr.numberOfDays || 0;
        }
      }
    });

    const rows = Object.values(aggregatedData).map(agg => {
      const { employee, casual, sick, halfDay, shortLeaveCount, duty, total } = agg;
      const noPayDays = total > 2 ? (total - 2).toFixed(2) : '-';
      const format = v => v && v > 0 ? v.toFixed(2) : '-';

      return [
  employee.id,
  `${employee.firstName} ${employee.lastName}`,
  employee.jobTitle,
  format(casual),
  format(sick),
  shortLeaveCount === 0 ? '-' : shortLeaveCount
];

    });
    return rows;
  }, [employeeIds, data]);

  // Utility to get image data as base64 for PDF embedding
  const getImageDataAndSize = async (url, targetHeight = 32) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new window.Image();
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const width = targetHeight * aspectRatio;
            resolve({ base64: reader.result, width, height: targetHeight });
          };
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Error fetching image ${url}:`, error);
      throw error; // Re-throw to be caught by the PDF function
    }
  };

const exportToPDF = async () => {
  if (!reportGenerated || tableRows.length === 0) {
    alert('Please generate the report first to export to PDF.');
    return;
  }

  try {
    const logoTargetHeight = 22;
    const leftLogo = await getImageDataAndSize('/uop.png', logoTargetHeight);
    const rightLogo = await getImageDataAndSize('/ceit.png', logoTargetHeight);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const headerHeight = 42;
    const footerHeight = 40;

    const selectedHeaders = ['UPF. No', 'Name', 'Designation', 'Casual Leave', 'Sick Leave', 'Short Leave'];
    const filteredTableRows = tableRows.map(row =>
      selectedHeaders.map(header => row[tableHeaders.indexOf(header)])
    );

    const drawHeaderFooter = (pageInfo) => {
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
      doc.text('Director`s Office', pageWidth / 2, textY, { align: 'center' });
      textY += 6;

      doc.setDrawColor(200, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(margin, headerHeight - 2, pageWidth - margin, headerHeight - 2);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0);
      const periodText = `Monthly Leave Record – Academic Support Staff (${startDate} - ${endDate})`;
      doc.text(periodText, pageWidth / 2, headerHeight + 5, { align: 'center' });
      const periodWidth = doc.getTextWidth(periodText);
      doc.setDrawColor(0);
      doc.line((pageWidth - periodWidth) / 2, headerHeight + 6, (pageWidth + periodWidth) / 2, headerHeight + 6);

      // Timestamp
      const timestamp = `Report generated on: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Colombo' })}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(timestamp, pageWidth / 2, headerHeight + 12, { align: 'center' });

      // Address block (left-aligned)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0);
      let addrY = headerHeight + 20;
      const addressLines = [
        'Assistant Registrar,',
        'Academic Establishment Division,',
        'University of Peradeniya.'
      ];
      addressLines.forEach(line => {
        doc.text(line, margin, addrY);
        addrY += 5;
      });

      // Paragraph below the address
      const paragraph = 'This is with reference to your letter dated ___/____/_____ the above matter. The requested Leave Details of Information Technology Center are attached herewith.';
      doc.setFontSize(10);
      const splitParagraph = doc.splitTextToSize(paragraph, pageWidth - 2 * margin);
      doc.text(splitParagraph, margin, addrY + 4);

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
      doc.text('University of Peradeniya,Peradeniya, Sri Lanka', margin, fy);
      doc.text('+94 (0) 81 2392090', pageWidth - margin - 60, fy);
      fy += 4;
      doc.text('Director`s Email: director@ceit.pdn.ac.lk', margin, fy);
      doc.text('Ext: 2900', pageWidth - margin - 60, fy);
      fy += 4;
      doc.text('Email: info@ceit.pdn.ac.lk / info.ceit@gs.pdn.ac.lk', margin, fy);
      doc.text('Web: www.ceit.pdn.ac.lk', pageWidth - margin - 60, fy);

      // Page number
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0);
      const pageLabel = `Page ${pageInfo.pageNumber} of ${pageInfo.totalPages}`;
      doc.text(pageLabel, pageWidth / 2, pageHeight - 6, { align: 'center' });
    };

    autoTable(doc, {
      startY: headerHeight + 55, // adjusted to push below paragraph
      head: [selectedHeaders],
      body: filteredTableRows,
      styles: { fontSize: 10, valign: 'middle', halign: 'center' },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      theme: 'grid',
      margin: { left: margin, right: margin },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.5,
      didDrawPage: function (hookData) {
        drawHeaderFooter({
          pageNumber: doc.internal.getCurrentPageInfo().pageNumber,
          totalPages: doc.internal.getNumberOfPages(),
        });
      },
      pageBreak: 'auto',
    });

    // Add signature space
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('..............................', margin + 20, finalY);
    doc.text('Director,', margin + 20, finalY + 6);
    doc.text('IT Center', margin + 20, finalY + 12);

    doc.save('AcademicSupportMonthlyReport.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Make sure images are accessible and report is generated. See console for details.');
  }
};


  // Export report to Excel
  const exportToExcel = () => {
    if (!reportGenerated || tableRows.length === 0) {
      alert('Please generate the report first to export to Excel.');
      return;
    }
    const ws = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Academic Support Report');
    XLSX.writeFile(wb, 'AcademicSupportMonthlyReport.xlsx');
  };

  // Print the report directly from the browser
  const printReport = () => {
    if (!reportGenerated || tableRows.length === 0) {
      alert('Please generate the report first to print.');
      return;
    }
    const content = reportRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Academic Support Monthly Leave Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h3, h4 { text-align: center; }
            h2 { color: #800000; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            .report-period { text-align: center; margin-bottom: 10px; }
            .report-generated-date { margin-top: 30px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Information Technology Center</h2>
          <h3>University of Peradeniya</h3>
          <h4>MONTHLY LEAVE REPORT - Academic Support Staff</h4>
          <div class="report-period">Period: ${startDate} to ${endDate}</div>
          ${content}
          <div class="report-generated-date">Report Generated: ${new Date().toLocaleDateString()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginTop: 16 }}>
      <div className="row mb-3 align-items-end">
        <div className="col-md-3">
          <label htmlFor="startDate">Date From</label>
          <input
            id="startDate"
            type="date"
            className="form-control"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            max={endDate || undefined}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="endDate">Date To</label>
          <input
            id="endDate"
            type="date"
            className="form-control"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate || undefined}
          />
        </div>
        <div className="col-md-3">
          <button onClick={fetchReportData} className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Export/Print buttons - conditionally displayed */}
      {reportGenerated && tableRows.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
          <button className="btn btn-outline-primary" onClick={exportToPDF}>PDF</button>
          <button className="btn btn-outline-success" onClick={exportToExcel}>Excel</button>
          <button className="btn btn-outline-secondary" onClick={printReport}>Print</button>
        </div>
      )}

      {loading && <div className="text-center mt-3">Loading report data...</div>}
      {error && <div className="alert alert-danger text-center mt-3">{error}</div>}

      {/* Report Table - conditionally displayed */}
      {reportGenerated && !loading && !error && (
        <div ref={reportRef}>
          {tableRows.length > 0 ? (
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
          ) : (
            <div className="text-center p-3 border">
              No Academic Support leave data found for the selected period.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicSupportMonthlyReport;