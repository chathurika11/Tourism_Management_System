import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign } from 'lucide-react';

const MyBookings = () => {
    const [bookings] = useState([
        { _id: 1, package: { name: 'Cultural Triangle Tour', location: 'Kandy' }, startDate: '2025-06-20', endDate: '2025-06-25', status: 'confirmed', totalAmount: 500 },
        { _id: 2, package: { name: 'Galle Day Tour', location: 'Galle' }, startDate: '2025-07-10', endDate: '2025-07-10', status: 'pending', totalAmount: 180 },
    ]);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-600 mb-8">Manage your SerendiGo reservations</p>

            <div className="space-y-4">
                {bookings.map(booking => (
                    <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{booking.package.name}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {booking.package.location}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {booking.status}
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t">
                            <div className="flex items-center gap-1 text-primary font-bold">
                                <DollarSign size={18} /> {booking.totalAmount}
                            </div>
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <Link to={`/payment/${booking._id}`} className="btn-primary text-sm py-2">
                                    {booking.status === 'pending' ? 'Pay Now' : 'View Invoice'}
                                </Link>
                                <Link to={`/invoice/${booking._id}`} className="btn-outline text-sm py-2">
                                    Invoice
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyBookings;