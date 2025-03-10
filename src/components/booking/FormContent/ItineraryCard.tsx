"use client";

import { FlightType } from "@/types/Flight";
import { ArrowRightIcon, ChevronUp, Square } from "lucide-react";
import { GiAirplaneArrival } from "react-icons/gi";
import Image from "next/image";
import { useState } from "react";
import { formatDate, formatTime, getTotalDuration } from "@/utils/dateUtils";

export default function ItineraryCard({ flight }: { flight?: FlightType }) {
  const [showDetails, setShowDetails] = useState(false);

  const getCabinClass = (flight: FlightType) => {
    if (!flight.connections || flight.connections.length === 0) {
      return flight.cabin_class;
    }

    const allCabinClasses = new Set([
      flight.cabin_class,
      ...flight.connections.map((connection) => connection.cabin_class),
    ]);

    return allCabinClasses.size > 1 ? "Mixed" : flight.cabin_class;
  };

  const getTotalTripDuration = (flight: FlightType) => {
    let totalHours = flight.travel_time_hours;
    let totalMinutes = flight.travel_time_minutes;

    if (flight.connections && flight.connections.length > 0) {
      flight.connections.forEach((connection) => {
        totalHours += connection.travel_time_hours;
        totalMinutes += connection.travel_time_minutes;
      });

      if (totalMinutes >= 60) {
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
      }
    }

    return getTotalDuration(totalHours, totalMinutes);
  };

  if (!flight) {
    return (
      <div className="flex flex-col w-full bg-white rounded-sm shadow-sm p-4 border-l-4 border-l-brown border border-border">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col w-full bg-white rounded-sm shadow-sm p-4 border-l-4 border-l-brown border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side */}
          <div className="flex flex-col">
            <div className="text-lg font-semibold flex flex-row items-center gap-2">
              <span>{flight.from_city}</span>
              <ArrowRightIcon className="w-5 h-5" />
              <span>
                {flight.connections && flight.connections.length > 0
                  ? flight.connections[flight.connections.length - 1].to_city
                  : flight.to_city}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(flight.departure_date)}{" "}
              {formatTime(flight.departure_date)}
            </div>
            <div className="text-sm text-muted-foreground flex flex-row items-center gap-2">
              <GiAirplaneArrival />
              <span>Arrival</span>
              <span>{formatDate(flight.arrival_date)}</span>
              <div className="flex flex-row items-center">
                <Square className="w-2 h-2 bg-gray-300 mr-0.5" />
                <span>
                  {flight.connections.length > 0
                    ? `${flight.connections.length}  stops`
                    : "Direct flight"}
                </span>
              </div>
            </div>
          </div>
          {/* Right side */}
          <div className="flex flex-col text-sm place-self-start items-start md:items-end mt-4 md:mt-0 border-t-2 border-border md:border-none pt-4 md:pt-0 w-full">
            <div className="text-muted-foreground flex flex-col md:items-end w-full justify-start items-start">
              <div className="flex md:items-start gap-6 w-full justify-between md:justify-end">
                <div className="flex flex-row items-center gap-4 order-2 md:order-1">
                  <div className="flex flex-row items-center gap-2 justify-center">
                    <Image
                      src={flight.air_company.logo}
                      alt={flight.air_company.name}
                      width={15}
                      height={15}
                    />
                    <p className="hidden md:block">{flight.air_company.name}</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-sm px-2 py-1 order-1 md:order-2">
                  Trip Total {getTotalTripDuration(flight)}
                </div>
              </div>
              <p className="font-semibold mt-2">{getCabinClass(flight)}</p>
            </div>
          </div>
        </div>
      </div>
      {showDetails && <Details flight={flight} />}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-white w-fit float-end flex items-center justify-center gap-2 py-2 text-sm text-gray-500 px-4 rounded-sm border-border border"
      >
        <span>{showDetails ? "Hide" : "Show"} details</span>
        <ChevronUp
          className={`w-4 h-4 transition-transform ${
            showDetails ? "" : "rotate-180"
          }`}
        />
      </button>
    </div>
  );
}

