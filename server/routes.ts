import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertSupportRequestSchema, insertVendorSupportRequestSchema, insertPaymentSchema, insertDiscussionSchema, insertCommentSchema, insertLikeSchema, insertQuickSaleSchema, insertQuickSaleProductSchema, insertQuickSaleBidSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import "./types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY;

// Import Paystack functions
import { createTransferRecipient, initiateTransfer } from './paystack-config';

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Use memory storage for Supabase uploads, disk storage for local fallback
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for resource file uploads (supports more file types)
const resourceUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for resource files
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Please upload PDF, Word, Excel, PowerPoint, text or image files.'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    
    try {
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      
      // Check if user account is still approved
      if (!user.is_approved) {
        return res.status(403).json({ 
          message: 'Your account is not approved by the admin. Please contact the administrator for account activation.',
          code: 'ACCOUNT_NOT_APPROVED'
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ message: 'Authentication error' });
    }
  });
};

// Middleware to check if user is vendor
const requireVendor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Vendor access required' });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to verify admin token
const authenticateAdminToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid admin token' });
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    try {
      const adminUser = await storage.getAdminUserById(decoded.id);
      if (!adminUser || !adminUser.is_active) {
        return res.status(403).json({ message: 'Admin user not found or inactive' });
      }
      req.adminUser = adminUser;
      next();
    } catch (error) {
      console.error('Admin authentication error:', error);
      return res.status(500).json({ message: 'Admin authentication error' });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Image upload endpoint
  app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Check if Supabase is configured
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        // Fall back to local storage - save file to disk
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'image-' + uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filePath, req.file.buffer);
        const fileUrl = `/uploads/${filename}`;
        res.json({ url: fileUrl });
        return;
      }
      
      // Upload to Supabase Storage
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true // Allow overwriting files
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        // Fall back to local storage - save file to disk
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'image-' + uniqueSuffix + path.extname(req.file.originalname);
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filePath, req.file.buffer);
        const fileUrl = `/uploads/${filename}`;
        res.json({ url: fileUrl });
        return;
      }
      
      // Get public URL
      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      res.json({ url: publicData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Validate KTU student email format
      const ktuEmailRegex = /^[^\s@]+@ktu\.edu\.gh$/;
      if (!ktuEmailRegex.test(userData.email)) {
        return res.status(400).json({ message: 'Only KTU students can register. Please use your official KTU email ending with @ktu.edu.gh' });
      }
      
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Since new users need admin approval, don't create a token or log them in immediately
      res.json({ 
        user: { ...user, password: undefined }, 
        message: 'Account created successfully! Your account is pending admin approval. You will be able to log in once an administrator activates your account.',
        requiresApproval: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid user data', error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format. Please use a valid email address (e.g., user@example.com)' });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user account is approved by admin
      if (!user.is_approved) {
        return res.status(403).json({ 
          message: 'Your account is not approved by the admin. Please contact the administrator for account activation.',
          code: 'ACCOUNT_NOT_APPROVED'
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // User update route
  app.put('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      console.log('User update request received:', req.body);
      console.log('User ID:', req.params.id);
      console.log('Auth user:', req.user);
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Check if user is updating their own profile or is admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to update this user' });
      }
      
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Process the update data
      const updateData = {
        ...req.body,
        updated_at: new Date(),
        // Remove password field if it exists
        password: undefined,
        // Ensure JSONB fields are properly formatted
        profile_picture: req.body.profile_picture || null,
        banner_url: req.body.banner_url || null,
      };
      
      console.log('Processed update data:', updateData);
      
      const updatedUser = await storage.updateUser(req.params.id, updateData);
      console.log('User updated successfully:', updatedUser);
      
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error('User update error:', error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, vendor } = req.query;
      let products;
      
      console.log('Products request query:', req.query);
      
      if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else if (vendor) {
        console.log('Filtering products by vendor:', vendor);
        products = await storage.getProductsByVendor(vendor as string);
        console.log('Vendor products found:', products.length);
      } else {
        products = await storage.getProducts();
      }
      
      // Ensure we always return an array
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to get products' });
    }
  });

  // Enhanced filter endpoints
  app.get('/api/products/filter/flash-sale', async (req, res) => {
    try {
      const products = await storage.getFlashSaleProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
      res.status(500).json({ message: 'Failed to get flash sale products' });
    }
  });

  app.get('/api/products/filter/clearance', async (req, res) => {
    try {
      const products = await storage.getClearanceProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching clearance products:', error);
      res.status(500).json({ message: 'Failed to get clearance products' });
    }
  });

  app.get('/api/products/filter/trending', async (req, res) => {
    try {
      const products = await storage.getTrendingProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      res.status(500).json({ message: 'Failed to get trending products' });
    }
  });

  app.get('/api/products/filter/new-this-week', async (req, res) => {
    try {
      const products = await storage.getNewThisWeekProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching new this week products:', error);
      res.status(500).json({ message: 'Failed to get new this week products' });
    }
  });

  app.get('/api/products/filter/top-selling', async (req, res) => {
    try {
      const products = await storage.getTopSellingProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      res.status(500).json({ message: 'Failed to get top selling products' });
    }
  });

  app.get('/api/products/filter/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({ message: 'Failed to get featured products' });
    }
  });

  app.get('/api/products/filter/hot-deals', async (req, res) => {
    try {
      const products = await storage.getHotDealsProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching hot deals products:', error);
      res.status(500).json({ message: 'Failed to get hot deals products' });
    }
  });

  app.get('/api/products/filter/dont-miss', async (req, res) => {
    try {
      const products = await storage.getDontMissProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error fetching dont miss products:', error);
      res.status(500).json({ message: 'Failed to get dont miss products' });
    }
  });

  // Advanced filter endpoint
  app.post('/api/products/filter', async (req, res) => {
    try {
      const filters = req.body;
      const products = await storage.getProductsByFilter(filters);
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error filtering products:', error);
      res.status(500).json({ message: 'Failed to filter products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get product' });
    }
  });

  app.post('/api/products', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      console.log('Received product data:', req.body);
      console.log('Product images received:', req.body.product_images);
      
      // Process the data before validation
      const processedData = {
        ...req.body,
        vendor_id: req.user.id,
        // Convert date string to Date object if present
        flash_sale_end_date: null, // Vendors cannot set flash sale dates
        // Ensure numbers are properly parsed
        stock_quantity: parseInt(req.body.stock_quantity) || 0,
        discount_percentage: parseInt(req.body.discount_percentage) || 0,
        low_stock_threshold: parseInt(req.body.low_stock_threshold) || 10,
        // Convert decimal fields to strings if they exist
        original_price: req.body.original_price ? req.body.original_price.toString() : null,
        weight: req.body.weight ? req.body.weight.toString() : null,
        // Promotional flags are admin-only, set to false for vendors
        is_flash_sale: false,
        is_clearance: false,
        is_trending: false,
        is_new_this_week: false,
        is_top_selling: false,
        is_featured: false,
        is_hot_deal: false,
        is_dont_miss: false,
        is_featured_vendor: false,
        // Handle nullable fields properly
        brand: req.body.brand || null,
        sku: req.body.sku || null,
        dimensions: req.body.dimensions || null,
        // SEO fields are admin-only, set to null for vendors
        meta_title: null,
        meta_description: null,
        search_keywords: [], // Empty array for vendors
        // Ensure arrays are properly handled
        tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []),
        product_images: Array.isArray(req.body.product_images) ? req.body.product_images : [],
        // Remove any old images field that might be present
        images: undefined
      };
      
      console.log('Processed product data:', processedData);
      
      const productData = insertProductSchema.parse(processedData);
      
      console.log('Parsed product data:', productData);
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({ message: 'Invalid product data', error: error.message });
    }
  });

  app.put('/api/products/:id', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const product = await storage.getProduct(req.params.id);
      if (!product || product.vendor_id !== req.user.id) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      console.log('Updating product with data:', req.body);
      console.log('Product images for update:', req.body.product_images);
      
      // Validate and process the request body - vendors cannot modify promotional/SEO fields
      const productData = {
        ...req.body,
        price: req.body.price.toString(), // Ensure price is string
        stock_quantity: parseInt(req.body.stock_quantity) || 0, // Ensure stock_quantity is number
        weight: req.body.weight?.toString() || null, // Ensure weight is string or null
        // Ensure numbers are properly parsed
        discount_percentage: parseInt(req.body.discount_percentage) || 0,
        low_stock_threshold: parseInt(req.body.low_stock_threshold) || 10,
        // Convert decimal fields to strings if they exist
        original_price: req.body.original_price ? req.body.original_price.toString() : null,
        // Handle nullable fields properly
        brand: req.body.brand || null,
        sku: req.body.sku || null,
        dimensions: req.body.dimensions || null,
        // Ensure arrays are properly handled
        tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []),
        product_images: Array.isArray(req.body.product_images) ? req.body.product_images : [],
        updated_at: new Date(),
        // Remove promotional, SEO, and flash sale fields - vendors cannot modify these
        flash_sale_end_date: undefined,
        is_flash_sale: undefined,
        is_clearance: undefined,
        is_trending: undefined,
        is_new_this_week: undefined,
        is_top_selling: undefined,
        is_featured: undefined,
        is_hot_deal: undefined,
        is_dont_miss: undefined,
        is_featured_vendor: undefined,
        meta_title: undefined,
        meta_description: undefined,
        search_keywords: undefined,
        // Remove any old images field that might be present
        images: undefined
      };
      
      const updatedProduct = await storage.updateProduct(req.params.id, productData);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({ message: 'Failed to update product', error: error.message });
    }
  });

  app.delete('/api/products/:id', authenticateToken, requireVendor, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const product = await storage.getProduct(req.params.id);
      if (!product || product.vendor_id !== req.user.id) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      await storage.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Order routes
  app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { vendor } = req.query;
      let orders;
      
      if (vendor && req.user.role === 'vendor' && req.user.id === vendor) {
        // Vendor requesting their own orders
        orders = await storage.getOrdersByVendor(vendor as string);
      } else if (req.user.role === 'admin') {
        orders = await storage.getOrders();
      } else if (req.user.role === 'vendor') {
        orders = await storage.getOrdersByVendor(req.user.id);
      } else {
        orders = await storage.getOrdersByBuyer(req.user.id);
      }
      
      // Add buyer information for vendor orders
      if (req.user.role === 'vendor' || vendor) {
        const ordersWithBuyers = await Promise.all(
          orders.map(async (order) => {
            if (order.buyer_id) {
              const buyer = await storage.getUser(order.buyer_id);
              return {
                ...order,
                buyer_name: buyer?.full_name || 'N/A',
                buyer_email: buyer?.email || 'N/A',
                buyer_phone: buyer?.phone || 'N/A'
              };
            }
            return order;
          })
        );
        res.json(ordersWithBuyers);
      } else {
        res.json(orders);
      }
    } catch (error) {
      console.error('Error in orders API:', error);
      res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Verify payment with Paystack if payment_id is provided
      if (orderData.payment_id && PAYSTACK_SECRET) {
        try {
          const response = await fetch(`https://api.paystack.co/transaction/verify/${orderData.payment_id}`, {
            headers: {
              'Authorization': `Bearer ${PAYSTACK_SECRET}`
            }
          });
          
          const paymentData = await response.json();
          
          if (paymentData.status && paymentData.data.status === 'success') {
            // Payment verified, update order status
            await storage.updateOrder(order.id, { status: 'confirmed' });
            
            // Note: Vendor payouts should be processed manually by admin
            // All payments go to platform first, then admin processes vendor payouts
            console.log(`Payment verified for order ${order.id}. Amount: ${paymentData.data.amount / 100} GHS`);
            console.log(`Vendor payout will be processed manually by admin`);
          }
        } catch (paymentError) {
          console.error('Payment verification error:', paymentError);
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: 'Invalid order data', error: error.message });
    }
  });

  // Function to process vendor payout
  async function processVendorPayout(order: any) {
    const vendor = await storage.getUser(order.vendor_id);
    if (!vendor || !vendor.momo_number) {
      throw new Error('Vendor mobile money number not found');
    }

    // Create transfer recipient for vendor
    const recipientData = {
      type: 'mobile_money',
      name: vendor.business_name || vendor.full_name,
      account_number: vendor.momo_number,
      bank_code: 'MTN' // Default to MTN, could be made dynamic
    };

    const recipientResponse = await createTransferRecipient(recipientData);
    
    if (!recipientResponse.status) {
      throw new Error('Failed to create transfer recipient');
    }

    // Calculate vendor payout (total amount minus platform fee)
    const platformFee = order.amount * 0.05; // 5% platform fee
    const vendorPayout = order.amount - platformFee;

    // Initiate transfer to vendor
    const transferData = {
      source: 'balance',
      amount: vendorPayout,
      recipient: recipientResponse.data.recipient_code,
      reason: `Payout for order ${order.id}`,
      reference: `PAYOUT-${order.id}-${Date.now()}`
    };

    const transferResponse = await initiateTransfer(transferData);
    
    if (!transferResponse.status) {
      throw new Error('Failed to initiate transfer to vendor');
    }

    console.log(`Vendor payout initiated: ${vendorPayout} GHS to ${vendor.momo_number}`);
  }

  app.put('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Only vendor can update their orders or admin can update any order
      if (!req.user || (req.user.role !== 'admin' && order.vendor_id !== req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updatedOrder = await storage.updateOrder(req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update order' });
    }
  });

  // Vendor routes
  app.get('/api/vendors', async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors.map(v => ({ ...v, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to get vendors' });
    }
  });

  // Vendor payments endpoint
  app.get('/api/vendors/:id/payments', authenticateToken, async (req, res) => {
    try {
      // Only vendor can see their own payments or admin can see any vendor payments
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const payments = await storage.getPaymentsByVendor(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      res.status(500).json({ message: 'Failed to get vendor payments' });
    }
  });

  // Vendor payouts endpoint
  app.get('/api/vendors/:id/payouts', authenticateToken, async (req, res) => {
    try {
      // Only vendor can see their own payouts or admin can see any vendor payouts
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const payouts = await storage.getPayoutsByVendor(req.params.id);
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching vendor payouts:', error);
      res.status(500).json({ message: 'Failed to get vendor payouts' });
    }
  });

  app.get('/api/vendors/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const vendors = await storage.getPendingVendors();
      res.json(vendors.map(v => ({ ...v, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to get pending vendors' });
    }
  });

  app.post('/api/vendors/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const vendor = await storage.approveVendor(req.params.id);
      res.json({ ...vendor, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve vendor' });
    }
  });

  app.get('/api/vendors/:id/stats', authenticateToken, async (req, res) => {
    try {
      // Only vendor can see their own stats or admin can see any vendor stats
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== req.params.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const stats = await storage.getVendorStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get vendor stats' });
    }
  });

  // Search endpoint for real-time search
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 3) {
        return res.json({ products: [], vendors: [] });
      }

      // Search products and vendors
      const [products, vendors] = await Promise.all([
        storage.searchProducts(query),
        storage.searchVendors(query)
      ]);

      res.json({
        products: products || [],
        vendors: vendors?.map(v => ({ ...v, password: undefined })) || []
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Search failed' });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Don't return password
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Admin routes - moved to dedicated admin endpoints below

  // Admin settings moved to dedicated admin endpoints below

  // Paystack public key endpoint
  app.get('/api/paystack/public-key', (req, res) => {
    res.json({ 
      publicKey: PAYSTACK_PUBLIC,
      configured: !!PAYSTACK_PUBLIC && !!PAYSTACK_SECRET
    });
  });

  // Direct SQL database update endpoint
  app.post('/api/database/alter-tables', async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || `https://${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('Adding product_id columns to payments and payouts tables...');
      
      // Add product_id column to payments table
      const { error: paymentsError } = await supabase.rpc('sql', {
        query: `
          ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS product_id uuid;
          ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS product_id uuid;
        `
      });

      if (paymentsError) {
        console.error('Database alter error:', paymentsError);
        return res.status(500).json({ 
          status: false, 
          message: 'Failed to alter database tables',
          error: paymentsError.message 
        });
      }

      // Update existing payment with product_id
      const { error: updateError } = await supabase
        .from('payments')
        .update({ product_id: '1838f031-2cf6-42ae-a57a-a3bba6aeb04b' })
        .eq('reference', 'VH_1752117543289_sfa6ows83');

      if (updateError) {
        console.error('Payment update error:', updateError);
      }

      res.json({ 
        status: true, 
        message: 'Database tables updated successfully with product_id columns',
        data: { paymentsUpdated: true, payoutsUpdated: true, existingPaymentUpdated: !updateError }
      });
    } catch (error) {
      console.error('Database alter error:', error);
      res.status(500).json({ 
        status: false, 
        message: 'Failed to alter database tables',
        error: error.message 
      });
    }
  });

  // Test endpoint to create payment directly (bypassing order creation)
  app.post('/api/payments/test-create', authenticateToken, async (req, res) => {
    try {
      const { reference, amount, currency, payment_method, vendor_id, buyer_id, status } = req.body;
      
      if (!reference || !amount || !vendor_id || !buyer_id) {
        return res.status(400).json({ 
          status: false, 
          message: 'Missing required fields: reference, amount, vendor_id, buyer_id' 
        });
      }

      // Create test order for payment testing
      const orderData = {
        buyer_id,
        vendor_id,
        product_id: '1838f031-2cf6-42ae-a57a-a3bba6aeb04b',
        quantity: 1,
        total_amount: amount.toString(),
        status: 'pending',
        shipping_address: 'Test Address',
        phone: '233551035300',
        notes: 'Test payment order'
      };
      
      const order = await storage.createOrder(orderData);
      
      // Create payment record
      const paymentData = {
        reference,
        order_id: order.id,
        vendor_id,
        buyer_id,
        amount: amount.toString(),
        currency: currency || 'GHS',
        payment_method: payment_method || 'card',
        status: status || 'pending'
      };

      const payment = await storage.createPayment(paymentData);
      res.json({ 
        status: true, 
        message: 'Payment created successfully', 
        data: payment 
      });
    } catch (error) {
      console.error('Test payment creation error:', error);
      res.status(500).json({ 
        status: false, 
        message: 'Failed to create test payment',
        error: error.message 
      });
    }
  });

  // Payment routes - Direct vendor payments with callback handling
  app.post('/api/payments/initialize', async (req, res) => {
    try {
      const { 
        email, 
        amount, 
        mobile_number, 
        provider, 
        payment_method,
        order_id,
        vendor_id,
        buyer_id
      } = req.body;
      
      console.log('Initializing payment:', { 
        email, 
        amount, 
        mobile_number, 
        provider, 
        payment_method,
        order_id,
        vendor_id,
        buyer_id
      });
      
      if (!email || !amount || !order_id || !vendor_id || !buyer_id) {
        return res.status(400).json({ 
          status: false, 
          message: 'Missing required fields: email, amount, order_id, vendor_id, buyer_id' 
        });
      }

      // Generate unique payment reference
      const reference = `VH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get vendor information for subaccount
      const vendor = await storage.getUser(vendor_id);
      if (!vendor) {
        return res.status(404).json({ 
          status: false, 
          message: 'Vendor not found' 
        });
      }

      // Create payment record in database
      const paymentData = {
        reference,
        order_id,
        vendor_id,
        buyer_id,
        amount: amount.toString(),
        currency: 'GHS',
        payment_method,
        mobile_number: mobile_number || null,
        network_provider: provider || null,
        status: 'pending'
      };
      
      const payment = await storage.createPayment(paymentData);
      
      // Prepare Paystack payment data
      const paystackData: any = {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        callback_url: `${req.protocol}://${req.get('host')}/api/payments/callback`,
      };

      // Add mobile money specific fields
      if (payment_method === 'mobile_money' && mobile_number && provider) {
        paystackData.mobile_number = mobile_number;
        paystackData.provider = provider;
        paystackData.channels = ['mobile_money'];
      }
      
      // Add subaccount for direct vendor payment
      if (vendor.paystack_subaccount) {
        paystackData.subaccount = vendor.paystack_subaccount;
      }

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paystackData),
      });

      const data = await response.json();
      console.log('Paystack payment response:', data);
      
      if (!response.ok) {
        return res.status(400).json({ 
          status: false, 
          message: data.message || 'Payment initialization failed' 
        });
      }

      // Update payment with Paystack response
      await storage.updatePayment(payment.id, {
        paystack_reference: data.data.reference,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code
      });

      res.json({
        status: true,
        message: 'Payment initialized successfully',
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
          payment_id: payment.id
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ 
        status: false, 
        message: 'Internal server error' 
      });
    }
  });

  // Mobile money payment initialization
  app.post('/api/payments/initialize-mobile-money', authenticateToken, async (req, res) => {
    try {
      const { email, amount, mobile_number, provider } = req.body;
      
      if (!PAYSTACK_SECRET) {
        return res.status(400).json({ 
          status: false, 
          message: 'Paystack secret key is not configured' 
        });
      }
      
      console.log('Initializing mobile money payment:', {
        email,
        amount,
        mobile_number,
        provider
      });
      
      // Generate unique payment reference
      const reference = `VH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get current user from request
      const user = req.user as any;
      console.log('User from token:', user);
      if (!user) {
        console.log('No user found in request');
        return res.status(401).json({ 
          status: false, 
          message: 'User not authenticated' 
        });
      }
      
      // Get vendor information for the product (in real implementation, this would be passed from frontend)
      const product = await storage.getProduct('1838f031-2cf6-42ae-a57a-a3bba6aeb04b');
      if (!product) {
        return res.status(404).json({
          status: false,
          message: 'Product not found'
        });
      }
      
      // Get vendor details including paystack_subaccount
      console.log('Fetching vendor with ID:', product.vendor_id);
      const vendor = await storage.getUser(product.vendor_id);
      if (!vendor) {
        console.log('Vendor not found for ID:', product.vendor_id);
        return res.status(404).json({
          status: false,
          message: 'Vendor not found'
        });
      }
      
      console.log('Vendor found:', {
        id: vendor.id,
        name: vendor.full_name,
        business_name: vendor.business_name,
        paystack_subaccount: vendor.paystack_subaccount
      });
      
      // Create order for mobile money payment
      const orderData = {
        buyer_id: user.id,
        vendor_id: product.vendor_id, // Use actual vendor ID from product
        product_id: product.id,
        quantity: 1,
        total_amount: amount.toString(),
        status: 'pending',
        shipping_address: 'Mobile Money Test Address',
        phone: user.phone || mobile_number,
        notes: 'Mobile money payment order'
      };
      
      const order = await storage.createOrder(orderData);
      
      // Create payment record in database
      const paymentData = {
        reference,
        order_id: order.id,
        vendor_id: product.vendor_id, // Use actual vendor ID
        buyer_id: user.id,
        amount: amount.toString(),
        currency: 'GHS',
        payment_method: 'mobile_money',
        mobile_number,
        network_provider: provider,
        status: 'pending'
      };
      
      const payment = await storage.createPayment(paymentData);
      console.log('Payment record created:', payment);
      
      // Prepare payment initialization with vendor subaccount if available
      const paymentPayload: any = {
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        channels: ['mobile_money'],
        mobile_money: {
          phone: mobile_number,
          provider: provider
        },
        callback_url: `${req.protocol}://${req.get('host')}/api/payments/callback`,
        metadata: {
          cancel_action: `${req.protocol}://${req.get('host')}/api/payments/callback`,
          vendor_id: product.vendor_id,
          order_id: order.id
        }
      };
      
      // Include subaccount for direct vendor payment if available
      if (vendor.paystack_subaccount) {
        paymentPayload.subaccount = vendor.paystack_subaccount;
        console.log('Using vendor subaccount for direct payment:', vendor.paystack_subaccount);
      }
      
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      });
      
      const data = await response.json();
      console.log('Paystack mobile money response:', data);
      
      if (!response.ok) {
        return res.status(400).json({ 
          status: false, 
          message: data.message || 'Payment initialization failed' 
        });
      }
      
      // Update payment with Paystack response
      await storage.updatePayment(payment.id, {
        paystack_reference: data.data.reference,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code
      });
      
      res.json({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
          payment_id: payment.id,
          order_id: order.id
        }
      });
    } catch (error) {
      console.error('Mobile money initialization error:', error);
      res.status(500).json({ 
        status: false, 
        message: 'Failed to initialize mobile money payment',
        error: error.message
      });
    }
  });

  // Payment callback route - handles both success and failure
  app.get('/api/payments/callback', async (req, res) => {
    const { reference, trxref } = req.query;
    const paymentReference = reference || trxref;
    
    console.log('Payment callback received:', { reference, trxref, paymentReference });
    
    if (paymentReference) {
      try {
        // Find payment in database
        const payment = await storage.getPaymentByReference(paymentReference as string);
        
        if (!payment) {
          console.log('Payment not found in database:', paymentReference);
          return res.redirect(`/payment-result?status=failed&reason=payment_not_found`);
        }

        // Verify payment with Paystack
        const response = await fetch(`https://api.paystack.co/transaction/verify/${paymentReference}`, {
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET}`
          }
        });
        
        const paymentData = await response.json();
        console.log('Payment verification response:', paymentData);
        
        if (paymentData.status && paymentData.data.status === 'success') {
          // Payment verified successfully - update payment status
          await storage.updatePayment(payment.id, {
            status: 'success',
            gateway_response: paymentData.data.gateway_response,
            paid_at: new Date()
          });
          
          // Update order status (skip if fails due to schema issues)
          try {
            await storage.updateOrder(payment.order_id, { 
              status: 'confirmed'
            });
            console.log('Order status updated successfully');
          } catch (orderError) {
            console.error('Failed to update order status (continuing with payment success):', orderError);
            // Continue with payment success even if order update fails
          }
          
          console.log(`Payment successful: ${paymentReference} - Amount: ${paymentData.data.amount / 100} GHS`);
          
          // Redirect to success page with order details
          res.redirect(`/payment-result?status=success&reference=${paymentReference}&amount=${paymentData.data.amount / 100}&order_id=${payment.order_id}`);
        } else {
          // Payment failed verification
          const errorMessage = paymentData.data?.gateway_response || paymentData.message || 'Payment failed';
          await storage.updatePayment(payment.id, {
            status: 'failed',
            gateway_response: errorMessage
          });
          
          console.log(`Payment failed: ${paymentReference} - Reason: ${errorMessage}`);
          
          res.redirect(`/payment-result?status=failed&reason=payment_failed&reference=${paymentReference}`);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        
        // Update payment as failed if found
        try {
          const payment = await storage.getPaymentByReference(paymentReference as string);
          if (payment) {
            await storage.updatePayment(payment.id, {
              status: 'failed',
              gateway_response: 'Verification error'
            });
          }
        } catch (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
        
        res.redirect(`/payment-result?status=failed&reason=verification_error&reference=${paymentReference}`);
      }
    } else {
      res.redirect('/payment-result?status=failed&reason=no_reference');
    }
  });

  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { reference } = req.body;
      
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      });
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify payment' });
    }
  });

  // Create payment endpoint
  app.post('/api/payments', authenticateToken, async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({ message: 'Failed to create payment' });
    }
  });

  // Test endpoint to create a payment record for testing callback
  app.post('/api/payments/create-test', async (req, res) => {
    try {
      const { reference, amount, order_id } = req.body;
      
      const testPayment = {
        reference: reference || `TEST_REF_${Date.now()}`,
        amount: amount || '10.00',
        payment_method: 'mobile_money',
        vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
        buyer_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
        order_id: order_id || '6fac5f0f-9522-49c2-a131-60bf330545d5'
      };
      
      const payment = await storage.createPayment(testPayment);
      res.json({ status: true, payment });
    } catch (error) {
      console.error('Error creating test payment:', error);
      res.status(500).json({ status: false, message: 'Failed to create test payment' });
    }
  });

  // Vendor stats route
  app.get('/api/vendor/stats/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Only allow vendors to view their own stats or admins to view any stats
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const stats = await storage.getVendorStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ message: 'Failed to get vendor stats' });
    }
  });

  // Payout routes
  app.get('/api/payouts', authenticateToken, async (req, res) => {
    try {
      let payouts;
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      if (req.user.role === 'admin') {
        payouts = await storage.getPayouts();
      } else if (req.user.role === 'vendor') {
        payouts = await storage.getPayoutsByVendor(req.user.id);
      } else {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get payouts' });
    }
  });

  app.post('/api/payouts/transfer', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { vendor_id, amount, momo_number } = req.body;
      
      // Create transfer recipient
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'mobile_money',
          name: 'Vendor',
          account_number: momo_number,
          bank_code: 'MTN',
          currency: 'GHS'
        })
      });
      
      const recipientData = await recipientResponse.json();
      
      if (!recipientData.status) {
        return res.status(400).json({ message: 'Failed to create transfer recipient' });
      }
      
      // Initiate transfer
      const transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'balance',
          amount: amount * 100, // Convert to pesewas
          recipient: recipientData.data.recipient_code,
          reason: 'Vendor payout'
        })
      });
      
      const transferData = await transferResponse.json();
      res.json(transferData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to initiate payout' });
    }
  });

  // Support request routes
  app.post('/api/support-requests', async (req, res) => {
    try {
      const supportRequest = insertSupportRequestSchema.parse(req.body);
      const newSupportRequest = await storage.createSupportRequest(supportRequest);
      res.json(newSupportRequest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/vendor-support-requests', async (req, res) => {
    try {
      const vendorSupportRequest = insertVendorSupportRequestSchema.parse(req.body);
      const newVendorSupportRequest = await storage.createVendorSupportRequest(vendorSupportRequest);
      res.json(newVendorSupportRequest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Setup route to populate database with sample data
  app.post('/api/setup-data', async (req, res) => {
    try {
      const { setupSupabaseData } = await import('./setup-supabase');
      await setupSupabaseData();
      res.json({ message: 'Database populated with sample data successfully' });
    } catch (error) {
      console.error('Error setting up data:', error);
      res.status(500).json({ message: 'Failed to setup data' });
    }
  });

  // Add comprehensive products endpoint
  app.post('/api/add-comprehensive-products', async (req, res) => {
    try {
      const { addComprehensiveProducts } = await import('./add-comprehensive-products');
      const result = await addComprehensiveProducts();
      res.json({ 
        message: `Added ${result.success} products successfully, ${result.failed} failed`,
        result 
      });
    } catch (error) {
      console.error('Error adding comprehensive products:', error);
      res.status(500).json({ message: 'Failed to add comprehensive products' });
    }
  });

  // Vendor stats endpoint
  app.get('/api/vendor/stats/:vendorId', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const stats = await storage.getVendorStats(vendorId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ message: 'Failed to fetch vendor stats' });
    }
  });

  // Vendor orders endpoint
  app.get('/api/orders/vendor/:vendorId', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const orders = await storage.getOrdersByVendor(vendorId);
      
      // Fetch buyer information for each order
      const ordersWithBuyers = await Promise.all(
        orders.map(async (order) => {
          if (order.buyer_id) {
            const buyer = await storage.getUser(order.buyer_id);
            return {
              ...order,
              buyer_name: buyer?.full_name || 'N/A',
              buyer_email: buyer?.email || 'N/A',
              buyer_phone: buyer?.phone || 'N/A'
            };
          }
          return order;
        })
      );
      
      res.json(ordersWithBuyers);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      res.status(500).json({ message: 'Failed to fetch vendor orders' });
    }
  });

  // Dashboard API routes
  
  // Sync Paystack data
  app.post('/api/sync/transactions', requireAdmin, async (req, res) => {
    try {
      const { databaseSync } = await import('./database-sync');
      await databaseSync.syncTransactions();
      res.json({ success: true, message: 'Transactions synced successfully' });
    } catch (error) {
      console.error('Transaction sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync transactions',
        error: error.message 
      });
    }
  });

  app.post('/api/sync/payouts', requireAdmin, async (req, res) => {
    try {
      const { databaseSync } = await import('./database-sync');
      await databaseSync.syncPayouts();
      res.json({ success: true, message: 'Payouts synced successfully' });
    } catch (error) {
      console.error('Payout sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync payouts',
        error: error.message 
      });
    }
  });

  app.post('/api/sync/all', requireAdmin, async (req, res) => {
    try {
      const { databaseSync } = await import('./database-sync');
      await databaseSync.syncAll();
      res.json({ success: true, message: 'All data synced successfully' });
    } catch (error) {
      console.error('Full sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync all data',
        error: error.message 
      });
    }
  });

  // Manual sync route for testing without admin requirement
  app.post('/api/sync/manual', authenticateToken, async (req, res) => {
    try {
      const { paystackDatabaseSync } = await import('./paystack-database-sync');
      console.log('Starting manual Paystack sync...');
      
      // Sync transactions to payments table
      await paystackDatabaseSync.syncTransactionsToPayments();
      console.log('Paystack transactions synced to payments table');
      
      // Sync transfers to payouts table
      await paystackDatabaseSync.syncTransfersToPayouts();
      console.log('Paystack transfers synced to payouts table');
      
      res.json({ 
        success: true, 
        message: 'Manual Paystack sync completed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Manual Paystack sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Manual Paystack sync failed',
        error: error.message 
      });
    }
  });

  // Vendor Dashboard API - Using existing payments table
  app.get('/api/dashboard/vendor/transactions', authenticateToken, requireVendor, async (req, res) => {
    try {
      const user = req.user as any;
      const db = storage as any;
      let transactions = [];
      
      // Query the payments table directly with JOIN to get buyer and order info
      if (db.query) {
        try {
          const result = await db.query(`
            SELECT 
              p.id,
              p.reference,
              p.amount,
              p.currency,
              p.payment_method as channel,
              p.status,
              p.paid_at,
              p.created_at,
              p.paystack_reference,
              p.gateway_response,
              p.mobile_number,
              p.network_provider,
              u.full_name as buyer_name,
              u.email as buyer_email,
              u.phone as buyer_phone,
              u.whatsapp as buyer_whatsapp,
              o.id as order_id,
              pr.title as item
            FROM payments p
            LEFT JOIN users u ON p.buyer_id = u.id
            LEFT JOIN orders o ON p.order_id = o.id
            LEFT JOIN products pr ON o.product_id = pr.id
            WHERE p.vendor_id = $1
            ORDER BY p.paid_at DESC, p.created_at DESC
            LIMIT 100
          `, [user.id]);
          
          transactions = result.rows || [];
          console.log(`Found ${transactions.length} payments for vendor ${user.id}`);
        } catch (queryError) {
          console.log('Database query failed, falling back to storage methods:', queryError.message);
        }
      }
      
      // If direct query failed, fall back to storage methods
      if (transactions.length === 0) {
        console.log('Using storage methods for vendor transactions');
        const payments = await storage.getPaymentsByVendor(user.id);
        
        transactions = await Promise.all(payments.map(async (payment) => {
          const buyer = await storage.getUser(payment.buyer_id);
          const order = await storage.getOrder(payment.order_id);
          const product = order ? await storage.getProduct(order.product_id) : null;
          
          return {
            id: payment.id,
            reference: payment.reference,
            amount: payment.amount,
            currency: payment.currency,
            item: product?.title || 'Product Purchase',
            status: payment.status,
            paid_at: payment.paid_at,
            buyer_name: buyer?.full_name,
            buyer_email: buyer?.email,
            buyer_phone: buyer?.phone,
            buyer_whatsapp: buyer?.whatsapp,
            channel: payment.payment_method,
            created_at: payment.created_at,
            paystack_reference: payment.paystack_reference,
            gateway_response: payment.gateway_response,
            mobile_number: payment.mobile_number,
            network_provider: payment.network_provider
          };
        }));
      }

      res.json(transactions);
    } catch (error) {
      console.error('Error fetching vendor transactions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch transactions' 
      });
    }
  });

  app.get('/api/dashboard/vendor/payouts', authenticateToken, requireVendor, async (req, res) => {
    try {
      const user = req.user as any;
      const db = storage as any;
      let payouts = [];
      
      // Query the payouts table directly
      if (db.query) {
        try {
          const result = await db.query(`
            SELECT 
              p.id,
              p.amount,
              p.status,
              p.momo_number,
              p.transaction_id,
              p.created_at,
              p.updated_at,
              'GHS' as currency,
              p.transaction_id as reference
            FROM payouts p
            WHERE p.vendor_id = $1
            ORDER BY p.created_at DESC
            LIMIT 100
          `, [user.id]);
          
          payouts = result.rows || [];
          console.log(`Found ${payouts.length} payouts for vendor ${user.id}`);
        } catch (queryError) {
          console.log('Database query failed, falling back to storage methods:', queryError.message);
        }
      }
      
      // If direct query failed, fall back to storage methods
      if (payouts.length === 0) {
        console.log('Using storage methods for vendor payouts');
        payouts = await storage.getPayoutsByVendor(user.id);
      }
      
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching vendor payouts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch payouts' 
      });
    }
  });

  app.get('/api/dashboard/vendor/stats', authenticateToken, requireVendor, async (req, res) => {
    try {
      const user = req.user as any;
      const db = storage as any;
      let stats = {};
      
      // Try to get enhanced stats from Paystack sync tables
      if (db.query) {
        try {
          const result = await db.query(`
            SELECT 
              -- Payment stats from payments table
              COUNT(CASE WHEN p.status = 'success' THEN 1 END) as successful_transactions,
              COALESCE(SUM(CASE WHEN p.status = 'success' THEN p.amount END), 0) as total_sales,
              COUNT(p.id) as total_transactions,
              COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_transactions,
              
              -- Recent activity
              COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as transactions_last_30_days,
              COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as transactions_last_7_days,
              COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as transactions_today
              
            FROM payments p
            WHERE p.vendor_id = $1
          `, [user.id]);
          
          const payoutResult = await db.query(`
            SELECT 
              COUNT(*) as total_payouts,
              COALESCE(SUM(CASE WHEN po.status = 'success' THEN po.amount END), 0) as total_paid,
              COALESCE(SUM(CASE WHEN po.status = 'pending' THEN po.amount END), 0) as pending_amount,
              COUNT(CASE WHEN po.status = 'success' THEN 1 END) as successful_payouts,
              COUNT(CASE WHEN po.status = 'pending' THEN 1 END) as pending_payouts
            FROM payouts po
            WHERE po.vendor_id = $1
          `, [user.id]);
          
          const orderResult = await db.query(`
            SELECT 
              COUNT(*) as total_orders,
              COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
              COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders
            FROM orders o
            WHERE o.vendor_id = $1
          `, [user.id]);
          
          const transactionStats = result.rows[0] || {};
          const payoutStats = payoutResult.rows[0] || {};
          const orderStats = orderResult.rows[0] || {};
          
          stats = {
            total_orders: parseInt(orderStats.total_orders || 0),
            total_sales: parseFloat(transactionStats.total_sales || 0),
            successful_orders: parseInt(transactionStats.successful_transactions || 0),
            pending_orders: parseInt(transactionStats.pending_transactions || 0),
            completed_orders: parseInt(orderStats.completed_orders || 0),
            total_payouts: parseInt(payoutStats.total_payouts || 0),
            total_paid: parseFloat(payoutStats.total_paid || 0),
            pending_amount: parseFloat(payoutStats.pending_amount || 0),
            successful_payouts: parseInt(payoutStats.successful_payouts || 0),
            pending_payouts: parseInt(payoutStats.pending_payouts || 0),
            current_balance: parseFloat(transactionStats.total_sales || 0) - parseFloat(payoutStats.total_paid || 0),
            currency: 'GHS',
            transactions_last_30_days: parseInt(transactionStats.transactions_last_30_days || 0),
            transactions_last_7_days: parseInt(transactionStats.transactions_last_7_days || 0),
            transactions_today: parseInt(transactionStats.transactions_today || 0)
          };
          
          console.log(`Enhanced stats for vendor ${user.id}:`, stats);
        } catch (queryError) {
          console.log('Paystack stats tables not available, falling back to regular stats');
        }
      }
      
      // If no Paystack stats found, fall back to regular stats
      if (Object.keys(stats).length === 0) {
        console.log('Falling back to regular stats calculation');
        const payments = await storage.getPaymentsByVendor(user.id);
        const orders = await storage.getOrdersByVendor(user.id);
        const payouts = await storage.getPayoutsByVendor(user.id);
        
        stats = {
          total_orders: orders.length,
          total_sales: payments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0),
          successful_orders: payments.filter(p => p.status === 'success').length,
          pending_orders: payments.filter(p => p.status === 'pending').length,
          total_payouts: payouts.length,
          total_paid: payouts
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0),
          pending_amount: payouts
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0),
          current_balance: 0,
          currency: 'GHS'
        };
      }
      
      // Add product count (always available)
      const products = await storage.getProductsByVendor(user.id);
      stats.total_products = products.length;

      res.json(stats);
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch vendor stats' 
      });
    }
  });

  // Vendor payments endpoint
  app.get('/api/vendors/:vendorId/payments', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const user = req.user;
      
      // Check if user can access this vendor's payments
      if (user.role !== 'admin' && user.id !== vendorId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const payments = await storage.getPaymentsByVendor(vendorId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching vendor payments:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch vendor payments' 
      });
    }
  });

  // Vendor payouts endpoint
  app.get('/api/vendors/:vendorId/payouts', authenticateToken, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const user = req.user;
      
      // Check if user can access this vendor's payouts
      if (user.role !== 'admin' && user.id !== vendorId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const payouts = await storage.getPayoutsByVendor(vendorId);
      res.json(payouts);
    } catch (error) {
      console.error('Error fetching vendor payouts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch vendor payouts' 
      });
    }
  });

  // Paystack balance and settlements
  app.get('/api/paystack/balance', requireAdmin, async (req, res) => {
    try {
      const { paystackSync } = await import('./paystack-sync');
      const balance = await paystackSync.fetchBalance();
      res.json(balance);
    } catch (error) {
      console.error('Error fetching Paystack balance:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch balance' 
      });
    }
  });

  app.get('/api/paystack/settlements', requireAdmin, async (req, res) => {
    try {
      const { paystackSync } = await import('./paystack-sync');
      const settlements = await paystackSync.fetchSettlements();
      res.json(settlements);
    } catch (error) {
      console.error('Error fetching Paystack settlements:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch settlements' 
      });
    }
  });

  // Public vendors/businesses endpoint with real product counts
  app.get('/api/vendors', async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const allProducts = await storage.getProducts();
      
      // Filter for approved vendors only
      const vendors = allUsers.filter(u => u.role === 'vendor' && u.is_approved);
      
      // Add real product counts to each vendor
      const vendorsWithCounts = vendors.map(vendor => {
        const vendorProducts = allProducts.filter(p => p.vendor_id === vendor.id);
        return {
          ...vendor,
          products_count: vendorProducts.length,
          recent_products: vendorProducts.slice(0, 3), // Latest 3 products for preview
          // Remove sensitive data
          password: undefined,
          paystack_subaccount: undefined,
          momo_number: undefined
        };
      });
      
      res.json(vendorsWithCounts);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ message: 'Failed to get vendors' });
    }
  });

  // Mentors endpoint - public
  app.get('/api/mentors', async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      res.status(500).json({ message: 'Failed to get mentors' });
    }
  });

  // Programs endpoint - public
  app.get('/api/programs', async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ message: 'Failed to get programs' });
    }
  });

  // Platform statistics endpoint - public
  app.get('/api/platform/stats', async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const allProducts = await storage.getProducts();
      const allOrders = await storage.getOrders();
      // Get real counts from database - handle empty tables gracefully
      let allMentors = [];
      let allPrograms = [];
      
      try {
        allMentors = await storage.getMentors();
        allPrograms = await storage.getPrograms();
      } catch (error) {
        console.log('Mentors/Programs tables empty or not accessible');
      }
      
      const vendors = allUsers.filter(u => u.role === 'vendor');
      const activeBusinesses = vendors.filter(v => v.is_approved);
      const completedOrders = allOrders.filter(o => o.status === 'completed');
      
      // Get category breakdown with real counts from database
      const categoryStats = activeBusinesses.reduce((acc: any, vendor: any) => {
        const category = vendor.business_category || 'services';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        activeBusinesses: activeBusinesses.length,
        studentEntrepreneurs: vendors.length,
        totalProducts: allProducts.length,
        completedOrders: completedOrders.length,
        activeMentors: Array.isArray(allMentors) ? allMentors.filter(m => m.status === 'active').length : 0,
        successStories: completedOrders.length,
        categoryBreakdown: categoryStats,
        pendingApprovals: vendors.filter(v => !v.is_approved).length
      };

      res.json(stats);
    } catch (error) {
      console.error('Platform stats error:', error);
      res.status(500).json({ message: 'Failed to fetch platform statistics' });
    }
  });

  // Admin API endpoints with real data
  app.get('/api/admin/stats', authenticateAdminToken, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const allProducts = await storage.getProducts();
      const allOrders = await storage.getOrders();
      const allMentors = await storage.getMentors();
      const allPrograms = await storage.getPrograms();
      const allResources = await storage.getResources();
      
      const vendors = allUsers.filter(u => u.role === 'vendor');
      const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);
      
      const pendingApprovals = vendors.filter(v => !v.is_approved).length;
      const activePrograms = allPrograms.filter(p => p.status === 'active').length;
      const activeMentors = allMentors.filter(m => m.status === 'active').length;
      
      const stats = {
        totalUsers: allUsers.length,
        totalVendors: vendors.length,
        totalProducts: allProducts.length,
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue,
        pendingApprovals: pendingApprovals,
        activePrograms: activePrograms,
        totalMentors: activeMentors,
        totalResources: allResources.length,
        publishedResources: allResources.filter(r => r.status === 'published').length
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/admin/businesses', authenticateAdminToken, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const vendors = allUsers.filter(u => u.role === 'vendor');
      
      const businessesData = await Promise.all(
        vendors.map(async (vendor) => {
          const products = await storage.getProductsByVendor(vendor.id);
          const orders = await storage.getOrdersByVendor(vendor.id);
          const totalSales = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);
          
          return {
            id: vendor.id,
            business_name: vendor.business_name || vendor.full_name,
            full_name: vendor.full_name,
            email: vendor.email,
            is_approved: vendor.is_approved || false,
            created_at: vendor.created_at,
            total_products: products.length,
            total_sales: totalSales
          };
        })
      );
      
      res.json(businessesData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      res.status(500).json({ message: 'Failed to fetch businesses' });
    }
  });

  app.get('/api/admin/users', authenticateAdminToken, async (req, res) => {
    try {
      const allUsers = await storage.getUsers();
      const usersData = allUsers.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved || false,
        created_at: user.created_at
      }));
      
      res.json(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Admin endpoint to approve/reject vendors
  app.patch('/api/admin/vendors/:vendorId/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { approved } = req.body;
      
      if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: 'Invalid approval status' });
      }
      
      const updatedUser = await storage.updateUser(vendorId, { is_approved: approved });
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      res.status(500).json({ message: 'Failed to update vendor status' });
    }
  });

  // Admin CRUD endpoints for user management
  app.patch('/api/admin/users/:userId', authenticateAdminToken, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:userId', authenticateAdminToken, async (req, res) => {
    try {
      const { userId } = req.params;
      
      await storage.deleteUser(userId);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Admin CRUD endpoints for business management
  app.patch('/api/admin/businesses/:businessId/status', authenticateAdminToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const { approved } = req.body;
      
      if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: 'Invalid approval status' });
      }
      
      const updatedUser = await storage.updateUser(businessId, { is_approved: approved });
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating business status:', error);
      res.status(500).json({ message: 'Failed to update business status' });
    }
  });

  app.delete('/api/admin/businesses/:businessId', authenticateAdminToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      
      // Delete business (which is a vendor user)
      await storage.deleteUser(businessId);
      res.json({ message: 'Business deleted successfully' });
    } catch (error) {
      console.error('Error deleting business:', error);
      res.status(500).json({ message: 'Failed to delete business' });
    }
  });

  // Admin endpoint to get all products
  app.get('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const allProducts = await storage.getProducts();
      res.json(allProducts);
    } catch (error) {
      console.error('Error fetching all products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  // Admin endpoint to manage product visibility
  app.patch('/api/admin/products/:productId/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const { status } = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, { status });
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({ message: 'Failed to update product status' });
    }
  });

  // Admin endpoints for mentors with full CRUD
  app.get('/api/admin/mentors', authenticateAdminToken, async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      res.status(500).json({ message: 'Failed to fetch mentors' });
    }
  });

  app.post('/api/admin/mentors', authenticateAdminToken, async (req, res) => {
    try {
      const mentorData = { ...req.body };
      
      // Convert numeric fields
      if (mentorData.years_experience && typeof mentorData.years_experience === 'string') {
        mentorData.years_experience = parseInt(mentorData.years_experience);
      }
      if (mentorData.consultation_fee && typeof mentorData.consultation_fee === 'string') {
        mentorData.consultation_fee = parseFloat(mentorData.consultation_fee);
      }
      
      const mentor = await storage.createMentor(mentorData);
      res.json(mentor);
    } catch (error) {
      console.error('Error creating mentor:', error);
      res.status(500).json({ message: 'Failed to create mentor' });
    }
  });

  app.get('/api/admin/mentors/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const mentor = await storage.getMentor(id);
      if (!mentor) {
        return res.status(404).json({ message: 'Mentor not found' });
      }
      res.json(mentor);
    } catch (error) {
      console.error('Error fetching mentor:', error);
      res.status(500).json({ message: 'Failed to fetch mentor' });
    }
  });

  app.put('/api/admin/mentors/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // Convert numeric fields
      if (updates.years_experience && typeof updates.years_experience === 'string') {
        updates.years_experience = parseInt(updates.years_experience);
      }
      if (updates.consultation_fee && typeof updates.consultation_fee === 'string') {
        updates.consultation_fee = parseFloat(updates.consultation_fee);
      }
      
      const mentor = await storage.updateMentor(id, updates);
      res.json(mentor);
    } catch (error) {
      console.error('Error updating mentor:', error);
      res.status(500).json({ message: 'Failed to update mentor' });
    }
  });

  app.delete('/api/admin/mentors/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMentor(id);
      res.json({ message: 'Mentor deleted successfully' });
    } catch (error) {
      console.error('Error deleting mentor:', error);
      res.status(500).json({ message: 'Failed to delete mentor' });
    }
  });

  // Admin endpoints for programs with full CRUD
  app.get('/api/admin/programs', authenticateAdminToken, async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ message: 'Failed to fetch programs' });
    }
  });

  app.post('/api/admin/programs', authenticateAdminToken, async (req, res) => {
    try {
      const programData = { ...req.body };
      
      // Convert date strings to Date objects for timestamp fields
      if (programData.start_date && typeof programData.start_date === 'string') {
        programData.start_date = new Date(programData.start_date);
      }
      if (programData.end_date && typeof programData.end_date === 'string') {
        programData.end_date = new Date(programData.end_date);
      }
      
      // Convert numeric fields
      if (programData.max_participants && typeof programData.max_participants === 'string') {
        programData.max_participants = parseInt(programData.max_participants);
      }
      if (programData.program_fee && typeof programData.program_fee === 'string') {
        programData.program_fee = parseFloat(programData.program_fee);
      }
      
      // Handle empty string mentor_id (convert to null for UUID validation)
      if (programData.mentor_id === '') {
        programData.mentor_id = null;
      }
      
      const program = await storage.createProgram(programData);
      res.json(program);
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(500).json({ message: 'Failed to create program' });
    }
  });

  app.get('/api/admin/programs/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const program = await storage.getProgram(id);
      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }
      res.json(program);
    } catch (error) {
      console.error('Error fetching program:', error);
      res.status(500).json({ message: 'Failed to fetch program' });
    }
  });

  app.put('/api/admin/programs/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // Convert date strings to Date objects for timestamp fields
      if (updates.start_date && typeof updates.start_date === 'string') {
        updates.start_date = new Date(updates.start_date);
      }
      if (updates.end_date && typeof updates.end_date === 'string') {
        updates.end_date = new Date(updates.end_date);
      }
      
      // Handle empty string mentor_id (convert to null for UUID validation)
      if (updates.mentor_id === '') {
        updates.mentor_id = null;
      }
      
      // Convert numeric fields
      if (updates.max_participants && typeof updates.max_participants === 'string') {
        updates.max_participants = parseInt(updates.max_participants);
      }
      if (updates.program_fee && typeof updates.program_fee === 'string') {
        updates.program_fee = parseFloat(updates.program_fee);
      }
      
      const program = await storage.updateProgram(id, updates);
      res.json(program);
    } catch (error) {
      console.error('Error updating program:', error);
      res.status(500).json({ message: 'Failed to update program' });
    }
  });

  app.delete('/api/admin/programs/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProgram(id);
      res.json({ message: 'Program deleted successfully' });
    } catch (error) {
      console.error('Error deleting program:', error);
      res.status(500).json({ message: 'Failed to delete program' });
    }
  });

  // Public resource endpoints for students
  app.get('/api/resources', async (req, res) => {
    try {
      const resources = await storage.getResources();
      // Only return published resources for public access
      const publishedResources = resources.filter(r => r.status === 'published');
      res.json(publishedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  });

  app.get('/api/resources/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getResource(id);
      if (!resource || resource.status !== 'published') {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ message: 'Failed to fetch resource' });
    }
  });

  // Track resource view
  app.post('/api/resources/:id/view', async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getResource(id);
      if (!resource || resource.status !== 'published') {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      await storage.incrementResourceViews(id);
      res.json({ message: 'View tracked successfully' });
    } catch (error) {
      console.error('Error tracking resource view:', error);
      res.status(500).json({ message: 'Failed to track view' });
    }
  });

  // Track resource download
  app.post('/api/resources/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      const { fileUrl } = req.body;
      const resource = await storage.getResource(id);
      if (!resource || resource.status !== 'published') {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      await storage.incrementResourceDownloads(id);
      res.json({ message: 'Download tracked successfully' });
    } catch (error) {
      console.error('Error tracking resource download:', error);
      res.status(500).json({ message: 'Failed to track download' });
    }
  });



  // Admin endpoints for resources with full CRUD
  app.get('/api/admin/resources', authenticateAdminToken, async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ message: 'Failed to fetch resources' });
    }
  });

  // Resource file upload endpoint
  app.post('/api/admin/resources/upload', authenticateAdminToken, resourceUpload.array('files', 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const uploadedFiles = [];
      
      for (const file of req.files) {
        // Save file to local storage
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `resource-${uniqueSuffix}${path.extname(file.originalname)}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        
        const fileUrl = `/uploads/${fileName}`;
        const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        uploadedFiles.push({
          name: file.originalname,
          url: fileUrl,
          type: file.mimetype,
          size: fileSize
        });
      }

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error('Error uploading resource files:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  });

  app.post('/api/admin/resources', authenticateAdminToken, async (req, res) => {
    try {
      const resourceData = { ...req.body };
      
      // Convert numeric fields if they're strings
      if (resourceData.views && typeof resourceData.views === 'string') {
        resourceData.views = parseInt(resourceData.views) || 0;
      }
      if (resourceData.downloads && typeof resourceData.downloads === 'string') {
        resourceData.downloads = parseInt(resourceData.downloads) || 0;
      }
      
      // Parse tags if it's a string
      if (resourceData.tags && typeof resourceData.tags === 'string') {
        resourceData.tags = resourceData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      
      // Set default values for new fields
      resourceData.views = resourceData.views || 0;
      resourceData.downloads = resourceData.downloads || 0;
      resourceData.files = resourceData.files || [];
      resourceData.external_links = resourceData.external_links || [];
      
      const resource = await storage.createResource(resourceData);
      res.json(resource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ message: 'Failed to create resource' });
    }
  });

  app.get('/api/admin/resources/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ message: 'Failed to fetch resource' });
    }
  });

  app.put('/api/admin/resources/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const resource = await storage.updateResource(id, updates);
      res.json(resource);
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(500).json({ message: 'Failed to update resource' });
    }
  });

  app.delete('/api/admin/resources/:id', authenticateAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteResource(id);
      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ message: 'Failed to delete resource' });
    }
  });

  // Admin authentication routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Username and password are required' 
        });
      }

      // Find admin user by username
      const adminUser = await storage.getAdminUserByUsername(username);
      
      if (!adminUser) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Check if admin is active
      if (!adminUser.is_active) {
        return res.status(401).json({ 
          error: 'Admin account is inactive' 
        });
      }

      // Compare plain text password (as requested)
      if (adminUser.password !== password) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Generate JWT token for admin session
      const token = jwt.sign(
        { 
          id: adminUser.id, 
          username: adminUser.username,
          type: 'admin'
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          full_name: adminUser.full_name,
          email: adminUser.email,
          is_active: adminUser.is_active
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  });



  // Admin profile route
  app.get('/api/admin/profile', authenticateAdminToken, async (req, res) => {
    try {
      const adminUser = req.adminUser;
      res.json({
        id: adminUser.id,
        username: adminUser.username,
        full_name: adminUser.full_name,
        email: adminUser.email,
        is_active: adminUser.is_active,
        created_at: adminUser.created_at
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({ message: 'Failed to fetch admin profile' });
    }
  });

  // Update admin profile
  app.put('/api/admin/profile', authenticateAdminToken, async (req, res) => {
    try {
      if (!req.adminUser) {
        return res.status(401).json({ message: 'Admin authentication required' });
      }

      const { username, email, full_name, phone, bio } = req.body;
      
      const updatedProfile = await storage.updateAdminUser(req.adminUser.id, {
        username,
        email,
        full_name,
        phone,
        bio
      });

      res.json({
        id: updatedProfile.id,
        username: updatedProfile.username,
        full_name: updatedProfile.full_name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        bio: updatedProfile.bio,
        is_active: updatedProfile.is_active,
        created_at: updatedProfile.created_at
      });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({ message: 'Failed to update admin profile' });
    }
  });

  // Admin logout route
  app.post('/api/admin/logout', authenticateAdminToken, async (req, res) => {
    try {
      // Since we're using stateless JWT, logout is handled on client side
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ message: 'Logout error' });
    }
  });

  // ================================
  // COMMUNITY DISCUSSION ROUTES
  // ================================
  
  // Get all discussions
  app.get('/api/discussions', async (req, res) => {
    try {
      const { category, search } = req.query;
      let discussions;
      
      if (category && category !== 'all') {
        discussions = await storage.getDiscussionsByCategory(category as string);
      } else {
        discussions = await storage.getDiscussions();
      }
      
      // Filter by search term if provided
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        discussions = discussions.filter(d => 
          d.title.toLowerCase().includes(searchTerm) ||
          d.content.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      res.status(500).json({ message: 'Failed to get discussions' });
    }
  });

  // Get single discussion
  app.get('/api/discussions/:id', async (req, res) => {
    try {
      const discussion = await storage.getDiscussion(req.params.id);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }
      
      // Increment view count
      await storage.incrementDiscussionViews(req.params.id);
      
      res.json(discussion);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      res.status(500).json({ message: 'Failed to get discussion' });
    }
  });

  // Create new discussion
  app.post('/api/discussions', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const discussionData = {
        ...req.body,
        author_id: req.user.id
      };

      const discussion = await storage.createDiscussion(discussionData);
      res.status(201).json(discussion);
    } catch (error) {
      console.error('Error creating discussion:', error);
      res.status(500).json({ message: 'Failed to create discussion' });
    }
  });

  // Update discussion - regular users
  app.put('/api/discussions/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const discussion = await storage.getDiscussion(req.params.id);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Only author can update their own discussion
      if (discussion.author_id !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own discussions' });
      }

      const updatedDiscussion = await storage.updateDiscussion(req.params.id, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      console.error('Error updating discussion:', error);
      res.status(500).json({ message: 'Failed to update discussion' });
    }
  });



  // Delete discussion - regular users
  app.delete('/api/discussions/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const discussion = await storage.getDiscussion(req.params.id);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Only author can delete their own discussion
      if (discussion.author_id !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own discussions' });
      }

      await storage.deleteDiscussion(req.params.id);
      res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
      console.error('Error deleting discussion:', error);
      res.status(500).json({ message: 'Failed to delete discussion' });
    }
  });



  // Increment view count for discussion
  app.post('/api/discussions/:id/view', async (req, res) => {
    try {
      await storage.incrementDiscussionViews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error incrementing view count:', error);
      res.status(500).json({ message: 'Failed to increment view count' });
    }
  });

  // Get comments for a discussion
  app.get('/api/discussions/:id/comments', async (req, res) => {
    try {
      const comments = await storage.getCommentsByDiscussion(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Failed to get comments' });
    }
  });

  // Create comment for specific discussion - regular users
  app.post('/api/discussions/:id/comments', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const commentData = {
        ...req.body,
        discussion_id: req.params.id,
        author_id: req.user.id
      };

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  // Create comment for specific discussion - admin users
  app.post('/api/admin/discussions/:id/comments', authenticateAdminToken, async (req, res) => {
    try {
      if (!req.adminUser) {
        return res.status(401).json({ message: 'Admin authentication required' });
      }

      const commentData = {
        ...req.body,
        discussion_id: req.params.id,
        author_id: req.adminUser.id
      };

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating admin comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  // Create comment
  app.post('/api/comments', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const commentData = {
        ...req.body,
        author_id: req.user.id
      };

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  // Update comment
  app.put('/api/comments/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Only author or admin can update
      if (comment.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const updatedComment = await storage.updateComment(req.params.id, req.body);
      res.json(updatedComment);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ message: 'Failed to update comment' });
    }
  });

  // Delete comment
  app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Only author or admin can delete
      if (comment.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await storage.deleteComment(req.params.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  });

  // Toggle like (for discussions and comments)
  app.post('/api/likes/toggle', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { target_id, type } = req.body;
      
      if (!target_id || !type || !['discussion', 'comment'].includes(type)) {
        return res.status(400).json({ message: 'Invalid target_id or type' });
      }

      const result = await storage.toggleLike(req.user.id, target_id, type);
      res.json(result);
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ message: 'Failed to toggle like' });
    }
  });

  // Get user's likes
  app.get('/api/users/:id/likes', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Users can only see their own likes unless admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const likes = await storage.getUserLikes(req.params.id);
      res.json(likes);
    } catch (error) {
      console.error('Error fetching user likes:', error);
      res.status(500).json({ message: 'Failed to get user likes' });
    }
  });

  // Get community stats
  app.get('/api/community/stats', async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching community stats:', error);
      res.status(500).json({ message: 'Failed to get community stats' });
    }
  });

  // ================================
  // ADMIN COMMUNITY MANAGEMENT ROUTES
  // ================================

  // Admin: Get all discussions (including hidden/deleted)
  app.get('/api/admin/discussions', authenticateAdminToken, async (req, res) => {
    try {
      const discussions = await storage.getDiscussions();
      res.json(discussions);
    } catch (error) {
      console.error('Error fetching admin discussions:', error);
      res.status(500).json({ message: 'Failed to get discussions' });
    }
  });

  // Admin: Create discussion
  app.post('/api/admin/discussions', authenticateAdminToken, async (req, res) => {
    try {
      // Get or create system admin user in users table for discussions
      let systemAdminUser;
      try {
        // Try to find existing system admin user
        const allUsers = await storage.getUsers();
        systemAdminUser = allUsers.find(u => u.email === 'admin@ktu.edu.gh' && u.role === 'admin');
        
        if (!systemAdminUser) {
          // Create system admin user for discussions
          const newSystemAdmin = {
            full_name: 'KTU BizConnect Admin',
            email: 'admin@ktu.edu.gh',
            password: 'system_admin_placeholder', // Not used for login
            role: 'admin' as const,
            is_approved: true,
            store_name: 'KTU BizConnect Administration',
            phone: '0000000000',
            whatsapp: '0000000000'
          };
          
          systemAdminUser = await storage.createUser(newSystemAdmin);
        }
      } catch (error) {
        console.error('Error handling system admin user:', error);
        throw new Error('Failed to setup system admin user');
      }

      const discussionData = {
        ...req.body,
        author_id: systemAdminUser.id // Use system admin user ID from users table
      };

      const discussion = await storage.createDiscussion(discussionData);
      res.status(201).json(discussion);
    } catch (error) {
      console.error('Error creating admin discussion:', error);
      res.status(500).json({ message: 'Failed to create discussion' });
    }
  });

  // Admin: Update any discussion
  app.put('/api/admin/discussions/:id', authenticateAdminToken, async (req, res) => {
    try {
      const updatedDiscussion = await storage.updateDiscussion(req.params.id, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      console.error('Error updating admin discussion:', error);
      res.status(500).json({ message: 'Failed to update discussion' });
    }
  });

  // Admin: Delete any discussion
  app.delete('/api/admin/discussions/:id', authenticateAdminToken, async (req, res) => {
    try {
      await storage.deleteDiscussion(req.params.id);
      res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin discussion:', error);
      res.status(500).json({ message: 'Failed to delete discussion' });
    }
  });

  // Admin: Get all comments
  app.get('/api/admin/comments', authenticateAdminToken, async (req, res) => {
    try {
      const { discussion_id } = req.query;
      let comments;
      
      if (discussion_id) {
        comments = await storage.getCommentsByDiscussion(discussion_id as string);
      } else {
        // Get all comments - we'll need to implement this method
        comments = [];
      }
      
      res.json(comments);
    } catch (error) {
      console.error('Error fetching admin comments:', error);
      res.status(500).json({ message: 'Failed to get comments' });
    }
  });

  // Admin: Update any comment
  app.put('/api/admin/comments/:id', authenticateAdminToken, async (req, res) => {
    try {
      const updatedComment = await storage.updateComment(req.params.id, req.body);
      res.json(updatedComment);
    } catch (error) {
      console.error('Error updating admin comment:', error);
      res.status(500).json({ message: 'Failed to update comment' });
    }
  });

  // Admin: Delete any comment
  app.delete('/api/admin/comments/:id', authenticateAdminToken, async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  });

  // Business Rating API Routes
  app.get('/api/businesses/:businessId/ratings', async (req, res) => {
    try {
      const { businessId } = req.params;
      const ratings = await storage.getBusinessRatings(businessId);
      res.json(ratings);
    } catch (error) {
      console.error('Error fetching business ratings:', error);
      res.status(500).json({ message: 'Failed to fetch business ratings' });
    }
  });

  app.get('/api/businesses/:businessId/rating-stats', async (req, res) => {
    try {
      const { businessId } = req.params;
      const stats = await storage.getBusinessRatingStats(businessId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching business rating stats:', error);
      res.status(500).json({ message: 'Failed to fetch business rating stats' });
    }
  });

  app.get('/api/businesses/:businessId/user-rating', authenticateToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const user = req.user as any;
      const rating = await storage.getBusinessRating(user.id, businessId);
      res.json(rating || null);
    } catch (error) {
      console.error('Error fetching user business rating:', error);
      res.status(500).json({ message: 'Failed to fetch user business rating' });
    }
  });

  app.post('/api/businesses/:businessId/rate', authenticateToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const { rating } = req.body;
      const user = req.user as any;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Check if user already has a rating for this business
      const existingRating = await storage.getBusinessRating(user.id, businessId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateBusinessRating(existingRating.id, { rating });
        res.json(updatedRating);
      } else {
        // Create new rating
        const newRating = await storage.createBusinessRating({
          user_id: user.id,
          business_id: businessId,
          rating
        });
        res.json(newRating);
      }
    } catch (error) {
      console.error('Error rating business:', error);
      res.status(500).json({ message: 'Failed to rate business' });
    }
  });

  app.delete('/api/businesses/:businessId/rating', authenticateToken, async (req, res) => {
    try {
      const { businessId } = req.params;
      const user = req.user as any;

      const existingRating = await storage.getBusinessRating(user.id, businessId);
      
      if (!existingRating) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      await storage.deleteBusinessRating(existingRating.id);
      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting business rating:', error);
      res.status(500).json({ message: 'Failed to delete business rating' });
    }
  });

  // Product Rating API Routes
  app.get('/api/products/:productId/ratings', async (req, res) => {
    try {
      const { productId } = req.params;
      const ratings = await storage.getProductRatings(productId);
      res.json(ratings);
    } catch (error) {
      console.error('Error fetching product ratings:', error);
      res.status(500).json({ message: 'Failed to fetch product ratings' });
    }
  });

  app.get('/api/products/:productId/rating-stats', async (req, res) => {
    try {
      const { productId } = req.params;
      const stats = await storage.getProductRatingStats(productId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching product rating stats:', error);
      res.status(500).json({ message: 'Failed to fetch product rating stats' });
    }
  });

  app.get('/api/products/:productId/user-rating', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const user = req.user as any;
      const rating = await storage.getProductRating(user.id, productId);
      res.json(rating || null);
    } catch (error) {
      console.error('Error fetching user product rating:', error);
      res.status(500).json({ message: 'Failed to fetch user product rating' });
    }
  });

  app.post('/api/products/:productId/rate', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating } = req.body;
      const user = req.user as any;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Check if user already has a rating for this product
      const existingRating = await storage.getProductRating(user.id, productId);
      
      if (existingRating) {
        // Update existing rating
        const updatedRating = await storage.updateProductRating(existingRating.id, { rating });
        res.json(updatedRating);
      } else {
        // Create new rating
        const newRating = await storage.createProductRating({
          user_id: user.id,
          product_id: productId,
          rating
        });
        res.json(newRating);
      }
    } catch (error) {
      console.error('Error rating product:', error);
      res.status(500).json({ message: 'Failed to rate product' });
    }
  });

  app.delete('/api/products/:productId/rating', authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const user = req.user as any;

      const existingRating = await storage.getProductRating(user.id, productId);
      
      if (!existingRating) {
        return res.status(404).json({ message: 'Rating not found' });
      }

      await storage.deleteProductRating(existingRating.id);
      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting product rating:', error);
      res.status(500).json({ message: 'Failed to delete product rating' });
    }
  });

  // Quick Sale / Auction routes
  app.get('/api/quick-sales', async (req, res) => {
    try {
      const { status } = req.query;
      const sales = await storage.getQuickSales(status as any);
      
      const salesWithDetails = await Promise.all(
        sales.map(async (sale) => {
          const products = await storage.getQuickSaleProducts(sale.id);
          const bids = await storage.getQuickSaleBids(sale.id);
          const highestBid = bids[0];
          
          return {
            ...sale,
            productsCount: products.length,
            bidsCount: bids.length,
            highestBid: highestBid ? Number(highestBid.bid_amount) : null
          };
        })
      );
      
      res.json(salesWithDetails);
    } catch (error) {
      console.error('Error getting quick sales:', error);
      res.status(500).json({ message: 'Failed to get quick sales' });
    }
  });

  app.get('/api/quick-sales/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await storage.getQuickSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: 'Quick sale not found' });
      }
      
      const products = await storage.getQuickSaleProducts(id);
      const bids = await storage.getQuickSaleBids(id);
      
      res.json({
        ...sale,
        products,
        bids
      });
    } catch (error) {
      console.error('Error getting quick sale:', error);
      res.status(500).json({ message: 'Failed to get quick sale' });
    }
  });

  app.post('/api/quick-sales', upload.array('productImages', 20), async (req, res) => {
    try {
      const { title, description, seller_name, seller_contact, seller_email, ends_at, products: productsJson, reserve_price } = req.body;
      
      const products = JSON.parse(productsJson || '[]');
      
      if (products.length === 0) {
        return res.status(400).json({ message: 'At least one product is required' });
      }
      
      if (products.length > 20) {
        return res.status(400).json({ message: 'Maximum 20 products allowed per quick sale' });
      }
      
      const quickSaleData = {
        title,
        description,
        seller_name,
        seller_contact,
        seller_email: seller_email || null,
        starts_at: new Date(),
        ends_at: new Date(ends_at),
        status: 'active' as const,
        reserve_price: reserve_price || null
      };
      
      const validatedQuickSale = insertQuickSaleSchema.parse(quickSaleData);
      
      const sale = await storage.createQuickSale(validatedQuickSale, products);
      
      res.status(201).json(sale);
    } catch (error: any) {
      console.error('Error creating quick sale:', error);
      res.status(400).json({ message: error.message || 'Failed to create quick sale' });
    }
  });

  app.post('/api/quick-sales/:id/bids', async (req, res) => {
    try {
      const { id } = req.params;
      const { bidder_name, bid_amount, contact_number } = req.body;
      
      const sale = await storage.getQuickSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: 'Quick sale not found' });
      }
      
      if (sale.status !== 'active') {
        return res.status(400).json({ message: 'This quick sale is not active' });
      }
      
      if (new Date(sale.ends_at) < new Date()) {
        return res.status(400).json({ message: 'This quick sale has ended' });
      }
      
      const highestBid = await storage.getHighestBid(id);
      const bidAmountNum = Number(bid_amount);
      
      if (highestBid && bidAmountNum <= Number(highestBid.bid_amount)) {
        return res.status(400).json({ 
          message: `Bid must be higher than current highest bid of GH₵${highestBid.bid_amount}` 
        });
      }
      
      const bidData = {
        quick_sale_id: id,
        bidder_name,
        bid_amount: bid_amount.toString(),
        contact_number
      };
      
      const validatedBid = insertQuickSaleBidSchema.parse(bidData);
      const bid = await storage.createQuickSaleBid(validatedBid);
      
      res.status(201).json(bid);
    } catch (error: any) {
      console.error('Error placing bid:', error);
      res.status(400).json({ message: error.message || 'Failed to place bid' });
    }
  });

  app.post('/api/quick-sales/:id/finalize', async (req, res) => {
    try {
      const { id } = req.params;
      
      const sale = await storage.getQuickSale(id);
      
      if (!sale) {
        return res.status(404).json({ message: 'Quick sale not found' });
      }
      
      if (sale.status === 'ended') {
        return res.status(400).json({ message: 'Quick sale already finalized' });
      }
      
      const finalizedSale = await storage.finalizeQuickSale(id);
      res.json(finalizedSale);
    } catch (error) {
      console.error('Error finalizing quick sale:', error);
      res.status(500).json({ message: 'Failed to finalize quick sale' });
    }
  });

  return httpServer;
}
