import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { vehicles, hotels, tourGuides } from '../../data/tourismData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsAnalytics = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('bookings');
    if (stored) setBookings(JSON.parse(stored));

    const handleStorageChange = () => {
      const updated = localStorage.getItem('bookings');
      if (updated) setBookings(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const vehicleCounts = {};
  vehicles.forEach(v => vehicleCounts[v.model] = 0);
  bookings.forEach(b => { if (b.vehicleName) vehicleCounts[b.vehicleName] = (vehicleCounts[b.vehicleName] || 0) + 1; });

  const guideCounts = {};
  tourGuides.forEach(g => guideCounts[g.name] = 0);
  bookings.forEach(b => { if (b.guideName) guideCounts[b.guideName] = (guideCounts[b.guideName] || 0) + 1; });

  const hotelCounts = {};
  hotels.forEach(h => hotelCounts[h.name] = 0);
  bookings.forEach(b => { if (b.hotelName) hotelCounts[b.hotelName] = (hotelCounts[b.hotelName] || 0) + 1; });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Reports & Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-xl shadow"><h2 className="font-semibold mb-2">Vehicle Rentals</h2><Bar data={{ labels: Object.keys(vehicleCounts), datasets: [{ label: 'Times Rented', data: Object.values(vehicleCounts), backgroundColor: '#093C5D' }] }} /></div>
        <div className="bg-white p-4 rounded-xl shadow"><h2 className="font-semibold mb-2">Guide Bookings</h2><Bar data={{ labels: Object.keys(guideCounts), datasets: [{ label: 'Bookings', data: Object.values(guideCounts), backgroundColor: '#3B7597' }] }} /></div>
        <div className="bg-white p-4 rounded-xl shadow lg:col-span-2"><h2 className="font-semibold mb-2">Hotel Bookings</h2><Bar data={{ labels: Object.keys(hotelCounts), datasets: [{ label: 'Bookings', data: Object.values(hotelCounts), backgroundColor: '#5DF8D8' }] }} /></div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;