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
  CartesianGrid,
} from 'recharts';
import { FaChartLine, FaUsers } from 'react-icons/fa';

export default function AdminReports() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortConfig, setSortConfig] = useState({ key: 'count', direction: 'desc' });

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);

        const monthlyRes = await api.get('/leaves/admin/report/monthly');
        const employeeRes = await api.get('/leaves/admin/report/employee');

        const monthOrder = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

        const monthly = Object.entries(monthlyRes.data || {})
          .map(([m,c]) => ({ month: m, count: parseInt(c)||0 }))
          .filter(x=>monthOrder.includes(x.month))
          .sort((a,b)=>monthOrder.indexOf(a.month)-monthOrder.indexOf(b.month));

        const employee = Object.entries(employeeRes.data || {})
          .map(([n,c]) => ({ name: n, count: parseInt(c)||0 }))
          .sort((a,b)=>b.count - a.count);

        setMonthlyData(monthly);
        setEmployeeData(employee);
        setLoading(false);
      } catch(err){
        setError('Failed to load reports.');
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const sortedEmployees = [...employeeData].sort((a,b)=>{
    if(sortConfig.key==='name'){
      return sortConfig.direction==='asc'?a.name.localeCompare(b.name):b.name.localeCompare(a.name);
    }
    return sortConfig.direction==='asc'?a.count-b.count:b.count-a.count;
  });

  const filtered = sortedEmployees.filter(e=>e.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length/itemsPerPage));
  const currentEmployees = filtered.slice((currentPage-1)*itemsPerPage,currentPage*itemsPerPage);

  const requestSort = key => {
    let dir='asc';
    if(sortConfig.key===key && sortConfig.direction==='asc') dir='desc';
    setSortConfig({key,direction:dir});
    setCurrentPage(1);
  };

  const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
    <div style={{background:'#fff',border:'1px solid #ddd',padding:'8px',borderRadius:'6px'}}>
      <strong style={{color:'#800000'}}>{label}</strong>
      <div>Leave Requests: <span style={{color:'#800000',fontWeight:'bold'}}>{payload[0].value}</span></div>
    </div>
  ):null;

  if(loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-warning"></div>
      <p className="text-muted mt-2">Loading reports...</p>
    </div>
  );

  if(error) return <div className="alert alert-danger text-center mt-4">{error}</div>;

  return (
    <div className="container-fluid py-4">
      <h2 className="text-center fw-bold mb-4" style={{color:'#800000',borderBottom:'2px solid #FFD700',paddingBottom:'8px'}}>📊 Leave Reports Dashboard</h2>

      <div className="row g-4">
        {/* Monthly Chart */}
        <div className="col-lg-6">
          <div className="p-4 rounded shadow-sm" style={{background:'#fff',borderLeft:'5px solid #800000'}}>
            <h5 className="fw-bold mb-3 text-maroon"><FaChartLine className="me-2"/>Monthly Leave Trend</h5>
            {monthlyData.length>0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month" angle={-30} textAnchor="end" height={60}/>
                  <YAxis allowDecimals={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend/>
                  <Line type="monotone" dataKey="count" stroke="#800000" strokeWidth={3} dot={{r:5,fill:'#FFD700',stroke:'#800000',strokeWidth:2}}/>
                </LineChart>
              </ResponsiveContainer>
            ):<p className="text-muted text-center py-5">No monthly data available</p>}
          </div>
        </div>

        {/* Employee Table */}
        <div className="col-lg-6">
          <div className="p-4 rounded shadow-sm d-flex flex-column" style={{background:'#fff',borderLeft:'5px solid #800000',minHeight:'400px'}}>
            <h5 className="fw-bold mb-3 text-maroon"><FaUsers className="me-2"/>Leave Requests by Employee</h5>

            <input className="form-control mb-3" placeholder="Search employee..." value={searchTerm} onChange={e=>{setSearchTerm(e.target.value);setCurrentPage(1)}} style={{borderColor:'#800000'}}/>

            <div style={{flex:1,overflowY:'auto'}}>
              <table className="table table-sm table-hover">
                <thead style={{position:'sticky',top:0,background:'#f8f9fa'}}>
                  <tr>
                    <th style={{cursor:'pointer'}} onClick={()=>requestSort('name')}>Name {sortConfig.key==='name'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
                    <th className="text-center" style={{cursor:'pointer'}} onClick={()=>requestSort('count')}>Requests {sortConfig.key==='count'?(sortConfig.direction==='asc'?'▲':'▼'):''}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length? currentEmployees.map((e,i)=>(
                    <tr key={i}>
                      <td>{e.name}</td>
                      <td className="text-center"><span className="badge bg-warning text-dark">{e.count}</span></td>
                    </tr>
                  )):(
                    <tr><td colSpan={2} className="text-center text-muted py-3">{searchTerm?'No match found':'No data'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages>1 && (
              <div className="d-flex justify-content-center mt-2">
                <nav>
                  <ul className="pagination pagination-sm">
                    <li className={`page-item ${currentPage===1?'disabled':''}`}>
                      <button className="page-link" onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>Prev</button>
                    </li>
                    {[...Array(totalPages)].map((_,i)=>(
                      <li key={i} className={`page-item ${currentPage===i+1?'active':''}`}>
                        <button className="page-link" onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage===totalPages?'disabled':''}`}>
                      <button className="page-link" onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}>Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
