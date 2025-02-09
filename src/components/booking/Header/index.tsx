"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBookingContext } from "@/context/BookingContext";
import Image from "next/image";

export default function Header() {
  const company = useBookingContext().bookingData.company;

  return (
    <div className="flex items-center justify-between py-4 w-full">
      <div className="items-center gap-2 flex">
        <Image src={company.logo} alt={company.name} width={100} height={100} />
      </div>
      <div className="items-center gap-12 justify-between flex">
        <a
          href={`tel:${company.phone}`}
          className="items-center gap-2 p-2 px-4 bg-white rounded-md shadow-sm hidden lg:flex"
        >
          <span className="font-semibold">Direct Line:</span>
          <span className="text-brown font-bold">{company.phone}</span>
        </a>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="md:flex-row flex-col flex gap-2">
              <span className="hidden lg:block">Prepared by</span>{" "}
              <span className="font-bold">{company.representative_name}</span>
            </span>
            <span className="hidden lg:block">{company.email}</span>
            <a
              href={`tel:${company.phone}`}
              className="flex items-center gap-2 p-1 px-2 bg-white rounded-md shadow-sm lg:hidden"
            >
              <span className="text-brown font-semibold">{company.phone}</span>
            </a>
          </div>
          <Avatar>
            <AvatarImage src={company.representative_avatar} />
            <AvatarFallback>
              {company.representative_name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
