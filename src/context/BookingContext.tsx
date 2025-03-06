"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BookingResponseType } from "@/types/Flight";

interface Step {
  id: number;
  name: string;
  completed: boolean;
  current: boolean;
}

export interface PassengerFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  email: string;
}

export interface BillingFormData {
  country: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
  phones: string[];
}

interface ExtrasFormData {
  insurancePlan: string | null;
  isFlexibleTicketSelected: boolean;
  insurancePrice?: number;
  flexibleTicketPrice?: number;
}

interface PaymentFormData {
  tip: number;
  tipAgreement: boolean;
  termsAgreement: boolean;
  billing: BillingFormData[];
  paymentMethod: "card" | "crypto";
  totalPrice?: number;
  termsAccepted: boolean;
  paymentAccepted: boolean;
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvc: string;
    servicePhone: string;
  };
}

interface BookingFormData {
  passengers: {
    adults: PassengerFormData[];
    children: PassengerFormData[];
    terms_accepted: boolean;
  };
  extras: ExtrasFormData;
  payment: PaymentFormData;
  itinerary: {
    terms_accepted: boolean;
  };
}

const BookingContext = createContext<{
  steps: Step[];
  currentStep: number;
  handleCompleteStep: (stepId: number) => void;
  handleResetStep: (stepId: number) => void;
  isCurrentStepValid: boolean;
  setIsCurrentStepValid: (isValid: boolean) => void;
  bookingData: BookingResponseType;
  handlePreviousStep: () => void;
  formData: BookingFormData;
  updatePassengerData: (data: BookingFormData["passengers"]) => void;
  updateExtrasData: (data: BookingFormData["extras"]) => void;
  updatePaymentData: (data: BookingFormData["payment"]) => void;
  updateItineraryData: (data: BookingFormData["itinerary"]) => void;
  gotoStep: (stepId: number) => void;
  isLoading: boolean;
}>({
  steps: [],
  currentStep: 1,
  handleCompleteStep: () => {},
  handleResetStep: () => {},
  isCurrentStepValid: false,
  setIsCurrentStepValid: () => {},
  bookingData: {} as BookingResponseType,
  handlePreviousStep: () => {},
  formData: {} as BookingFormData,
  updatePassengerData: () => {},
  updateExtrasData: () => {},
  updatePaymentData: () => {},
  updateItineraryData: () => {},
  gotoStep: () => {},
  isLoading: true,
});

