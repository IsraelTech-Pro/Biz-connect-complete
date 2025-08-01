import { paystackSync, PaystackTransaction, PaystackTransfer } from './paystack-sync';
import { storage } from './storage';
import { transactions, users, InsertTransaction } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export interface Transaction {
  id?: string;
  amount: string;
  currency: string;
  email: string;
  item: string;
  vendor_id: string;
  buyer_id: string;
  reference: string;
  status: string;
  paid_at?: Date;
  delivery_time?: Date;
  vendor_contact?: string;
  paystack_id: number;
  gateway_response?: string;
  channel?: string;
}

export interface Payout {
  id?: string;
  amount: string;
  vendor_id: string;
  subaccount_code?: string;
  reference: string;
  status: string;
  paid_at?: Date;
  paystack_id: number;
  recipient_code?: string;
  transfer_code?: string;
  reason?: string;
}

export class DatabaseSyncService {
  async syncTransactions(): Promise<void> {
    try {
      console.log('Starting transaction sync...');
      
      // Fetch all transactions from Paystack
      const paystackTransactions = await paystackSync.fetchAllTransactions();
      console.log(`Fetched ${paystackTransactions.length} transactions from Paystack`);

      // Get all users for ID mapping
      const users = await storage.getUsers();
      const userEmailMap = new Map(users.map(u => [u.email, u.id]));

      for (const paystackTx of paystackTransactions) {
        try {
          // Check if transaction already exists in database
          const existingTransaction = await this.getTransactionByPaystackId(paystackTx.id);
          
          if (existingTransaction) {
            // Update existing transaction if status changed
            if (existingTransaction.status !== paystackTx.status) {
              await this.updateTransaction(existingTransaction.id!, {
                status: paystackTx.status,
                paid_at: paystackTx.paid_at ? new Date(paystackTx.paid_at) : undefined,
                gateway_response: paystackTx.gateway_response
              });
            }
            continue;
          }

          // Find buyer by email
          const buyerId = userEmailMap.get(paystackTx.customer.email);
          if (!buyerId) {
            console.warn(`No buyer found for email: ${paystackTx.customer.email}`);
            continue;
          }

          // Extract vendor info from metadata or subaccount
          let vendorId = paystackTx.metadata?.vendor_id;
          let vendorContact = paystackTx.metadata?.vendor_contact;
          
          if (!vendorId && paystackTx.subaccount) {
            // Find vendor by subaccount code
            const vendor = users.find(u => u.paystack_subaccount === paystackTx.subaccount!.subaccount_code);
            if (vendor) {
              vendorId = vendor.id;
              vendorContact = vendor.phone || vendor.whatsapp;
            }
          }

          if (!vendorId) {
            console.warn(`No vendor found for transaction: ${paystackTx.reference}`);
            continue;
          }

          // Create transaction record
          const transaction: Transaction = {
            amount: (paystackTx.amount / 100).toString(), // Convert from kobo to cedis
            currency: paystackTx.currency,
            email: paystackTx.customer.email,
            item: paystackTx.metadata?.item || 'Product Purchase',
            vendor_id: vendorId,
            buyer_id: buyerId,
            reference: paystackTx.reference,
            status: paystackTx.status,
            paid_at: paystackTx.paid_at ? new Date(paystackTx.paid_at) : undefined,
            delivery_time: paystackTx.metadata?.delivery_time ? new Date(paystackTx.metadata.delivery_time) : undefined,
            vendor_contact: vendorContact,
            paystack_id: paystackTx.id,
            gateway_response: paystackTx.gateway_response,
            channel: paystackTx.channel
          };

          await this.createTransaction(transaction);
          console.log(`Synced transaction: ${paystackTx.reference}`);
        } catch (error) {
          console.error(`Error syncing transaction ${paystackTx.reference}:`, error);
        }
      }

      console.log('Transaction sync completed');
    } catch (error) {
      console.error('Error in transaction sync:', error);
      throw error;
    }
  }

  async syncPayouts(): Promise<void> {
    try {
      console.log('Starting payout sync...');
      
      // Fetch all transfers from Paystack
      const paystackTransfers = await paystackSync.fetchAllTransfers();
      console.log(`Fetched ${paystackTransfers.length} transfers from Paystack`);

      // Get all users for subaccount mapping
      const users = await storage.getUsers();
      const subaccountMap = new Map(
        users.filter(u => u.paystack_subaccount)
          .map(u => [u.paystack_subaccount!, u.id])
      );

      for (const paystackTransfer of paystackTransfers) {
        try {
          // Check if payout already exists in database
          const existingPayout = await this.getPayoutByPaystackId(paystackTransfer.id);
          
          if (existingPayout) {
            // Update existing payout if status changed
            if (existingPayout.status !== paystackTransfer.status) {
              await this.updatePayout(existingPayout.id!, {
                status: paystackTransfer.status,
                paid_at: paystackTransfer.transferred_at ? new Date(paystackTransfer.transferred_at) : undefined
              });
            }
            continue;
          }

          // Find vendor by recipient email or subaccount
          const vendorId = users.find(u => u.email === paystackTransfer.recipient.email)?.id;
          
          if (!vendorId) {
            console.warn(`No vendor found for transfer recipient: ${paystackTransfer.recipient.email}`);
            continue;
          }

          // Create payout record
          const payout: Payout = {
            amount: (paystackTransfer.amount / 100).toString(), // Convert from kobo to cedis
            vendor_id: vendorId,
            reference: paystackTransfer.reference,
            status: paystackTransfer.status,
            paid_at: paystackTransfer.transferred_at ? new Date(paystackTransfer.transferred_at) : undefined,
            paystack_id: paystackTransfer.id,
            recipient_code: paystackTransfer.recipient.id.toString(),
            transfer_code: paystackTransfer.transfer_code,
            reason: paystackTransfer.reason
          };

          await this.createPayout(payout);
          console.log(`Synced payout: ${paystackTransfer.reference}`);
        } catch (error) {
          console.error(`Error syncing payout ${paystackTransfer.reference}:`, error);
        }
      }

      console.log('Payout sync completed');
    } catch (error) {
      console.error('Error in payout sync:', error);
      throw error;
    }
  }

  async syncAll(): Promise<void> {
    console.log('Starting full Paystack sync...');
    await this.syncTransactions();
    await this.syncPayouts();
    console.log('Full sync completed');
  }

  // Helper methods for database operations
  private async getTransactionByPaystackId(paystackId: number): Promise<any> {
    try {
      // For now, we'll use a mock implementation since we don't have transactions table in storage yet
      return null;
    } catch (error) {
      console.error('Error fetching transaction by Paystack ID:', error);
      return null;
    }
  }

  private async getPayoutByPaystackId(paystackId: number): Promise<any> {
    try {
      // For now, we'll use a mock implementation
      return null;
    } catch (error) {
      console.error('Error fetching payout by Paystack ID:', error);
      return null;
    }
  }

  private async createTransaction(transaction: Transaction): Promise<void> {
    try {
      // For now, we'll just log the transaction creation
      console.log('Creating transaction:', transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  private async createPayout(payout: Payout): Promise<void> {
    try {
      // For now, we'll just log the payout creation
      console.log('Creating payout:', payout);
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  private async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      console.log('Updating transaction:', id, updates);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  private async updatePayout(id: string, updates: Partial<Payout>): Promise<void> {
    try {
      console.log('Updating payout:', id, updates);
    } catch (error) {
      console.error('Error updating payout:', error);
      throw error;
    }
  }
}

export const databaseSync = new DatabaseSyncService();