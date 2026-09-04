import api from "../lib/axios";
export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId?: string;
}
export const createOrder = async (planId: string) => {
    const response = await api.post("/payment/create-order", { planId });
    return response.data;
};
export const verifyPayment = async (paymentData: VerifyPaymentPayload) => {
    const response = await api.post("/payment/verify", paymentData);
    return response.data;
};
export const cancelPlan = async () => {
    const response = await api.post("/payment/cancel-plan");
    return response.data;
};
