import { useEffect, useState } from 'react';
import api from '../component/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export default function AdminReports() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' });

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);

        // Fetch monthly data
        const monthlyRes = await api.get('/leaves/admin/report/monthly');
        console.log('Monthly data response:', monthlyRes.data);
        
        let monthly = [];
        if (monthlyRes.data && typeof monthlyRes.data === 'object') {
          monthly = Object.entries(monthlyRes.data)
            .map(([month, count]) => ({ 
              month: month || 'Unknown', 
              count: parseInt(count) || 0 
            }))
            .filter(item => item.month !== 'Unknown' && item.count >= 0)
            .sort((a, b) => {
              // Sort by month order (January to December)
              const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
              return months.indexOf(a.month) - months.indexOf(b.month);
            });
        }
        setMonthlyData(monthly);

        // Fetch employee data
        const employeeRes = await api.get('/leaves/admin/report/employee');
        console.log('Employee data response:', employeeRes.data);
        
        let employee = [];
        if (employeeRes.data && typeof employeeRes.data === 'object') {
          employee = Object.entries(employeeRes.data)
            .map(([name, count]) => ({ 
              name: name || 'Unknown Employee', 
              count: parseInt(count) || 0 
            }))
            .filter(item => item.name !== 'Unknown Employee' && item.count >= 0)
            .sort((a, b) => b.count - a.count); // Sort by count descending
        }
        setEmployeeData(employee);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Sorting function for employees
  const sortedEmployees = [...employeeData].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    // Sort by count
    return sortConfig.direction === 'asc' ? a.count - b.count : b.count - a.count;
  });

  // Filter by search term
  const filteredEmployees = sortedEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting toggle
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#800000' }}>
            {label}
          </p>
          <p style={{ margin: 0, color: '#666' }}>
            Leave Requests: <span style={{ fontWeight: 'bold', color: '#800000' }}>
              {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading)
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading reports...</p>
      </div>
    );

  if (error)
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );

  return (
    <div className="container py-4">
      <h2
        className="mb-4 text-center"
        style={{
          color: '#800000',
          fontWeight: '700',
          borderBottom: '2px solid #FFD700',
          paddingBottom: 8,
          letterSpacing: 1,
        }}
      >
        Leave Reports Dashboard
      </h2>

      <div className="row">
        {/* Monthly Leave Count - Line Chart */}
        <div className="col-md-6 mb-4">
          <div
            className="p-3 shadow rounded"
            style={{ 
              border: '1px solid #800000', 
              backgroundColor: '#fff',
              minHeight: '400px'
            }}
          >
            <h5 style={{ color: '#800000', fontWeight: '600', marginBottom: '20px' }}>
              Monthly Leave Trend
            </h5>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Leave Requests"
                    stroke="#800000"
                    strokeWidth={3}
                    dot={{ r: 5, stroke: '#FFD700', strokeWidth: 2, fill: '#FFD700' }}
                    activeDot={{ r: 8, stroke: '#800000', strokeWidth: 2, fill: '#FFD700' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                <div className="text-center text-muted">
                  <i className="fas fa-chart-line fa-3x mb-3"></i>
                  <p>No monthly data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employee Leave Count - Searchable, Sortable, Paginated Table */}
        <div className="col-md-6 mb-4">
          <div
            className="p-3 shadow rounded"
            style={{ 
              border: '1px solid #800000', 
              backgroundColor: '#fff', 
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h5 style={{ color: '#800000', fontWeight: '600', marginBottom: '20px' }}>
              Leave Requests by Employee
            </h5>

            {/* Search input */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search employee name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderColor: '#800000' }}
              />
            </div>

            {/* Table Container */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '200px' }}>
              <table className="table table-hover table-sm">
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                  <tr>
                    <th
                      style={{ cursor: 'pointer', color: '#800000', fontWeight: '600' }}
                      onClick={() => requestSort('name')}
                    >
                      Employee Name{' '}
                      {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th
                      style={{ cursor: 'pointer', color: '#800000', fontWeight: '600' }}
                      onClick={() => requestSort('count')}
                      className="text-center"
                    >
                      Leave Requests{' '}
                      {sortConfig.key === 'count' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center text-muted py-4">
                        {searchTerm ? 'No employees found matching your search.' : 'No employee data available.'}
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map(({ name, count }, index) => (
                      <tr key={index}>
                        <td>{name}</td>
                        <td className="text-center">
                          <span className="badge bg-primary">{count}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((num) => (
                    <li
                      key={num}
                      className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
                    >
                      <button className="page-link" onClick={() => setCurrentPage(num + 1)}>
                        {num + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
