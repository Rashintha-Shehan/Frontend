import api from '../component/api';

export const getAllEmployeeIds = async () => {
  try {
    const response = await api.get('/leaves/admin/users/employees'); // no /api/api
    const employees = response.data.users; // ✅ Access correct array field

    if (!Array.isArray(employees)) {
      throw new Error('Response does not contain a valid user array');
    }

    return employees;
  } catch (error) {
    console.error('Error fetching employee IDs:', error);
    throw error;
  }
};


export const getLeaveReportByEmployeeId = async (userId) => {
  try {
    const response = await api.get(`/leaves/admin/report/employee/${userId}`); // Corrected path
    return response.data;
  } catch (error) {
    console.error('Error fetching employee leave report:', error);
    throw error;
  }
};

