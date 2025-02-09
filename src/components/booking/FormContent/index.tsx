"use client";

import dynamic from "next/dynamic";
import { useBookingContext } from "@/context/BookingContext";
import { formatDate } from "@/utils/dateUtils";
import { ArrowLeftIcon } from "lucide-react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Itinerary = dynamic(() => import("./Itinerary"), {
  loading: () => <LoadingSpinner />,
});

const PassengerDetails = dynamic(() => import("./PassengerDetails"), {
  loading: () => <LoadingSpinner />,
});

const Extras = dynamic(() => import("./Extras"), {
  loading: () => <LoadingSpinner />,
});

const PaymentDetails = dynamic(() => import("./PaymentDetails"), {
  loading: () => <LoadingSpinner />,
});

const Overview = dynamic(() => import("./Overview"), {
  loading: () => <LoadingSpinner />,
});

const PaymentCard = dynamic(() => import("./PaymentCard"), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const stepComponents: { [key: number]: React.ComponentType } = {
  1: Itinerary,
  2: PassengerDetails,
  3: Extras,
  4: PaymentDetails,
  5: Overview,
};

export default function FormContent() {
  const { currentStep, bookingData, handlePreviousStep, isLoading } =
    useBookingContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const StepComponent = stepComponents[currentStep];
  const flight = bookingData?.flights?.filter((f) => !f.is_connection)[0];
  const connections = flight?.connections || [];
  const flightFrom = flight?.from_city;
  const flightFromCode = flight?.from_airport_code;
  const lastFlight =
    connections.length > 0 ? connections[connections.length - 1] : flight;
  const flightTo = lastFlight?.to_city;
  const flightToCode = lastFlight?.to_airport_code;

  return (
    <div className="grid grid-cols-12 gap-4 md:pt-10">
      <div className="col-span-12 lg:col-span-9">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              onClick={handlePreviousStep}
              className="hidden md:flex flex-col items-center justify-center px-6 bg-white rounded-sm shadow-sm border-border mb-6 w-fit"
            >
              <ArrowLeftIcon className="text-2xl" />
            </button>
          )}
          <div className="flex flex-col w-full p-2 bg-white rounded-sm shadow-sm border-border mb-6">
            <h2 className="text-lg font-semibold">
              {flightFrom} ({flightFromCode}) - {flightTo} ({flightToCode})
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(flight?.departure_date)} -{" "}
              {formatDate(flight?.arrival_date)}
            </p>
          </div>
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <StepComponent />
        </Suspense>
      </div>
      <div className="col-span-12 lg:col-span-3 sticky top-0">
        <Suspense fallback={<LoadingSpinner />}>
          <PaymentCard />
        </Suspense>
      </div>
    </div>
  );
}
