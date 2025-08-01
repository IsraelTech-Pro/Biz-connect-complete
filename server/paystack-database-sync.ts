import {
  paystackSync,
  PaystackTransaction,
  PaystackTransfer,
} from "./paystack-sync";
import { storage } from "./storage";

export class PaystackDatabaseSyncService {
  /**
   * Sync Paystack transactions to our payments table
   */
  async syncTransactionsToPayments(): Promise<void> {
    try {
      console.log("Starting Paystack transaction sync to payments table...");

      const paystackTransactions = await paystackSync.fetchAllTransactions();
      console.log(
        `Fetched ${paystackTransactions.length} transactions from Paystack`,
      );

      if (paystackTransactions.length === 0) {
        console.log("No transactions found from Paystack");
        return;
      }

      const users = await storage.getUsers();
      const userEmailMap = new Map(users.map((u) => [u.email, u.id]));
      const vendorSubaccountMap = new Map(
        users
          .filter((u) => u.paystack_subaccount)
          .map((u) => [u.paystack_subaccount!, u.id]),
      );

      for (const paystackTx of paystackTransactions) {
        try {
          const existingPayment = await storage.getPaymentByPaystackReference(
            paystackTx.reference,
          );

          if (existingPayment) {
            if (existingPayment.status !== paystackTx.status) {
              await storage.updatePayment(existingPayment.id, {
                status: paystackTx.status,
                paid_at: paystackTx.paid_at
                  ? new Date(paystackTx.paid_at)
                  : undefined,
                gateway_response: paystackTx.gateway_response,
              });
              console.log(
                `Updated payment ${existingPayment.id} status to ${paystackTx.status}`,
              );
            }
            continue;
          }

          const buyerId = userEmailMap.get(paystackTx.customer.email);
          if (!buyerId) {
            console.warn(
              `No buyer found for email: ${paystackTx.customer.email}`,
            );
            continue;
          }

          let vendorId = paystackTx.metadata?.vendor_id;
          if (!vendorId && paystackTx.subaccount) {
            vendorId = vendorSubaccountMap.get(
              paystackTx.subaccount.subaccount_code,
            );
          }

          if (!vendorId) {
            const vendors = users.filter((u) => u.role === "vendor");
            if (vendors.length > 0) {
              vendorId = vendors[0].id;
              console.log(
                `Using fallback vendor for transaction: ${paystackTx.reference}`,
              );
            } else {
              console.warn(
                `No vendor found for transaction: ${paystackTx.reference}`,
              );
              continue;
            }
          }

          let orderId = paystackTx.metadata?.order_id;
          if (!orderId) {
            const vendorProducts = await storage.getProductsByVendor(vendorId);
            let firstProduct = vendorProducts[0];

            if (!firstProduct) {
              const allProducts = await storage.getProducts();
              if (allProducts.length === 0) {
                console.warn(
                  `No products available to create order for transaction ${paystackTx.reference}`,
                );
                continue;
              }
              firstProduct = allProducts[0];
            }

            const order = await storage.createOrder({
              buyer_id: buyerId,
              vendor_id: vendorId,
              product_id: firstProduct.id,
              quantity: 1,
              total_amount: paystackTx.amount / 100,
              status: "pending",
              shipping_address:
                paystackTx.metadata?.delivery_address || "Address not provided",
              phone: paystackTx.metadata?.phone || "",
              notes: `Synced from Paystack transaction ${paystackTx.reference}`,
            });
            orderId = order.id;
            console.log(
              `Created order ${orderId} for Paystack transaction ${paystackTx.reference}`,
            );
          }

          const payment = await storage.createPayment({
            reference: `PS_${paystackTx.reference}`,
            order_id: orderId,
            vendor_id: vendorId,
            buyer_id: buyerId,
            amount: paystackTx.amount / 100,
            currency: paystackTx.currency,
            payment_method: paystackTx.channel,
            mobile_number: paystackTx.metadata?.mobile_number || "",
            network_provider: paystackTx.metadata?.network_provider || "",
            status: paystackTx.status,
            paystack_reference: paystackTx.reference,
            authorization_url: "",
            access_code: "",
            gateway_response: paystackTx.gateway_response,
            paid_at: paystackTx.paid_at
              ? new Date(paystackTx.paid_at)
              : undefined,
          });

          console.log(
            `Created payment ${payment.id} from Paystack transaction ${paystackTx.reference}`,
          );
        } catch (error) {
          console.error(
            `Error syncing transaction ${paystackTx.reference}:`,
            error,
          );
        }
      }

      console.log("Paystack transaction sync completed");
    } catch (error) {
      console.error("Error syncing Paystack transactions:", error);
      throw error;
    }
  }

  /**
   * Sync Paystack transfers to our payouts table
   */
  async syncTransfersToPayouts(): Promise<void> {
    try {
      console.log("Starting Paystack transfer sync to payouts table...");

      const paystackTransfers = await paystackSync.fetchAllTransfers();
      console.log(
        `Fetched ${paystackTransfers.length} transfers from Paystack`,
      );

      if (paystackTransfers.length === 0) {
        console.log("No transfers found from Paystack");
        return;
      }

      const users = await storage.getUsers();
      const vendorMap = new Map(
        users.filter((u) => u.role === "vendor").map((u) => [u.email, u]),
      );

      for (const transfer of paystackTransfers) {
        try {
          const existingPayouts = await storage.getPayoutsByVendor(""); // to be filtered properly
          const existingPayout = existingPayouts.find(
            (p) => p.transaction_id === transfer.reference,
          );

          if (existingPayout) {
            if (existingPayout.status !== transfer.status) {
              await storage.updatePayout(existingPayout.id, {
                status: transfer.status,
              });
              console.log(
                `Updated payout ${existingPayout.id} status to ${transfer.status}`,
              );
            }
            continue;
          }

          let vendorId = "";
          const vendor = vendorMap.get(transfer.recipient.email);
          if (vendor) {
            vendorId = vendor.id;
          }

          if (!vendorId) {
            console.warn(
              `No vendor found for transfer recipient: ${transfer.recipient.email}`,
            );
            continue;
          }

          const payout = await storage.createPayout({
            vendor_id: vendorId,
            amount: transfer.amount / 100,
            status: transfer.status,
            momo_number: transfer.recipient.details?.account_number || "",
            transaction_id: transfer.reference,
          });

          console.log(
            `Created payout ${payout.id} from Paystack transfer ${transfer.reference}`,
          );
        } catch (error) {
          console.error(`Error syncing transfer ${transfer.reference}:`, error);
        }
      }

      console.log("Paystack transfer sync completed");
    } catch (error) {
      console.error("Error syncing Paystack transfers:", error);
      throw error;
    }
  }

  /**
   * Sync all Paystack data
   */
  async syncAll(): Promise<void> {
    try {
      console.log("Starting complete Paystack sync...");
      await this.syncTransactionsToPayments();
      await this.syncTransfersToPayouts();
      console.log("Complete Paystack sync finished");
    } catch (error) {
      console.error("Error in complete Paystack sync:", error);
      throw error;
    }
  }
}

export const paystackDatabaseSync = new PaystackDatabaseSyncService();
