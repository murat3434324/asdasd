import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-lg px-4">
        <div className="flex justify-center">
          <AlertCircle className="w-20 h-20 text-red-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-800">
            Invalid Request
          </h2>
          <p className="text-gray-600">
            The booking information you&apos;re looking for doesn&apos;t exist
            or might have expired. Please make sure you have the correct booking
            link.
          </p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
