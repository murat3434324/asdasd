import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailPage({
  searchParams,
}: {
  searchParams: { booking_token: string };
}) {
  const bookingToken = searchParams.booking_token;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          An error occurred during the payment process. Please try again or
          choose a different payment method.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors w-full"
          >
            Back to Home
          </Link>
          {bookingToken && (
            <Link
              href={`/bookings?booking_token=${bookingToken}`}
              className="inline-block border border-brown text-brown px-6 py-3 rounded-lg font-medium hover:bg-brown hover:text-white transition-colors w-full"
            >
              View My Bookings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
