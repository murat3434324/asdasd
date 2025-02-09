"use client";

import { useEffect } from "react";
import { useBookingContext } from "@/context/BookingContext";
import Title from "./Title";
import ItineraryCard from "./ItineraryCard";
import type { PassengerFormData } from "@/context/BookingContext";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function Overview() {
  const {
    setIsCurrentStepValid,
    bookingData,
    formData,
    updatePaymentData,
    gotoStep,
  } = useBookingContext();
  const flights = bookingData?.flights?.filter((f) => !f.is_connection);

  const handleTermsAcceptedChange = (checked: boolean) => {
    updatePaymentData({
      ...formData.payment,
      termsAccepted: checked,
    });
  };

  const handlePaymentAcceptedChange = (checked: boolean) => {
    updatePaymentData({
      ...formData.payment,
      paymentAccepted: checked,
    });
  };

  useEffect(() => {
    setIsCurrentStepValid(
      formData.payment.termsAccepted && formData.payment.paymentAccepted
    );
  }, [
    setIsCurrentStepValid,
    formData.payment.termsAccepted,
    formData.payment.paymentAccepted,
  ]);

  return (
    <div className="space-y-4">
      <Title title="Overview & Payment" />
      {/* Itinerary */}
      <div>
        <div className="flex flex-col gap-6">
          {flights?.map((flight) => (
            <ItineraryCard key={flight.id} flight={flight} />
          ))}
        </div>
      </div>

      {/* Passenger Details */}
      <div className="space-y-4 border border-border rounded-sm p-4 bg-white">
        <h3 className="text-lg font-semibold">Passenger Details</h3>
        {formData.passengers.adults.map(
          (passenger: PassengerFormData, index: number) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold">
                Passenger {index + 1}{" "}
                <span className="font-medium text-muted-foreground">
                  (Adult)
                </span>
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 divide-black divide-x-2 divide">
                  <div>
                    <p className="text-sm">{`${passenger.first_name} ${
                      passenger.middle_name || ""
                    } ${passenger.last_name}`}</p>
                  </div>
                  <div className="pl-2">
                    <p className="text-sm">
                      {formatDateForDisplay(passenger.birth_date)}
                    </p>
                  </div>
                  <div className="pl-2">
                    <p className="text-sm">{passenger.gender}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm">{passenger.email}</p>
                </div>
              </div>
            </div>
          )
        )}
        {formData.passengers.children.map(
          (passenger: PassengerFormData, index: number) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold">
                Passenger {formData.passengers.adults.length + index + 1}{" "}
                <span className="font-medium text-muted-foreground">
                  (Child)
                </span>
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 divide-black divide-x-2 divide">
                  <div>
                    <p className="text-sm">{`${passenger.first_name} ${
                      passenger.middle_name || ""
                    } ${passenger.last_name}`}</p>
                  </div>
                  <div className="pl-2">
                    <p className="text-sm">
                      {formatDateForDisplay(passenger.birth_date)}
                    </p>
                  </div>
                  <div className="pl-2">
                    <p className="text-sm">{passenger.gender}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm">{passenger.email}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Extras */}
      <div className="space-y-4 border border-border rounded-sm p-4 bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">EXTRAS</h3>
          <button
            onClick={() => gotoStep(3)}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 bg-gray-200/80 text-gray-700 px-6 py-2 rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Edit
          </button>
        </div>
        <div className="space-y-2">
          {formData.extras.insurancePlan === "no-protection" ? (
            <p className="text-gray-700">Your trip is not protected.</p>
          ) : (
            formData.extras.insurancePlan && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <p className="text-gray-700">
                  Trip Protection: {formData.extras.insurancePlan}
                </p>
              </div>
            )
          )}

          {formData.extras.isFlexibleTicketSelected && (
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <p className="text-gray-700">Flexible Ticket Selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4 border border-border rounded-sm p-4 bg-white font-semibold">
        <div className="flex justify-between items-center">
          <h3 className="text-lg">PAYMENT DETAILS</h3>
          <button
            onClick={() => gotoStep(4)}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 bg-gray-200/80 text-gray-700 px-6 py-2 rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Edit
          </button>
        </div>

        {/* Billing Section */}
        <div className="space-y-4">
          <h4 className="text-gray-700">Billing</h4>
          {formData.payment.billing.map((billing, index) => (
            <div key={index} className="space-y-4">
              <h5 className="text-muted-foreground">
                Billing details {index + 1}
              </h5>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="text-gray-700">{billing.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zip code</p>
                  <p className="text-gray-700">{billing.zipCode}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    State Province
                  </p>
                  <p className="text-gray-700">{billing.state}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Billing phone</p>
                  <p className="text-gray-700">{billing.phones[0]}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="text-gray-700">{billing.city}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Secondary phone
                  </p>
                  <p className="text-gray-700">{billing.phones[1] || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Street address
                  </p>
                  <p className="text-gray-700">{billing.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <hr />
        {formData.payment.paymentMethod === "card" ? (
          <div className="space-y-6 font-semibold">
            {/* Card Payment Section */}
            {formData.payment.cardDetails && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Card payment</h4>
                <div className="space-y-4">
                  <h5 className="text-gray-600">Card 1</h5>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Number</p>
                      <p className="text-gray-700">
                        {"*".repeat(12) +
                          formData.payment.cardDetails.cardNumber.slice(-4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expiration date</p>
                      <p className="text-gray-700">
                        {formData.payment.cardDetails.expiryDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Cardholder&apos;s name
                      </p>
                      <p className="text-gray-700">
                        {formData.payment.cardDetails.cardholderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Card customer service phone
                      </p>
                      <p className="text-gray-700">
                        {formData.payment.cardDetails.servicePhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Crypto Payment Section */
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Crypto Payment</h4>
          </div>
        )}
      </div>

      {/* Terms and Conditions Checkboxes */}
      <div className="space-y-4 border border-border rounded-sm p-4 bg-white">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="payment-agreement"
            checked={formData.payment.paymentAccepted}
            onChange={(e) => handlePaymentAcceptedChange(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="payment-agreement" className="text-sm text-gray-700">
            I acknowledge that my card will be charged for the total amount
            shown above, which includes the flight/service fee processed by
            business-skies.com and all applicable airline and government taxes.
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms-agreement"
            checked={formData.payment.termsAccepted}
            onChange={(e) => handleTermsAcceptedChange(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms-agreement" className="text-sm text-gray-700">
            <span>I have read and accept business-skies.com&apos;s </span>
            <span className="text-primary hover:underline">
              Terms and Conditions
            </span>

            <span> and </span>
            <span className="text-primary hover:underline">Privacy Policy</span>
            <span>
              . I also understand that cancellations, changes, and refunds may
              not be possible before and/or after departure. All sales are final
              and non-refundable/non-transferable.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
