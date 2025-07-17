import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../component/api";

const AuditLogPanel = ({ darkMode = false }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await api.get("/audit-logs"); // your backend endpoint
        setAuditLogs(response.data || []);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setError("Failed to load audit logs. Please try again later.");
        toast.error("Could not fetch audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  if (loading) {
    return (
      <div
        className={`p-4 rounded shadow ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900"
        } flex justify-center items-center`}
        style={{ height: 150 }}
      >
        <div className="spinner-border text-maroon" role="status" />
        <span className="ml-2">Loading audit logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded shadow ${
          darkMode ? "bg-gray-900 text-red-400" : "bg-white text-red-600"
        } text-center font-medium`}
      >
        <i className="fas fa-exclamation-circle mr-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded shadow ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900"
      }`}
      style={{ maxHeight: 400, overflowY: "auto" }}
    >
      <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className={darkMode ? "bg-gray-700" : "bg-gray-200"}>
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Action</th>
              <th className="border px-4 py-2">Performed By</th>
              <th className="border px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length > 0 ? (
              auditLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className={`hover:bg-gray-100 ${
                    darkMode
                      ? index % 2 === 0
                        ? "bg-gray-800"
                        : "bg-gray-900"
                      : ""
                  }`}
                >
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{log.action}</td>
                  <td className="border px-4 py-2">{log.performedBy}</td>
                  <td className="border px-4 py-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-4 text-gray-500 italic"
                >
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
