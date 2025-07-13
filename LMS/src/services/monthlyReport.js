import api from '../component/api';

export const getMonthlyLeaveReport = async (month, year) => {
  try {
    const response = await api.get(`/leaves/admin/report/monthly/${month}/${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly leave report:', error);
    throw error;
  }
};
 export const getLeaveReportByDateRange = async (startDate, endDate) => {
  const response = await api.get(`/leaves/admin/report/date-range?start=${startDate}&end=${endDate}`);
  return response.data;
};
