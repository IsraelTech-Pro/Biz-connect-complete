// Paystack configuration
export const PAYSTACK_CONFIG = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  baseUrl: 'https://api.paystack.co',
  
  // Supported payment channels
  channels: {
    card: 'card',
    bank: 'bank',
    ussd: 'ussd',
    qr: 'qr',
    mobile_money: 'mobile_money',
    bank_transfer: 'bank_transfer',
    eft: 'eft'
  },
  
  // Mobile money providers in Ghana
  mobileMoneyProviders: {
    mtn: 'mtn',
    vodafone: 'vodafone',
    airteltigo: 'airteltigo'
  }
};

// Paystack API helper functions
export const verifyPayment = async (reference: string) => {
  if (!PAYSTACK_CONFIG.secretKey) {
    throw new Error('Paystack secret key not configured');
  }
  
  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`, {
    headers: {
      'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};

export const initializePayment = async (paymentData: {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  mobile_number?: string;
  provider?: string;
  subaccount?: string;
  callback_url?: string;
}) => {
  if (!PAYSTACK_CONFIG.secretKey) {
    throw new Error('Paystack secret key not configured');
  }
  
  const requestBody: any = {
    email: paymentData.email,
    amount: Math.round(paymentData.amount * 100), // Convert to kobo
    currency: paymentData.currency || 'GHS',
    reference: paymentData.reference,
    callback_url: paymentData.callback_url || `${process.env.REPLIT_DOMAIN || 'http://localhost:5000'}/api/payments/callback`,
  };

  // Add mobile money specific fields
  if (paymentData.mobile_number) {
    requestBody.mobile_number = paymentData.mobile_number;
  }
  if (paymentData.provider) {
    requestBody.provider = paymentData.provider;
  }
  
  // Add subaccount for direct vendor payments
  if (paymentData.subaccount) {
    requestBody.subaccount = paymentData.subaccount;
  }

  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  const data = await response.json();
  return data;
};

// Create transfer recipient for vendor payout
export const createTransferRecipient = async (recipientData: {
  type: string; // 'mobile_money' for mobile money
  name: string;
  account_number: string;
  bank_code: string; // 'MTN' for MTN Mobile Money
  currency?: string;
}) => {
  if (!PAYSTACK_CONFIG.secretKey) {
    throw new Error('Paystack secret key not configured');
  }
  
  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transferrecipient`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...recipientData,
      currency: recipientData.currency || 'GHS'
    })
  });
  
  const data = await response.json();
  return data;
};

// Initiate transfer to vendor mobile money account
export const initiateTransfer = async (transferData: {
  source: string; // 'balance' to transfer from Paystack balance
  amount: number;
  recipient: string; // recipient_code from createTransferRecipient
  reason?: string;
  reference?: string;
}) => {
  if (!PAYSTACK_CONFIG.secretKey) {
    throw new Error('Paystack secret key not configured');
  }
  
  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transfer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...transferData,
      amount: transferData.amount * 100, // Convert to kobo
      source: transferData.source || 'balance'
    })
  });
  
  const data = await response.json();
  return data;
};

// Verify transfer status
export const verifyTransfer = async (reference: string) => {
  if (!PAYSTACK_CONFIG.secretKey) {
    throw new Error('Paystack secret key not configured');
  }
  
  const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/transfer/verify/${reference}`, {
    headers: {
      'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};