export const BookingProvider = ({
  children,
  bookingData,
}: {
  children: React.ReactNode;
  bookingData: BookingResponseType;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, name: "Itinerary", completed: false, current: true },
    { id: 2, name: "Passenger(s) details", completed: false, current: false },
    { id: 3, name: "Extras", completed: false, current: false },
    { id: 4, name: "Payment Details", completed: false, current: false },
    { id: 5, name: "Overview & Payment", completed: false, current: false },
  ]);

  const [itineraryData, setItineraryData] = useState<
    BookingFormData["itinerary"]
  >({
    terms_accepted: false,
  });

  const [passengerData, setPassengerData] = useState<
    BookingFormData["passengers"]
  >({
    adults: Array(bookingData.template.adult_count || 0).fill({
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      gender: "",
      email: "",
    }),
    children: Array(bookingData.template.children_count || 0).fill({
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      gender: "",
      email: "",
    }),
    terms_accepted: false,
  });

  const [extrasData, setExtrasData] = useState<BookingFormData["extras"]>({
    insurancePlan: "no-protection",
    isFlexibleTicketSelected: false,
    insurancePrice: 0,
    flexibleTicketPrice: 0,
  });

  const [paymentData, setPaymentData] = useState<BookingFormData["payment"]>({
    tip: 0,
    tipAgreement: false,
    termsAgreement: false,
    termsAccepted: false,
    paymentAccepted: false,
    billing: [
      {
        country: "",
        state: "",
        city: "",
        address: "",
        zipCode: "",
        phones: [""],
      },
    ],
    paymentMethod: "card",
  });

  const formData = useMemo(
    () => ({
      passengers: passengerData,
      extras: extrasData,
      payment: paymentData,
      itinerary: itineraryData,
    }),
    [passengerData, extrasData, paymentData, itineraryData]
  );

  useEffect(() => {
    if (bookingData) {
      setIsLoading(false);
    }
  }, [bookingData]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentStepValid, setCurrentStepValid] = useState<boolean>(false);

  const calculateTotalPrice = useCallback(() => {
    const basePrice = parseFloat(bookingData.template.total_price);
    const taxes = parseFloat(bookingData.template.taxes);

    let extrasTotal = 0;
    if (
      extrasData.insurancePlan &&
      extrasData.insurancePlan !== "no-protection"
    ) {
      extrasTotal += extrasData.insurancePrice || 0;
    }
    if (extrasData.isFlexibleTicketSelected) {
      extrasTotal += extrasData.flexibleTicketPrice || 0;
    }

    let tipAmount = 0;
    if (paymentData.tipAgreement && paymentData.tip > 0) {
      tipAmount = paymentData.tip;
    }

    return basePrice + extrasTotal + tipAmount;
  }, [
    bookingData.template.total_price,
    bookingData.template.taxes,
    extrasData,
    paymentData.tip,
    paymentData.tipAgreement,
  ]);

  const updatePassengerData = useCallback(
    (data: BookingFormData["passengers"]) => {
      setPassengerData(data);
    },
    []
  );

  const updateExtrasData = useCallback((data: BookingFormData["extras"]) => {
    setExtrasData(data);
  }, []);

  const updatePaymentData = useCallback(
    (data: BookingFormData["payment"]) => {
      setPaymentData((prev) => {
        const updatedData = { ...prev, ...data };
        const newTotalPrice = calculateTotalPrice();
        return { ...updatedData, totalPrice: newTotalPrice };
      });
    },
    [calculateTotalPrice]
  );

  const updateItineraryData = useCallback(
    (data: BookingFormData["itinerary"]) => {
      setItineraryData(data);
    },
    []
  );

  useEffect(() => {
    const newTotalPrice = calculateTotalPrice();
    setPaymentData((prev) => ({
      ...prev,
      totalPrice: newTotalPrice,
    }));
  }, [
    calculateTotalPrice,
    extrasData.insurancePlan,
    extrasData.isFlexibleTicketSelected,
    extrasData.insurancePrice,
    extrasData.flexibleTicketPrice,
    paymentData.tip,
    paymentData.tipAgreement,
  ]);

  const isCurrentStepValid = useMemo(
    () => currentStepValid,
    [currentStepValid]
  );

  const setIsCurrentStepValid = useCallback(
    (isValid: boolean) => {
      setCurrentStepValid(isValid);
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === currentStep ? { ...step, completed: isValid } : step
        )
      );
    },
    [currentStep]
  );

  const handleCompleteStep = useCallback((stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, completed: true, current: false }
          : step.id === stepId + 1
          ? { ...step, current: true }
          : step
      )
    );
    setCurrentStep(stepId + 1);
    setCurrentStepValid(false);
  }, []);

  const handlePreviousStep = useCallback(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === currentStep - 1 ? { ...step, current: true } : step
      )
    );
    setCurrentStep((prev) => prev - 1);
    setCurrentStepValid(false);
  }, [currentStep]);

  const handleResetStep = useCallback((stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, completed: false, current: false }
          : step
      )
    );
    setCurrentStep(stepId);
    setCurrentStepValid(false);
  }, []);

  const gotoStep = useCallback((stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, current: true }
          : {
              ...step,
              current: false,
              completed: step.id > stepId ? false : step.completed,
            }
      )
    );
    setCurrentStep(stepId);
  }, []);

  const contextValue = useMemo(
    () => ({
      steps,
      currentStep,
      handleCompleteStep,
      handleResetStep,
      isCurrentStepValid,
      setIsCurrentStepValid,
      bookingData,
      handlePreviousStep,
      formData,
      updatePassengerData,
      updateExtrasData,
      updatePaymentData,
      updateItineraryData,
      gotoStep,
      isLoading,
    }),
    [
      steps,
      currentStep,
      handleCompleteStep,
      handleResetStep,
      isCurrentStepValid,
      setIsCurrentStepValid,
      bookingData,
      handlePreviousStep,
      formData,
      updatePassengerData,
      updateExtrasData,
      updatePaymentData,
      updateItineraryData,
      gotoStep,
      isLoading,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
};
