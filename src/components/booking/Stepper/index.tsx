"use client";

import { useBookingContext } from "@/context/BookingContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function Stepper() {
  const { steps, currentStep, handlePreviousStep } = useBookingContext();
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const { top } = navRef.current.getBoundingClientRect();
        setIsSticky(top <= 24);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!steps) return null;

  return (
    <>
      <div
        ref={navRef}
        className={cn(
          "sticky top-2 z-[60] hidden md:block",
          isSticky &&
            "bg-white py-8 px-4 border border-border rounded-sm transition-all duration-300"
        )}
      >
        <nav aria-label="Progress">
          <div
            className={cn(
              "absolute top-3 left-0 w-full h-[2px] bg-gray-300",
              isSticky && "top-[2.7rem]"
            )}
          />
          <div
            className={cn(
              "absolute top-3 left-0 w-full h-[2px] bg-brown",
              isSticky && "top-[2.7rem]"
            )}
            style={{
              width: `${
                ((steps.findIndex((step) => step.current) + 1) / steps.length) *
                100
              }%`,
            }}
          />

          <ol role="list" className="flex items-center justify-between w-full">
            {steps.map((step) => (
              <li key={step.id} className="relative flex flex-col items-center">
                <span
                  className={cn(
                    "h-4 w-4 rounded-full absolute top-[5px] flex items-center justify-center",
                    step.completed
                      ? "bg-brown h-5 w-5 top-[2.5px]"
                      : step.current
                      ? "bg-brown h-5 w-5 top-[2.5px]"
                      : "bg-gray-300"
                  )}
                >
                  {step.current && (
                    <span className="h-2.5 w-2.5 bg-blue-50 rounded-full" />
                  )}
                  {!step.current && step.completed && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-3 text-sm font-medium whitespace-nowrap relative top-[22px]",
                    step.current
                      ? "text-brown"
                      : step.completed
                      ? "text-gray-900"
                      : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <nav
        aria-label="Progress"
        className="sticky top-2 z-[60] md:hidden bg-white py-4 border border-border shadow-sm"
      >
        <div className="flex items-center justify-between px-4">
          {currentStep > 1 && (
            <button
              onClick={handlePreviousStep}
              className="bg-brown p-2 text-white rounded-md"
            >
              <ArrowLeft className="h-4 w-4 " />
            </button>
          )}

          <h1 className="font-semibold">
            {steps.find((step) => step.current)?.name}
          </h1>

          <span className="font-semibold text-muted-foreground bg-gray-300 px-2 rounded-md">
            {steps.findIndex((step) => step.current) + 1} of {steps.length}
          </span>
        </div>
      </nav>
    </>
  );
}
