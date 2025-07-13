import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Just import for side effects
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const MonthlyLeaveReportSummary = ({ summary, reportTitle }) => {
  const summaryRef = useRef();

  // Export summary table to Excel
  const exportSummaryToExcel = () => {
    const data = Object.entries(summary.byEmployee).map(([empId, emp]) => ({
      'Employee ID': empId,
      'Name': emp.employeeName,
      'Total Leaves': emp.total,
      'Approved': emp.approved,
      'Rejected': emp.rejected,
      'Pending': emp.pending,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Leave Summary");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), "LeaveSummary.xlsx");
  };

  // Export summary to CSV
  const exportSummaryToCSV = () => {
    const data = Object.entries(summary.byEmployee).map(([empId, emp]) => ({
      'Employee ID': empId,
      'Name': emp.employeeName,
      'Total Leaves': emp.total,
      'Approved': emp.approved,
      'Rejected': emp.rejected,
      'Pending': emp.pending,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "LeaveSummary.csv");
  };

  // Export summary to PDF
  const exportSummaryToPDF = () => {
  try {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(reportTitle || "Employee Leave Summary", 14, 15);

    const tableColumn = ['Employee ID', 'Name', 'Total', 'Approved', 'Rejected', 'Pending'];
    const tableRows = Object.entries(summary.byEmployee).map(([empId, emp]) => [
      empId,
      emp.employeeName,
      emp.total.toString(),
      emp.approved.toString(),
      emp.rejected.toString(),
      emp.pending.toString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [128, 0, 0], textColor: 255 },
    });

    doc.save("LeaveSummary.pdf");
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. See console for details.');
  }
};

  // Print summary table
  const printSummary = () => {
    const content = summaryRef.current.innerHTML;
    const original = document.body.innerHTML;

    document.body.innerHTML = `
      <div style="padding:20px; font-size: 14px;">
        <h2>${reportTitle || "Employee Leave Summary"}</h2>
        ${content}
        <p style="margin-top: 30px;">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    `;

    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  return (
    <div
      ref={summaryRef}
      style={{
        backgroundColor: 'var(--background-color)',
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '6px',
        marginTop: '20px',
      }}
    >
      <h5 style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>Summary</h5>
      <p>Total Leaves: <strong>{summary.totalLeaves}</strong></p>
      <p style={{ color: 'green' }}>Approved: <strong>{summary.approved}</strong></p>
      <p style={{ color: 'red' }}>Rejected: <strong>{summary.rejected}</strong></p>
      <p>Pending: <strong>{summary.pending}</strong></p>

      <hr />
      <h6 style={{ color: 'var(--primary-color)', marginTop: 'var(--space-md)', fontSize: 'var(--font-size-md)' }}>Employee-wise Leave Summary</h6>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        <table className="table table-sm table-bordered mt-md" style={{ fontSize: 'var(--font-size-sm)' }}>
          <thead style={{ backgroundColor: 'var(--primary-color)', color: 'var(--secondary-color)' }}>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Total</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Pending</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.byEmployee).map(([empId, emp]) => (
              <tr key={empId}>
                <td>{empId}</td>
                <td>{emp.employeeName || 'Unknown'}</td>
                <td>{emp.total}</td>
                <td style={{ color: 'green' }}>{emp.approved}</td>
                <td style={{ color: 'red' }}>{emp.rejected}</td>
                <td>{emp.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="btn btn-outline-success btn-sm" onClick={exportSummaryToExcel}>Export Excel</button>
        <button className="btn btn-outline-primary btn-sm" onClick={exportSummaryToCSV}>Export CSV</button>
        <button className="btn btn-outline-danger btn-sm" onClick={exportSummaryToPDF}>Export PDF</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={printSummary}>Print</button>
      </div>
    </div>
  );
};

export default MonthlyLeaveReportSummary;
