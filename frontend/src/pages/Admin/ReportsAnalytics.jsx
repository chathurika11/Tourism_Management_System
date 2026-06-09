import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import API from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [hotelData, setHotelData] = useState({});
  const [vehicleData, setVehicleData] = useState({});
  const [guideData, setGuideData] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('/analytics/reports');
        setHotelData(res.data.hotelCounts);
        setVehicleData(res.data.vehicleCounts);
        setGuideData(res.data.guideCounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const chartOptions = { responsive: true, maintainAspectRatio: true };

  if (loading) return <div className="text-center py-20">Loading reports...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Reports & Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Most Booked Hotels</h2>
          <Bar
            data={{
              labels: Object.keys(hotelData),
              datasets: [{ label: 'Times Booked', data: Object.values(hotelData), backgroundColor: '#093C5D' }]
            }}
            options={chartOptions}
          />
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Most Rented Vehicles</h2>
          <Bar
            data={{
              labels: Object.keys(vehicleData),
              datasets: [{ label: 'Times Rented', data: Object.values(vehicleData), backgroundColor: '#3B7597' }]
            }}
            options={chartOptions}
          />
        </div>
        <div className="bg-white p-4 rounded-xl shadow lg:col-span-2">
          <h2 className="font-semibold mb-2">Most Booked Guides</h2>
          <Bar
            data={{
              labels: Object.keys(guideData),
              datasets: [{ label: 'Bookings', data: Object.values(guideData), backgroundColor: '#5DF8D8' }]
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;