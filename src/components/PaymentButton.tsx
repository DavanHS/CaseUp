import { formatPrice } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { Button } from "./ui/button";

interface PaymentButtonProps {
  configurationId: string;
  amount: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentButton({ configurationId, amount }: PaymentButtonProps) {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  const initializeRazorpayPayment = useCallback(async () => {
    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configurationId,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize payment");
      }

      const data = await response.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "CaseUp",
        description: "Custom Phone Case Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          console.log("Payment successful:", response);
          // Redirect to thank you page
          window.location.href = "/thank-you";
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  }, [configurationId, amount]);

  return (
    <Button onClick={initializeRazorpayPayment} className="w-full">
      Pay {formatPrice(amount)}
    </Button>
  );
}