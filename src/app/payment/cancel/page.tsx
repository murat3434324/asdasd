"use client";

import { Ban } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <Ban className="w-16 h-16 text-yellow-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          The payment process has been cancelled. You can try again or choose a
          different payment method.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors w-full"
          >
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-block border border-brown text-brown px-6 py-3 rounded-lg font-medium hover:bg-brown hover:text-white transition-colors w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
