import React from 'react';
import { useParams } from 'react-router-dom';

const BookingForm = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">Booking</h1>
      <p className="text-gray-600 mb-8">Complete your booking for item #{id}</p>
      <div className="bg-white p-8 rounded-xl shadow-md text-left">
        <p>Booking form functionality coming soon.</p>
      </div>
    </div>
  );
};

export default BookingForm;
