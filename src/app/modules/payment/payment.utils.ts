import axios from 'axios';
import { paymentData } from '../order/order.interface';
import { Error } from 'mongoose';
import config from '../../config';

export const initiatPayment = async (paymentData: paymentData) => {
  try {
    const response = await axios.post(process.env.Payment_url!, {
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
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed initiating payment');
  }

  // console.log('Payment API response:', response);
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
