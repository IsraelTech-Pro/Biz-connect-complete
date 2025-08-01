export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  callback: (response: any) => void;
  onClose?: () => void;
  channels?: string[];
  metadata?: any;
}

export const initializePaystackPayment = (config: PaystackConfig) => {
  loadPaystackScript().then(() => {
    const PaystackPop = (window as any).PaystackPop;
    if (PaystackPop) {
      const handler = PaystackPop.setup({
        key: config.publicKey,
        email: config.email,
        amount: config.amount * 100, // Convert to kobo
        currency: config.currency || 'GHS',
        callback: config.callback,
        onClose: config.onClose || (() => {}),
        channels: config.channels || ['card', 'mobile_money'],
        metadata: config.metadata || {}
      });
      handler.openIframe();
    }
  });
};

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};
