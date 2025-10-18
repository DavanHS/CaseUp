"use client";

import Phone from "@/components/Phone";
import { Button } from "@/components/ui/button";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { Configuration } from "@/generated/prisma/client";
import { cn, formatPrice } from "@/lib/utils";
import { COLORS, MODELS } from "@/validators/option-validator";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import LoginModal from "@/components/LoginModal";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";

function DesignPreview({ configuration }: { configuration: Configuration }) {
  const {id} = configuration
  const { user } = useKindeBrowserClient();
  const router = useRouter();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  useEffect(() => {
    setShowConfetti(true);
    
    // Check for saved configuration on mount
    const savedConfiguration = localStorage.getItem('savedConfiguration');
    if (savedConfiguration) {
      const parsedConfig = JSON.parse(savedConfiguration);
      // If the IDs match, we're on the right page for the saved configuration
      if (parsedConfig.id === configuration.id) {
        localStorage.removeItem('savedConfiguration');
        localStorage.removeItem('configurationId');
      }
    }
  }, [configuration.id]);

  const { color, model, finish, material } = configuration;

  const tw = COLORS.find(
    (supportedColor) => supportedColor.value === color
  )?.tw;

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!;

  let totalPrice = BASE_PRICE;
  if (material === "polycarbonate")
    totalPrice += PRODUCT_PRICES.material.polycarbonate;
  if (finish === "textured") totalPrice += PRODUCT_PRICES.finish.textured;

  const { mutate: initializePayment } = useMutation({
    mutationKey: ["initialize-payment"],
    mutationFn: async () => {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configurationId: id,
          amount: totalPrice,
        }),
      });
      if (!response.ok) {
        throw new Error('Payment initialization failed');
      }
      return response.json();
    },
    onSuccess: (data: { key: string; amount: number; currency: string; orderId: string }) => {
      const options: RazorpayOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'CaseUp',
        description: 'Custom Phone Case Payment',
        order_id: data.orderId,
        handler: function (_: RazorpayResponse) {
          toast.success('Payment successful!', {
            description: 'Your order has been confirmed.',
          });
          router.push('/thank-you');
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled', {
              description: 'You can try the payment again when you\'re ready.',
            });
          }
        },
        prefill: {
          name: user?.given_name ?? undefined,
          email: user?.email ?? undefined,
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    },
    onError: () => {
      toast.error('Something went wrong', {
        description: 'There was an error initializing the payment. Please try again.',
      });
    },
  });

  const handleCheckout = () => {
    if (user) {
      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          initializePayment();
        };
        document.body.appendChild(script);
      } else {
        initializePayment();
      }
    } else {
      // Store both the ID and the full configuration
      localStorage.setItem("configurationId", id);
      localStorage.setItem("savedConfiguration", JSON.stringify(configuration));
      setIsLoginModalOpen(true);
    }
  }

  return (
    <>
      <div
        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
        aria-hidden="true"
      >
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />

      <div className="mt-20 grid grid-col-1 text-sm sm:grid-cols-12 sm:grid-rows-1 sm: gap-x-6 md:gap-x-8 lg:gap-x-12">
        <div className="sm:col-span-4 md:col-span-3 md:row-span-2 md:row-end-2">
          <Phone
            className={cn(`bg-${tw}`)}
            imgSrc={configuration.croppedImageUrl!}
          />
        </div>
        <div className="mt-6 sm:col-span-9 sm:mt-0 md:row-end-1">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            Your {modelLabel} Case
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-base">
            <Check className="h-4 w-4 text-green-500" />
            In Stock and ready to ship
          </div>
        </div>
        <div className="sm:col-span-12 md:col-span-9 text-base">
          <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
            <div>
              <p className="font-medium text-zinc-950">Highlights</p>
              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>Wireless charging compatible</li>
                <li>TPU shock absorption</li>
                <li>Packaging made from recycled materials</li>
                <li>5 year print warranty</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-zinc-950">Materials</p>
              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>High-quality, durable material</li>
                <li>Scratch and fingerprint resistant coating</li>
              </ol>
            </div>
          </div>
          <div className="mt-8">
            <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
              <div className="flow-root text-sm">
                <div className="flex items-center justify-between py-1 mt-2 ">
                  <p className="text-gray-600">Base price</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(BASE_PRICE)}
                  </p>
                </div>
                {finish === "textured" ? (
                  <div className="flex items-center justify-between py-1 mt-2 ">
                    <p className="text-gray-600">Textured Finish</p>
                    <p className="font-medium text-gray-900">
                      {formatPrice(PRODUCT_PRICES.finish.textured)}
                    </p>
                  </div>
                ) : null}
                {material === "polycarbonate" ? (
                  <div className="flex items-center justify-between py-1 mt-2 ">
                    <p className="text-gray-600">Soft polycarbonate material</p>
                    <p className="font-medium text-gray-900">
                      {formatPrice(PRODUCT_PRICES.material.polycarbonate)}
                    </p>
                  </div>
                ) : null}

                <div className="my-2 h-px bg-gray-200" />
                <div className="flex items-center justify-between py-2">
                  <p className="font-semibold text-gray-900">Order total</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end pb-12">
              {/* <Button
                onClick={() => handleCheckout()}
                className='px-4 sm:px-6 lg:px-8'>
                Check out <ArrowRight className='h-4 w-4 ml-1.5 inline' />
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DesignPreview;
