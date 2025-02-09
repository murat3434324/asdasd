"use client";
import { useFormContext, FieldErrors } from "react-hook-form";
import FormInput from "@/components/ui/forminput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/constants/countries";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BillingFormData } from "@/context/BookingContext";

interface BillingDetailsProps {
  index: number;
  onRemove?: () => void;
}

type BillingForm = {
  billing: Array<BillingFormData>;
};

export default function BillingDetails({
  index,
  onRemove,
}: BillingDetailsProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext<BillingForm>();
  const [selectedCountry, setSelectedCountry] = useState<string>(
    watch(`billing.${index}.country`) || ""
  );
  const [phones, setPhones] = useState<string[]>(
    watch(`billing.${index}.phones`) || [""]
  );

  useEffect(() => {
    const currentBilling = watch(`billing.${index}`);
    if (currentBilling) {
      setSelectedCountry(currentBilling.country || "");
      setPhones(currentBilling.phones || [""]);
    }
  }, [watch, index]);

  const billingErrors = errors as unknown as FieldErrors<BillingForm>;

  const addPhone = () => {
    setPhones([...phones, ""]);
  };

  const updatePhone = async (value: string, phoneIndex: number) => {
    const newPhones = [...phones];
    newPhones[phoneIndex] = value;
    setPhones(newPhones);
    setValue(`billing.${index}.phones.${phoneIndex}`, value);
    await trigger();
  };

  const removePhone = async (phoneIndex: number) => {
    const newPhones = phones.filter((_, i) => i !== phoneIndex);
    setPhones(newPhones);
    setValue(
      `billing.${index}.phones`,
      newPhones.length > 0 ? newPhones : [""]
    );
    await trigger();
  };

  return (
    <div className="p-4 border border-border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Billing Details {index + 1}</h4>
        {onRemove && index > 0 && (
          <button
            onClick={onRemove}
            className="text-red-500 text-sm hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>
      <div className="space-y-4">
        {/* Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Country</label>

            <Select
              value={selectedCountry}
              onValueChange={async (value) => {
                setSelectedCountry(value);
                setValue(`billing.${index}.country`, value);
                await trigger(`billing.${index}.country`);
              }}
            >
              <SelectTrigger
                className={cn(
                  "h-10",
                  billingErrors?.billing?.[index]?.country
                    ? "border-red-500"
                    : ""
                )}
              >
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {billingErrors?.billing?.[index]?.country && (
              <p className="text-red-500 text-xs mt-1">
                Country selection is required
              </p>
            )}
          </div>
          <FormInput
            label="State/Region"
            type="text"
            {...register(`billing.${index}.state`, {
              required: "State/Region is required",
            })}
            error={billingErrors?.billing?.[index]?.state?.message}
            required
          />
          <FormInput
            label="City"
            type="text"
            {...register(`billing.${index}.city`, {
              required: "City is required",
            })}
            error={billingErrors?.billing?.[index]?.city?.message}
            required
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Address"
            type="text"
            {...register(`billing.${index}.address`, {
              required: "Address is required",
            })}
            error={billingErrors?.billing?.[index]?.address?.message}
            required
          />
          <FormInput
            label="Postal Code"
            type="number"
            {...register(`billing.${index}.zipCode`, {
              required: "Postal code is required",
            })}
            error={billingErrors?.billing?.[index]?.zipCode?.message}
            required
          />
        </div>

        {/* Phones */}
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {phones.map((phone, phoneIndex) => (
            <div key={phoneIndex} className="flex items-start gap-4 h-full">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-2">
                  {phoneIndex === 0 ? "Phone Number" : "Secondary Phone Number"}
                  <span className="text-xs text-red-500 ml-1">*</span>
                </label>
                <PhoneInput
                  country={"us"}
                  value={phone}
                  onChange={(value) => updatePhone(value, phoneIndex)}
                  inputClass={`!w-full !h-full min-h-10 ${
                    billingErrors?.billing?.[index]?.phones?.[phoneIndex]
                      ? "!border-red-500"
                      : ""
                  }`}
                />
                {billingErrors?.billing?.[index]?.phones?.[phoneIndex] && (
                  <p className="text-red-500 text-xs mt-1">
                    Phone number is required
                  </p>
                )}
              </div>
              {phoneIndex > 0 && (
                <button
                  onClick={() => removePhone(phoneIndex)}
                  className="text-red-500 hover:text-red-600 h-10 flex items-end justify-center self-center"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {phones.length < 2 && (
            <div className="">
              <button
                onClick={addPhone}
                className={cn(
                  "bg-gray-300 text-white px-4 py-2 rounded-md w-fit hover:bg-gray-400 h-10",
                  billingErrors?.billing?.[index]?.phones?.[0] && "mb-5"
                )}
              >
                Add Secondary Phone
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
