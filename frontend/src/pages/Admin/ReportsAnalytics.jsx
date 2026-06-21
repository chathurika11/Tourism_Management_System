import React, { useState, useEffect } from 'react';
import {
  Bar, Doughnut, Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Download, TrendingUp, BarChart3, Hotel, Car, Users, Compass, DollarSign, RefreshCw } from 'lucide-react';
import API from '../../services/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
);

const doughnutPercentagePlugin = {
  id: 'doughnutPercentagePlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    meta.data.forEach((arc, index) => {
      const value = dataset.data[index];
      if (!value || value <= 0) return;
      const pos = arc.tooltipPosition();
      ctx.fillText(`${value}%`, pos.x, pos.y);
    });
    ctx.restore();
  }
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('reports');
  const [year, setYear] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);

  // Reports data
  const [typeCounts, setTypeCounts] = useState({});
  const [typePercentages, setTypePercentages] = useState({});
  const [monthlyByType, setMonthlyByType] = useState({});
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Commission data
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalHotelComm, setTotalHotelComm] = useState(0);
  const [totalGuideComm, setTotalGuideComm] = useState(0);
  const [totalVehicleComm, setTotalVehicleComm] = useState(0);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState({});
  const [mostBooked, setMostBooked] = useState({
    hotels: [],
    vehicles: [],
    guides: [],
    packages: [],
    hotelCommissions: [],
    vehicleCommissions: [],
    guideCommissions: [],
    packageCommissions: []
  });

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [repRes, commRes, mostRes] = await Promise.all([
          API.get(`/analytics/reports?year=${year}`),
          API.get(`/analytics/commission-summary?year=${year}`),
          API.get(`/analytics/most-booked-items?year=${year}`).catch(() => ({ data: {} }))
        ]);

        const r = repRes.data;
        setTypeCounts(r.typeCounts || {});
        setTypePercentages(r.typePercentages || {});
        setMonthlyByType(r.monthlyByType || {});
        setTotalBookings(r.total || 0);
        setTotalRevenue(r.totalRevenue || 0);

        const c = commRes.data;
        setTotalCommission(c.totalCommission || 0);
        setTotalHotelComm(c.totalHotelCommission || 0);
        setTotalGuideComm(c.totalGuideCommission || 0);
        setTotalVehicleComm(c.totalVehicleCommission || 0);
        setMonthlyBreakdown(c.monthlyBreakdown || {});

        const m = mostRes.data || {};
        setMostBooked({
          hotels: m.hotels || [],
          vehicles: m.vehicles || [],
          guides: m.guides || [],
          packages: m.packages || [],
          hotelCommissions: m.hotelCommissions || [],
          vehicleCommissions: m.vehicleCommissions || [],
          guideCommissions: m.guideCommissions || [],
          packageCommissions: m.packageCommissions || []
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, refreshKey]);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ---- Chart configurations ----
  const doughnutData = {
    labels: ['Hotels', 'Vehicles', 'Guides', 'Tours'],
    datasets: [{
      data: [
        typePercentages.hotel || 0,
        typePercentages.vehicle || 0,
        typePercentages.guide || 0,
        typePercentages.tour || 0
      ],
      backgroundColor: ['#093C5D','#3B7597','#5DF8D8','#F59E0B'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const monthlyBookingData = {
    labels: MONTHS,
    datasets: [
      { label: 'Hotels', data: MONTHS.map(m => (monthlyByType[m] || {}).hotel || 0), backgroundColor: '#093C5D', borderRadius: 4 },
      { label: 'Vehicles', data: MONTHS.map(m => (monthlyByType[m] || {}).vehicle || 0), backgroundColor: '#3B7597', borderRadius: 4 },
      { label: 'Guides', data: MONTHS.map(m => (monthlyByType[m] || {}).guide || 0), backgroundColor: '#5DF8D8', borderRadius: 4 },
      { label: 'Tours', data: MONTHS.map(m => (monthlyByType[m] || {}).tour || 0), backgroundColor: '#F59E0B', borderRadius: 4 }
    ]
  };

  const commissionLineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Hotel (25%)', data: MONTHS.map(m => (monthlyBreakdown[m] || {}).hotel || 0), borderColor: '#093C5D', backgroundColor: 'rgba(9,60,93,0.1)', fill: true, tension: 0.4, pointRadius: 4 },
      { label: 'Guide (25%)', data: MONTHS.map(m => (monthlyBreakdown[m] || {}).guide || 0), borderColor: '#5DF8D8', backgroundColor: 'rgba(93,248,216,0.1)', fill: true, tension: 0.4, pointRadius: 4 },
      { label: 'Vehicle (15%)', data: MONTHS.map(m => (monthlyBreakdown[m] || {}).vehicle || 0), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4, pointRadius: 4 }
    ]
  };

  const commissionBarData = {
    labels: MONTHS,
    datasets: [
      { label: 'Hotel Commission', data: MONTHS.map(m => (monthlyBreakdown[m] || {}).hotel || 0), backgroundColor: '#093C5D', borderRadius: 4 },
      { label: 'Guide Commission', data: MONTHS.map(m => (monthlyBreakdown[m] || {}).guide || 0), backgroundColor: '#5DF8D8', borderRadius: 4 },
      { label: 'Vehicle Commission', data: MONTHS.map(m => (monthlyBreakdown[m] || {}).vehicle || 0), backgroundColor: '#F59E0B', borderRadius: 4 }
    ]
  };

  const smallChartOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y?.toLocaleString() ?? ctx.parsed}` } }
    },
    scales: {
      x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { font: { size: 10 } }, beginAtZero: true }
    }
  };

  const groupedBarOpts = {
    ...smallChartOpts,
    scales: {
      x: { stacked: false, ticks: { font: { size: 10 } }, grid: { display: false } },
      y: { stacked: false, ticks: { font: { size: 10 } }, beginAtZero: true }
    }
  };

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
    }
  };

  const createMostBookedData = (items, label, color) => ({
    labels: items.map(item => item.name || 'Unknown'),
    datasets: [{
      label,
      data: items.map(item => item.count || 0),
      backgroundColor: color,
      borderRadius: 6
    }]
  });

  const createCommissionItemData = (items, label, color) => ({
    labels: items.map(item => item.name || 'Unknown'),
    datasets: [{
      label,
      data: items.map(item => item.amount || 0),
      backgroundColor: color,
      borderRadius: 6
    }]
  });

  const statCards = [
    { label: 'Total Bookings', value: totalBookings, color: 'border-primary', textColor: 'text-primary', icon: BarChart3 },
    { label: 'Total Revenue', value: `Rs ${totalRevenue.toLocaleString()}`, color: 'border-green-500', textColor: 'text-green-600', icon: DollarSign },
    { label: 'Hotel Bookings', value: `${typeCounts.hotel || 0} (${typePercentages.hotel || 0}%)`, color: 'border-blue-500', textColor: 'text-blue-600', icon: Hotel },
    { label: 'Vehicle Bookings', value: `${typeCounts.vehicle || 0} (${typePercentages.vehicle || 0}%)`, color: 'border-amber-500', textColor: 'text-amber-600', icon: Car },
    { label: 'Guide Bookings', value: `${typeCounts.guide || 0} (${typePercentages.guide || 0}%)`, color: 'border-teal-400', textColor: 'text-teal-600', icon: Users },
    { label: 'Tour Bookings', value: `${typeCounts.tour || 0} (${typePercentages.tour || 0}%)`, color: 'border-yellow-400', textColor: 'text-yellow-600', icon: Compass }
  ];

  return (
    <div id="report-content">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Annual overview of confirmed bookings and commission earnings</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="input-field text-sm py-2 px-3 w-28">
            {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setActiveSection('reports')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${activeSection === 'reports' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'}`}>
              <BarChart3 size={16} /> Reports
            </button>
            <button onClick={() => setActiveSection('commission')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${activeSection === 'commission' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'}`}>
              <TrendingUp size={16} /> Commission
            </button>
          </div>
          <button onClick={refreshData} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* ══════════════ REPORTS SECTION ══════════════ */}
      {activeSection === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((s, i) => (
              <div key={i} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon size={16} className={s.textColor} />
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
                <p className={`text-lg font-bold ${s.textColor}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3 text-sm">Booking Distribution {year}</h2>
              <div className="max-w-[220px] mx-auto">
                <Doughnut data={doughnutData} options={doughnutOpts} plugins={[doughnutPercentagePlugin]} />
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3 text-sm">Monthly Bookings by Type — {year}</h2>
              <Bar data={monthlyBookingData} options={groupedBarOpts} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Most Booked Hotels</h2>
              <Bar data={createMostBookedData(mostBooked.hotels, 'Hotel Bookings', '#093C5D')} options={groupedBarOpts} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Most Booked Vehicles</h2>
              <Bar data={createMostBookedData(mostBooked.vehicles, 'Vehicle Bookings', '#3B7597')} options={groupedBarOpts} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Most Booked Guides</h2>
              <Bar data={createMostBookedData(mostBooked.guides, 'Guide Bookings', '#5DF8D8')} options={groupedBarOpts} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Most Booked Packages</h2>
              <Bar data={createMostBookedData(mostBooked.packages, 'Package Bookings', '#F59E0B')} options={groupedBarOpts} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-primary text-sm">Monthly Booking Details — {year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Month','Hotels','Vehicles','Guides','Tours','Total'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MONTHS.map(m => {
                    const d = monthlyByType[m] || {};
                    const tot = (d.hotel||0)+(d.vehicle||0)+(d.guide||0)+(d.tour||0);
                    return (
                      <tr key={m} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium">{m}</td>
                        <td className="px-4 py-3 text-blue-600">{d.hotel||0}</td>
                        <td className="px-4 py-3 text-amber-600">{d.vehicle||0}</td>
                        <td className="px-4 py-3 text-teal-600">{d.guide||0}</td>
                        <td className="px-4 py-3 text-yellow-600">{d.tour||0}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{tot}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ COMMISSION SECTION ══════════════ */}
      {activeSection === 'commission' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={24} className="text-cta" />
              <p className="text-lg font-medium opacity-90">Total Company Commission Earned — {year}</p>
            </div>
            <p className="text-4xl font-bold">Rs {totalCommission.toLocaleString()}</p>
            <p className="text-sm mt-3 opacity-80">25% on confirmed Hotel & Guide bookings · 15% on Vehicle bookings</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-1">
                <Hotel size={16} className="text-primary" />
                <p className="text-xs text-gray-500">Hotel Commission (25%)</p>
              </div>
              <p className="text-2xl font-bold text-primary">Rs {totalHotelComm.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-teal-400">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-teal-600" />
                <p className="text-xs text-gray-500">Guide Commission (25%)</p>
              </div>
              <p className="text-2xl font-bold text-teal-600">Rs {totalGuideComm.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-400">
              <div className="flex items-center gap-2 mb-1">
                <Car size={16} className="text-amber-600" />
                <p className="text-xs text-gray-500">Vehicle Commission (15%)</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">Rs {totalVehicleComm.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3 text-sm">Monthly Commission Trends — {year}</h2>
              <Line data={commissionLineData} options={{ ...smallChartOpts, plugins: { ...smallChartOpts.plugins, tooltip: { callbacks: { label: ctx => ` Rs ${ctx.parsed.y.toLocaleString()}` } } } }} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3 text-sm">Monthly Commission by Type — {year}</h2>
              <Bar data={commissionBarData} options={{ ...groupedBarOpts, plugins: { ...groupedBarOpts.plugins, tooltip: { callbacks: { label: ctx => ` Rs ${ctx.parsed.y.toLocaleString()}` } } } }} />
            </div>
          </div>

          {/* ⭐ Commission by Item – the charts you requested ⭐ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Hotel Commission by Item</h2>
              <Bar data={createCommissionItemData(mostBooked.hotelCommissions, 'Hotel Commission', '#093C5D')} options={groupedBarOpts} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Vehicle Commission by Item</h2>
              <Bar data={createCommissionItemData(mostBooked.vehicleCommissions, 'Vehicle Commission', '#3B7597')} options={groupedBarOpts} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Guide Commission by Item</h2>
              <Bar data={createCommissionItemData(mostBooked.guideCommissions, 'Guide Commission', '#5DF8D8')} options={groupedBarOpts} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-primary mb-3">Package Commission by Item</h2>
              <Bar data={createCommissionItemData(mostBooked.packageCommissions, 'Package Commission', '#F59E0B')} options={groupedBarOpts} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold text-primary text-sm">Monthly Commission Breakdown — {year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Month','Hotel (Rs)','Guide (Rs)','Vehicle (Rs)','Total (Rs)'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MONTHS.map(m => {
                    const b = monthlyBreakdown[m] || {};
                    const tot = (b.hotel||0)+(b.guide||0)+(b.vehicle||0);
                    return (
                      <tr key={m} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium">{m}</td>
                        <td className="px-4 py-3 text-primary">{(b.hotel||0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-teal-600">{(b.guide||0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-amber-600">{(b.vehicle||0).toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{tot.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-primary/5 font-bold">
                    <td className="px-4 py-3 text-primary">Total</td>
                    <td className="px-4 py-3 text-primary">{totalHotelComm.toLocaleString()}</td>
                    <td className="px-4 py-3 text-teal-600">{totalGuideComm.toLocaleString()}</td>
                    <td className="px-4 py-3 text-amber-600">{totalVehicleComm.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-800">Rs {totalCommission.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;