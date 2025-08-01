import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSupabaseFilters() {
  try {
    console.log('Setting up Supabase database with enhanced filter fields...');
    
    // Add new filtering fields to the products table
    const alterTableQuery = `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_flash_sale boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_clearance boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_trending boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_new_this_week boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_top_selling boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_hot_deal boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_dont_miss boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS original_price numeric(10,2),
      ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS flash_sale_end_date timestamp with time zone,
      ADD COLUMN IF NOT EXISTS rating_average numeric(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10,
      ADD COLUMN IF NOT EXISTS is_featured_vendor boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS meta_title text,
      ADD COLUMN IF NOT EXISTS meta_description text,
      ADD COLUMN IF NOT EXISTS search_keywords text[] DEFAULT '{}';
    `;

    const { error: alterError } = await supabase.rpc('execute_sql', { sql: alterTableQuery });
    if (alterError) {
      console.error('Error altering table:', alterError);
    } else {
      console.log('✅ Successfully added filter fields to products table');
    }

    // Create indexes for better query performance
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_products_is_flash_sale ON products (is_flash_sale);
      CREATE INDEX IF NOT EXISTS idx_products_is_clearance ON products (is_clearance);
      CREATE INDEX IF NOT EXISTS idx_products_is_trending ON products (is_trending);
      CREATE INDEX IF NOT EXISTS idx_products_is_new_this_week ON products (is_new_this_week);
      CREATE INDEX IF NOT EXISTS idx_products_is_top_selling ON products (is_top_selling);
      CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products (is_featured);
      CREATE INDEX IF NOT EXISTS idx_products_is_hot_deal ON products (is_hot_deal);
      CREATE INDEX IF NOT EXISTS idx_products_is_dont_miss ON products (is_dont_miss);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
      CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
      CREATE INDEX IF NOT EXISTS idx_products_rating_average ON products (rating_average);
    `;

    const { error: indexError } = await supabase.rpc('execute_sql', { sql: createIndexesQuery });
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Successfully created performance indexes');
    }

    // Update existing products with sample filter data
    const updateProductsQuery = `
      -- Set some products as flash sale items (20% of products)
      UPDATE products 
      SET is_flash_sale = true, 
          flash_sale_end_date = now() + interval '2 days',
          discount_percentage = 15 + (random() * 35)::int,
          original_price = price * (1 + (discount_percentage / 100.0))
      WHERE random() < 0.2;

      -- Set some products as clearance items (15% of products)
      UPDATE products 
      SET is_clearance = true,
          discount_percentage = 20 + (random() * 50)::int,
          original_price = price * (1 + (discount_percentage / 100.0))
      WHERE random() < 0.15 AND NOT is_flash_sale;

      -- Set some products as trending (25% of products)
      UPDATE products 
      SET is_trending = true
      WHERE random() < 0.25;

      -- Set some products as new this week (10% of products)
      UPDATE products 
      SET is_new_this_week = true
      WHERE created_at >= now() - interval '7 days' OR random() < 0.1;

      -- Set some products as top selling (20% of products)
      UPDATE products 
      SET is_top_selling = true,
          rating_average = 3.5 + (random() * 1.5),
          rating_count = 10 + (random() * 200)::int
      WHERE random() < 0.2;

      -- Set some products as featured (15% of products)
      UPDATE products 
      SET is_featured = true
      WHERE random() < 0.15;

      -- Set some products as hot deals (12% of products)
      UPDATE products 
      SET is_hot_deal = true,
          discount_percentage = 25 + (random() * 25)::int,
          original_price = price * (1 + (discount_percentage / 100.0))
      WHERE random() < 0.12 AND NOT is_flash_sale AND NOT is_clearance;

      -- Set some products as don't miss deals (10% of products)
      UPDATE products 
      SET is_dont_miss = true
      WHERE random() < 0.1;
    `;

    const { error: updateError } = await supabase.rpc('execute_sql', { sql: updateProductsQuery });
    if (updateError) {
      console.error('Error updating products:', updateError);
    } else {
      console.log('✅ Successfully updated products with filter data');
    }

    console.log('🎉 Supabase database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up Supabase filters:', error);
  }
}

// Run the setup
setupSupabaseFilters().then(() => {
  console.log('Setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});