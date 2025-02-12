"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import Title from "@/components/booking/FormContent/Title";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useBookingContext } from "@/context/BookingContext";
import { PhoneIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import BillingDetails from "./BillingDetails";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Amex from "@/svg/amex.svg";
import Discover from "@/svg/discover.svg";
import Mastercard from "@/svg/mastercard.svg";
import Visa from "@/svg/visa.svg";
import Image from "next/image";
import FormInput from "@/components/ui/forminput";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { BillingType } from "@/types/Flight";

const paymentSchema = z.discriminatedUnion("paymentMethod", [
  z.object({
    paymentMethod: z.literal("card"),

    tip: z.number().min(0).optional(),
    tipAgreement: z.boolean().optional().default(false),
    termsAgreement: z
      .boolean()
      .refine((val) => val !== undefined && val !== null, {
        message: "Please accept the terms and conditions",
      })
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions to continue",
      }),
    termsAccepted: z.boolean().default(false),
    paymentAccepted: z.boolean().default(false),
    billing: z.array(
      z.object({
        country: z.string().min(1, "Country selection is required"),
        state: z.string().min(1, "State/Region is required"),
        city: z.string().min(1, "City is required"),
        address: z.string().min(1, "Address is required"),
        zipCode: z.string().min(1, "Postal code is required"),
        phones: z.array(z.string().min(1, "Phone number is required")),
      })
    ),
    cardDetails: z.object({
      cardNumber: z
        .string()
        .min(16, "Card number must be 16 digits")
        .max(19, "Card number cannot be more than 19 digits")
        .regex(/^[0-9\s-]+$/, "Invalid card number format")
        .refine((val) => {
          const cleanNumber = val.replace(/[\s-]/g, "");
          let sum = 0;
          let isEven = false;

          for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber[i]);

            if (isEven) {
              digit *= 2;
              if (digit > 9) {
                digit -= 9;
              }
            }

            sum += digit;
            isEven = !isEven;
          }

          return sum % 10 === 0;
        }, "Invalid card number"),
      cardholderName: z.string().min(1, "Cardholder name is required"),
      expiryDate: z
        .string()
        .regex(
          /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
          "Invalid expiry date format (MM/YY)"
        )
        .refine((val) => {
          const [month, year] = val.split("/").map((num) => parseInt(num));
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;

          if (year < currentYear) return false;
          if (year === currentYear && month < currentMonth) return false;
          return true;
        }, "Card has expired"),
      cvc: z
        .string()
        .min(3, "CVC must be at least 3 digits")
        .max(4, "CVC can be at most 4 digits")
        .regex(/^[0-9]+$/, "CVC must contain only numbers"),
      servicePhone: z.string().min(1, "Phone number is required"),
    }),
  }),
  z.object({
    paymentMethod: z.literal("crypto"),
    tip: z.number().min(0).optional(),
    tipAgreement: z.boolean().optional().default(false),
    termsAgreement: z
      .boolean()
      .refine((val) => val !== undefined && val !== null, {
        message: "Please accept the terms and conditions",
      })
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions to continue",
      }),
    termsAccepted: z.boolean().default(false),
    paymentAccepted: z.boolean().default(false),
    billing: z.array(
      z.object({
        country: z.string().min(1, "Country selection is required"),
        state: z.string().min(1, "State/Region is required"),
        city: z.string().min(1, "City is required"),
        address: z.string().min(1, "Address is required"),
        zipCode: z.string().min(1, "Postal code is required"),
        phones: z.array(z.string().min(1, "Phone number is required")),
      })
    ),
    cardDetails: z.undefined(),
  }),
]);

type PaymentFormData = z.infer<typeof paymentSchema>;

type FormErrors = {
  cardDetails?: {
    cardNumber?: { message?: string };
    cardholderName?: { message?: string };
    expiryDate?: { message?: string };
    cvc?: { message?: string };
    servicePhone?: { message?: string };
  };
};

