import FormContent from "@/components/booking/FormContent";
import Header from "@/components/booking/Header";
import Stepper from "@/components/booking/Stepper";
import { Toaster } from "@/components/ui/toaster";
import { BookingProvider } from "@/context/BookingContext";
import { notFound } from "next/navigation";

export default async function TokenPage({
  params,
}: {
  params: { token: string };
}) {
  const bookingData = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/templates/${params.token}`,
    {
      cache: "no-store",
    }
  )
    .then((res) => res.json())
    .then((data) => data.data)

    .catch((err) => {
      console.error(err);
      return notFound();
    });

  if (!bookingData) {
    return notFound();
  }

  return (
    <main className="container w-full mx-auto xl:px-16 py-4 min-h-screen space-y-6 prose prose-sm xl:prose-base ">
      <BookingProvider bookingData={bookingData}>
        <Header />
        <Stepper />
        <FormContent />
      </BookingProvider>
      <Toaster />
    </main>
  );
}
