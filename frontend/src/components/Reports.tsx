import React, { useEffect, useState } from 'react';
import { getDashboardStats, getEmployeePerformance, getUsageTrends } from '../reports';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsData = await getDashboardStats();
      setStats(statsData);
      
      if (user?.role === 'manager') {
        const perfData = await getEmployeePerformance();
        const trendData = await getUsageTrends();
        setPerformance(perfData);
        setTrends(trendData);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const input = document.getElementById('report-container');
    if (input) {
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('workshop_report.pdf');
      });
    }
  };

  if (loading) return <div>Loading reports...</div>;

  const jobStatusData = stats ? [
    { name: 'Completed', value: stats.jobs.completed },
    { name: 'In Progress', value: stats.jobs.in_progress },
    { name: 'Pending', value: stats.jobs.pending }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reporting & Analytics</h1>
          <p className="text-gray-600 mt-1">System-wide statistics and performance metrics.</p>
        </div>
        
        {user?.role === 'manager' && (
          <button 
            onClick={exportPDF}
            className="bg-primary-600 text-white px-4 py-2 rounded shadow hover:bg-primary-700 transition"
          >
            Export to PDF
          </button>
        )}
      </div>

      <div id="report-container" className="space-y-8 bg-gray-50 p-4 rounded">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
            <p className="text-3xl font-bold text-gray-800">{stats?.jobs.total}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.jobs.total > 0 
                ? Math.round((stats?.jobs.completed / stats?.jobs.total) * 100) 
                : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Low Materials</h3>
            <p className="text-3xl font-bold text-red-600">{stats?.alerts.low_materials}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Low Spare Parts</h3>
            <p className="text-3xl font-bold text-red-600">{stats?.alerts.low_spareparts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Status Chart */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Employee Performance Chart */}
          {user?.role === 'manager' && (
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Performance (Completed Jobs)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed_jobs" fill="#82ca9d" name="Completed Jobs" />
                    <Bar dataKey="total_jobs" fill="#8884d8" name="Total Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Usage Trends */}
        {user?.role === 'manager' && trends && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Usage Trends Over Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" allowDuplicatedCategory={false} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    data={trends.materials} 
                    type="monotone" 
                    dataKey="total" 
                    name="Material Usage" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    data={trends.spare_parts} 
                    type="monotone" 
                    dataKey="total" 
                    name="Spare Part Usage" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
