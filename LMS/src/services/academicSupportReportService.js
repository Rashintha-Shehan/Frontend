// src/services/academicSupportReportService.js
import api from '../component/api'; // Assuming 'api' is your configured axios instance with baseURL: '/api'

const normalize = (val) => (val || '').trim().toLowerCase();

/**
 * Fetches leave report data for Academic Support staff within a given date range.
 * Assumes the backend API /api/admin/report/date-range returns List<LeaveReportItemDTO>.
 * Each LeaveReportItemDTO should contain flattened user details like employeeId, name,
 * jobTitle, staffCategory, and typeOfRegistration.
 *
 * @param {string} startDate - The start date in 'YYYY-MM-DD' format.
 * @param {string} endDate - The end date in 'YYYY-MM-DD' format.
 * @returns {Promise<Array>} A promise that resolves to an array of filtered LeaveReportItemDTOs for academic support staff.
 */
export const getAcademicSupportLeaveReportByDateRange = async (startDate, endDate) => {
  try {
    // Corrected path: api.baseURL is '/api', so we append '/admin/report/date-range'
    const res = await api.get(`/admin/report/date-range?start=${startDate}&end=${endDate}`);
    const allLeaveRecords = res.data || [];

    // Filter for only 'Academic Support' staff based on the 'staffCategory'
    // or 'typeOfRegistration' fields in the LeaveReportItemDTO.
    const academicSupportRecords = allLeaveRecords.filter(
      (lr) => normalize(lr.staffCategory) === 'academic support' || normalize(lr.typeOfRegistration) === 'academic support'
    );
    
    return academicSupportRecords;
  } catch (error) {
    console.error('Error fetching academic support leave report:', error);
    throw error; // Re-throw to be handled by the component
  }
};