export default function PaymentDetails() {
  const {
    bookingData: { company },
    setIsCurrentStepValid,
    formData,
    updatePaymentData,
  } = useBookingContext();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    formData.payment.tip || null
  );
  const [customAmount, setCustomAmount] = useState<string>(
    formData.payment.tip ? formData.payment.tip.toString() : ""
  );
  const [billingDetails, setBillingDetails] = useState<number[]>([0]);

  // Initial form values
  useEffect(() => {
    if (formData.payment.tip) {
      setSelectedAmount(formData.payment.tip);
      setCustomAmount(formData.payment.tip.toString());
    }
  }, [formData.payment.tip]);

  const methods = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: "onChange",
    defaultValues: {
      paymentMethod: formData.payment.paymentMethod || "card",
      tip: formData.payment.tip || 0,
      tipAgreement: formData.payment.tipAgreement || false,
      termsAgreement: formData.payment.termsAgreement || false,
      termsAccepted: formData.payment.termsAccepted || false,
      paymentAccepted: formData.payment.paymentAccepted || false,
      billing:
        formData.payment.billing?.length > 0
          ? formData.payment.billing
          : [
              {
                country: "",
                state: "",
                city: "",
                address: "",
                zipCode: "",
                phones: [""],
              },
            ],
      cardDetails: {
        cardNumber: formData.payment.cardDetails?.cardNumber || "",
        cardholderName: formData.payment.cardDetails?.cardholderName || "",
        expiryDate: formData.payment.cardDetails?.expiryDate || "",
        cvc: formData.payment.cardDetails?.cvc || "",
        servicePhone: formData.payment.cardDetails?.servicePhone || "",
      },
    } as PaymentFormData,
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = methods;

  const formValues = useWatch({
    control: methods.control,
  });

  // Form değerlerini güncelle
  useEffect(() => {
    if (formData.payment.cardDetails) {
      methods.setValue("cardDetails", {
        cardNumber: formData.payment.cardDetails.cardNumber || "",
        cardholderName: formData.payment.cardDetails.cardholderName || "",
        expiryDate: formData.payment.cardDetails.expiryDate || "",
        cvc: formData.payment.cardDetails.cvc || "",
        servicePhone: formData.payment.cardDetails.servicePhone || "",
      });
    }
  }, [formData.payment.cardDetails, methods]);

  useEffect(() => {
    if (formValues && formValues.paymentMethod) {
      const billingArray = formValues?.billing || [];
      const billingValid =
        billingArray.length > 0 &&
        billingArray.every((billing: BillingType | undefined | null) => {
          if (!billing) return false;
          const phones = billing.phones || [];
          return (
            !!billing.country &&
            !!billing.state &&
            !!billing.city &&
            !!billing.address &&
            !!billing.zipCode &&
            phones.length > 0 &&
            phones.every((phone: string) => !!phone && phone.length > 0)
          );
        });

      const cardDetailsValid =
        formValues.paymentMethod === "card"
          ? !!formValues.cardDetails &&
            !!formValues.cardDetails.cardNumber &&
            !!formValues.cardDetails.cardholderName &&
            !!formValues.cardDetails.expiryDate &&
            !!formValues.cardDetails.cvc &&
            !!formValues.cardDetails.servicePhone
          : true;

      const isFormValid =
        formValues.termsAgreement === true && billingValid && cardDetailsValid;

      setIsCurrentStepValid(isFormValid);

      // Debounce ile form verilerini güncelleme
      const timeoutId = setTimeout(() => {
        const basePaymentData = {
          tip: Number(formValues.tip || 0) as number,
          tipAgreement: Boolean(formValues.tipAgreement || false),
          termsAgreement: Boolean(formValues.termsAgreement || false),
          termsAccepted: Boolean(formValues.termsAccepted || false),
          paymentAccepted: Boolean(formValues.paymentAccepted || false),
          billing:
            formValues.billing?.map((billing: BillingType) => ({
              country: String(billing?.country || ""),
              state: String(billing?.state || ""),
              city: String(billing?.city || ""),
              address: String(billing?.address || ""),
              zipCode: String(billing?.zipCode || ""),
              phones: (billing?.phones || [""]).map((phone: string) =>
                String(phone || "")
              ),
            })) || [],
        };

        const paymentData =
          formValues.paymentMethod === "card"
            ? {
                ...basePaymentData,
                paymentMethod: "card" as const,
                cardDetails: {
                  cardNumber: formValues.cardDetails?.cardNumber || "",
                  cardholderName: formValues.cardDetails?.cardholderName || "",
                  expiryDate: formValues.cardDetails?.expiryDate || "",
                  cvc: formValues.cardDetails?.cvc || "",
                  servicePhone: formValues.cardDetails?.servicePhone || "",
                },
              }
            : {
                ...basePaymentData,
                paymentMethod: "crypto" as const,
                cardDetails: undefined,
              };

        updatePaymentData(paymentData);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formValues, updatePaymentData, setIsCurrentStepValid]);

  useEffect(() => {
    if (formValues?.paymentMethod === "crypto") {
      setValue("cardDetails", undefined);
    } else if (formValues?.paymentMethod === "card") {
      setValue("cardDetails", {
        cardNumber: formData.payment.cardDetails?.cardNumber || "",
        cardholderName: formData.payment.cardDetails?.cardholderName || "",
        expiryDate: formData.payment.cardDetails?.expiryDate || "",
        cvc: formData.payment.cardDetails?.cvc || "",
        servicePhone: formData.payment.cardDetails?.servicePhone || "",
      });
    }
  }, [formValues?.paymentMethod, setValue, formData.payment.cardDetails]);

  const onSubmit = (data: PaymentFormData) => {
    console.log("Form data:", data);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setValue("tip", amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(value ? Number(value) : null);
    setValue("tip", value ? Number(value) : 0);
  };

  /* const addBillingDetails = () => {
    setBillingDetails([...billingDetails, billingDetails.length]);
    const currentBilling = watch("billing") || [];
    setValue("billing", [
      ...currentBilling,
      {
        country: "",
        state: "",
        city: "",
        address: "",
        zipCode: "",
        phones: [""],
      },
    ]);
  }; */

  const removeBillingDetails = (index: number) => {
    setBillingDetails(billingDetails.filter((_, i) => i !== index));
    const currentBilling = watch("billing") || [];
    setValue(
      "billing",
      currentBilling.filter((_: BillingType, i: number) => i !== index)
    );
  };

  const handleTermsAgreementChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue("termsAgreement", e.target.checked);

    if (e.target.checked) {
      const isValid = await trigger(
        Object.keys(methods.getValues()).filter(
          (key) => key !== "termsAgreement"
        ) as (keyof PaymentFormData)[]
      );

      if (!isValid) {
        e.target.checked = false;
        setValue("termsAgreement", false);

        const firstError = document.querySelector(".text-red-500");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  const getCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s+/g, "");

    if (cleanNumber.startsWith("34") || cleanNumber.startsWith("37")) {
      return { type: "amex", logo: Amex };
    } else if (cleanNumber.startsWith("6")) {
      return { type: "discover", logo: Discover };
    } else if (cleanNumber.startsWith("5")) {
      return { type: "mastercard", logo: Mastercard };
    } else if (cleanNumber.startsWith("4")) {
      return { type: "visa", logo: Visa };
    }

    return { type: "unknown", logo: Visa }; // Default to Visa
  };

  const handlePhoneChange = useCallback(
    (phone: string) => {
      const cleanPhone = phone.replace(/\D/g, "");
      methods.setValue("cardDetails.servicePhone", cleanPhone);
    },
    [methods.setValue]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Tip Section */}
        <div className="space-y-4">
          <Title title="Leave a Tip for Your Travel Advisor" />
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6">
              <div>
                <p className="font-semibold mb-2">
                  Did you enjoy your agent&apos;s service?
                </p>
                <p className="text-sm text-gray-500">
                  You may leave a tip if your travel agent performed beyond your
                  expectations.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <div className="flex flex-col items-start md:items-end order-2 md:order-1">
                  <span className="font-semibold text-sm">{company.name}</span>
                  <div className="text-brown flex gap-1 items-center">
                    <PhoneIcon className="w-4 h-4" />
                    <span className="text-sm">{company.phone}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center order-1 md:order-2">
                  <Avatar>
                    <AvatarImage src={company.logo} />
                    <AvatarFallback>{company.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            <hr className="w-full" />

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <p className="font-semibold mb-2">
                    Please select the desired amount
                  </p>
                  <div className="flex gap-3 mb-4">
                    {[50, 100, 200, 250].map((amount) => (
                      <button
                        type="button"
                        key={amount}
                        className={`px-4 h-10 py-2 border rounded-md min-w-[80px] ${
                          selectedAmount === amount ? "bg-brown text-white" : ""
                        }`}
                        onClick={() => handleAmountSelect(amount)}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">
                    Or enter a custom tip amount
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="50"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="pl-8 pr-4 h-10 py-2 border rounded-md md:w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...methods.register("tipAgreement")}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                I agree to include the tip fee in my purchase process.
              </span>
            </label>
          </div>
        </div>

        {/* Billing Section */}
        <div className="space-y-4">
          <Title title="Payment Details" />
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold">Billing</h3>
            <div className="space-y-4">
              {billingDetails.map((_, index) => (
                <BillingDetails
                  key={index}
                  index={index}
                  onRemove={
                    index > 0 ? () => removeBillingDetails(index) : undefined
                  }
                />
              ))}
              {/* <button
                type="button"
                onClick={addBillingDetails}
                className="bg-blue-100 text-blue-400 px-4 py-2 rounded-md w-fit hover:bg-blue-200"
              >
                Add Another Billing
              </button> */}
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="space-y-4">
          <Title title="Payment Method" />
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            {/* Card Payment Option */}
            <div className="border rounded-lg border-border p-4">
              <div className="flex items-center justify-center gap-2">
                <div className="relative w-4 h-4">
                  <input
                    type="radio"
                    id="card-payment"
                    {...methods.register("paymentMethod")}
                    value="card"
                    defaultChecked={formData.payment.paymentMethod === "card"}
                    className="appearance-none w-4 h-4 rounded-full border-2 border-brown checked:border-brown checked:border-4"
                  />
                </div>
                <label htmlFor="card-payment" className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pay with card</span>
                    <div className="flex gap-2">
                      <Image
                        src={Amex}
                        alt="American Express"
                        className="h-6 w-6"
                      />
                      <Image
                        src={Mastercard}
                        alt="Mastercard"
                        className="h-6 w-6"
                      />
                      <Image src={Visa} alt="Visa" className="h-6 w-6" />
                      <Image
                        src={Discover}
                        alt="Discover"
                        className="h-6 w-6"
                      />
                    </div>
                  </div>
                </label>
              </div>

              {/* Card Details Form */}
              {watch("paymentMethod") === "card" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/*Form Inputs */}
                  <div className="space-y-4">
                    <div>
                      <FormInput
                        type="text"
                        label="Card number"
                        minLength={16}
                        maxLength={19}
                        required
                        {...methods.register("cardDetails.cardNumber")}
                        error={
                          (errors as FormErrors)?.cardDetails?.cardNumber
                            ?.message
                        }
                        placeholder="5625 3720 0085 5038"
                      />
                    </div>

                    <div>
                      <FormInput
                        type="text"
                        label="Cardholder&apos;s name"
                        required
                        {...methods.register("cardDetails.cardholderName")}
                        error={
                          (errors as FormErrors)?.cardDetails?.cardholderName
                            ?.message
                        }
                        placeholder="Ashley J. Beery"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormInput
                        type="text"
                        label="Expiry date"
                        required
                        {...methods.register("cardDetails.expiryDate")}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          methods.setValue('cardDetails.expiryDate', value);
                        }}
                        maxLength={5}
                        error={
                          (errors as FormErrors)?.cardDetails?.expiryDate
                            ?.message
                        }
                        placeholder="04/29"
                      />
                      <FormInput
                        type="password"
                        label="CVC"
                        required
                        {...methods.register("cardDetails.cvc")}
                        error={
                          (errors as FormErrors)?.cardDetails?.cvc?.message
                        }
                        placeholder="•••"
                      />
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full md:w-fit">
                      <label className="block text-sm font-medium text-gray-700">
                        Card customer service phone{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        country={"us"}
                        value={methods.watch("cardDetails.servicePhone")}
                        onChange={handlePhoneChange}
                        inputClass={`!w-full md:w-fit border rounded-md p-2 h-10 ${
                          (errors as FormErrors)?.cardDetails?.servicePhone
                            ? "border-red-500"
                            : "border-border"
                        }`}
                        enableSearch={true}
                        disableSearchIcon={true}
                        countryCodeEditable={false}
                      />
                      {(errors as FormErrors)?.cardDetails?.servicePhone && (
                        <p className="mt-1 text-sm text-red-500">
                          {
                            (errors as FormErrors)?.cardDetails?.servicePhone
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="hidden md:block place-self-center self-center relative h-[200px] w-[350px] rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 p-6 text-white shadow-lg">
                    {/* Card Logo */}
                    <div className="absolute right-6 top-6">
                      <Image
                        src={
                          getCardType(
                            methods.watch("cardDetails.cardNumber") || ""
                          ).logo
                        }
                        alt="Card Type"
                        className="h-8 w-8 object-contain"
                      />
                    </div>

                    {/* Chip */}
                    <div className="mt-4">
                      <div className="h-9 w-12 rounded-md bg-yellow-400/80" />
                    </div>

                    {/* Card Number */}
                    <div className="mt-6">
                      <p className="font-mono text-lg tracking-widest">
                        {methods.watch("cardDetails.cardNumber")
                          ? methods
                              .watch("cardDetails.cardNumber")
                              .replace(/(\d{4})/g, "$1 ")
                              .trim()
                          : "•••• •••• •••• ••••"}
                      </p>
                    </div>

                    {/* Card Details */}
                    <div className="mt-6 flex justify-between">
                      <div>
                        <p className="text-xs text-gray-300">Card Holder</p>
                        <p className="font-medium tracking-wider">
                          {methods.watch("cardDetails.cardholderName") ||
                            "FULL NAME"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">Expires</p>
                        <p className="font-medium tracking-wider">
                          {methods.watch("cardDetails.expiryDate") || "MM/YY"}
                        </p>
                      </div>
                    </div>

                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 z-[-1] rounded-xl opacity-50">
                      <div className="absolute inset-x-0 -bottom-2 h-40 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute -right-28 -top-28 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
                      <div className="absolute -left-28 -bottom-28 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Crypto Payment Option */}
            <div className="border rounded-lg border-border p-4">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="radio"
                  id="crypto-payment"
                  {...methods.register("paymentMethod")}
                  value="crypto"
                  defaultChecked={formData.payment.paymentMethod === "crypto"}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-brown checked:border-brown checked:border-4"
                />
                <label htmlFor="crypto-payment" className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pay with Crypto</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...methods.register("termsAgreement")}
                onChange={handleTermsAgreementChange}
                className={`rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
                  errors.termsAgreement ? "border-red-500" : ""
                }`}
              />
              <span className="text-sm text-gray-600">
                I confirm that I have read and agree to the{" "}
                <span className="text-blue-300">Terms and Conditions</span>
              </span>
            </label>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}