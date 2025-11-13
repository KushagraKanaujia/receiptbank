import paypal from '@paypal/payouts-sdk';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

// Configure PayPal environment
const environment = PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);

const client = new paypal.core.PayPalHttpClient(environment);

export interface PayoutRequest {
  recipientEmail: string;
  amount: number;
  currency?: string;
  note?: string;
  senderItemId: string; // Unique ID for this payout (withdrawal ID)
}

export interface PayoutResponse {
  success: boolean;
  batchId?: string;
  payoutItemId?: string;
  transactionId?: string;
  status?: string;
  error?: string;
}

/**
 * Send a payout to a user via PayPal
 */
export const sendPayout = async (payoutRequest: PayoutRequest): Promise<PayoutResponse> => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    const requestBody = {
      sender_batch_header: {
        sender_batch_id: `batch_${payoutRequest.senderItemId}`,
        email_subject: 'You have a payment from ReceiptBank',
        email_message: `Your withdrawal of $${payoutRequest.amount} has been processed.`,
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: payoutRequest.amount.toFixed(2),
            currency: payoutRequest.currency || 'USD',
          },
          note: payoutRequest.note || 'ReceiptBank withdrawal',
          sender_item_id: payoutRequest.senderItemId,
          receiver: payoutRequest.recipientEmail,
        },
      ],
    };

    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);

    const response = await client.execute(request);

    if (response.statusCode === 201) {
      const batchId = response.result.batch_header.payout_batch_id;
      const item = response.result.items?.[0];

      return {
        success: true,
        batchId,
        payoutItemId: item?.payout_item_id,
        transactionId: item?.transaction_id,
        status: item?.transaction_status || 'PENDING',
      };
    } else {
      return {
        success: false,
        error: `Unexpected status code: ${response.statusCode}`,
      };
    }
  } catch (error: any) {
    console.error('PayPal payout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process payout',
    };
  }
};

/**
 * Get payout status by batch ID
 */
export const getPayoutStatus = async (batchId: string): Promise<any> => {
  try {
    const request = new paypal.payouts.PayoutsGetRequest(batchId);
    const response = await client.execute(request);

    if (response.statusCode === 200) {
      return {
        success: true,
        batch: response.result.batch_header,
        items: response.result.items,
      };
    }

    return {
      success: false,
      error: 'Failed to get payout status',
    };
  } catch (error: any) {
    console.error('PayPal status check error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate PayPal email (basic validation)
 */
export const validatePayPalEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
