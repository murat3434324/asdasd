"use client";

import { useBookingContext } from "@/context/BookingContext";
import Title from "./Title";
import ItineraryCard from "./ItineraryCard";
import { useEffect } from "react";

export default function Itinerary() {
  const { setIsCurrentStepValid, bookingData, formData, updateItineraryData } =
    useBookingContext();

  const flights = bookingData?.flights?.filter((f) => !f.is_connection);

  const handleTermsChange = (checked: boolean) => {
    updateItineraryData({
      terms_accepted: checked,
    });
  };

  useEffect(() => {
    setIsCurrentStepValid(formData.itinerary.terms_accepted);
  }, [formData.itinerary.terms_accepted, setIsCurrentStepValid]);

  return (
    <div className="space-y-4">
      <Title title="Itinerary" />
      <div className="flex flex-col gap-6">
        {flights?.map((flight) => (
          <ItineraryCard key={flight.id} flight={flight} />
        ))}
      </div>
      <div className="pt-10">
        <label className="flex items-center gap-2 cursor-pointer w-full bg-white p-4 rounded-sm border-border border">
          <input
            type="checkbox"
            checked={formData.itinerary.terms_accepted}
            onChange={(e) => handleTermsChange(e.target.checked)}
            className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            I confirm that the flight details above are correct.
          </span>
        </label>
      </div>
    </div>
  );
}
