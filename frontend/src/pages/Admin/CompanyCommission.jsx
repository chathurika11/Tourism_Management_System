import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompanyCommission = () => {
  const [bookings, setBookings] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});

  const calculateMonthly = (allBookings) => {
    const monthly = {};
    allBookings.forEach(b => {
      if (b.status === 'confirmed' || b.status === 'completed') {
        const month = b.startDate ? new Date(b.startDate).toLocaleString('default', { month: 'short' }) : 'Unknown';
        let commission = 0;
        if (b.hotelPrice) commission += b.hotelPrice * 0.25;
        if (b.guidePrice) commission += b.guidePrice * 0.25;
        if (b.vehiclePrice) commission += b.vehiclePrice * 0.20;
        if (!monthly[month]) monthly[month] = 0;
        monthly[month] += commission;
      }
    });
    setMonthlyData(monthly);
  };

  useEffect(() => {
    const stored = localStorage.getItem('bookings');
    if (stored) {
      const parsed = JSON.parse(stored);
      setBookings(parsed);
      calculateMonthly(parsed);
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem('bookings');
      if (updated) {
        const parsed = JSON.parse(updated);
        setBookings(parsed);
        calculateMonthly(parsed);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = months.map(m => monthlyData[m] || 0);
  const totalCommission = values.reduce((a,b) => a+b, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Company Commission</h1>
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl mb-8">
        <p className="text-lg">Total Company Commission Earned</p>
        <p className="text-4xl font-bold">Rs {totalCommission.toLocaleString()}</p>
        <p className="text-sm mt-2">Hotels & Guides: 25% | Vehicles: 20%</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <Bar data={{ labels: months, datasets: [{ label: 'Commission (Rs)', data: values, backgroundColor: '#5DF8D8' }] }} />
      </div>
    </div>
  );
};

export default CompanyCommission;