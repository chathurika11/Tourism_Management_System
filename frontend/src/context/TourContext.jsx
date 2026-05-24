import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [customTour, setCustomTour] = useState({
    district: '',
    places: [],
    wantsVehicle: null,
    vehicleDetails: null, // { passengers, type, model }
    wantsGuide: null,
    guideId: null,
    hotelBudget: ''
  });

  const updateTour = (updates) => {
    setCustomTour(prev => ({ ...prev, ...updates }));
  };

  const resetTour = () => {
    setCustomTour({
      district: '',
      places: [],
      wantsVehicle: null,
      vehicleDetails: null,
      wantsGuide: null,
      guideId: null,
      hotelBudget: ''
    });
  };

  return (
    <TourContext.Provider value={{ customTour, updateTour, resetTour }}>
      {children}
    </TourContext.Provider>
  );
};
