import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../component/api";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import { FaUserShield, FaUndo, FaTrash, FaMoon, FaSun, FaFilePdf, FaPrint, FaPlay, FaCog } from "react-icons/fa";
import UniversityLogo from "../assets/images/uop.png";
import CEITLogo from "../assets/images/ceit.png";
import AuditLogPanel from "./AuditLogPanel";
import GuidedTour from "../components/GuidedTour";
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { isTokenExpired } from '../component/api';

const PRIMARY_COLOR = "#993333";
const PRIMARY = "#800000";       // Maroon
const DARK_PRIMARY = "#4b0000";  // Dark Maroon
const GOLD = "#d4af37";          // Gold
const LIGHT_GOLD = "#f5deb3";    // Light Gold

const FACULTIES = [
  "Faculty of Agriculture",
  "Faculty of Allied Health Sciences",
  "Faculty of Arts",
  "Faculty of Dental",
  "Faculty of Engineering",
  "Faculty of Management",
  "Faculty of Medicine",
  "Faculty of Science",
  "Faculty of Veterinary Medicine and Science",
  "Center for Quality Assurance",
  "Financial Administration",
  "Information Technology Center",
  "Internal Audit Division",
  "Library",
  "Senate House",
  "Test faculty",
];
const departmentsByFaculty = {
  "Faculty of Agriculture": [
    "Agricultural Biology",
    "Agricultural Economics & Business Management",
    "Agricultural Engineering",
    "Agricultural Extension",
    "Animal Science",
    "Crop Science",
    "Food Science & Technology",
    "Soil Science",
  ],
  "Faculty of Allied Health Sciences": [
    "Medical Laboratory Science",
    "Nursing",
    "Physiotherapy",
    "Radiography/Radiotherapy",
    "Pharmacy",
    "Basic Sciences",
  ],
  "Faculty of Arts": [
    "Arabic & Islamic Civilization",
    "Archaeology",
    "Classical Languages",
    "Economics & Statistics",
    "Education",
    "English",
    "English Language Teaching",
    "Fine Arts",
    "Geography",
    "History",
    "Information Technology",
    "Law",
    "Philosophy",
    "Psychology",
    "Political Science",
    "Pali & Buddhist Studies",
    "Sinhala",
    "Sociology",
    "Tamil",
  ],
  "Faculty of Dental": [
    "Basic Sciences",
    "Community Dental Health",
    "Comprehensive Oral Health Care",
    "Oral Medicine & Periodontology",
    "Oral Pathology",
    "Prosthetic Dentistry",
    "Restorative Dentistry",
    "Oral & Maxillofacial Surgery",
  ],
  "Faculty of Engineering": [
    "Chemical & Process Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Electrical & Electronic Engineering",
    "Engineering Management",
    "Engineering Mathematics",
    "Mechanical Engineering",
    "Manufacturing & Industrial Engineering",
  ],
  "Faculty of Management": [
    "Business Finance",
    "Human Resource Management",
    "Management Studies",
    "Marketing Management",
    "Operations Management",
  ],
  "Faculty of Medicine": [
    "Anatomy",
    "Anaesthesiology and Critical Care",
    "Biochemistry",
    "Community Medicine",
    "Family Medicine",
    "Forensic Medicine",
    "Medical Education",
    "Medicine",
    "Microbiology",
    "Obstetrics & Gynecology",
    "Paediatrics",
    "Parasitology",
    "Pathology",
    "Pharmacology",
    "Physiology",
    "Psychiatry",
    "Radiology",
    "Surgery",
  ],
  "Faculty of Science": [
    "Botany",
    "Chemistry",
    "Environmental & Industrial Sciences",
    "Geology",
    "Mathematics",
    "Molecular Biology & Biotechnology",
    "Physics",
    "Statistics & Computer Science",
    "Zoology",
  ],
  "Faculty of Veterinary Medicine and Science": [
    "Basic Veterinary Sciences",
    "Farm Animal Production & Health",
    "Veterinary Clinical Sciences",
    "Veterinary Pathobiology",
    "Veterinary Public Health & Pharmacology",
  ],
  "Information Technology Center": [
    "ITC", // Single department for ITC since it doesn't have multiple departments
  ],
};

