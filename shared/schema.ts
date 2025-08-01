import { pgTable, text, uuid, decimal, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  full_name: text("full_name").notNull(),
  role: text("role").notNull().default("buyer"), // buyer, vendor, admin
  business_name: text("business_name"),
  business_description: text("business_description"),
  business_category: text("business_category"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  momo_number: text("momo_number"),
  paystack_subaccount: text("paystack_subaccount"), // For direct vendor payments
  profile_picture: jsonb("profile_picture"),
  banner_url: jsonb("banner_url"),
  bio: text("bio"),
  is_approved: boolean("is_approved").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendor_id: uuid("vendor_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer("stock_quantity").notNull().default(0),
  image_url: text("image_url"),
  product_images: jsonb("product_images").default([]),
  category: text("category").notNull(),
  brand: text("brand"),
  sku: text("sku"),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  dimensions: text("dimensions"),
  tags: text("tags").array().default([]),
  status: text("status").notNull().default("active"), // active, inactive, out_of_stock
  
  // Enhanced filtering fields
  is_flash_sale: boolean("is_flash_sale").default(false),
  is_clearance: boolean("is_clearance").default(false),
  is_trending: boolean("is_trending").default(false),
  is_new_this_week: boolean("is_new_this_week").default(false),
  is_top_selling: boolean("is_top_selling").default(false),
  is_featured: boolean("is_featured").default(false),
  is_hot_deal: boolean("is_hot_deal").default(false),
  is_dont_miss: boolean("is_dont_miss").default(false),
  
  // Discount and promotion fields
  original_price: decimal("original_price", { precision: 10, scale: 2 }),
  discount_percentage: integer("discount_percentage").default(0),
  flash_sale_end_date: timestamp("flash_sale_end_date"),
  
  // Product ratings and reviews
  rating_average: decimal("rating_average", { precision: 3, scale: 2 }).default("0.00"),
  rating_count: integer("rating_count").default(0),
  
  // Inventory and availability
  low_stock_threshold: integer("low_stock_threshold").default(10),
  is_featured_vendor: boolean("is_featured_vendor").default(false),
  
  // SEO and searchability
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  search_keywords: text("search_keywords").array().default([]),
  
  // Timestamps
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyer_id: uuid("buyer_id").notNull().references(() => users.id),
  vendor_id: uuid("vendor_id").notNull().references(() => users.id),
  product_id: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  shipping_address: text("shipping_address"),
  phone: text("phone"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendor_id: uuid("vendor_id").notNull().references(() => users.id),
  product_id: uuid("product_id").references(() => products.id), // Add product_id
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, success, failed
  momo_number: text("momo_number").notNull(),
  transaction_id: text("transaction_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const platform_settings = pgTable("platform_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  commission_percentage: decimal("commission_percentage", { precision: 5, scale: 2 }).notNull().default("5.00"),
  minimum_payout: decimal("minimum_payout", { precision: 10, scale: 2 }).notNull().default("50.00"),
  auto_payout_threshold: decimal("auto_payout_threshold", { precision: 10, scale: 2 }).notNull().default("500.00"),
  payout_schedule: text("payout_schedule").notNull().default("daily"), // daily, weekly, monthly
});

export const support_requests = pgTable("support_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const vendor_support_requests = pgTable("vendor_support_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendor_email: text("vendor_email").notNull(),
  store_name: text("store_name").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  order_id: uuid("order_id").notNull().references(() => orders.id),
  vendor_id: uuid("vendor_id").notNull().references(() => users.id),
  buyer_id: uuid("buyer_id").notNull().references(() => users.id),
  product_id: uuid("product_id").references(() => products.id), // Add product_id
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("GHS"),
  payment_method: text("payment_method").notNull(), // card, mobile_money
  mobile_number: text("mobile_number"), // for mobile money
  network_provider: text("network_provider"), // mtn, vod, tgo
  status: text("status").notNull().default("pending"), // pending, success, failed
  paystack_reference: text("paystack_reference"),
  authorization_url: text("authorization_url"),
  access_code: text("access_code"),
  gateway_response: text("gateway_response"),
  paid_at: timestamp("paid_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("GHS"),
  email: text("email").notNull(),
  item: text("item").notNull(),
  vendor_id: uuid("vendor_id").notNull().references(() => users.id),
  buyer_id: uuid("buyer_id").notNull().references(() => users.id),
  reference: text("reference").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, success, failed
  paid_at: timestamp("paid_at"),
  delivery_time: timestamp("delivery_time"),
  vendor_contact: text("vendor_contact"),
  paystack_id: integer("paystack_id").unique(),
  gateway_response: text("gateway_response"),
  channel: text("channel"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  price: z.string().min(1, "Price is required"),
  stock_quantity: z.number().int().min(0, "Stock quantity must be non-negative"),
  weight: z.string().optional().nullable(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  created_at: true,
});

export const insertSupportRequestSchema = createInsertSchema(support_requests).omit({
  id: true,
  created_at: true,
});

export const insertVendorSupportRequestSchema = createInsertSchema(vendor_support_requests).omit({
  id: true,
  created_at: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Admin management tables
export const mentors = pgTable("mentors", {
  id: uuid("id").primaryKey().defaultRandom(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  whatsapp_number: text("whatsapp_number"),
  company: text("company").notNull(),
  position: text("position").notNull(),
  expertise: text("expertise").notNull(),
  bio: text("bio").notNull(),
  years_experience: integer("years_experience").notNull(),
  specializations: text("specializations"),
  availability: text("availability").notNull().default("weekends"),
  status: text("status").notNull().default("active"), // active, inactive
  profile_image: text("profile_image"),
  linkedin_url: text("linkedin_url"),
  twitter_url: text("twitter_url"),
  facebook_url: text("facebook_url"),
  instagram_url: text("instagram_url"),
  website_url: text("website_url"),
  office_address: text("office_address"),
  consultation_fee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  languages_spoken: text("languages_spoken"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  max_participants: integer("max_participants").notNull(),
  program_type: text("program_type").notNull().default("mentorship"), // mentorship, workshop, bootcamp, course, seminar
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  requirements: text("requirements"),
  outcomes: text("outcomes"),
  status: text("status").notNull().default("active"), // active, upcoming, completed, cancelled
  participants_count: integer("participants_count").default(0),
  mentor_id: uuid("mentor_id").references(() => mentors.id),
  location_type: text("location_type").notNull().default("online"), // online, physical, hybrid
  location_address: text("location_address"),
  platform_link: text("platform_link"), // Zoom, Teams, etc.
  whatsapp_support: text("whatsapp_support"),
  call_support: text("call_support"),
  program_fee: decimal("program_fee", { precision: 10, scale: 2 }).default("0.00"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("business-plan"), // business-plan, marketing, finance, legal, operations, technology, personal-development
  resource_type: text("resource_type").notNull().default("guide"), // guide, template, checklist, video, webinar, ebook, tool
  files: jsonb("files").default([]), // Array of {name, url, size, type}
  external_links: jsonb("external_links").default([]), // Array of {name, url, description}
  tags: text("tags").array().default([]),
  difficulty_level: text("difficulty_level").notNull().default("beginner"), // beginner, intermediate, advanced
  estimated_time: text("estimated_time"),
  status: text("status").notNull().default("published"), // published, draft, archived
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  thumbnail_url: text("thumbnail_url"), // Preview image for the resource
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertMentorSchema = createInsertSchema(mentors).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type PlatformSettings = typeof platform_settings.$inferSelect;
export type SupportRequest = typeof support_requests.$inferSelect;
export type InsertSupportRequest = z.infer<typeof insertSupportRequestSchema>;
export type VendorSupportRequest = typeof vendor_support_requests.$inferSelect;
export type InsertVendorSupportRequest = z.infer<typeof insertVendorSupportRequestSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Mentor = typeof mentors.$inferSelect;
export type InsertMentor = z.infer<typeof insertMentorSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

// Admin users table for admin authentication
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Plain text as requested
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Business ratings table
export const businessRatings = pgTable("business_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  business_id: uuid("business_id").notNull().references(() => users.id), // References vendor/business user
  user_id: uuid("user_id").notNull().references(() => users.id), // User who rated
  rating: integer("rating").notNull(), // 1-5 star rating
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Product ratings table
export const productRatings = pgTable("product_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").notNull().references(() => products.id), // References product
  user_id: uuid("user_id").notNull().references(() => users.id), // User who rated
  rating: integer("rating").notNull(), // 1-5 star rating
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schema for admin users
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Insert schema for business ratings
export const insertBusinessRatingSchema = createInsertSchema(businessRatings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Insert schema for product ratings
export const insertProductRatingSchema = createInsertSchema(productRatings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type BusinessRating = typeof businessRatings.$inferSelect;
export type InsertBusinessRating = z.infer<typeof insertBusinessRatingSchema>;
export type ProductRating = typeof productRatings.$inferSelect;
export type InsertProductRating = z.infer<typeof insertProductRatingSchema>;

// Community discussions table
export const discussions = pgTable("discussions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"), // general, business-ideas, funding, marketing, tech, success-stories, questions, networking
  tags: text("tags").array().default([]),
  author_id: uuid("author_id").notNull().references(() => users.id),
  is_pinned: boolean("is_pinned").default(false),
  is_locked: boolean("is_locked").default(false),
  view_count: integer("view_count").default(0),
  like_count: integer("like_count").default(0),
  comment_count: integer("comment_count").default(0),
  status: text("status").notNull().default("published"), // published, hidden, deleted
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  discussion_id: uuid("discussion_id").notNull().references(() => discussions.id),
  parent_comment_id: uuid("parent_comment_id"), // For nested replies
  content: text("content").notNull(),
  author_id: uuid("author_id").notNull().references(() => users.id),
  like_count: integer("like_count").default(0),
  reply_count: integer("reply_count").default(0),
  status: text("status").notNull().default("published"), // published, hidden, deleted
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Likes table for discussions and comments
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  discussion_id: uuid("discussion_id").references(() => discussions.id),
  comment_id: uuid("comment_id").references(() => comments.id),
  type: text("type").notNull(), // discussion or comment
  created_at: timestamp("created_at").defaultNow(),
});

// Insert schemas for community features
export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  view_count: true,
  like_count: true,
  comment_count: true,
  created_at: true,
  updated_at: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  like_count: true,
  reply_count: true,
  created_at: true,
  updated_at: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  created_at: true,
});

// Types for community features
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
