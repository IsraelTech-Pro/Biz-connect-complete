import { storage } from "./storage";

// Comprehensive product data for all 11 categories (110 products total)
const comprehensiveProducts = [
  // Fashion and Apparel (10 products)
  {
    title: 'Men\'s Classic Denim Jeans',
    description: 'Comfortable straight-fit denim jeans for everyday wear',
    price: 89.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Levi\'s'
  },
  {
    title: 'Women\'s Elegant Evening Dress',
    description: 'Stunning black evening dress perfect for special occasions',
    price: 149.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Zara'
  },
  {
    title: 'Nike Air Force 1 Sneakers',
    description: 'Classic white leather sneakers with iconic Nike design',
    price: 129.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    stock_quantity: 75,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Nike'
  },
  {
    title: 'Luxury Leather Handbag',
    description: 'Premium leather handbag with gold hardware and spacious interior',
    price: 299.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Michael Kors'
  },
  {
    title: 'Men\'s Casual Cotton T-Shirt',
    description: 'Soft cotton t-shirt in various colors, perfect for casual wear',
    price: 24.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    stock_quantity: 100,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'H&M'
  },
  {
    title: 'Women\'s High-Waisted Yoga Pants',
    description: 'Stretchy and breathable yoga pants for active lifestyle',
    price: 59.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1506629905645-b178e0a54aae?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Lululemon'
  },
  {
    title: 'Classic Leather Watch',
    description: 'Elegant leather strap watch with minimalist design',
    price: 189.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd2f23?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Daniel Wellington'
  },
  {
    title: 'Children\'s Cartoon Hoodie',
    description: 'Cute cartoon-themed hoodie for kids, soft and comfortable',
    price: 39.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Disney'
  },
  {
    title: 'Silk Scarf Collection',
    description: 'Luxurious silk scarf with beautiful patterns and colors',
    price: 79.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Hermès'
  },
  {
    title: 'Winter Wool Coat',
    description: 'Warm and stylish wool coat for cold weather protection',
    price: 249.99,
    category: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Zara'
  },

  // Electronics (10 products)
  {
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Latest flagship smartphone with advanced AI features',
    price: 1399.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Samsung'
  },
  {
    title: 'MacBook Pro 16-inch M3',
    description: 'Powerful laptop for professionals with M3 chip',
    price: 2999.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    stock_quantity: 15,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Apple'
  },
  {
    title: 'Sony 65" 4K OLED TV',
    description: 'Premium OLED television with stunning picture quality',
    price: 1899.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Sony'
  },
  {
    title: 'AirPods Pro 2nd Generation',
    description: 'Wireless earbuds with active noise cancellation',
    price: 249.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Apple'
  },
  {
    title: 'Canon EOS R5 Camera',
    description: 'Professional mirrorless camera for photography enthusiasts',
    price: 3899.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
    stock_quantity: 12,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Canon'
  },
  {
    title: 'PlayStation 5 Console',
    description: 'Next-generation gaming console with lightning-fast loading',
    price: 499.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Sony'
  },
  {
    title: 'Bose QuietComfort 45 Headphones',
    description: 'Premium noise-cancelling over-ear headphones',
    price: 329.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Bose'
  },
  {
    title: 'iPad Pro 12.9" M2',
    description: 'Professional tablet with M2 chip and Apple Pencil support',
    price: 1099.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Apple'
  },
  {
    title: 'Nintendo Switch OLED',
    description: 'Hybrid gaming console with vibrant OLED screen',
    price: 349.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Nintendo'
  },
  {
    title: 'Dyson V15 Cordless Vacuum',
    description: 'Advanced cordless vacuum with laser dust detection',
    price: 749.99,
    category: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Dyson'
  },

  // Beauty and Personal Care (10 products)
  {
    title: 'Fenty Beauty Foundation',
    description: 'Full-coverage foundation with 50 inclusive shades',
    price: 38.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Fenty Beauty'
  },
  {
    title: 'The Ordinary Niacinamide Serum',
    description: 'Pore-minimizing serum with 10% niacinamide',
    price: 6.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    stock_quantity: 100,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'The Ordinary'
  },
  {
    title: 'Olaplex Hair Treatment',
    description: 'Professional hair treatment for damaged and chemically treated hair',
    price: 28.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Olaplex'
  },
  {
    title: 'Chanel No. 5 Perfume',
    description: 'Iconic luxury fragrance with timeless elegance',
    price: 149.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Chanel'
  },
  {
    title: 'Electric Facial Cleansing Brush',
    description: 'Gentle rotating brush for deep pore cleansing',
    price: 89.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Clarisonic'
  },
  {
    title: 'Rare Beauty Liquid Blush',
    description: 'Lightweight liquid blush with buildable coverage',
    price: 24.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    stock_quantity: 70,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Rare Beauty'
  },
  {
    title: 'Clinique Dramatically Different Moisturizer',
    description: 'Dermatologist-developed moisturizer for all skin types',
    price: 32.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    stock_quantity: 55,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Clinique'
  },
  {
    title: 'Urban Decay Eyeshadow Palette',
    description: 'Highly pigmented eyeshadow palette with 12 shades',
    price: 54.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Urban Decay'
  },
  {
    title: 'Neutrogena Hydrating Cleanser',
    description: 'Gentle hydrating cleanser for sensitive skin',
    price: 8.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Neutrogena'
  },
  {
    title: 'Maybelline Sky High Mascara',
    description: 'Volumizing mascara with flexible brush for long lashes',
    price: 12.99,
    category: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    stock_quantity: 90,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Maybelline'
  },

  // Home and Kitchen (10 products)
  {
    title: 'KitchenAid Stand Mixer',
    description: 'Professional stand mixer for baking and cooking',
    price: 399.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'KitchenAid'
  },
  {
    title: 'Instant Pot Duo Pressure Cooker',
    description: 'Multi-functional electric pressure cooker',
    price: 79.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Instant Pot'
  },
  {
    title: 'Ikea Malm Bed Frame',
    description: 'Modern bed frame with clean lines and storage options',
    price: 199.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'IKEA'
  },
  {
    title: 'Nespresso Coffee Machine',
    description: 'Premium espresso machine with milk frother',
    price: 249.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Nespresso'
  },
  {
    title: 'Le Creuset Dutch Oven',
    description: 'Cast iron Dutch oven perfect for braising and roasting',
    price: 329.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    stock_quantity: 15,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Le Creuset'
  },
  {
    title: 'Philips Hue Smart Lighting',
    description: 'Smart LED bulbs with app control and voice activation',
    price: 49.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Philips'
  },
  {
    title: 'Tempur-Pedic Memory Foam Pillow',
    description: 'Ergonomic memory foam pillow for better sleep',
    price: 129.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Tempur-Pedic'
  },
  {
    title: 'Vitamix High-Speed Blender',
    description: 'Professional blender for smoothies and food processing',
    price: 449.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    stock_quantity: 18,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Vitamix'
  },
  {
    title: 'West Elm Mid-Century Sofa',
    description: 'Modern mid-century style sofa with velvet upholstery',
    price: 1299.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    stock_quantity: 8,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'West Elm'
  },
  {
    title: 'Shark Robot Vacuum',
    description: 'Self-emptying robot vacuum with smart mapping',
    price: 399.99,
    category: 'home',
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Shark'
  },

  // Food and Beverages (10 products)
  {
    title: 'Organic Avocado Box',
    description: 'Fresh organic avocados, perfectly ripe and ready to eat',
    price: 24.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Organic Farms'
  },
  {
    title: 'Artisan Coffee Beans',
    description: 'Single-origin coffee beans roasted to perfection',
    price: 18.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    stock_quantity: 75,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Blue Mountain Coffee'
  },
  {
    title: 'Ghanaian Jollof Rice Kit',
    description: 'Complete meal kit with authentic Ghanaian spices',
    price: 12.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Mama Afrika'
  },
  {
    title: 'Manuka Honey',
    description: 'Premium New Zealand Manuka honey with health benefits',
    price: 49.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Comvita'
  },
  {
    title: 'Craft Beer Variety Pack',
    description: 'Selection of 12 craft beers from local breweries',
    price: 39.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Local Breweries'
  },
  {
    title: 'Organic Quinoa Salad Mix',
    description: 'Healthy quinoa salad with organic vegetables',
    price: 14.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Healthy Choice'
  },
  {
    title: 'Imported Italian Pasta',
    description: 'Authentic Italian pasta made with durum wheat',
    price: 8.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1551892374-ecf8845ffa8a?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Barilla'
  },
  {
    title: 'Exotic Fruit Basket',
    description: 'Collection of tropical and exotic fruits',
    price: 34.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Tropical Fruits'
  },
  {
    title: 'Artisan Chocolate Box',
    description: 'Handcrafted chocolates with premium ingredients',
    price: 29.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Godiva'
  },
  {
    title: 'Green Tea Collection',
    description: 'Premium green tea varieties from around the world',
    price: 19.99,
    category: 'food',
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
    stock_quantity: 55,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Twinings'
  },

  // Toys and Hobbies (10 products)
  {
    title: 'LEGO Creator Expert Set',
    description: 'Advanced LEGO building set for adult collectors',
    price: 199.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'LEGO'
  },
  {
    title: 'Monopoly Board Game',
    description: 'Classic family board game for hours of fun',
    price: 29.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Hasbro'
  },
  {
    title: 'Remote Control Drone',
    description: 'High-tech drone with camera and GPS features',
    price: 299.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'DJI'
  },
  {
    title: 'Watercolor Paint Set',
    description: 'Professional watercolor paints for artists',
    price: 49.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Winsor & Newton'
  },
  {
    title: 'Rubik\'s Cube',
    description: 'Original 3x3 puzzle cube for brain training',
    price: 12.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Rubik\'s'
  },
  {
    title: 'Barbie Dreamhouse',
    description: 'Multi-story dollhouse with furniture and accessories',
    price: 149.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
    stock_quantity: 15,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Mattel'
  },
  {
    title: 'Electric Guitar for Beginners',
    description: 'Starter electric guitar with amplifier',
    price: 199.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Yamaha'
  },
  {
    title: 'Jigsaw Puzzle 1000 Pieces',
    description: 'Challenging jigsaw puzzle with beautiful artwork',
    price: 19.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Ravensburger'
  },
  {
    title: 'Soccer Ball Official Size',
    description: 'FIFA-approved soccer ball for professional play',
    price: 34.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Adidas'
  },
  {
    title: 'Model Train Set',
    description: 'Electric model train set with tracks and accessories',
    price: 129.99,
    category: 'toys',
    image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop',
    stock_quantity: 18,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Lionel'
  },

  // Pet Products (10 products)
  {
    title: 'Premium Dog Food',
    description: 'Nutritious dry dog food for all breeds and ages',
    price: 39.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Royal Canin'
  },
  {
    title: 'Cat Scratching Post',
    description: 'Tall scratching post with multiple levels for cats',
    price: 59.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'SmartCat'
  },
  {
    title: 'Automatic Pet Feeder',
    description: 'Smart feeder with timer and portion control',
    price: 89.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'PetSafe'
  },
  {
    title: 'Dog Leash and Collar Set',
    description: 'Durable leash and collar set for daily walks',
    price: 24.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
    stock_quantity: 70,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Ruffwear'
  },
  {
    title: 'Cat Litter Box',
    description: 'Self-cleaning litter box with odor control',
    price: 149.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Litter Robot'
  },
  {
    title: 'Bird Cage with Accessories',
    description: 'Spacious bird cage with perches and feeding bowls',
    price: 79.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Prevue Pet'
  },
  {
    title: 'Fish Tank Starter Kit',
    description: 'Complete aquarium kit with filter and heater',
    price: 129.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Tetra'
  },
  {
    title: 'Dog Grooming Kit',
    description: 'Professional grooming tools for home use',
    price: 49.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Wahl'
  },
  {
    title: 'Hamster Exercise Wheel',
    description: 'Silent exercise wheel for small pets',
    price: 19.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Kaytee'
  },
  {
    title: 'Pet Carrier Bag',
    description: 'Comfortable carrier bag for traveling with pets',
    price: 34.99,
    category: 'pets',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
    stock_quantity: 55,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Sherpa'
  },

  // Digital Products (10 products)
  {
    title: 'Adobe Creative Suite',
    description: 'Professional design software subscription',
    price: 52.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Adobe'
  },
  {
    title: 'Online Photography Course',
    description: 'Comprehensive photography course with 50+ lessons',
    price: 89.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'MasterClass'
  },
  {
    title: 'Spotify Premium Subscription',
    description: 'Music streaming service with offline downloads',
    price: 9.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Spotify'
  },
  {
    title: 'Microsoft Office 365',
    description: 'Productivity suite with Word, Excel, and PowerPoint',
    price: 69.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Microsoft'
  },
  {
    title: 'Cooking Masterclass eBook',
    description: 'Digital cookbook with 200+ recipes',
    price: 19.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Chef\'s Collection'
  },
  {
    title: 'Meditation App Subscription',
    description: 'Guided meditation and mindfulness app',
    price: 14.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Headspace'
  },
  {
    title: 'Stock Photo Bundle',
    description: 'High-quality stock photos for commercial use',
    price: 39.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Shutterstock'
  },
  {
    title: 'Video Editing Software',
    description: 'Professional video editing software with effects',
    price: 199.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1574717024679-5b618c56b0e8?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Final Cut Pro'
  },
  {
    title: 'Language Learning App',
    description: 'Interactive language learning with 30+ languages',
    price: 79.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Rosetta Stone'
  },
  {
    title: 'Fitness Workout Videos',
    description: 'Home workout video collection with trainer guidance',
    price: 29.99,
    category: 'digital',
    image_url: 'https://images.unsplash.com/photo-1571019613914-85f342ba5b7e?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Beachbody'
  },

  // Health and Wellness (10 products)
  {
    title: 'Vitamin D3 Supplements',
    description: 'High-potency vitamin D3 for immune support',
    price: 24.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Nature Made'
  },
  {
    title: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with carrying strap',
    price: 49.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Manduka'
  },
  {
    title: 'Protein Powder Whey',
    description: 'High-quality whey protein for muscle building',
    price: 39.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Optimum Nutrition'
  },
  {
    title: 'Blood Pressure Monitor',
    description: 'Digital blood pressure monitor with memory',
    price: 79.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Omron'
  },
  {
    title: 'Essential Oil Diffuser',
    description: 'Ultrasonic aromatherapy diffuser with LED lights',
    price: 34.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'URPOWER'
  },
  {
    title: 'Fitness Tracker Watch',
    description: 'Smart fitness tracker with heart rate monitoring',
    price: 149.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Fitbit'
  },
  {
    title: 'Massage Gun Therapy',
    description: 'Percussive therapy device for muscle recovery',
    price: 199.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Theragun'
  },
  {
    title: 'Probiotics Supplement',
    description: 'Daily probiotic supplement for digestive health',
    price: 29.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    stock_quantity: 70,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Garden of Life'
  },
  {
    title: 'Resistance Bands Set',
    description: 'Exercise resistance bands with door anchor',
    price: 19.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    stock_quantity: 85,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Bodylastics'
  },
  {
    title: 'Sleep Mask Silk',
    description: 'Premium silk sleep mask for better rest',
    price: 24.99,
    category: 'health',
    image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop',
    stock_quantity: 55,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Slip'
  },

  // DIY and Hardware (10 products)
  {
    title: 'Cordless Drill Set',
    description: 'Professional cordless drill with multiple bits',
    price: 129.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 30,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'DeWalt'
  },
  {
    title: 'Tool Box Organizer',
    description: 'Heavy-duty tool box with multiple compartments',
    price: 89.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Craftsman'
  },
  {
    title: 'Paint Roller Set',
    description: 'Complete paint roller set with brushes and tray',
    price: 24.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Purdy'
  },
  {
    title: 'Garden Hose Heavy Duty',
    description: 'Durable garden hose with spray nozzle',
    price: 39.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    stock_quantity: 40,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Flexzilla'
  },
  {
    title: 'Circular Saw',
    description: 'Professional circular saw for woodworking projects',
    price: 179.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Makita'
  },
  {
    title: 'Screwdriver Set',
    description: 'Complete screwdriver set with magnetic tips',
    price: 19.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Klein Tools'
  },
  {
    title: 'Level 24 Inch',
    description: 'Precision level with bubble vials for accuracy',
    price: 29.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Stanley'
  },
  {
    title: 'Plumbing Repair Kit',
    description: 'Complete plumbing repair kit with fittings',
    price: 49.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 35,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'SharkBite'
  },
  {
    title: 'Measuring Tape 25ft',
    description: 'Heavy-duty measuring tape with standout blade',
    price: 14.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 70,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Milwaukee'
  },
  {
    title: 'Safety Glasses Set',
    description: 'ANSI-approved safety glasses for eye protection',
    price: 12.99,
    category: 'diy',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
    stock_quantity: 90,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: '3M'
  },

  // Other Categories (10 products)
  {
    title: 'Ergonomic Office Chair',
    description: 'Comfortable office chair with lumbar support',
    price: 299.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop',
    stock_quantity: 20,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Herman Miller'
  },
  {
    title: 'Bestselling Novel Collection',
    description: 'Set of 5 bestselling novels from top authors',
    price: 49.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    stock_quantity: 60,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Penguin Random House'
  },
  {
    title: 'Vintage Vinyl Records',
    description: 'Classic vinyl records from the 70s and 80s',
    price: 89.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    stock_quantity: 25,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Various Artists'
  },
  {
    title: 'Monthly Snack Box',
    description: 'Curated snack box with international treats',
    price: 24.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
    stock_quantity: 100,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'SnackCrate'
  },
  {
    title: 'Customized Photo Album',
    description: 'Personalized photo album with custom cover',
    price: 39.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    stock_quantity: 50,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Shutterfly'
  },
  {
    title: 'Desk Organizer Set',
    description: 'Bamboo desk organizer with multiple compartments',
    price: 34.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop',
    stock_quantity: 45,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Bamboo Living'
  },
  {
    title: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad for smartphones',
    price: 29.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    stock_quantity: 80,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Belkin'
  },
  {
    title: 'Subscription Box Mystery',
    description: 'Monthly mystery box with surprise items',
    price: 19.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
    stock_quantity: 200,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Mystery Box Co'
  },
  {
    title: 'Portable Phone Stand',
    description: 'Adjustable phone stand for desk and travel',
    price: 15.99,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    stock_quantity: 100,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Lamicall'
  },
  {
    title: 'Gift Card Collection',
    description: 'Digital gift cards for popular retailers',
    price: 50.00,
    category: 'other',
    image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    stock_quantity: 999,
    vendor_id: '6fac5f0f-9522-49c2-a131-60bf330545d5',
    brand: 'Various Retailers'
  }
];

export async function addComprehensiveProducts() {
  console.log(`Adding ${comprehensiveProducts.length} comprehensive products...`);
  
  const addedProducts = [];
  let errorCount = 0;
  
  for (const product of comprehensiveProducts) {
    try {
      const result = await storage.createProduct(product);
      addedProducts.push(result);
      console.log(`Added: ${product.title}`);
    } catch (error) {
      console.error(`Failed to add ${product.title}:`, error);
      errorCount++;
    }
  }
  
  console.log(`Successfully added ${addedProducts.length} products`);
  console.log(`Failed to add ${errorCount} products`);
  
  return {
    success: addedProducts.length,
    failed: errorCount,
    total: comprehensiveProducts.length
  };
}