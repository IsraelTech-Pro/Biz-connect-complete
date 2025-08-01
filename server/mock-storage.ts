import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type Payout, type InsertPayout, type PlatformSettings, type SupportRequest, type InsertSupportRequest, type VendorSupportRequest, type InsertVendorSupportRequest, type Payment, type InsertPayment } from "@shared/schema";
import { IStorage } from "./storage";

export class MockStorage implements IStorage {
  private users: User[] = [
    {
      id: "admin-1",
      full_name: "Admin User",
      email: "admin@vendorhub.com",
      password: "$2b$10$dummy.hash.for.admin123",
      role: "admin",
      phone: "+233123456789",
      whatsapp: "+233123456789",
      is_approved: true,
      business_name: null,
      business_description: null,
      address: null,
      momo_number: null,
      profile_picture: null,
      banner_url: null,
      bio: null,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01")
    },
    {
      id: "vendor-1",
      full_name: "John Doe",
      email: "john@example.com",
      password: "$2b$10$dummy.hash.for.john123",
      role: "vendor",
      phone: "+233123456790",
      whatsapp: "+233123456790",
      is_approved: true,
      business_name: "John's Electronics",
      business_description: "Quality electronics and accessories",
      address: null,
      momo_number: "+233123456790",
      profile_picture: {
        "url": "/uploads/vendor-logo.png",
        "alt": "John's Electronics logo",
        "primary": true
      },
      banner_url: {
        "url": "/uploads/vendor-banner.jpg",
        "alt": "John's Electronics banner",
        "primary": true
      },
      bio: null,
      paystack_subaccount: "ACCT_johnselectronics123",
      created_at: new Date("2024-01-15"),
      updated_at: new Date("2024-01-15")
    },
    {
      id: "customer-1",
      full_name: "Alice Johnson",
      email: "alice@example.com",
      password: "$2b$10$dummy.hash.for.alice123",
      role: "customer",
      phone: "+233123456791",
      whatsapp: null,
      is_approved: false,
      business_name: null,
      business_description: null,
      address: null,
      momo_number: null,
      profile_picture: null,
      banner_url: null,
      bio: null,
      created_at: new Date("2024-01-20"),
      updated_at: new Date("2024-01-20")
    },
    {
      id: "6fac5f0f-9522-49c2-a131-60bf330545d5",
      full_name: "melvin",
      email: "blackforest360blank@gmail.com",
      password: "$2b$10$MjlX/5mtBWFIaIdv1OwSk.T5BX/u08ul6AltrBEaxRBDi3nvCYEPi",
      role: "vendor",
      phone: "1332232323",
      whatsapp: "0866554544",
      is_approved: false,
      business_name: "Issy",
      business_description: "You can now test the registration form in the browser. The form includes all required fields and properly maps to the database structure. Would you like me to test any specific functionality or make any adjustments to the registration flow?",
      address: null,
      momo_number: "0243357372",
      profile_picture: {
        "url": "/uploads/image-1752077502854-173045030.png",
        "alt": "Store logo",
        "primary": true
      },
      banner_url: {
        "url": "/uploads/image-1752077506146-24758151.png",
        "alt": "Store banner",
        "primary": true
      },
      bio: null,
      paystack_subaccount: "ACCT_melvinissystore456",
      created_at: new Date("2025-07-08T19:43:54.456228+00:00"),
      updated_at: new Date("2025-07-09T16:36:33.856+00:00")
    }
  ];

