// import { db } from "@/db";
// import { razorpay, formatAmountForRazorpay } from "@/lib/razorpay";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { configurationId, amount } = await req.json();
//     const { getUser } = getKindeServerSession();
//     const user = await getUser();

//     if (!user || !user.id) {
//       return NextResponse.json(
//         { error: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     if (!configurationId || !amount) {
//       return NextResponse.json(
//         { error: "Configuration ID and amount are required" },
//         { status: 400 }
//       );
//     }

//     const amountInPaise = formatAmountForRazorpay(amount);

//     const order = await razorpay.orders.create({
//       amount: amountInPaise,
//       currency: "INR",
//       notes: {
//         configurationId,
//         userId: user.id,
//       },
//     });

//     // Create a payment record in the database
//     await db.payment.create({
//       data: {
//         orderId: order.id,
//         amount: amount,
//         status: "PENDING",
//         configurationId,
//       },
//     });

//     return NextResponse.json({ 
//       orderId: order.id,
//       amount: amountInPaise,
//       currency: "INR",
//       key: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (error) {
//     console.error("Error creating payment:", error);
//     return NextResponse.json(
//       { error: "Error creating payment" },
//       { status: 500 }
//     );
//   }
// }