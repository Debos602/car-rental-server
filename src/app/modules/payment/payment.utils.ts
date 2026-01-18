import axios from 'axios';
// qs removed: send JSON body instead of form-urlencoded to AamarPay
import { paymentData } from '../order/order.interface';
import config from '../../config';

export const initiatPayment = async (paymentData: paymentData) => {
  try {
    const payload = {
      store_id: config.Store_Id,
      signature_key: config.Signature_Key,
      tran_id: paymentData.transactionId,

      success_url: `${config.Server_url}/api/confirmation?transactionId=${paymentData.transactionId}&status=success`,
      fail_url: `${config.Server_url}/api/confirmation?status=failed`,
      cancel_url: `${config.Server_url}`,

      amount: paymentData.totalCost,
      currency: 'BDT',
      desc: 'Merchant Registration Payment',

      cus_name: paymentData.name,
      cus_email: paymentData.email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1206',
      cus_country: 'Bangladesh',
      cus_phone: paymentData.phone,

      type: 'json',
    };

    const response = await axios.post(
      process.env.PAYMENT_URL as string,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (!response.data || response.data.result !== 'true') {
      console.error('AamarPay response:', response.data);
      throw new Error(`AamarPay initiation failed: ${JSON.stringify(response.data)}`);
    }

    return response.data;
  } catch (error: any) {
    console.error('Payment Initiate Error:', error?.response?.data || error.message);
    const details = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Failed initiating payment: ${details}`);
  }
};

export const verifyPayment = async (tnxId: string) => {
  try {
    const response = await axios.get(config.Payment_verify_url!, {
      params: {
        store_id: config.Store_Id,
        signature_key: config.Signature_Key,
        type: 'json',
        request_id: tnxId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed verifying payment');
  }
};
