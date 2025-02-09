"use client";

import { useEffect, useState } from "react";
import { useBookingContext } from "@/context/BookingContext";
import Title from "./Title";
import { Button } from "@/components/ui/button";
import {
  CheckIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

export default function Extras() {
  const [expandedPlans, setExpandedPlans] = useState<{
    [key: string]: boolean;
  }>({});
  const { setIsCurrentStepValid, formData, updateExtrasData } =
    useBookingContext();

  const insurancePlans = [
    {
      id: "standard",
      name: "STANDARD",
      price: 256.96,
      type: "Standard plan",
      features: [
        { name: "Missed connection", isActive: true },
        { name: "Flight delay compensation", isActive: true },
        { name: "Hospitalization (prohibiting travel)", isActive: true },
        { name: "Illness (prohibiting travel)", isActive: true },
        { name: "Lost or mishandled luggage", isActive: true },
        { name: "30% OFF with Bundle Deal", isActive: false },
        { name: "24/7 priority concierge service", isActive: false },
        { name: "Price drop protection", isActive: false },
        { name: "Free seat selection", isActive: false },
        { name: "Refund in form of voucher", isActive: false },
        {
          name: "Upgrade waitlist priority against fare difference",
          isActive: false,
        },
      ],
    },
    {
      id: "premium",
      name: "PREMIUM",
      price: 321.2,
      type: "Premium plan",
      recommended: true,
      features: [
        { name: "Missed connection", isActive: true },
        { name: "Flight delay compensation", isActive: true },
        { name: "Hospitalization (prohibiting travel)", isActive: true },
        { name: "Illness (prohibiting travel)", isActive: true },
        { name: "Lost or mishandled luggage", isActive: true },
        { name: "30% OFF with Bundle Deal", isActive: true },
        { name: "24/7 priority concierge service", isActive: true },
        { name: "Price drop protection", isActive: true },
        { name: "Free seat selection", isActive: true },
        { name: "Refund in form of voucher", isActive: true },
        {
          name: "Upgrade waitlist priority against fare difference",
          isActive: true,
        },
      ],
    },
    {
      id: "no-protection",
      name: "NO PROTECTION",
      type: "I am declining Travel Protection for this trip",
      features: [
        { name: "Missed connection", isActive: false },
        { name: "Flight delay compensation", isActive: false },
        { name: "Hospitalization (prohibiting travel)", isActive: false },
        { name: "Illness (prohibiting travel)", isActive: false },
        { name: "Lost or mishandled luggage", isActive: false },
        { name: "30% OFF with Bundle Deal", isActive: false },
        { name: "24/7 priority concierge service", isActive: false },
        { name: "Price drop protection", isActive: false },
        { name: "Free seat selection", isActive: false },
        { name: "Refund in form of voucher", isActive: false },
        {
          name: "Upgrade waitlist priority against fare difference",
          isActive: false,
        },
      ],
    },
  ];

  const flexibleTicket = {
    price: 353.32,
    description:
      "If you or any member of the traveling party has a change of plan and cannot go on the trip as it was intended, this is the perfect option.",
    recommended: true,
    features: [
      "Avoid all agency and airline fees when changing travel dates",
      "Rebook your ticket for no additional cost other than the fare difference, if any.",
      "30% OFF with Bundle Deal",
    ],
  };

  useEffect(() => {
    setIsCurrentStepValid(!!formData.extras.insurancePlan);
  }, [formData.extras.insurancePlan, setIsCurrentStepValid]);

  const handleInsurancePlanSelect = (planId: string) => {
    const selectedPlan = insurancePlans.find((plan) => plan.id === planId);
    updateExtrasData({
      ...formData.extras,
      insurancePlan: planId,
      insurancePrice: selectedPlan?.price || 0,
    });
  };

  const handleFlexibleTicketToggle = () => {
    updateExtrasData({
      ...formData.extras,
      isFlexibleTicketSelected: !formData.extras.isFlexibleTicketSelected,
      flexibleTicketPrice: !formData.extras.isFlexibleTicketSelected
        ? flexibleTicket.price
        : 0,
    });
  };

  const togglePlanDetails = (planId: string) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  return (
    <div className="space-y-4">
      <Title title="Travel Protection" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 bg-white border border-border rounded-sm p-4 pb-6 md:pt-12">
        {insurancePlans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 relative shadow-md ${
              formData.extras.insurancePlan === plan.id
                ? "border-primary"
                : "border-gray-200"
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 right-[50%] translate-x-[50%] bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm flex items-center gap-2">
                <StarIcon className="w-4 h-4" />
                <span>Recommended</span>
              </div>
            )}

            <div className="space-y-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.type}</p>
                </div>

                {plan.price && (
                  <p className="text-lg font-semibold mt-2 text-brown">
                    +${plan.price}
                  </p>
                )}
              </div>

              <div className="hidden md:block space-y-2">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      !feature.isActive ? "opacity-40" : ""
                    }`}
                  >
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => togglePlanDetails(plan.id)}
                  className="w-full flex items-center justify-between py-2"
                >
                  <span>Show Details</span>
                  {expandedPlans[plan.id] ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </Button>

                {expandedPlans[plan.id] && (
                  <div className="space-y-2 mt-2">
                    {plan.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 ${
                          !feature.isActive ? "opacity-40" : ""
                        }`}
                      >
                        <CheckIcon className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleInsurancePlanSelect(plan.id)}
                variant={"outline"}
                className="w-full bg-gray-300 font-semibold text-orange-950"
              >
                {plan.id === "no-protection" ? "Select" : `Add ${plan.name}`}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-6">
        <Title title="Flexible Ticket" />
        <div className="gap-4 bg-white border border-border rounded-sm p-4 pb-6 pt-12">
          <div className="border rounded-lg p-6 relative shadow-md w-full">
            {flexibleTicket.recommended && (
              <div className="absolute -top-3 right-[50%] translate-x-[50%] bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm flex items-center gap-2">
                <StarIcon className="w-4 h-4" />
                <span>Recommended</span>
              </div>
            )}

            <div className="space-y-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-6">
                <p>{flexibleTicket.description}</p>
                <p className="text-lg font-semibold text-brown">
                  +${flexibleTicket.price}
                </p>
              </div>

              <div className="space-y-2">
                {flexibleTicket.features.map((feature, index) => (
                  <>
                    <div key={index} className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                    <hr className="w-full" />
                  </>
                ))}
              </div>

              <Button
                variant={"outline"}
                className={`w-full font-semibold ${
                  formData.extras.isFlexibleTicketSelected
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-orange-950"
                }`}
                onClick={handleFlexibleTicketToggle}
              >
                {formData.extras.isFlexibleTicketSelected
                  ? "Remove flexible ticket"
                  : "Add flexible ticket"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
