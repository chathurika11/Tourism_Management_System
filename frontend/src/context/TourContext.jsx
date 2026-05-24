import React, { createContext, useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  // Feedback State
  const [vehicleFeedbacks, setVehicleFeedbacks] = useState([
    { id: 1, vehicleId: 1, userName: 'John Doe', rating: 5, comment: 'Excellent condition, very comfortable ride!', date: '2025-05-15' },
    { id: 2, vehicleId: 2, userName: 'Sarah Wilson', rating: 4, comment: 'Good car, smooth driving experience.', date: '2025-05-10' },
  ]);

  const [guideFeedbacks, setGuideFeedbacks] = useState([
    { id: 1, guideId: 1, userName: 'Michael Chen', rating: 5, comment: 'Priya was amazing! Very knowledgeable about Sri Lankan history.', date: '2025-05-18' },
    { id: 2, guideId: 2, userName: 'Emma Brown', rating: 5, comment: 'Samantha made our wildlife safari unforgettable!', date: '2025-05-12' },
  ]);

  const [hotelFeedbacks, setHotelFeedbacks] = useState([
    { id: 1, hotelId: 1, userName: 'David Kim', rating: 5, comment: 'Beautiful hotel with great service!', date: '2025-05-20' },
    { id: 2, hotelId: 2, userName: 'Lisa Wong', rating: 4, comment: 'Amazing location, very peaceful.', date: '2025-05-14' },
  ]);

  // Add Tour Feedback State
  const [tourFeedbacks, setTourFeedbacks] = useState([
    { id: 1, tourId: 1, userName: 'Alex Johnson', rating: 5, comment: 'Amazing tour! The Cultural Triangle was breathtaking.', date: '2025-05-22' },
    { id: 2, tourId: 2, userName: 'Maria Garcia', rating: 4, comment: 'Great experience in Galle Fort, very informative guide.', date: '2025-05-19' },
  ]);

  // Booking State
  const [bookings, setBookings] = useState([]);

  // Add Feedback Functions
  const addVehicleFeedback = (feedback) => {
    const newFeedback = { id: vehicleFeedbacks.length + 1, ...feedback, date: new Date().toISOString().split('T')[0] };
    setVehicleFeedbacks([newFeedback, ...vehicleFeedbacks]);
    toast.success('Feedback submitted successfully!');
  };

  const addGuideFeedback = (feedback) => {
    const newFeedback = { id: guideFeedbacks.length + 1, ...feedback, date: new Date().toISOString().split('T')[0] };
    setGuideFeedbacks([newFeedback, ...guideFeedbacks]);
    toast.success('Feedback submitted successfully!');
  };

  const addHotelFeedback = (feedback) => {
    const newFeedback = { id: hotelFeedbacks.length + 1, ...feedback, date: new Date().toISOString().split('T')[0] };
    setHotelFeedbacks([newFeedback, ...hotelFeedbacks]);
    toast.success('Feedback submitted successfully!');
  };

  const addTourFeedback = (feedback) => {
    const newFeedback = { id: tourFeedbacks.length + 1, ...feedback, date: new Date().toISOString().split('T')[0] };
    setTourFeedbacks([newFeedback, ...tourFeedbacks]);
    toast.success('Feedback submitted successfully!');
  };

  // Get Feedbacks by ID
  const getVehicleFeedbacks = (vehicleId) => vehicleFeedbacks.filter(f => f.vehicleId === vehicleId);
  const getGuideFeedbacks = (guideId) => guideFeedbacks.filter(f => f.guideId === guideId);
  const getHotelFeedbacks = (hotelId) => hotelFeedbacks.filter(f => f.hotelId === hotelId);
  const getTourFeedbacks = (tourId) => tourFeedbacks.filter(f => f.tourId === tourId);

  // Add Booking
  const addBooking = (booking) => {
    const newBooking = { id: bookings.length + 1, ...booking, bookingDate: new Date().toISOString(), status: 'pending' };
    setBookings([newBooking, ...bookings]);
    toast.success('Booking created successfully!');
    return newBooking;
  };

  return (
    <TourContext.Provider value={{
      vehicleFeedbacks, guideFeedbacks, hotelFeedbacks, tourFeedbacks,
      addVehicleFeedback, addGuideFeedback, addHotelFeedback, addTourFeedback,
      getVehicleFeedbacks, getGuideFeedbacks, getHotelFeedbacks, getTourFeedbacks,
      bookings, addBooking
    }}>
      {children}
    </TourContext.Provider>
  );
};