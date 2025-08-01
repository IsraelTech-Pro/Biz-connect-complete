import { users, products, orders, payouts, platform_settings, support_requests, vendor_support_requests, payments, transactions, mentors, programs, resources, adminUsers, discussions, comments, likes, businessRatings, productRatings, type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type Payout, type InsertPayout, type PlatformSettings, type SupportRequest, type InsertSupportRequest, type VendorSupportRequest, type InsertVendorSupportRequest, type Payment, type InsertPayment, type Mentor, type InsertMentor, type Program, type InsertProgram, type Resource, type InsertResource, type AdminUser, type InsertAdminUser, type Discussion, type InsertDiscussion, type Comment, type InsertComment, type Like, type InsertLike, type BusinessRating, type InsertBusinessRating, type ProductRating, type InsertProductRating } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not found. Please configure PostgreSQL database.");
}

const pool = new pg.Pool({
  connectionString,
});

const db = drizzle(pool);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getVendors(): Promise<User[]>;
  getPendingVendors(): Promise<User[]>;
  approveVendor(id: string): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByVendor(vendorId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Enhanced filtering methods
  getFlashSaleProducts(): Promise<Product[]>;
  getClearanceProducts(): Promise<Product[]>;
  getTrendingProducts(): Promise<Product[]>;
  getNewThisWeekProducts(): Promise<Product[]>;
  getTopSellingProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getHotDealsProducts(): Promise<Product[]>;
  getDontMissProducts(): Promise<Product[]>;
  getProductsByFilter(filters: {
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
  }): Promise<Product[]>;

  // Search methods
  searchProducts(query: string): Promise<Product[]>;
  searchVendors(query: string): Promise<User[]>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByBuyer(buyerId: string): Promise<Order[]>;
  getOrdersByVendor(vendorId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  
  // Payouts
  getPayouts(): Promise<Payout[]>;
  getPayoutsByVendor(vendorId: string): Promise<Payout[]>;
  createPayout(payout: InsertPayout): Promise<Payout>;
  updatePayout(id: string, payout: Partial<InsertPayout>): Promise<Payout>;
  
  // Platform Settings
  getPlatformSettings(): Promise<PlatformSettings>;
  updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings>;
  
  // Analytics
  getVendorStats(vendorId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    pendingPayouts: number;
  }>;
  
  getPlatformStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    platformRevenue: number;
    pendingPayouts: number;
  }>;

  // Support Requests
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  createVendorSupportRequest(request: InsertVendorSupportRequest): Promise<VendorSupportRequest>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByReference(reference: string): Promise<Payment | undefined>;
  getPaymentByPaystackReference(paystackReference: string): Promise<Payment | undefined>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;
  getPaymentsByOrder(orderId: string): Promise<Payment[]>;
  getPaymentsByVendor(vendorId: string): Promise<Payment[]>;
  
  // Users lookup
  getUsers(): Promise<User[]>;
  
  // Admin management methods
  // Mentors
  getMentors(): Promise<Mentor[]>;
  getMentor(id: string): Promise<Mentor | undefined>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  updateMentor(id: string, mentor: Partial<InsertMentor>): Promise<Mentor>;
  deleteMentor(id: string): Promise<void>;
  
  // Programs
  getPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program>;
  deleteProgram(id: string): Promise<void>;
  
  // Resources
  getResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  incrementResourceViews(id: string): Promise<void>;
  incrementResourceDownloads(id: string): Promise<void>;

  // Admin authentication methods
  getAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(data: InsertAdminUser): Promise<AdminUser>;
  getAdminUserByUsername(username: string): Promise<AdminUser | null>;
  getAdminUserById(id: string): Promise<AdminUser | null>;
  updateAdminUser(id: string, data: Partial<InsertAdminUser>): Promise<AdminUser | null>;
  
  // Community Discussions
  getDiscussions(): Promise<any[]>;
  getDiscussionsByCategory(category: string): Promise<any[]>;
  getDiscussion(id: string): Promise<any | undefined>;
  createDiscussion(discussion: any): Promise<any>;
  updateDiscussion(id: string, discussion: any): Promise<any>;
  deleteDiscussion(id: string): Promise<void>;
  incrementDiscussionViews(id: string): Promise<void>;
  
  // Comments
  getCommentsByDiscussion(discussionId: string): Promise<any[]>;
  getComment(id: string): Promise<any | undefined>;
  createComment(comment: any): Promise<any>;
  updateComment(id: string, comment: any): Promise<any>;
  deleteComment(id: string): Promise<void>;
  
  // Likes
  toggleLike(userId: string, targetId: string, type: 'discussion' | 'comment'): Promise<{ liked: boolean; count: number }>;
  getUserLikes(userId: string): Promise<any[]>;
  
  // Community Stats
  getCommunityStats(): Promise<{
    totalMembers: number;
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
  }>;
  
  // Business Ratings
  getBusinessRatings(businessId: string): Promise<BusinessRating[]>;
  getBusinessRating(userId: string, businessId: string): Promise<BusinessRating | undefined>;
  createBusinessRating(rating: InsertBusinessRating): Promise<BusinessRating>;
  updateBusinessRating(id: string, rating: Partial<InsertBusinessRating>): Promise<BusinessRating>;
  deleteBusinessRating(id: string): Promise<void>;
  getBusinessRatingStats(businessId: string): Promise<{
    averageRating: number;
    totalRatings: number;
  }>;

  // Product Ratings
  getProductRatings(productId: string): Promise<ProductRating[]>;
  getProductRating(userId: string, productId: string): Promise<ProductRating | undefined>;
  createProductRating(rating: InsertProductRating): Promise<ProductRating>;
  updateProductRating(id: string, rating: Partial<InsertProductRating>): Promise<ProductRating>;
  deleteProductRating(id: string): Promise<void>;
  getProductRatingStats(productId: string): Promise<{
    averageRating: number;
    totalRatings: number;
  }>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(users).where(eq(users.id, id));
  }

  async getVendors(): Promise<User[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(users).where(eq(users.role, "vendor"));
  }

  async getPendingVendors(): Promise<User[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(users).where(and(eq(users.role, "vendor"), eq(users.is_approved, false)));
  }

  async approveVendor(id: string): Promise<User> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(users).set({ is_approved: true }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.created_at));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products).where(and(eq(products.category, category), eq(products.status, "active")));
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products).where(eq(products.vendor_id, vendorId));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(products).values({
      ...product,
      // Ensure product_images is properly handled
      product_images: product.product_images || []
    }).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(products).where(eq(products.id, id));
  }

  // Enhanced filtering methods
  async getFlashSaleProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_flash_sale, true), eq(products.status, "active")))
      .orderBy(desc(products.created_at));
  }

  async getClearanceProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_clearance, true), eq(products.status, "active")))
      .orderBy(desc(products.discount_percentage));
  }

  async getTrendingProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_trending, true), eq(products.status, "active")))
      .orderBy(desc(products.rating_average));
  }

  async getNewThisWeekProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_new_this_week, true), eq(products.status, "active")))
      .orderBy(desc(products.created_at));
  }

  async getTopSellingProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_top_selling, true), eq(products.status, "active")))
      .orderBy(desc(products.rating_count));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_featured, true), eq(products.status, "active")))
      .orderBy(desc(products.created_at));
  }

  async getHotDealsProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_hot_deal, true), eq(products.status, "active")))
      .orderBy(desc(products.discount_percentage));
  }

  async getDontMissProducts(): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(products)
      .where(and(eq(products.is_dont_miss, true), eq(products.status, "active")))
      .orderBy(desc(products.rating_average));
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
    if (!db) throw new Error('Database not available');
    
    const conditions: any[] = [eq(products.status, "active")];
    
    if (filters.category) {
      conditions.push(eq(products.category, filters.category));
    }
    
    if (filters.isFlashSale) {
      conditions.push(eq(products.is_flash_sale, true));
    }
    
    if (filters.isClearance) {
      conditions.push(eq(products.is_clearance, true));
    }
    
    if (filters.isTrending) {
      conditions.push(eq(products.is_trending, true));
    }
    
    if (filters.isNewThisWeek) {
      conditions.push(eq(products.is_new_this_week, true));
    }
    
    if (filters.isTopSelling) {
      conditions.push(eq(products.is_top_selling, true));
    }
    
    if (filters.isFeatured) {
      conditions.push(eq(products.is_featured, true));
    }
    
    if (filters.isHotDeal) {
      conditions.push(eq(products.is_hot_deal, true));
    }
    
    if (filters.isDontMiss) {
      conditions.push(eq(products.is_dont_miss, true));
    }
    
    if (filters.minPrice !== undefined) {
      conditions.push(sql`${products.price} >= ${filters.minPrice}`);
    }
    
    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
    }
    
    if (filters.searchTerm) {
      conditions.push(sql`(
        LOWER(${products.title}) LIKE LOWER('%${filters.searchTerm}%') OR 
        LOWER(${products.description}) LIKE LOWER('%${filters.searchTerm}%') OR
        LOWER(${products.brand}) LIKE LOWER('%${filters.searchTerm}%') OR
        ${filters.searchTerm} = ANY(${products.search_keywords})
      )`);
    }
    
    return await db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.created_at));
  }

  async getOrders(): Promise<Order[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(orders).orderBy(desc(orders.created_at));
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(orders).where(eq(orders.buyer_id, buyerId));
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(orders).where(eq(orders.vendor_id, vendorId));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getPayouts(): Promise<Payout[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(payouts).orderBy(desc(payouts.created_at));
  }

  async getPayoutsByVendor(vendorId: string): Promise<Payout[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(payouts).where(eq(payouts.vendor_id, vendorId));
  }

  async createPayout(payout: InsertPayout): Promise<Payout> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(payouts).values(payout).returning();
    return result[0];
  }

  async updatePayout(id: string, payout: Partial<InsertPayout>): Promise<Payout> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(payouts).set({
      ...payout,
      updated_at: new Date()
    }).where(eq(payouts.id, id)).returning();
    return result[0];
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(platform_settings).limit(1);
    if (result.length === 0) {
      const defaultSettings = await db.insert(platform_settings).values({}).returning();
      return defaultSettings[0];
    }
    return result[0];
  }

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    if (!db) throw new Error('Database not available');
    const current = await this.getPlatformSettings();
    const result = await db.update(platform_settings).set(settings).where(eq(platform_settings.id, current.id)).returning();
    return result[0];
  }

  async getVendorStats(vendorId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    pendingPayouts: number;
  }> {
    if (!db) throw new Error('Database not available');
    const [salesResult, ordersResult, productsResult, payoutsResult] = await Promise.all([
      db.select({ total: sql<number>`sum(${orders.total_amount})` }).from(orders).where(eq(orders.vendor_id, vendorId)),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.vendor_id, vendorId)),
      db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.vendor_id, vendorId)),
      db.select({ total: sql<number>`sum(${payouts.amount})` }).from(payouts).where(and(eq(payouts.vendor_id, vendorId), eq(payouts.status, "pending")))
    ]);

    return {
      totalSales: salesResult[0]?.total || 0,
      totalOrders: ordersResult[0]?.count || 0,
      totalProducts: productsResult[0]?.count || 0,
      pendingPayouts: payoutsResult[0]?.total || 0,
    };
  }

  async getPlatformStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    platformRevenue: number;
    pendingPayouts: number;
  }> {
    if (!db) throw new Error('Database not available');
    const [vendorsResult, ordersResult, revenueResult, payoutsResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "vendor")),
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db.select({ total: sql<number>`sum(${orders.total_amount})` }).from(orders),
      db.select({ total: sql<number>`sum(${payouts.amount})` }).from(payouts).where(eq(payouts.status, "pending"))
    ]);

    const settings = await this.getPlatformSettings();
    const commission = parseFloat(settings.commission_percentage || "5");
    const platformRevenue = (revenueResult[0]?.total || 0) * (commission / 100);

    return {
      totalVendors: vendorsResult[0]?.count || 0,
      totalOrders: ordersResult[0]?.count || 0,
      platformRevenue,
      pendingPayouts: payoutsResult[0]?.total || 0,
    };
  }

  async createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest> {
    const [newRequest] = await db.insert(support_requests).values(request).returning();
    return newRequest;
  }

  async createVendorSupportRequest(request: InsertVendorSupportRequest): Promise<VendorSupportRequest> {
    const [newRequest] = await db.insert(vendor_support_requests).values(request).returning();
    return newRequest;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
    return result[0];
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return result[0];
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(payments).where(eq(payments.order_id, orderId));
  }

  async getPaymentsByVendor(vendorId: string): Promise<Payment[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(payments).where(eq(payments.vendor_id, vendorId));
  }

  async getPaymentByPaystackReference(paystackReference: string): Promise<Payment | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(payments).where(eq(payments.paystack_reference, paystackReference)).limit(1);
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(users);
  }

  // Admin management implementations
  // Mentors
  async getMentors(): Promise<Mentor[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(mentors).orderBy(desc(mentors.created_at));
  }

  async getMentor(id: string): Promise<Mentor | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(mentors).where(eq(mentors.id, id)).limit(1);
    return result[0];
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(mentors).values(mentor).returning();
    return result[0];
  }

  async updateMentor(id: string, mentor: Partial<InsertMentor>): Promise<Mentor> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(mentors).set(mentor).where(eq(mentors.id, id)).returning();
    return result[0];
  }

  async deleteMentor(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(mentors).where(eq(mentors.id, id));
  }

  // Programs
  async getPrograms(): Promise<Program[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(programs).orderBy(desc(programs.created_at));
  }

  async getProgram(id: string): Promise<Program | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
    return result[0];
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(programs).values(program).returning();
    return result[0];
  }

  async updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(programs).set(program).where(eq(programs.id, id)).returning();
    return result[0];
  }

  async deleteProgram(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    if (!db) throw new Error('Database not available');
    return await db.select().from(resources).orderBy(desc(resources.created_at));
  }

  async getResource(id: string): Promise<Resource | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    return result[0];
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(resources).values(resource).returning();
    return result[0];
  }

  async updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(resources).set(resource).where(eq(resources.id, id)).returning();
    return result[0];
  }

  async deleteResource(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(resources).where(eq(resources.id, id));
  }

  async incrementResourceViews(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.update(resources)
      .set({ views: sql`${resources.views} + 1` })
      .where(eq(resources.id, id));
  }

  async incrementResourceDownloads(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.update(resources)
      .set({ downloads: sql`${resources.downloads} + 1` })
      .where(eq(resources.id, id));
  }

  // Admin authentication methods
  async getAdminUsers(): Promise<AdminUser[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(adminUsers).orderBy(desc(adminUsers.created_at));
    return result;
  }

  async createAdminUser(data: InsertAdminUser): Promise<AdminUser> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(adminUsers).values(data).returning();
    return result[0];
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | null> {
    if (!db) throw new Error('Database not available');      
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return result[0] || null;
  }

  async getAdminUserById(id: string): Promise<AdminUser | null> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return result[0] || null;
  }

  async updateAdminUser(id: string, data: Partial<InsertAdminUser>): Promise<AdminUser | null> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(adminUsers).set(data).where(eq(adminUsers.id, id)).returning();
    return result[0] || null;
  }

  // Community Discussion methods
  async getDiscussions(): Promise<any[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      category: discussions.category,
      tags: discussions.tags,
      author_id: discussions.author_id,
      author_name: users.full_name,
      author_email: users.email,
      is_pinned: discussions.is_pinned,
      is_locked: discussions.is_locked,
      view_count: discussions.view_count,
      like_count: discussions.like_count,
      comment_count: discussions.comment_count,
      status: discussions.status,
      created_at: discussions.created_at,
      updated_at: discussions.updated_at,
    })
    .from(discussions)
    .innerJoin(users, eq(discussions.author_id, users.id))
    .where(eq(discussions.status, 'published'))
    .orderBy(desc(discussions.is_pinned), desc(discussions.created_at));
    
    return result;
  }

  async getDiscussionsByCategory(category: string): Promise<any[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      category: discussions.category,
      tags: discussions.tags,
      author_id: discussions.author_id,
      author_name: users.full_name,
      author_email: users.email,
      is_pinned: discussions.is_pinned,
      is_locked: discussions.is_locked,
      view_count: discussions.view_count,
      like_count: discussions.like_count,
      comment_count: discussions.comment_count,
      status: discussions.status,
      created_at: discussions.created_at,
      updated_at: discussions.updated_at,
    })
    .from(discussions)
    .innerJoin(users, eq(discussions.author_id, users.id))
    .where(and(eq(discussions.category, category), eq(discussions.status, 'published')))
    .orderBy(desc(discussions.is_pinned), desc(discussions.created_at));
    
    return result;
  }

  async getDiscussion(id: string): Promise<any | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      category: discussions.category,
      tags: discussions.tags,
      author_id: discussions.author_id,
      author_name: users.full_name,
      author_email: users.email,
      is_pinned: discussions.is_pinned,
      is_locked: discussions.is_locked,
      view_count: discussions.view_count,
      like_count: discussions.like_count,
      comment_count: discussions.comment_count,
      status: discussions.status,
      created_at: discussions.created_at,
      updated_at: discussions.updated_at,
    })
    .from(discussions)
    .innerJoin(users, eq(discussions.author_id, users.id))
    .where(eq(discussions.id, id))
    .limit(1);
    
    return result[0];
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<any> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(discussions).values(discussion).returning();
    return result[0];
  }

  async updateDiscussion(id: string, discussion: Partial<InsertDiscussion>): Promise<any> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(discussions)
      .set({ ...discussion, updated_at: new Date() })
      .where(eq(discussions.id, id))
      .returning();
    return result[0];
  }

  async deleteDiscussion(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    // Delete associated likes first
    await db.delete(likes).where(eq(likes.discussion_id, id));
    // Delete associated comments and their likes
    const discussionComments = await db.select({ id: comments.id }).from(comments).where(eq(comments.discussion_id, id));
    for (const comment of discussionComments) {
      await db.delete(likes).where(eq(likes.comment_id, comment.id));
    }
    await db.delete(comments).where(eq(comments.discussion_id, id));
    // Finally delete the discussion
    await db.delete(discussions).where(eq(discussions.id, id));
  }

  async incrementDiscussionViews(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.update(discussions)
      .set({ view_count: sql`${discussions.view_count} + 1` })
      .where(eq(discussions.id, id));
  }

  // Comment methods
  async getCommentsByDiscussion(discussionId: string): Promise<any[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      id: comments.id,
      discussion_id: comments.discussion_id,
      parent_comment_id: comments.parent_comment_id,
      content: comments.content,
      author_id: comments.author_id,
      author_name: users.full_name,
      author_email: users.email,
      like_count: comments.like_count,
      reply_count: comments.reply_count,
      status: comments.status,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
    })
    .from(comments)
    .innerJoin(users, eq(comments.author_id, users.id))
    .where(and(eq(comments.discussion_id, discussionId), eq(comments.status, 'published')))
    .orderBy(comments.created_at);
    
    return result;
  }

  async getComment(id: string): Promise<any | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      id: comments.id,
      discussion_id: comments.discussion_id,
      parent_comment_id: comments.parent_comment_id,
      content: comments.content,
      author_id: comments.author_id,
      author_name: users.full_name,
      author_email: users.email,
      like_count: comments.like_count,
      reply_count: comments.reply_count,
      status: comments.status,
      created_at: comments.created_at,
      updated_at: comments.updated_at,
    })
    .from(comments)
    .innerJoin(users, eq(comments.author_id, users.id))
    .where(eq(comments.id, id))
    .limit(1);
    
    return result[0];
  }

  async createComment(comment: InsertComment): Promise<any> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(comments).values(comment).returning();
    
    // Update discussion comment count
    await db.update(discussions)
      .set({ comment_count: sql`${discussions.comment_count} + 1` })
      .where(eq(discussions.id, comment.discussion_id));
    
    // Update parent comment reply count if it's a reply
    if (comment.parent_comment_id) {
      await db.update(comments)
        .set({ reply_count: sql`${comments.reply_count} + 1` })
        .where(eq(comments.id, comment.parent_comment_id));
    }
    
    return result[0];
  }

  async updateComment(id: string, comment: Partial<InsertComment>): Promise<any> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(comments)
      .set({ ...comment, updated_at: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return result[0];
  }

  async deleteComment(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    // Get comment details first
    const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (!comment[0]) return;
    
    // Delete associated likes
    await db.delete(likes).where(eq(likes.comment_id, id));
    
    // Delete the comment
    await db.delete(comments).where(eq(comments.id, id));
    
    // Update discussion comment count
    await db.update(discussions)
      .set({ comment_count: sql`${discussions.comment_count} - 1` })
      .where(eq(discussions.id, comment[0].discussion_id));
    
    // Update parent comment reply count if it was a reply
    if (comment[0].parent_comment_id) {
      await db.update(comments)
        .set({ reply_count: sql`${comments.reply_count} - 1` })
        .where(eq(comments.id, comment[0].parent_comment_id));
    }
  }

  // Like methods
  async toggleLike(userId: string, targetId: string, type: 'discussion' | 'comment'): Promise<{ liked: boolean; count: number }> {
    if (!db) throw new Error('Database not available');
    
    // Check if like exists
    const existingLike = await db.select()
      .from(likes)
      .where(and(
        eq(likes.user_id, userId),
        type === 'discussion' ? eq(likes.discussion_id, targetId) : eq(likes.comment_id, targetId),
        eq(likes.type, type)
      ))
      .limit(1);
    
    if (existingLike.length > 0) {
      // Unlike - remove the like
      await db.delete(likes).where(eq(likes.id, existingLike[0].id));
      
      // Update count
      if (type === 'discussion') {
        await db.update(discussions)
          .set({ like_count: sql`${discussions.like_count} - 1` })
          .where(eq(discussions.id, targetId));
      } else {
        await db.update(comments)
          .set({ like_count: sql`${comments.like_count} - 1` })
          .where(eq(comments.id, targetId));
      }
      
      return { liked: false, count: await this.getLikeCount(targetId, type) };
    } else {
      // Like - add the like
      const likeData: InsertLike = {
        user_id: userId,
        type,
        ...(type === 'discussion' ? { discussion_id: targetId } : { comment_id: targetId })
      };
      
      await db.insert(likes).values(likeData);
      
      // Update count
      if (type === 'discussion') {
        await db.update(discussions)
          .set({ like_count: sql`${discussions.like_count} + 1` })
          .where(eq(discussions.id, targetId));
      } else {
        await db.update(comments)
          .set({ like_count: sql`${comments.like_count} + 1` })
          .where(eq(comments.id, targetId));
      }
      
      return { liked: true, count: await this.getLikeCount(targetId, type) };
    }
  }

  private async getLikeCount(targetId: string, type: 'discussion' | 'comment'): Promise<number> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(likes)
      .where(and(
        type === 'discussion' ? eq(likes.discussion_id, targetId) : eq(likes.comment_id, targetId),
        eq(likes.type, type)
      ));
    
    return Number(result[0]?.count || 0);
  }

  async getUserLikes(userId: string): Promise<any[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select()
      .from(likes)
      .where(eq(likes.user_id, userId));
    
    return result;
  }

  // Community Stats
  async getCommunityStats(): Promise<{ totalMembers: number; totalPosts: number; totalComments: number; totalLikes: number }> {
    if (!db) throw new Error('Database not available');
    
    const [membersResult, postsResult, commentsResult, likesResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(discussions).where(eq(discussions.status, 'published')),
      db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.status, 'published')),
      db.select({ count: sql<number>`count(*)` }).from(likes)
    ]);
    
    return {
      totalMembers: Number(membersResult[0]?.count || 0),
      totalPosts: Number(postsResult[0]?.count || 0),
      totalComments: Number(commentsResult[0]?.count || 0),
      totalLikes: Number(likesResult[0]?.count || 0)
    };
  }

  // Business Rating methods
  async getBusinessRatings(businessId: string): Promise<BusinessRating[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(businessRatings).where(eq(businessRatings.business_id, businessId));
    return result;
  }

  async getBusinessRating(userId: string, businessId: string): Promise<BusinessRating | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(businessRatings)
      .where(and(eq(businessRatings.user_id, userId), eq(businessRatings.business_id, businessId)));
    return result[0];
  }

  async createBusinessRating(rating: InsertBusinessRating): Promise<BusinessRating> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(businessRatings).values(rating).returning();
    return result[0];
  }

  async updateBusinessRating(id: string, rating: Partial<InsertBusinessRating>): Promise<BusinessRating> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(businessRatings)
      .set({ ...rating, updated_at: new Date() })
      .where(eq(businessRatings.id, id))
      .returning();
    return result[0];
  }

  async deleteBusinessRating(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(businessRatings).where(eq(businessRatings.id, id));
  }

  async getBusinessRatingStats(businessId: string): Promise<{ averageRating: number; totalRatings: number }> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      averageRating: sql<number>`AVG(${businessRatings.rating})`,
      totalRatings: sql<number>`COUNT(*)`
    }).from(businessRatings).where(eq(businessRatings.business_id, businessId));
    
    return {
      averageRating: Number(result[0]?.averageRating || 0),
      totalRatings: Number(result[0]?.totalRatings || 0)
    };
  }

  // Product Rating methods
  async getProductRatings(productId: string): Promise<ProductRating[]> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(productRatings).where(eq(productRatings.product_id, productId));
    return result;
  }

  async getProductRating(userId: string, productId: string): Promise<ProductRating | undefined> {
    if (!db) throw new Error('Database not available');
    const result = await db.select().from(productRatings)
      .where(and(eq(productRatings.user_id, userId), eq(productRatings.product_id, productId)));
    return result[0];
  }

  async createProductRating(rating: InsertProductRating): Promise<ProductRating> {
    if (!db) throw new Error('Database not available');
    const result = await db.insert(productRatings).values(rating).returning();
    return result[0];
  }

  async updateProductRating(id: string, rating: Partial<InsertProductRating>): Promise<ProductRating> {
    if (!db) throw new Error('Database not available');
    const result = await db.update(productRatings)
      .set({ ...rating, updated_at: new Date() })
      .where(eq(productRatings.id, id))
      .returning();
    return result[0];
  }

  async deleteProductRating(id: string): Promise<void> {
    if (!db) throw new Error('Database not available');
    await db.delete(productRatings).where(eq(productRatings.id, id));
  }

  async getProductRatingStats(productId: string): Promise<{ averageRating: number; totalRatings: number }> {
    if (!db) throw new Error('Database not available');
    const result = await db.select({
      averageRating: sql<number>`AVG(${productRatings.rating})`,
      totalRatings: sql<number>`COUNT(*)`
    }).from(productRatings).where(eq(productRatings.product_id, productId));
    
    return {
      averageRating: Number(result[0]?.averageRating || 0),
      totalRatings: Number(result[0]?.totalRatings || 0)
    };
  }

  // Search methods
  async searchProducts(query: string): Promise<Product[]> {
    if (!db) throw new Error('Database not available');
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const result = await db.select()
      .from(products)
      .where(
        or(
          like(sql`LOWER(${products.title})`, searchTerm),
          like(sql`LOWER(${products.description})`, searchTerm),
          like(sql`LOWER(${products.category})`, searchTerm)
        )
      )
      .orderBy(desc(products.created_at))
      .limit(10);
    
    return result;
  }

  async searchVendors(query: string): Promise<User[]> {
    if (!db) throw new Error('Database not available');
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const result = await db.select()
      .from(users)
      .where(
        and(
          eq(users.role, 'vendor'),
          or(
            like(sql`LOWER(${users.business_name})`, searchTerm),
            like(sql`LOWER(${users.full_name})`, searchTerm),
            like(sql`LOWER(${users.business_description})`, searchTerm)
          )
        )
      )
      .orderBy(desc(users.created_at))
      .limit(8);
    
    return result;
  }
}

console.log('Storage initialization: Using PostgreSQL with DATABASE_URL');

export const storage = new PostgresStorage();
