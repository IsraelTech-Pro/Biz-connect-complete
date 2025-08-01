import { createClient } from '@supabase/supabase-js';
import type { 
  User, InsertUser, Product, InsertProduct, Order, InsertOrder, 
  Payout, InsertPayout, PlatformSettings, SupportRequest, InsertSupportRequest,
  VendorSupportRequest, InsertVendorSupportRequest, Payment, InsertPayment
} from '@shared/schema';
import type { IStorage } from './storage';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    return data;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
    return data;
  }

  async getVendors(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'vendor')
      .eq('is_approved', true);
    
    if (error) {
      throw new Error(`Error fetching vendors: ${error.message}`);
    }
    return data || [];
  }

  async getPendingVendors(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'vendor')
      .eq('is_approved', false);
    
    if (error) {
      throw new Error(`Error fetching pending vendors: ${error.message}`);
    }
    return data || [];
  }

  async approveVendor(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error approving vendor: ${error.message}`);
    }
    return data;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
    return data || [];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
    return data || [];
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching products by vendor: ${error.message}`);
    }
    return data || [];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return undefined;
    }
    return data;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
    return data;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Enhanced filtering methods
  async getFlashSaleProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_flash_sale', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching flash sale products: ${error.message}`);
    }
    return data || [];
  }

  async getClearanceProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_clearance', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching clearance products: ${error.message}`);
    }
    return data || [];
  }

  async getTrendingProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_trending', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching trending products: ${error.message}`);
    }
    return data || [];
  }

  async getNewThisWeekProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_new_this_week', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching new this week products: ${error.message}`);
    }
    return data || [];
  }

  async getTopSellingProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_top_selling', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching top selling products: ${error.message}`);
    }
    return data || [];
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
    return data || [];
  }

  async getHotDealsProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_hot_deal', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching hot deals products: ${error.message}`);
    }
    return data || [];
  }

  async getDontMissProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_dont_miss', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching dont miss products: ${error.message}`);
    }
    return data || [];
  }

  async getProductsByFilter(filters: {
    category?: string;
    isFlashSale?: boolean;
    isClearance?: boolean;
    isTrending?: boolean;
    isNewThisWeek?: boolean;
    isTopSelling?: boolean;
    isFeatured?: boolean;
    isHotDeal?: boolean;
    isDontMiss?: boolean;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.isFlashSale) {
      query = query.eq('is_flash_sale', true);
    }

    if (filters.isClearance) {
      query = query.eq('is_clearance', true);
    }

    if (filters.isTrending) {
      query = query.eq('is_trending', true);
    }

    if (filters.isNewThisWeek) {
      query = query.eq('is_new_this_week', true);
    }

    if (filters.isTopSelling) {
      query = query.eq('is_top_selling', true);
    }

    if (filters.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters.isHotDeal) {
      query = query.eq('is_hot_deal', true);
    }

    if (filters.isDontMiss) {
      query = query.eq('is_dont_miss', true);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error filtering products: ${error.message}`);
    }
    return data || [];
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
    return data || [];
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching orders by buyer: ${error.message}`);
    }
    return data || [];
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching orders by vendor: ${error.message}`);
    }
    return data || [];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      return undefined;
    }
    return data;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
    return data;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...order, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
    return data;
  }

  // Payouts
  async getPayouts(): Promise<Payout[]> {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching payouts: ${error.message}`);
    }
    return data || [];
  }

  async getPayoutsByVendor(vendorId: string): Promise<Payout[]> {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching payouts by vendor: ${error.message}`);
    }
    return data || [];
  }

  async createPayout(payout: InsertPayout): Promise<Payout> {
    const { data, error } = await supabase
      .from('payouts')
      .insert(payout)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating payout: ${error.message}`);
    }
    return data;
  }

  async updatePayout(id: string, payout: Partial<InsertPayout>): Promise<Payout> {
    const { data, error } = await supabase
      .from('payouts')
      .update({ ...payout, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating payout: ${error.message}`);
    }
    return data;
  }

  // Platform Settings
  async getPlatformSettings(): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (error) {
      throw new Error(`Error fetching platform settings: ${error.message}`);
    }
    return data;
  }

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', (await this.getPlatformSettings()).id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating platform settings: ${error.message}`);
    }
    return data;
  }

  // Analytics
  async getVendorStats(vendorId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    pendingPayouts: number;
  }> {
    const [ordersResult, productsResult, payoutsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', vendorId)
        .eq('status', 'completed'),
      supabase
        .from('products')
        .select('id')
        .eq('vendor_id', vendorId),
      supabase
        .from('payouts')
        .select('amount')
        .eq('vendor_id', vendorId)
        .eq('status', 'pending')
    ]);

    const totalSales = ordersResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
    const totalOrders = ordersResult.data?.length || 0;
    const totalProducts = productsResult.data?.length || 0;
    const pendingPayouts = payoutsResult.data?.reduce((sum, payout) => sum + parseFloat(payout.amount), 0) || 0;

    return {
      totalSales,
      totalOrders,
      totalProducts,
      pendingPayouts
    };
  }

  async getPlatformStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    platformRevenue: number;
    pendingPayouts: number;
  }> {
    const [vendorsResult, ordersResult, payoutsResult] = await Promise.all([
      supabase
        .from('users')
        .select('id')
        .eq('role', 'vendor'),
      supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed'),
      supabase
        .from('payouts')
        .select('amount')
        .eq('status', 'pending')
    ]);

    const settings = await this.getPlatformSettings();
    const commission = parseFloat(settings.commission_percentage || '5');
    const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
    const platformRevenue = totalRevenue * (commission / 100);
    const pendingPayouts = payoutsResult.data?.reduce((sum, payout) => sum + parseFloat(payout.amount), 0) || 0;

    return {
      totalVendors: vendorsResult.data?.length || 0,
      totalOrders: ordersResult.data?.length || 0,
      platformRevenue,
      pendingPayouts
    };
  }

  // Support Requests
  async createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest> {
    const { data, error } = await supabase
      .from('support_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating support request: ${error.message}`);
    }
    return data;
  }

  async createVendorSupportRequest(request: InsertVendorSupportRequest): Promise<VendorSupportRequest> {
    const { data, error } = await supabase
      .from('vendor_support_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating vendor support request: ${error.message}`);
    }
    return data;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }
    return data;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching payment:', error);
      return undefined;
    }
    return data;
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();
    
    if (error) {
      console.error('Error fetching payment by reference:', error);
      return undefined;
    }
    return data;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...payment, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating payment: ${error.message}`);
    }
    return data;
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching payments by order: ${error.message}`);
    }
    return data || [];
  }

  async getPaymentsByVendor(vendorId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching payments by vendor: ${error.message}`);
    }
    return data || [];
  }

  async getPaymentByPaystackReference(paystackReference: string): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('paystack_reference', paystackReference)
      .single();
    
    if (error) {
      console.error('Error fetching payment by Paystack reference:', error);
      return undefined;
    }
    return data;
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
    return data || [];
  }
}