  private products: Product[] = [
    {
      id: "prod-1",
      title: "iPhone 15 Pro",
      description: "Latest iPhone with advanced features",
      price: "1200.00",
      category: "electronics",
      image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      product_images: [
        {
          url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
          alt: "iPhone 15 Pro main image",
          primary: true
        }
      ],
      stock_quantity: 50,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: true,
      is_clearance: false,
      is_trending: true,
      is_new_this_week: false,
      is_top_selling: true,
      is_featured: true,
      is_hot_deal: false,
      is_dont_miss: false,
      original_price: "1400.00",
      discount_percentage: 15,
      flash_sale_end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      rating_average: "4.5",
      rating_count: 125,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "iPhone 15 Pro - VendorHub",
      meta_description: "Buy iPhone 15 Pro online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["iphone", "15", "pro", "apple", "smartphone", "electronics"],
      created_at: new Date("2024-01-16"),
      updated_at: new Date("2024-01-16")
    },
    {
      id: "prod-2",
      title: "Samsung Galaxy S24",
      description: "Premium Android smartphone",
      price: "1100.00",
      category: "electronics",
      image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      product_images: [
        {
          url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
          alt: "Samsung Galaxy S24 main image",
          primary: true
        }
      ],
      stock_quantity: 30,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: false,
      is_clearance: true,
      is_trending: false,
      is_new_this_week: false,
      is_top_selling: false,
      is_featured: false,
      is_hot_deal: true,
      is_dont_miss: false,
      original_price: "1250.00",
      discount_percentage: 12,
      flash_sale_end_date: null,
      rating_average: "4.2",
      rating_count: 89,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "Samsung Galaxy S24 - VendorHub",
      meta_description: "Buy Samsung Galaxy S24 online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["samsung", "galaxy", "s24", "android", "smartphone", "electronics"],
      created_at: new Date("2024-01-17"),
      updated_at: new Date("2024-01-17")
    },
    {
      id: "prod-3",
      title: "MacBook Pro",
      description: "High-performance laptop for professionals",
      price: "2500.00",
      category: "electronics",
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      product_images: [
        {
          url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
          alt: "MacBook Pro main image",
          primary: true
        }
      ],
      stock_quantity: 15,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: false,
      is_clearance: false,
      is_trending: true,
      is_new_this_week: true,
      is_top_selling: false,
      is_featured: true,
      is_hot_deal: false,
      is_dont_miss: true,
      original_price: null,
      discount_percentage: 0,
      flash_sale_end_date: null,
      rating_average: "4.8",
      rating_count: 67,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "MacBook Pro - VendorHub",
      meta_description: "Buy MacBook Pro online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["macbook", "pro", "apple", "laptop", "electronics"],
      created_at: new Date("2024-01-18"),
      updated_at: new Date("2024-01-18")
    },
    {
      id: "prod-4",
      title: "Nike Air Max",
      description: "Comfortable running shoes",
      price: "150.00",
      category: "fashion",
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      product_images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
          alt: "Nike Air Max main image",
          primary: true
        }
      ],
      stock_quantity: 80,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: false,
      is_clearance: true,
      is_trending: false,
      is_new_this_week: false,
      is_top_selling: true,
      is_featured: false,
      is_hot_deal: false,
      is_dont_miss: false,
      original_price: "200.00",
      discount_percentage: 25,
      flash_sale_end_date: null,
      rating_average: "4.3",
      rating_count: 234,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "Nike Air Max - VendorHub",
      meta_description: "Buy Nike Air Max online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["nike", "air", "max", "shoes", "sneakers", "fashion"],
      created_at: new Date("2024-01-19"),
      updated_at: new Date("2024-01-19")
    },
    {
      id: "prod-5",
      title: "Coffee Maker",
      description: "Automatic coffee brewing machine",
      price: "89.99",
      category: "home",
      image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      product_images: [
        {
          url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
          alt: "Coffee Maker main image",
          primary: true
        }
      ],
      stock_quantity: 25,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: false,
      is_clearance: false,
      is_trending: false,
      is_new_this_week: true,
      is_top_selling: false,
      is_featured: false,
      is_hot_deal: false,
      is_dont_miss: false,
      original_price: null,
      discount_percentage: 0,
      flash_sale_end_date: null,
      rating_average: "4.1",
      rating_count: 45,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "Coffee Maker - VendorHub",
      meta_description: "Buy Coffee Maker online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["coffee", "maker", "brewing", "machine", "home"],
      created_at: new Date("2024-01-20"),
      updated_at: new Date("2024-01-20")
    },
    {
      id: "prod-6",
      title: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: "89.99",
      category: "electronics",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      stock_quantity: 40,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: false,
      is_clearance: false,
      is_trending: false,
      is_new_this_week: false,
      is_top_selling: false,
      is_featured: false,
      is_hot_deal: false,
      is_dont_miss: true,
      original_price: "120.00",
      discount_percentage: 25,
      flash_sale_end_date: null,
      rating_average: "4.4",
      rating_count: 156,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "Wireless Bluetooth Headphones - VendorHub",
      meta_description: "Buy Wireless Bluetooth Headphones online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["wireless", "bluetooth", "headphones", "audio", "electronics"],
      created_at: new Date("2024-01-21"),
      updated_at: new Date("2024-01-21")
    },
    {
      id: "prod-7",
      title: "Stylish Women's Handbag",
      description: "Elegant leather handbag perfect for any occasion",
      price: "79.99",
      category: "fashion",
      image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      stock_quantity: 60,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: false,
      is_clearance: false,
      is_trending: true,
      is_new_this_week: false,
      is_top_selling: false,
      is_featured: false,
      is_hot_deal: false,
      is_dont_miss: false,
      original_price: null,
      discount_percentage: 0,
      flash_sale_end_date: null,
      rating_average: "4.6",
      rating_count: 78,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "Stylish Women's Handbag - VendorHub",
      meta_description: "Buy Stylish Women's Handbag online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["handbag", "women", "fashion", "leather", "accessories"],
      created_at: new Date("2024-01-22"),
      updated_at: new Date("2024-01-22")
    },
    {
      id: "prod-8",
      title: "Smart Watch Series 9",
      description: "Latest smart watch with health tracking features",
      price: "299.99",
      category: "electronics",
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=400",
      stock_quantity: 20,
      status: "active",
      vendor_id: "vendor-1",
      is_flash_sale: true,
      is_clearance: false,
      is_trending: false,
      is_new_this_week: true,
      is_top_selling: false,
      is_featured: true,
      is_hot_deal: false,
      is_dont_miss: false,
      original_price: "399.99",
      discount_percentage: 25,
      flash_sale_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      rating_average: "4.7",
      rating_count: 203,
      low_stock_threshold: 10,
      is_featured_vendor: false,
      meta_title: "Smart Watch Series 9 - VendorHub",
      meta_description: "Buy Smart Watch Series 9 online at VendorHub. Best prices, fast delivery, authentic products.",
      search_keywords: ["smartwatch", "watch", "fitness", "health", "electronics"],
      created_at: new Date("2024-01-23"),
      updated_at: new Date("2024-01-23")
    }
  ];

  private orders: Order[] = [
    {
      id: '659ff927-ddf4-49b4-a9c9-0cc4653d68af',
      buyer_id: '1f6a02c0-436c-45b8-97cb-a8d56ff01568',
      vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
      product_id: '1838f031-2cf6-42ae-a57a-a3bba6aeb04b',
      quantity: 1,
      total_amount: 0.20,
      status: 'confirmed',
      shipping_address: 'Accra, Ghana',
      phone: '233551035300',
      notes: 'Test order for payment integration',
      created_at: new Date('2025-07-10T03:19:03Z'),
      updated_at: new Date('2025-07-10T03:19:40Z')
    }
  ];
  private payouts: Payout[] = [
    {
      id: 'payout-001',
      vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
      amount: 0.18,
      status: 'pending',
      momo_number: '0551035300',
      transaction_id: 'TXN_VH_1752117543289_PAYOUT',
      created_at: new Date('2025-07-10T03:20:00Z'),
      updated_at: new Date('2025-07-10T03:20:00Z')
    },
    {
      id: 'payout-002',
      vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
      amount: 1.50,
      status: 'success',
      momo_number: '0551035300',
      transaction_id: 'TXN_PREV_PAYOUT_001',
      created_at: new Date('2025-07-09T15:30:00Z'),
      updated_at: new Date('2025-07-09T15:30:00Z')
    },
    {
      id: 'payout-003',
      vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
      amount: 0.85,
      status: 'pending',
      momo_number: '0551035300',
      transaction_id: 'TXN_PREV_PAYOUT_002',
      created_at: new Date('2025-07-08T12:15:00Z'),
      updated_at: new Date('2025-07-08T12:15:00Z')
    }
  ];
  private payments: Payment[] = [
    {
      id: 'f3a774a2-9eee-44a3-bb53-d4eeaea38df5',
      reference: 'VH_1752117543289_sfa6ows83',
      order_id: '659ff927-ddf4-49b4-a9c9-0cc4653d68af',
      vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
      buyer_id: '1f6a02c0-436c-45b8-97cb-a8d56ff01568',
      amount: 0.20,
      currency: 'GHS',
      payment_method: 'mobile_money',
      status: 'success',
      mobile_number: '233551035300',
      network_provider: 'mtn',
      paystack_reference: 'VH_1752117543289_sfa6ows83',
      authorization_url: 'https://checkout.paystack.com/z6ohe8djnvrbb54',
      access_code: 'z6ohe8djnvrbb54',
      gateway_response: 'Approved',
      paid_at: new Date('2025-07-10T03:19:40Z'),
      created_at: new Date('2025-07-10T03:19:03Z'),
      updated_at: new Date('2025-07-10T03:19:40Z')
    }
  ];
  private settings: PlatformSettings = {
    id: "settings-1",
    commission_rate: 0.05,
    paystack_public_key: "pk_test_placeholder",
    paystack_secret_key: "sk_test_placeholder",
    mtn_momo_api_key: "placeholder",
    mtn_momo_user_id: "placeholder",
    mtn_momo_subscription_key: "placeholder",
    platform_name: "VendorHub",
    platform_description: "Multi-vendor eCommerce platform for Ghana",
    support_email: "support@vendorhub.com",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  };

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      ...user,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    this.users[index] = { ...this.users[index], ...user, updated_at: new Date() };
    return this.users[index];
  }

  async getVendors(): Promise<User[]> {
    return this.users.filter(u => u.role === 'vendor');
  }

  async getPendingVendors(): Promise<User[]> {
    return this.users.filter(u => u.role === 'vendor' && !u.vendor_approved);
  }

  async approveVendor(id: string): Promise<User> {
    return this.updateUser(id, { vendor_approved: true });
  }

  async getProducts(): Promise<Product[]> {
    return this.products.filter(p => p.status === 'active');
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category && p.status === 'active');
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return this.products.filter(p => p.vendor_id === vendorId);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.generateId(),
      ...product,
      // Ensure product_images is properly handled
      product_images: product.product_images || [],
      created_at: new Date(),
      updated_at: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    this.products[index] = { ...this.products[index], ...product, updated_at: new Date() };
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    this.products.splice(index, 1);
  }

  // Enhanced filtering methods
  async getFlashSaleProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_flash_sale && p.status === 'active');
  }

  async getClearanceProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_clearance && p.status === 'active');
  }

  async getTrendingProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_trending && p.status === 'active');
  }

  async getNewThisWeekProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_new_this_week && p.status === 'active');
  }

  async getTopSellingProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_top_selling && p.status === 'active');
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_featured && p.status === 'active');
  }

  async getHotDealsProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_hot_deal && p.status === 'active');
  }

  async getDontMissProducts(): Promise<Product[]> {
    return this.products.filter(p => p.is_dont_miss && p.status === 'active');
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
    let filteredProducts = this.products.filter(p => p.status === 'active');

    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters.isFlashSale) {
      filteredProducts = filteredProducts.filter(p => p.is_flash_sale);
    }

    if (filters.isClearance) {
      filteredProducts = filteredProducts.filter(p => p.is_clearance);
    }

    if (filters.isTrending) {
      filteredProducts = filteredProducts.filter(p => p.is_trending);
    }

    if (filters.isNewThisWeek) {
      filteredProducts = filteredProducts.filter(p => p.is_new_this_week);
    }

    if (filters.isTopSelling) {
      filteredProducts = filteredProducts.filter(p => p.is_top_selling);
    }

    if (filters.isFeatured) {
      filteredProducts = filteredProducts.filter(p => p.is_featured);
    }

    if (filters.isHotDeal) {
      filteredProducts = filteredProducts.filter(p => p.is_hot_deal);
    }

    if (filters.isDontMiss) {
      filteredProducts = filteredProducts.filter(p => p.is_dont_miss);
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
        (p.search_keywords && p.search_keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)))
      );
    }

    return filteredProducts;
  }

  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    return this.orders.filter(o => o.buyer_id === buyerId);
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    return this.orders.filter(o => o.vendor_id === vendorId);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.find(o => o.id === id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      id: this.generateId(),
      ...order,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    this.orders[index] = { ...this.orders[index], ...order, updated_at: new Date() };
    return this.orders[index];
  }

  async getPayouts(): Promise<Payout[]> {
    return this.payouts;
  }

  async getPayoutsByVendor(vendorId: string): Promise<Payout[]> {
    return this.payouts.filter(p => p.vendor_id === vendorId);
  }

  async createPayout(payout: InsertPayout): Promise<Payout> {
    const newPayout: Payout = {
      id: this.generateId(),
      ...payout,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.payouts.push(newPayout);
    return newPayout;
  }

  async updatePayout(id: string, payout: Partial<InsertPayout>): Promise<Payout> {
    const index = this.payouts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payout not found');
    this.payouts[index] = { ...this.payouts[index], ...payout, updated_at: new Date() };
    return this.payouts[index];
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    return this.settings;
  }

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.settings = { ...this.settings, ...settings, updated_at: new Date() };
    return this.settings;
  }

  async getVendorStats(vendorId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    pendingPayouts: number;
  }> {
    const vendorOrders = this.orders.filter(o => o.vendor_id === vendorId);
    const vendorProducts = this.products.filter(p => p.vendor_id === vendorId);
    const vendorPayouts = this.payouts.filter(p => p.vendor_id === vendorId && p.status === 'pending');

    return {
      totalSales: vendorOrders.reduce((sum, order) => sum + order.total_amount, 0),
      totalOrders: vendorOrders.length,
      totalProducts: vendorProducts.length,
      pendingPayouts: vendorPayouts.reduce((sum, payout) => sum + payout.amount, 0)
    };
  }

  async getPlatformStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    platformRevenue: number;
    pendingPayouts: number;
  }> {
    const vendors = this.users.filter(u => u.role === 'vendor');
    const pendingPayouts = this.payouts.filter(p => p.status === 'pending');
    const platformRevenue = this.orders.reduce((sum, order) => sum + (order.total_amount * 0.05), 0);

    return {
      totalVendors: vendors.length,
      totalOrders: this.orders.length,
      platformRevenue: platformRevenue,
      pendingPayouts: pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0)
    };
  }

  async createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest> {
    const newRequest: SupportRequest = {
      ...request,
      id: this.generateId(),
      created_at: new Date()
    };
    // In a real implementation, you would store this in a database
    return newRequest;
  }

  async createVendorSupportRequest(request: InsertVendorSupportRequest): Promise<VendorSupportRequest> {
    const newRequest: VendorSupportRequest = {
      ...request,
      id: this.generateId(),
      created_at: new Date()
    };
    // In a real implementation, you would store this in a database
    return newRequest;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.find(p => p.id === id);
  }

  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    return this.payments.find(p => p.reference === reference);
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Payment with id ${id} not found`);
    }
    
    this.payments[index] = {
      ...this.payments[index],
      ...payment,
      updated_at: new Date()
    };
    return this.payments[index];
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.payments.filter(p => p.order_id === orderId);
  }

  async getPaymentsByVendor(vendorId: string): Promise<Payment[]> {
    return this.payments.filter(p => p.vendor_id === vendorId);
  }

  async getPaymentByPaystackReference(paystackReference: string): Promise<Payment | undefined> {
    return this.payments.find(p => p.paystack_reference === paystackReference);
  }

  async getUsers(): Promise<User[]> {
    return this.users;
  }
}