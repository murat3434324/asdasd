"use client";

import { memo, useState } from "react";
import TrustPilot from "@/svg/trustpilot.svg";
import { useBookingContext } from "@/context/BookingContext";
import { ArrowRightIcon, CheckIcon, Loader2, StarIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { createPlisioInvoice } from "@/app/actions/plisio";
import { useRouter } from "next/navigation";

const PaymentCard = () => {
  const {
    isCurrentStepValid,
    handleCompleteStep,
    currentStep,
    bookingData,
    formData,
  } = useBookingContext();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBookNow = async () => {
    setIsLoading(true);
    const bookingPayload = {
      token: bookingData.template.token,
      total_price: formData.payment.totalPrice,
      passengers: formData.passengers,
      extras: formData.extras,
      payment: formData.payment,
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
      body: JSON.stringify(bookingPayload),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success) {
          if (bookingPayload.payment.paymentMethod == "card") {
            toast({
              title: "Success",
              description: "Successfully booked your ticket",
              variant: "default",
            });
            router.push(
              `/payment/success?booking_token=${bookingData.template.token}`
            );
          } else {
            try {
              const mainPassenger = formData.passengers.adults[0];

              const billingInfo = formData.payment.billing[0];

              if (!data.data.booking_token) {
                throw new Error("Booking ID is missing");
              }

              const result = await createPlisioInvoice({
                orderId: data.data.booking_token,
                amount: data.data.total_price || 0,
                customerEmail: mainPassenger.email || "",
                customerPhone: billingInfo.phones[0] || "",
                customerName: `${mainPassenger.first_name} ${mainPassenger.last_name}`,
                bookingToken: bookingData.template.token,
              });

              if (result.success) {
                router.push(result.invoice_url);
                toast({
                  title: "Redirecting",
                  description: "You are being redirected to the payment page",
                  variant: "default",
                });
              } else {
                console.error("Plisio error details:", result.details);
                throw new Error(result.error || "Invoice creation failed");
              }
            } catch (error) {
              console.error("Plisio payment error:", error);
              toast({
                title: "Error",
                description:
                  error instanceof Error
                    ? error.message
                    : "An error occurred while creating the payment page",
                variant: "destructive",
              });
            }
          }
        } else {
          toast({
            title: "Error",
            description: "An error occurred while booking",
            variant: "destructive",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description: "An error occurred while booking",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full border-brown border-t-4 rounded-sm shadow-sm p-4 bg-white flex flex-col gap-4 sticky top-28">
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            Adult Ticket Price ({bookingData.template.adult_count} x $
            {formatCurrency(Number(bookingData.template.price_per_adult))})
          </span>
          <span className="font-semibold">
            $
            {formatCurrency(
              Number(bookingData.template.price_per_adult) *
                bookingData.template.adult_count
            )}
          </span>
        </div>
        {bookingData.template.has_children &&
          bookingData.template.children_count &&
          bookingData.template.price_per_child && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Child Ticket Price ({bookingData.template.children_count} x $
                {formatCurrency(Number(bookingData.template.price_per_child))})
              </span>
              <span className="font-semibold">
                $
                {formatCurrency(
                  Number(bookingData.template.price_per_child) *
                    bookingData.template.children_count
                )}
              </span>
            </div>
          )}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Taxes and Fees</span>
          <span className="font-semibold">
            ${formatCurrency(Number(bookingData.template.taxes))}
          </span>
        </div>
        {formData.extras.insurancePlan &&
          formData.extras.insurancePlan !== "no-protection" && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trip Protection</span>
              <span className="font-semibold">
                ${formatCurrency(Number(formData.extras.insurancePrice))}
              </span>
            </div>
          )}
        {formData.extras.isFlexibleTicketSelected && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Flexible Ticket</span>
            <span className="font-semibold">
              ${formatCurrency(Number(formData.extras.flexibleTicketPrice))}
            </span>
          </div>
        )}
        {formData.payment.tipAgreement && formData.payment.tip > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tip</span>
            <span className="font-semibold">
              ${formatCurrency(Number(formData.payment.tip))}
            </span>
          </div>
        )}
      </div>
      <div className="border-y-[1px] border-border py-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Amount (USD)</span>
          {formData.payment.totalPrice ? (
            <span className="font-semibold">
              ${formatCurrency(formData.payment.totalPrice)}
            </span>
          ) : (
            <div className="bg-gray-200 w-20 h-4 rounded-sm animate-pulse" />
          )}
        </div>
      </div>

      <button
        onClick={() =>
          isCurrentStepValid &&
          (currentStep === 5
            ? handleBookNow()
            : handleCompleteStep(currentStep))
        }
        className={cn(
          "w-full rounded-sm py-2 flex items-center justify-center gap-2",
          isCurrentStepValid
            ? "bg-brown text-white cursor-pointer hover:bg-brown/90 transition-colors active:scale-95"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        )}
        disabled={!isCurrentStepValid || isLoading}
      >
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{currentStep === 5 ? "Book Now" : "Continue"}</span>
          <ArrowRightIcon className="w-4 h-4" />
        </div>
      </button>
      <div className="flex flex-col text-muted-foreground">
        <span>Book with confidence</span>
        <div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>Live 24/7 support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>100% Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>100% Trusted</span>
          </div>
        </div>
      </div>
      <p>
        Our <span className="text-blue-300">Terms & Conditions</span> and{" "}
        <span className="text-blue-300">Privacy Policy</span>
      </p>
      <div className="border-y-[1px] border-border">
        <div className="grid grid-cols-3">
          <Image
            src={TrustPilot}
            alt="TrustPilot"
            className="w-14 h-14 xl:w-20 xl:h-20"
          />
          <Image
            src={TrustPilot}
            alt="TrustPilot"
            className="w-14 h-14 xl:w-20 xl:h-20"
          />
          <Image
            src={TrustPilot}
            alt="TrustPilot"
            className="w-14 h-14 xl:w-20 xl:h-20"
          />
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex flex-col">
        <p className="font-semibold">Customers Love Us</p>
        <p className="font-semibold">Over 1194+ Satisfied Travelers</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-0.5">
            <StarIcon className="w-6 h-6 text-white bg-green-600 p-1" />
            <StarIcon className="w-6 h-6 text-white bg-green-600 p-1" />
            <StarIcon className="w-6 h-6 text-white bg-green-600 p-1" />
            <StarIcon className="w-6 h-6 text-white bg-green-600 p-1" />
            <StarIcon className="w-6 h-6 text-white bg-green-600 p-1" />
          </div>
          <span className="text-base font-semibold">4.8</span>
        </div>
      </div>
    </div>
  );
};

export default memo(PaymentCard);
