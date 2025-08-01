import { PAYSTACK_CONFIG } from './paystack-config';

export interface PaystackTransaction {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  metadata: {
    vendor_id?: string;
    order_id?: string;
    item?: string;
    vendor_contact?: string;
    delivery_time?: string;
  };
  subaccount?: {
    id: number;
    subaccount_code: string;
    business_name: string;
  };
}

export interface PaystackTransfer {
  id: number;
  domain: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  reason: string;
  recipient: {
    id: number;
    name: string;
    email: string;
    details: {
      account_number: string;
      account_name: string;
      bank_name: string;
    };
  };
  transfer_code: string;
  transferred_at: string;
  created_at: string;
}

export interface PaystackBalance {
  currency: string;
  balance: number;
}

export interface PaystackSettlement {
  id: number;
  domain: string;
  status: string;
  currency: string;
  integration: number;
  total_amount: number;
  effective_amount: number;
  total_fees: number;
  total_processed: number;
  deductions: number;
  settlement_date: string;
  settled_by: string;
  created_at: string;
  updated_at: string;
  subaccount?: {
    id: number;
    subaccount_code: string;
    business_name: string;
  };
}

export class PaystackSyncService {
  private apiBase = 'https://api.paystack.co';
  private headers = {
    'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
    'Content-Type': 'application/json'
  };

  async fetchTransactions(page = 1, perPage = 100): Promise<PaystackTransaction[]> {
    try {
      const response = await fetch(
        `${this.apiBase}/transaction?page=${page}&perPage=${perPage}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Paystack transactions:', error);
      throw error;
    }
  }

  async fetchTransfers(page = 1, perPage = 100): Promise<PaystackTransfer[]> {
    try {
      const response = await fetch(
        `${this.apiBase}/transfer?page=${page}&perPage=${perPage}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Paystack transfers:', error);
      throw error;
    }
  }

  async fetchBalance(): Promise<PaystackBalance[]> {
    try {
      const response = await fetch(`${this.apiBase}/balance`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Paystack balance:', error);
      throw error;
    }
  }

  async fetchSettlements(page = 1, perPage = 100): Promise<PaystackSettlement[]> {
    try {
      const response = await fetch(
        `${this.apiBase}/settlement?page=${page}&perPage=${perPage}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Paystack settlements:', error);
      throw error;
    }
  }

  async fetchSubaccountTransactions(subaccountCode: string, page = 1, perPage = 100): Promise<PaystackTransaction[]> {
    try {
      const response = await fetch(
        `${this.apiBase}/transaction?subaccount=${subaccountCode}&page=${page}&perPage=${perPage}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching transactions for subaccount ${subaccountCode}:`, error);
      throw error;
    }
  }

  async fetchAllTransactions(): Promise<PaystackTransaction[]> {
    const allTransactions: PaystackTransaction[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const transactions = await this.fetchTransactions(page, 100);
        allTransactions.push(...transactions);
        
        if (transactions.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error(`Error fetching transactions page ${page}:`, error);
        hasMore = false;
      }
    }

    return allTransactions;
  }

  async fetchAllTransfers(): Promise<PaystackTransfer[]> {
    const allTransfers: PaystackTransfer[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const transfers = await this.fetchTransfers(page, 100);
        allTransfers.push(...transfers);
        
        if (transfers.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (error) {
        console.error(`Error fetching transfers page ${page}:`, error);
        hasMore = false;
      }
    }

    return allTransfers;
  }
}

export const paystackSync = new PaystackSyncService();