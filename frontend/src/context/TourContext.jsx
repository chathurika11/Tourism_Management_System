import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const TourContext = createContext();
export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [vehicleFeedbacks, setVehicleFeedbacks] = useState([]);
  const [guideFeedbacks, setGuideFeedbacks] = useState([]);
  const [hotelFeedbacks, setHotelFeedbacks] = useState([]);
  const [tourFeedbacks, setTourFeedbacks] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Load bookings from localStorage
  React.useEffect(() => {
    const storedBookings = localStorage.getItem('serendigo_bookings');
    if (storedBookings) setBookings(JSON.parse(storedBookings));
  }, []);

  const saveBookings = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem('serendigo_bookings', JSON.stringify(newBookings));
  };

  const addBooking = (booking) => {
    const newBooking = { ...booking, id: Date.now(), status: 'pending', userId: JSON.parse(localStorage.getItem('user'))?.id };
    const newBookings = [newBooking, ...bookings];
    saveBookings(newBookings);
    toast.success('Booking created! Please complete payment.');
    return newBooking;
  };

  const updateBooking = (id, updates) => {
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
    saveBookings(updatedBookings);
    toast.success('Booking updated!');
  };

  const updateBookingStatus = (id, status, paymentStatus) => {
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, status, paymentStatus } : b);
    saveBookings(updatedBookings);
  };

  const deleteBooking = (id) => {
    const updatedBookings = bookings.filter(b => b.id !== id);
    saveBookings(updatedBookings);
  };

  const getBookingById = (id) => bookings.find(b => b.id === id);

  // SMS simulation
  const sendSMS = (phoneNumber, message) => {
    console.log(`📱 SMS to ${phoneNumber}: ${message}`);
    toast.success(`Confirmation sent to ${phoneNumber}`);
    return true;
  };

  const addVehicleFeedback = (fb) => setVehicleFeedbacks([{ ...fb, id: Date.now(), date: new Date().toISOString() }, ...vehicleFeedbacks]);
  const addGuideFeedback = (fb) => setGuideFeedbacks([{ ...fb, id: Date.now(), date: new Date().toISOString() }, ...guideFeedbacks]);
  const addHotelFeedback = (fb) => setHotelFeedbacks([{ ...fb, id: Date.now(), date: new Date().toISOString() }, ...hotelFeedbacks]);
  const addTourFeedback = (fb) => setTourFeedbacks([{ ...fb, id: Date.now(), date: new Date().toISOString() }, ...tourFeedbacks]);

  const getVehicleFeedbacks = (id) => vehicleFeedbacks.filter(f => f.vehicleId === id);
  const getGuideFeedbacks = (id) => guideFeedbacks.filter(f => f.guideId === id);
  const getHotelFeedbacks = (id) => hotelFeedbacks.filter(f => f.hotelId === id);
  const getTourFeedbacks = (id) => tourFeedbacks.filter(f => f.tourId === id);

  return (
    <TourContext.Provider value={{
      bookings, addBooking, updateBooking, updateBookingStatus, deleteBooking, getBookingById, sendSMS,
      addVehicleFeedback, addGuideFeedback, addHotelFeedback, addTourFeedback,
      getVehicleFeedbacks, getGuideFeedbacks, getHotelFeedbacks, getTourFeedbacks
    }}>
      {children}
    </TourContext.Provider>
  );
};