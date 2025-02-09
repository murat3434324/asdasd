"use server";

interface CreateInvoiceParams {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  bookingToken: string;
}

export async function createPlisioInvoice({
  orderId,
  amount,
  customerEmail,
  customerPhone,
  customerName,
  bookingToken,
}: CreateInvoiceParams) {
  if (!orderId) {
    return {
      success: false,
      error: "Order ID is required",
    };
  }

  try {
    const params = new URLSearchParams({
      api_key: process.env.PLISIO_API_KEY || "",
      order_name: `Booking #${orderId}`,
      order_number: new Date().getTime().toLocaleString(),
      currency: "BTC",
      source_currency: "USD",
      source_amount: amount.toString(),
      email: customerEmail,
      description: `Booking for ${customerName} (${customerPhone})`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/plisio/callback?booking_token=${bookingToken}&json=true`,
      success_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/plisio/callback?booking_token=${bookingToken}&status=success&json=true`,
      fail_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/plisio/callback?booking_token=${bookingToken}&status=fail&json=true`,
      success_invoice_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      fail_invoice_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`,
    });

    const response = await fetch(
      `https://api.plisio.net/api/v1/invoices/new?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      return {
        success: true,
        invoice_url: result.data.invoice_url,
      };
    } else {
      return {
        success: false,
        error:
          result.data?.message || result.message || "Invoice creation failed",
        details: result,
      };
    }
  } catch (error) {
    console.error("Plisio API error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while creating invoice",
      details: error,
    };
  }
}