const FlightSegment = ({
  flight,
  isLast,
}: {
  flight: FlightType;
  isLast: boolean;
}) => {
  if (!flight) return null;

  return (
    <div className="flex flex-col">
      {/* departure */}
      <div className="grid grid-cols-[5rem_2.5rem_1fr] items-start">
        {/* departure time and date */}
        <div>
          <div className="text-sm font-medium">
            {formatTime(flight.departure_date)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(flight.departure_date)}
          </div>
        </div>
        {/* time line */}
        <div className="flex justify-center items-start relative h-full">
          <div className="w-3 h-3 rounded-full bg-white  z-10 border-2 border-gray-300 outline outline-4 outline-white" />
          <div className="absolute left-[calc(50%-1px)] inset-0 w-0.5 bg-gray-300 h-full" />
        </div>
        {/* from city and time duration */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2">
          {/* from city */}
          <div>
            <div className="font-medium">
              {`${flight.from_city} // ${flight.from_airport_code}`}
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="bg-blue-50 px-2 py-0.5 rounded">
                {getTotalDuration(
                  flight.travel_time_hours,
                  flight.travel_time_minutes
                )}
              </span>
              <span className="text-gray-400">{flight.air_company.name}</span>
            </div>
          </div>
          {/* from city details */}
          <div className="flex flex-col items-start place-self-start lg:items-end lg:place-self-end mt-2 lg:mt-0 border-t-2 border-border lg:border-none pt-2 lg:pt-0 w-full">
            <div className="flex flex-row items-center">
              <span className="text-sm font-semibold mr-2">
                {flight.cabin_class}
              </span>
              <span className="text-muted-foreground">Flight: </span>
              <span className="text-sm font-semibold">
                {flight.flight_number}
              </span>
            </div>
            <div className="flex flex-row items-center">
              <span>Plane: </span>
              <span className="font-semibold">{flight.aircraft_type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* arrival time and date */}
      <div className="grid grid-cols-[5rem_2.5rem_1fr] items-start">
        <div>
          <div className="text-sm font-medium">
            {formatTime(flight.arrival_date)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(flight.arrival_date)}
          </div>
        </div>
        <div className="flex justify-center items-start relative h-full">
          <div className="w-3 h-3 rounded-full bg-white z-10 border-2 border-gray-300 outline outline-4 outline-white" />
          {!isLast && (
            <div className="absolute left-[calc(50%-1px)] inset-0 border-l-2 border-dashed border-gray-300 h-full" />
          )}
        </div>
        <div>
          <div className="font-medium">
            {`${flight.to_city} // ${flight.to_airport_code}`}
          </div>
        </div>
      </div>
    </div>
  );
};

const LayoverSegment = ({ flight }: { flight: FlightType }) => {
  if (!flight) return null;

  const calculateLayover = (arrivalDate: string, departureDate: string) => {
    // String tarihleri Date objelerine çevir
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);

    // İki tarih arasındaki farkı milisaniye cinsinden hesapla
    const diff = departure.getTime() - arrival.getTime();

    // Milisaniyeleri saat ve dakikaya çevir
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;

  };

  return (
    <div className="relative">
      <div className="grid grid-cols-[5rem_2.5rem_1fr] items-start h-10 relative">
        <div />
        <div className="relative left-[calc(50%-1px)] inset-0 border-l-2 border-dashed border-gray-300 h-full my-1" />
      </div>

      <div className="relative grid grid-cols-[5rem_2.5rem_1fr] items-center border-y-2 border-y-border py-2 bg-white">
        <span className="text-[#F97316] justify-self-end">Layover</span>
        <div className="flex justify-center">
          <div className="w-4 h-4 rounded-full bg-[#F97316] z-10" />
        </div>
        <div className="flex items-center gap-2 ">
          <span className="font-semibold">
            { calculateLayover(flight.arrival_date,flight.departure_date) }
          </span>
          <span className="text-muted-foreground">
            in {flight.from_city} ({flight.from_airport_code})
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[5rem_2.5rem_1fr] items-start h-10">
        <div />
        <div className="relative left-[calc(50%-1px)] inset-0 border-l-2 border-dashed border-gray-300 h-full my-1" />
      </div>
    </div>
  );
};

const Details = ({ flight }: { flight: FlightType }) => {
  if (!flight) return null;

  return (
    <div className="flex flex-col w-full bg-white rounded-sm shadow-sm p-4 border border-border">
      <div className="relative">
        <div className="">
          <FlightSegment
            flight={flight}
            isLast={flight.connections.length === 0}
          />
          {flight.connections.map((connection, index) => (
            <>
              <LayoverSegment
                key={`layover-${connection.id}`}
                flight={connection}
              />
              <FlightSegment
                key={`connection-${connection.id}`}
                flight={connection}
                isLast={index === flight.connections.length - 1}
              />
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
