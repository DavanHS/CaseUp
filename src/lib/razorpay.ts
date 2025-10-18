import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export { razorpay };


export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
};

export const formatAmountForRazorpay = (amount: number) => {
  // Razorpay expects amount in smallest currency unit (paise for INR)
  return Math.round(amount * 100);
};
