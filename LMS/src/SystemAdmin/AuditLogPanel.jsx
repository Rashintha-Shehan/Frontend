import React, { useEffect, useState } from "react";
import axios from "axios";
import api from '../component/api';

const AuditLogPanel = () => {
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
  const fetchAuditLogs = async () => {
    try {
      const response = await api.get("/audit-logs");  // relative path; api already has baseURL
      setAuditLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    }
  };

  fetchAuditLogs();
}, []);


  return (
    <div className="p-4 rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Action</th>
              <th className="border px-4 py-2">Performed By</th>
              <th className="border px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, index) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{log.action}</td>
                <td className="border px-4 py-2">{log.performedBy}</td>
                <td className="border px-4 py-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No audit logs available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogPanel;
