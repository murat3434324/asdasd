export type AirCompanyType = {
  name: string;
  logo: string;
};

export type FlightType = {
  id: number;
  flight_type: "departure" | "return";
  from_city: string;
  from_airport_code: string;
  to_city: string;
  to_airport_code: string;
  departure_date: string;
  arrival_date: string;
  travel_time_hours: number;
  travel_time_minutes: number;
  airline_code: string;
  flight_number: string;
  aircraft_type: string;
  cabin_class: string;
  is_connection: boolean;
  air_company: AirCompanyType;
  connections: FlightType[];
};

export type CompanyType = {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  representative_name: string;
  representative_avatar: string;
};

export interface TemplateType {
  id: number;
  token: string;
  customer_name: string;
  has_return: boolean;
  adult_count: number;
  price_per_adult: string;
  has_children: boolean;
  children_count: number | null;
  price_per_child: string | null;
  total_price: string;
  taxes: string;
  created_at: string;
  updated_at: string;
  company_logo?: string;
}

export type BookingResponseType = {
  template: TemplateType;
  company: CompanyType;
  flights: FlightType[];
};

export type BillingType = {
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  phones?: string[];
};
