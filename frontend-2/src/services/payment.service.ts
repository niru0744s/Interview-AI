import api from "../lib/axios";

export const createOrder = async (planId: string) => {
    try {
        const response = await api.post("/payment/create-order", { planId });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const verifyPayment = async (paymentData: any) => {
    try {
        const response = await api.post("/payment/verify", paymentData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const cancelPlan = async () => {
    try {
        const response = await api.post("/payment/cancel-plan");
        return response.data;
    } catch (error) {
        throw error;
    }
}
