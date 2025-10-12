import { db } from "@/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET!
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);
    const { 
      payload: { payment: { entity } }
    } = payload;

    // Update payment status in database
    const payment = await db.payment.findUnique({
      where: {
        orderId: entity.order_id,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    await db.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: entity.status === "captured" ? "COMPLETED" : "FAILED",
        paymentId: entity.id,
      },
    });

    // If payment is successful, update configuration status
    if (entity.status === "captured") {
      await db.configuration.update({
        where: {
          id: payment.configurationId,
        },
        data: {
          status: "PAID",
        },
      });
    } else {
      await db.configuration.update({
        where: {
          id: payment.configurationId,
        },
        data: {
          status: "FAILED",
        },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}