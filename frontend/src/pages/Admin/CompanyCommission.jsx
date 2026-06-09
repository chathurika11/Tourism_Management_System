import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompanyCommission = () => {
  const [loading, setLoading] = useState(true);
  const [totalCommission, setTotalCommission] = useState(0);
  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const res = await API.get('/analytics/commission-summary');
        setTotalCommission(res.data.totalCommission);
        setMonthlyData(res.data.monthlyCommission);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommission();
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = months.map(m => monthlyData[m] || 0);
  const chartData = {
    labels: months,
    datasets: [{ label: 'Commission (Rs)', data: values, backgroundColor: '#5DF8D8' }]
  };

  if (loading) return <div className="text-center py-20">Loading commission data...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Company Commission</h1>
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl mb-8">
        <p className="text-lg">Total Company Commission Earned</p>
        <p className="text-4xl font-bold">Rs {totalCommission.toLocaleString()}</p>
        <p className="text-sm mt-2">22% commission on all confirmed bookings</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default CompanyCommission;