"use client";

import { useBookingContext } from "@/context/BookingContext";
import Title from "./Title";
import FormInput from "@/components/ui/forminput";
import { BirthDatePicker } from "@/components/ui/birthDatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useCallback } from "react";
import { TemplateType } from "@/types/Flight";

interface PassengerFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  email: string;
}

const formatBirthDate = (date: string) => {
  if (!date) return "";

  if (date.includes("-") && date.split("-").length === 3) {
    const [year] = date.split("-");
    if (year.length === 4) {
      return date;
    }
  }

  const parts = date.split("-").map((part) => part.trim());
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${month}-${day}`;
  }

  return date;
};

export default function PassengerDetails() {
  const {
    bookingData: { template },
    setIsCurrentStepValid,
    formData,
    updatePassengerData,
  } = useBookingContext();

  const [showErrors, setShowErrors] = useState(false);

  const validatePassenger = useCallback((passenger: PassengerFormData, isChild = false) => {
    const errors = [];
    if (!passenger.first_name) errors.push("first_name");
    if (!passenger.last_name) errors.push("last_name");
    if (!passenger.birth_date) errors.push("birth_date");
    if (!passenger.gender) errors.push("gender");
    if (!isChild) {
      if (!passenger.email) {
        errors.push("email");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(passenger.email)) {
          errors.push("email_format");
        }
      }
    }
    return errors;
  }, []);

  const validateForm = useCallback(() => {
    const adultErrors = formData.passengers.adults
      .map((passenger, index) => ({
        index,
        errors: validatePassenger(passenger),
      }))
      .filter((item) => item.errors.length > 0);

    const childErrors = formData.passengers.children
      .map((passenger, index) => ({
        index,
        errors: validatePassenger(passenger, true),
      }))
      .filter((item) => item.errors.length > 0);

    return { adultErrors, childErrors };
  }, [formData.passengers, validatePassenger]);

  useEffect(() => {
    const { adultErrors, childErrors } = validateForm();
    const hasErrors = adultErrors.length > 0 || childErrors.length > 0;

    if (hasErrors && formData.passengers.terms_accepted) {
      updatePassengerData({
        ...formData.passengers,
        terms_accepted: false,
      });
    }

    const isValid =
      adultErrors.length === 0 &&
      childErrors.length === 0 &&
      formData.passengers.terms_accepted;
    setIsCurrentStepValid(isValid);
  }, [
    formData.passengers,
    setIsCurrentStepValid,
    updatePassengerData,
    validateForm,
  ]);

  const updatePassengerDetails = (
    type: "adults" | "children",
    index: number,
    field: keyof PassengerFormData,
    value: string
  ) => {
    const updatedData = {
      ...formData.passengers,
      [type]: formData.passengers[type].map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger
      ),
    };
    updatePassengerData(updatedData);
  };

  const handleTermsChange = (checked: boolean) => {
    setShowErrors(true);
    const { adultErrors, childErrors } = validateForm();
    const hasErrors = adultErrors.length > 0 || childErrors.length > 0;

    if (hasErrors && checked) {
      return;
    }

    updatePassengerData({
      ...formData.passengers,
      terms_accepted: checked,
    });
  };

  return (
    <div className="space-y-4">
      <Title title="Passenger Details" />
      {template.adult_count > 0 && (
        <div className="space-y-4 border border-border rounded-sm p-4 bg-white">
          {Array(template.adult_count)
            .fill(0)
            .map((_, index) => (
              <AdultPassengerForm
                key={index}
                index={index}
                template={template}
                formData={formData.passengers.adults[index]}
                updatePassengerData={(field, value) =>
                  updatePassengerDetails("adults", index, field, value)
                }
                showErrors={showErrors}
                validatePassenger={validatePassenger}
              />
            ))}
        </div>
      )}
      {(template.children_count || 0) > 0 && (
        <div className="space-y-4 border border-border rounded-sm p-4 bg-white">
          {Array(template.children_count)
            .fill(0)
            .map((_, index) => (
              <ChildPassengerForm
                key={index}
                index={index}
                template={template}
                formData={formData.passengers.children[index]}
                updatePassengerData={(field, value) =>
                  updatePassengerDetails("children", index, field, value)
                }
                showErrors={showErrors}
                validatePassenger={validatePassenger}
              />
            ))}
        </div>
      )}
      <div className="pt-4 space-y-2">
        <label className="flex items-center gap-2 w-full bg-white p-4 rounded-sm border-border border cursor-pointer">
          <input
            type="checkbox"
            checked={formData.passengers.terms_accepted}
            onChange={(e) => handleTermsChange(e.target.checked)}
            className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            Confirm that the passenger details are correct.
          </span>
        </label>
      </div>
    </div>
  );
}

const PassengerForm = ({
  index,
  formData,
  updatePassengerData,
  validatePassenger,
  showErrors,
  isChild = false,
}: {
  index: number;
  formData: PassengerFormData;
  updatePassengerData: (field: keyof PassengerFormData, value: string) => void;
  validatePassenger: (passenger: PassengerFormData) => string[];
  showErrors: boolean;
  isChild?: boolean;
}) => {
  const errors = validatePassenger(formData);
  const getFieldError = (field: keyof PassengerFormData) => {
    if (!showErrors) return "";

    const errorMessages: Record<
      keyof PassengerFormData | "email_format",
      string
    > = {
      first_name: "First name is required",
      middle_name: "",
      last_name: "Last name is required",
      birth_date: "Date of birth is required",
      gender: "Gender selection is required",
      email: "Email is required",
      email_format: "Please enter a valid email address",
    };

    if (field === "email") {
      if (errors.includes("email_format")) {
        return errorMessages.email_format;
      }
      if (errors.includes("email")) {
        return errorMessages.email;
      }
    }

    return errors.includes(field) ? errorMessages[field] : "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <FormInput
          label="First Name"
          name={`passenger_${index}_first_name`}
          type="text"
          value={formData.first_name}
          placeholder="e.g John"
          onChange={(e) => updatePassengerData("first_name", e.target.value)}
          required
          error={getFieldError("first_name")}
        />

        <FormInput
          label="Middle Name"
          name={`passenger_${index}_middle_name`}
          type="text"
          value={formData.middle_name}
          placeholder="e.g Martin"
          onChange={(e) => updatePassengerData("middle_name", e.target.value)}
        />

        <FormInput
          label="Last Name"
          name={`passenger_${index}_last_name`}
          type="text"
          value={formData.last_name}
          placeholder="e.g Doe"
          onChange={(e) => updatePassengerData("last_name", e.target.value)}
          required
          error={getFieldError("last_name")}
        />
      </div>
      <div className="flex flex-col md:flex-row items-start justify-start gap-2">
        <div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center">
              <label className="block text-sm font-medium">
                Birth Date
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            <BirthDatePicker
              value={formatBirthDate(formData.birth_date)}
              onChange={(date) => updatePassengerData("birth_date", date)}
              error={getFieldError("birth_date")}
            />
          </div>
        </div>

        <div className="h-full w-full md:w-fit">
          <div className="flex flex-col gap-2 h-full w-full md:w-fit">
            <div className="flex items-center">
              <label className="text-sm font-medium">
                Gender
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Select
                value={formData.gender}
                onValueChange={(value) => updatePassengerData("gender", value)}
              >
                <SelectTrigger
                  className={`w-full md:w-[150px] h-10 gap-2 border-border border rounded-sm text-muted-foreground py-2.5 shadow-none ${
                    showErrors && getFieldError("gender")
                      ? "border-red-500"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {showErrors && getFieldError("gender") && (
                <p className="text-sm text-red-500">
                  {getFieldError("gender")}
                </p>
              )}
            </div>
          </div>
        </div>
        {!isChild && (
          <div className="h-full min-w-fit w-full md:w-fit">
            <FormInput
              label="Email"
              name={`passenger_${index}_email`}
              type="email"
              value={formData.email}
              placeholder="e.g flight@gmail.com"
              onChange={(e) => updatePassengerData("email", e.target.value)}
              required
              error={getFieldError("email")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const AdultPassengerForm = ({
  index,
  template,
  formData,
  updatePassengerData,
  showErrors,
  validatePassenger,
}: {
  index: number;
  template: TemplateType;
  formData: PassengerFormData;
  updatePassengerData: (field: keyof PassengerFormData, value: string) => void;
  showErrors: boolean;
  validatePassenger: (passenger: PassengerFormData) => string[];
}) => {
  return (
    <div key={index}>
      <h3 className="text-lg  mb-5">
        Passenger {index + 1}{" "}
        <span className="text-muted-foreground">(Adult)</span>
      </h3>
      <PassengerForm
        index={index}
        formData={formData}
        updatePassengerData={updatePassengerData}
        validatePassenger={validatePassenger}
        showErrors={showErrors}
      />
      {index !== template.adult_count - 1 && <hr className="my-6" />}
    </div>
  );
};

const ChildPassengerForm = ({
  index,
  template,
  formData,
  updatePassengerData,
  showErrors,
  validatePassenger,
}: {
  index: number;
  template: TemplateType;
  formData: PassengerFormData;
  updatePassengerData: (field: keyof PassengerFormData, value: string) => void;
  showErrors: boolean;
  validatePassenger: (passenger: PassengerFormData) => string[];
}) => {
  return (
    <div key={index}>
      <h3 className="text-lg  mb-5">
        Passenger {index + 1}{" "}
        <span className="text-muted-foreground">(Child)</span>
      </h3>
      <PassengerForm
        index={index}
        formData={formData}
        updatePassengerData={updatePassengerData}
        validatePassenger={validatePassenger}
        showErrors={showErrors}
        isChild={true}
      />
      {index !== (template.children_count || 0) - 1 && <hr className="my-6" />}
    </div>
  );
};