const PAGE_SIZE = 6; // Users per page

const RoleBadge = ({ role }) => {
  const badgeColors = {
    USER: "bg-secondary",
    STAFF: "bg-secondary",
    ADMIN: "bg-primary",
    SYS_ADMIN: "bg-warning text-dark",
  };
  return (
    <span className={`badge ${badgeColors[role] || "bg-dark"} ms-2`}>
      {role}
    </span>
  );
};

// Mock audit logs data

export default function SysAdminDashboard() {
  const navigate = useNavigate();
  // States
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterFaculty, setFilterFaculty] = useState("ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterUserId, setFilterUserId] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterAccountType, setFilterAccountType] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [facultySelections, setFacultySelections] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  // Ref for printing
  const printRef = useRef();

  // Fetch users on mount
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      navigate('/login');
      return;
    }
    fetchUsers();
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized admin map
  const adminsByFacultyDepartment = useMemo(() => {
    return users.reduce((acc, u) => {
      if (u.role === "ADMIN" && u.faculty && u.department) {
        const key = `${u.faculty}||${u.department}`;
        acc[key] = u;
      }
      return acc;
    }, {});
  }, [users]);

  const DEPARTMENTS = useMemo(() => {
    if (filterFaculty === "ALL") {
      // Combine all departments from all faculties into one sorted array without duplicates
      const allDepsSet = new Set();
      Object.values(departmentsByFaculty).forEach((depList) => {
        depList.forEach((dep) => allDepsSet.add(dep));
      });
      return Array.from(allDepsSet).sort();
    } else {
      // Return the department list from the static mapping for the selected faculty
      return departmentsByFaculty[filterFaculty] || [];
    }
  }, [filterFaculty]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleMatch = filterRole === "ALL" || u.role === filterRole;
      const facultyMatch = filterFaculty === "ALL" || u.faculty === filterFaculty;
      const departmentMatch = filterDepartment === "ALL" || u.department === filterDepartment;
      const userIdMatch = !filterUserId || u.id.toString().includes(filterUserId);
      const keywordMatch =
        !searchKeyword ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        u.email.toLowerCase().includes(searchKeyword.toLowerCase());
      const accountTypeMatch = filterAccountType === "ALL" || 
        (filterAccountType === "GOOGLE" && u.id.startsWith("GOOGLE_")) ||
        (filterAccountType === "REGULAR" && !u.id.startsWith("GOOGLE_"));
      return roleMatch && facultyMatch && departmentMatch && userIdMatch && keywordMatch && accountTypeMatch;
    });
  }, [users, filterRole, filterFaculty, filterDepartment, filterUserId, searchKeyword, filterAccountType]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Assign / remove admin, delete user functions (same as before)
  const assignAdminRole = async (userId, faculty, department) => {
    if (!faculty || faculty === "ALL") {
      return toast.error("Please select a faculty from the filter above to assign admin.");
    }

    if (!department || department === "ALL") {
      return toast.error("Please select a department from the filter above to assign admin.");
    }

    const existingAdmin = adminsByFacultyDepartment[`${faculty}||${department}`];
    if (existingAdmin && existingAdmin.id !== userId) {
      const confirmReplace = window.confirm(
        `Department "${department}" in "${faculty}" already has an admin (${existingAdmin.firstName} ${existingAdmin.lastName}). Replace?`
      );
      if (!confirmReplace) return;
    }

    try {
      await api.put(`/users/${userId}/assign-admin`, { faculty, department });
      toast.success("Admin role assigned successfully.");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "Failed to assign admin role.");
    }
  };

  const removeAdminRole = async (userId) => {
    if (!window.confirm("Remove admin role from this user?")) return;
    try {
      await api.put(`/users/${userId}/remove-admin`);
      toast.success("Admin role removed successfully.");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || "Failed to remove admin role.");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted.");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  // CSV headers
  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Faculty", key: "faculty" },
    { label: "Department", key: "department" },
    { label: "Job Title", key: "jobTitle" },
    { label: "Role", key: "role" },
  ];

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  // PDF export handler
  const exportPDF = () => {
    const input = printRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("users_report.pdf");
    });
  };

  // Analytics widgets: user counts
  const totalUsers = users.length;
  const totalStaff = users.filter((u) => u.role === "STAFF").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalSysAdmins = users.filter((u) => u.role === "SYS_ADMIN").length;

  // Faculty-wise user counts
  const facultyCounts = useMemo(() => {
    const counts = {};
    FACULTIES.forEach((f) => {
      counts[f] = users.filter((u) => u.faculty === f).length;
    });
    return counts;
  }, [users]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // User card render
  const renderUserCard = (user) => {
    const existingAdmin = (filterFaculty !== "ALL" && filterDepartment !== "ALL")
      ? adminsByFacultyDepartment[`${filterFaculty}||${filterDepartment}`]
      : null;

    return (
      <div key={user.id} className="col">
        <div
          className="card shadow-sm h-100"
          style={{
            borderRadius: 12,
            borderColor: PRIMARY_COLOR,
            backgroundColor: darkMode ? "#222" : "white",
            color: darkMode ? "#eee" : "inherit",
          }}
        >
          <div className="card-body d-flex gap-4" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
            <div>
              {user.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="rounded-circle border"
                  style={{
                    height: isMobile ? 60 : 72,
                    width: isMobile ? 60 : 72,
                    objectFit: "cover",
                    borderColor: PRIMARY_COLOR,
                    borderWidth: 2,
                    borderStyle: "solid",
                  }}
                />
              ) : (
                <div
                  className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ 
                    height: isMobile ? 60 : 72, 
                    width: isMobile ? 60 : 72, 
                    fontSize: isMobile ? "1.25rem" : "1.5rem" 
                  }}
                >
                  N/A
                </div>
              )}
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-between" style={{ textAlign: isMobile ? 'center' : 'left', width: '100%' }}>
              <div>
                <h5 className="mb-1" style={{ 
                  color: PRIMARY_COLOR,
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  lineHeight: 1.2
                }}>
                  {user.firstName} {user.lastName}
                  <RoleBadge role={user.role} />
                  {user.id.startsWith("GOOGLE_") && (
                    <span className="badge bg-info ms-2" title="Google Account">
                      <i className="fab fa-google me-1"></i>Google
                    </span>
                  )}
                </h5>
                <p className="mb-1 text-muted" style={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  wordBreak: 'break-word'
                }}>
                  {user.email}
                </p>
                <p className="mb-1 small" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                  <strong>Faculty:</strong> {user.faculty || "—"}
                  {user.faculty !== 'Information Technology Center' && (
                    <>
                      <br />
                      <strong>Department:</strong> {user.department || "—"}
                    </>
                  )}
                </p>
                <p className="mb-1 small" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                  <strong>Job:</strong> {user.jobTitle || "—"} | <strong>Mobile:</strong> {user.mobile || "—"}
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3 align-items-center" style={{ justifyContent: isMobile ? 'center' : 'flex-start' }}>
                {user.role === "STAFF" && (
                  <>
                    {(filterFaculty === "ALL" || filterDepartment === "ALL") && (
                      <div className="text-muted small" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem', textAlign: 'center' }}>
                        Please select both Faculty and Department filters above to assign admin.
                      </div>
                    )}
                    {filterFaculty !== "ALL" && filterDepartment !== "ALL" && existingAdmin && existingAdmin.id !== user.id && (
                      <div
                        className="small mt-1"
                        style={{
                          maxWidth: isMobile ? '100%' : 300,
                          color: "#800000", // Maroon text
                          backgroundColor: darkMode ? "#4b0000" : "#f8d7da", // Dark maroon bg for dark mode, light pinkish for light mode
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontWeight: "600",
                          boxShadow: darkMode ? "0 0 6px #800000" : "none",
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          textAlign: 'center'
                        }}
                      >
                        Warning: Department of "{filterDepartment}" already has admin <strong>{existingAdmin.firstName} {existingAdmin.lastName}</strong>. Assigning will replace them.
                      </div>
                    )}
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => assignAdminRole(user.id, filterFaculty, filterDepartment)}
                      disabled={filterFaculty === "ALL" || filterDepartment === "ALL"}
                      style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      <FaUserShield className="me-1" /> Assign
                    </button>
                  </>
                )}

                {user.role === "ADMIN" && (
                  <button 
                    className="btn btn-sm btn-outline-warning" 
                    onClick={() => removeAdminRole(user.id)}
                    style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    <FaUndo className="me-1" /> Remove Admin
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => deleteUser(user.id)}
                  style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                >
                  <FaTrash className="me-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pagination buttons
  const Pagination = () => (
    <nav aria-label="Page navigation" className="my-3">
      <ul className="pagination justify-content-center" style={{ flexWrap: 'wrap' }}>
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button 
            className="page-link" 
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            {isMobile ? 'Prev' : 'Previous'}
          </button>
        </li>
        {[...Array(totalPages).keys()].map((n) => (
          <li key={n + 1} className={`page-item ${currentPage === n + 1 ? "active" : ""}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(n + 1)}
              style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {n + 1}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button 
            className="page-link" 
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container py-4" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <header
          className="dashboard-header"
          style={{
            backgroundColor: darkMode ? "#222" : "#fff",
            color: darkMode ? "#eee" : "inherit",
            padding: "1rem 2rem",
            borderBottom: `2px solid ${PRIMARY_COLOR}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "1rem",
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '1rem' : '0'
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <img src={UniversityLogo} alt="University Logo" style={{ height: isMobile ? 40 : 60 }} />
            <h1 className="mb-0" style={{ 
              color: PRIMARY_COLOR, 
              fontWeight: "700", 
              fontSize: isMobile ? "1.5rem" : "2rem",
              lineHeight: 1.2
            }}>
              {isMobile ? 'SysAdmin' : 'System Admin Dashboard'}
            </h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            
            {/* Start Tutorial Button */}
            <button
              onClick={() => setShowGuidedTour(true)}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #800000, #A52A2A)',
                color: '#FFD700',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              title="Start Interactive Tutorial"
            >
              <FaPlay />
              {!isMobile && 'Tutorial'}
            </button>
            
            <img src={CEITLogo} alt="CEIT Logo" style={{ height: isMobile ? 40 : 60 }} />
          </div>
        </header>

        {/* Filters + Export + Print */}
        <section
          className="p-4 mb-4 rounded shadow-sm"
          style={{ backgroundColor: darkMode ? "#333" : "#f8f9fa" }}
        >
          <h4 style={{ color: PRIMARY_COLOR, fontWeight: "600" }}>Filter & Export</h4>
          <div className="row gy-3 gx-3 align-items-end">
            <div className={isMobile ? "col-6" : "col-md-2"}>
              <label className="form-label fw-semibold">Role</label>
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ borderColor: PRIMARY_COLOR }}
              >
                <option value="ALL">All</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
                <option value="SYS_ADMIN">System Admin</option>
              </select>
            </div>

            <div className={isMobile ? "col-6" : "col-md-3"}>
              <label className="form-label fw-semibold">Faculty</label>
              <select
                className="form-select"
                value={filterFaculty}
                onChange={(e) => {
                  setFilterFaculty(e.target.value);
                  setFilterDepartment("ALL"); // reset department when faculty changes
                }}
                style={{ borderColor: PRIMARY_COLOR }}
              >
                <option value="ALL">All</option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Insert the Department filter here */}
            <div className={isMobile ? "col-6" : "col-md-3"}>
              <label className="form-label fw-semibold">Department</label>
              <select
                className="form-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{ borderColor: PRIMARY_COLOR }}
                disabled={filterFaculty === "ALL"}
              >
                <option value="ALL">All</option>
                {DEPARTMENTS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className={isMobile ? "col-6" : "col-md-2"}>
              <label className="form-label fw-semibold">Account Type</label>
              <select
                className="form-select"
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value)}
                style={{ borderColor: PRIMARY_COLOR }}
              >
                <option value="ALL">All</option>
                <option value="REGULAR">Regular</option>
                <option value="GOOGLE">Google</option>
              </select>
            </div>

            <div className={isMobile ? "col-12" : "col-md-2"}>
              <label className="form-label fw-semibold">Search by Name</label>
              <input
                className="form-control"
                placeholder="User ID or Name"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ borderColor: PRIMARY_COLOR }}
              />
            </div>

            {/* Export and Print buttons follow */}
            <div className={isMobile ? "col-12" : "col-md-4"} style={{ display: 'flex', gap: '0.5rem', justifyContent: isMobile ? 'center' : 'flex-end' }}>
              <button className="btn btn-sm btn-outline-primary" onClick={exportPDF}>
                <FaFilePdf className="me-1" /> PDF
              </button>
              <CSVLink data={filteredUsers} headers={csvHeaders} filename="users_export.csv">
                <button className="btn btn-sm btn-outline-success">
                  CSV
                </button>
              </CSVLink>
              <button className="btn btn-sm btn-outline-secondary" onClick={handlePrint}>
                <FaPrint className="me-1" /> Print
              </button>
            </div>
          </div>
        </section>

        {/* Analytics Widgets */}
        <section
          className="mb-4 p-3 rounded shadow-sm"
          style={{
            backgroundColor: darkMode ? "#222" : "#fff",
            color: darkMode ? "#eee" : "inherit",
          }}
        >
          <h4 style={{ color: PRIMARY_COLOR, fontWeight: "600" }}>Dashboard Analytics</h4>
          <div className="row text-center">
            <div className={isMobile ? "col-6" : "col-md-3"} style={{ marginBottom: isMobile ? "1rem" : "0" }}>
              <div
                className="p-3 rounded shadow-sm"
                style={{ backgroundColor: PRIMARY, color: "#fff" }}
              >
                <h5 style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>{totalUsers}</h5>
                <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", margin: 0 }}>Total Users</p>
              </div>
            </div>
            <div className={isMobile ? "col-6" : "col-md-3"} style={{ marginBottom: isMobile ? "1rem" : "0" }}>
              <div
                className="p-3 rounded shadow-sm"
                style={{ backgroundColor: GOLD, color: "#000" }}
              >
                <h5 style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>{totalStaff}</h5>
                <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", margin: 0 }}>Staff</p>
              </div>
            </div>
            <div className={isMobile ? "col-6" : "col-md-3"} style={{ marginBottom: isMobile ? "1rem" : "0" }}>
              <div
                className="p-3 rounded shadow-sm"
                style={{ backgroundColor: DARK_PRIMARY, color: "#fff" }}
              >
                <h5 style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>{totalAdmins}</h5>
                <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", margin: 0 }}>Admins</p>
              </div>
            </div>
            <div className={isMobile ? "col-6" : "col-md-3"} style={{ marginBottom: isMobile ? "1rem" : "0" }}>
              <div
                className="p-3 rounded shadow-sm"
                style={{ backgroundColor: LIGHT_GOLD, color: PRIMARY }}
              >
                <h5 style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>{totalSysAdmins}</h5>
                <p style={{ fontSize: isMobile ? "0.875rem" : "1rem", margin: 0 }}>System Admins</p>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Log Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <button
            className={`btn btn-sm ${showAuditLog ? "btn-secondary" : "btn-outline-secondary"}`}
            onClick={() => setShowAuditLog((prev) => !prev)}
            style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
          >
            {showAuditLog ? (isMobile ? "Hide Logs" : "Hide Audit Logs") : (isMobile ? "Show Logs" : "Show Audit Logs")}
          </button>
        </div>

        {/* Audit Logs Panel */}
        {showAuditLog && <AuditLogPanel darkMode={darkMode} />}

        {/* Users List */}
        <section ref={printRef}>
          {loading ? (
            <p className="text-center" style={{ color: PRIMARY_COLOR }}>
              Loading users...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-muted">No users found.</p>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-md-2 g-4" style={{ margin: 0 }}>
                {paginatedUsers.map(renderUserCard)}
              </div>
              <Pagination />
            </>
          )}
        </section>

        {/* Add logout button at the top right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-md)' }}>
          <button className="btn btn-primary" onClick={handleLogout} style={{ fontSize: 'var(--font-size-md)', borderRadius: '8px' }}>Logout</button>
        </div>
      </div>

      {/* Guided Tour */}
      <GuidedTour 
        isVisible={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
        userRole="SYS_ADMIN"
      />
    </div>
  );
}     