import { storage } from './storage';
import bcrypt from 'bcrypt';

// Sample data for testing
const sampleUsers = [
  {
    email: 'john@example.com',
    password: 'password123',
    full_name: 'John Doe',
    role: 'vendor' as const,
    business_name: 'Tech Store Ghana',
    business_description: 'Premium electronics and gadgets for modern living',
    phone: '+233241234567',
    address: '123 Oxford Street, Accra',
    momo_number: '0241234567',
    is_approved: true
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    full_name: 'Jane Smith',
    role: 'vendor' as const,
    business_name: 'Fashion Hub',
    business_description: 'Trendy clothing and accessories for all occasions',
    phone: '+233241234568',
    address: '456 Ring Road, Kumasi',
    momo_number: '0241234568',
    is_approved: true
  },
  {
    email: 'sarah@example.com',
    password: 'password123',
    full_name: 'Sarah Wilson',
    role: 'vendor' as const,
    business_name: 'Home & Garden',
    business_description: 'Quality home decor and garden supplies',
    phone: '+233241234569',
    address: '789 Liberation Road, Tamale',
    momo_number: '0241234569',
    is_approved: true
  },
  {
    email: 'buyer@example.com',
    password: 'password123',
    full_name: 'Alex Johnson',
    role: 'buyer' as const,
    phone: '+233241234570',
    address: '321 Castle Road, Cape Coast'
  }
];

const sampleProducts = [
  // Tech Store Ghana products
  {
    title: 'iPhone 15 Pro',
    description: 'Latest Apple iPhone with advanced camera system, A17 Pro chip, and titanium design. Perfect for professionals and content creators.',
    price: '5999.99',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    stock_quantity: 10,
    vendor_id: ''
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen, 200MP camera, and AI-powered features for ultimate productivity.',
    price: '4999.99',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    stock_quantity: 15,
    vendor_id: ''
  },
  {
    title: 'MacBook Pro 14-inch',
    description: 'Powerful laptop with M3 chip, Liquid Retina XDR display, and up to 22 hours of battery life.',
    price: '8999.99',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400',
    stock_quantity: 8,
    vendor_id: ''
  },
  {
    title: 'AirPods Pro 2',
    description: 'Advanced noise cancellation, spatial audio, and adaptive transparency for immersive listening experience.',
    price: '899.99',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400',
    stock_quantity: 25,
    vendor_id: ''
  },
  
  // Fashion Hub products
  {
    title: 'Designer Evening Dress',
    description: 'Elegant silk evening dress with intricate beadwork, perfect for special occasions and formal events.',
    price: '299.99',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
    stock_quantity: 5,
    vendor_id: ''
  },
  {
    title: 'Premium Leather Handbag',
    description: 'Handcrafted genuine leather handbag with multiple compartments and adjustable strap.',
    price: '199.99',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    stock_quantity: 12,
    vendor_id: ''
  },
  {
    title: 'Nike Air Max Sneakers',
    description: 'Comfortable running shoes with Air Max cushioning technology for daily wear and sports.',
    price: '179.99',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    stock_quantity: 20,
    vendor_id: ''
  },
  {
    title: 'Casual Denim Jacket',
    description: 'Classic denim jacket with modern fit, perfect for layering and casual outfits.',
    price: '89.99',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',
    stock_quantity: 18,
    vendor_id: ''
  },
  
  // Home & Garden products
  {
    title: 'Modern Coffee Table',
    description: 'Sleek glass-top coffee table with wooden legs, perfect for contemporary living rooms.',
    price: '249.99',
    category: 'Home & Garden',
    image_url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400',
    stock_quantity: 6,
    vendor_id: ''
  },
  {
    title: 'Indoor Plant Collection',
    description: 'Set of 3 low-maintenance indoor plants including snake plant, pothos, and peace lily.',
    price: '79.99',
    category: 'Home & Garden',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock_quantity: 15,
    vendor_id: ''
  },
  {
    title: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with touch controls, multiple brightness levels, and USB charging port.',
    price: '59.99',
    category: 'Home & Garden',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    stock_quantity: 22,
    vendor_id: ''
  },
  {
    title: 'Organic Herb Garden Kit',
    description: 'Complete kit for growing fresh herbs at home, includes seeds, pots, and growing medium.',
    price: '39.99',
    category: 'Home & Garden',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    stock_quantity: 30,
    vendor_id: ''
  }
];

export async function setupSupabaseData() {
  try {
    console.log('Setting up Supabase data...');
    
    // First, check if we already have data
    const existingProducts = await storage.getProducts();
    console.log('Existing products count:', existingProducts.length);
    
    // Skip check for now to force data creation
    // if (existingProducts.length > 0) {
    //   console.log('Data already exists in Supabase');
    //   return;
    // }
    
    // Create sample users
    const createdUsers = [];
    for (const user of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(user.email);
        if (existingUser) {
          console.log(`User ${user.email} already exists`);
          createdUsers.push(existingUser);
        } else {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          const createdUser = await storage.createUser({
            ...user,
            password: hashedPassword
          });
          createdUsers.push(createdUser);
          console.log(`Created user: ${createdUser.full_name}`);
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
    
    // Get vendors for products
    const vendors = await storage.getVendors();
    if (vendors.length === 0) {
      console.log('No vendors found');
      return;
    }
    
    // Create sample products
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = sampleProducts[i];
      product.vendor_id = vendors[i % vendors.length].id;
      
      try {
        const createdProduct = await storage.createProduct(product);
        console.log(`Created product: ${createdProduct.title}`);
      } catch (error) {
        console.error(`Error creating product ${product.title}:`, error);
      }
    }
    
    console.log('Supabase data setup completed!');
  } catch (error) {
    console.error('Error setting up Supabase data:', error);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSupabaseData();
}