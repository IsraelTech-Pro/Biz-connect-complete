# VendorHub - Multi-Vendor eCommerce Platform

## Overview
VendorHub is a mobile-friendly multi-vendor eCommerce platform designed for the Ghanaian market. It enables vendors to establish and manage online stores, offering buyers a smooth shopping experience. The platform integrates with Paystack for secure payments and MTN Mobile Money for vendor payouts, aiming to be a leading online marketplace in Ghana.

## Recent Changes (October 2025)
- **Public Browsing Implementation**: Buyers can now browse the entire platform (homepage, products, vendors, resources, mentorship, community) without requiring signup or authentication
- **Vendor-Only Registration**: Converted registration flow to vendor-only - removed buyer signup option, registration page now exclusively for sellers/vendors with business details required
- **Protected Route Configuration**: Authentication required only for transactional pages (cart, checkout, orders, payment) and vendor dashboard areas
- **Account Dropdown Refinement**: Account dropdown visible to all users with role-specific content - vendors/admins see dashboard link and logout, buyers see only logout, non-logged users see sign in and become a seller options
- **Real-time Search Implementation**: Added debounced search functionality with dropdown results showing products and businesses separately
- **Updated Search Routing**: Changed search redirects from `/browse-products` to `/products-listing` for unified product browsing experience
- **Enhanced Rating System**: Integrated database-driven ratings for vendor stores, replacing fake display metrics
- **Buyer Dashboard Removal**: Completely removed buyer dashboard functionality, streamlining the platform for vendor-focused operations
- **Product Rating System**: Implemented comprehensive product rating functionality with 1-5 star ratings, matching business rating display format (single star + number like "3.0"), and interactive rating capability on homepage cards and product detail pages
- **Inventory Removal**: Completely removed all stock/inventory tracking including "items left" displays from product cards and listings
- **Cart Button Removal**: Removed shopping cart buttons from product listings to enforce contact-based purchasing model
- **BizConnect Logo Integration**: Implemented comprehensive branding with BizConnect logo across entire application including header navigation, login/register pages, admin login, homepage hero section, and favicon
- **University Name Correction**: Updated all references to reflect correct university name "Koforidua Technical University" throughout documentation and application materials
- **Complete Application Documentation**: Created comprehensive guide explaining all platform functionalities including admin dashboard, student business dashboard, and all platform sections (Products, Mentorship, Resources, Community)
- **Login Redirect Fix**: Fixed authentication flow where users remained on login page after successful authentication - added automatic redirect to homepage when authentication state updates
- **Real Registration Date Display**: Updated vendor detail pages to fetch and display actual business registration date from database instead of hardcoded "Active since 2024"

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Design System
The platform features a Jumia-inspired design with a clean aesthetic.
- **Color Scheme**: White background, Black text, Orange accents.
- **Typography**: Inter font family.
- **Component Library**: Radix UI primitives with custom styling and shadcn/ui components.
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities.
- **Visuals**: Incorporates glassmorphism effects, gradient backgrounds, shimmer animations, and consistent 6-column grid layouts for product displays on desktop, with horizontal scrolling on mobile.

### Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS.
- **State Management**: React Context API for authentication and shopping cart.
- **Data Fetching**: TanStack Query (React Query).
- **Routing**: Wouter.
- **Build Tool**: Vite.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Database**: PostgreSQL with Drizzle ORM.
- **Database Provider**: Neon (serverless PostgreSQL).
- **Authentication**: JWT-based authentication with role-based access control (buyer, vendor, admin).
- **Session Management**: PostgreSQL session store with connect-pg-simple.
- **API Structure**: RESTful API with middleware-based authentication.

### Technical Implementations
- **Authentication**: JWT-based with role-based access control and session persistence via localStorage.
- **Database Schema**: Comprehensive schema including Users, Products, Orders, Payouts, and Platform Settings. Supports advanced filtering, product images (JSONB), and Paystack transaction synchronization.
- **Payment System**: Direct vendor payments via Paystack subaccounts, mobile money integration, and comprehensive transaction tracking.
- **Vendor Management**: Features vendor registration, store customization, product management, order fulfillment tracking, and payout management. Includes secure phone number handling and image upload system (supporting Supabase storage with local fallback).
- **Shopping Cart**: Context-based, persistent, multi-vendor cart with a clear checkout flow.
- **Product Management**: 3-step creation wizard, multi-image support, and separation of vendor vs. admin fields (promotional/SEO fields are admin-only).
- **Store Sharing**: QR code generation and URL sharing for vendor stores.
- **Order Management**: Comprehensive vendor orders page with filtering, search, status management, and analytics dashboard.

## External Dependencies

### Payment Processing
- **Paystack**: Payment gateway for buyer transactions and automated payouts to vendor Mobile Money.

### Database & Infrastructure
- **Neon**: Serverless PostgreSQL database.
- **Drizzle ORM**: Type-safe database queries and migrations.
- **Drizzle Kit**: Database migration management.

### UI Libraries
- **Radix UI**: Accessible primitive components.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.
- **Class Variance Authority**: Component variant management.
- **qrcode**: For QR code generation.

### Development Tools
- **Vite**: Build tool and development server.
- **TypeScript**: Type safety.
- **ESBuild**: Production bundling for server code.
- **Zod**: Schema validation.
- **Multer**: For file uploads.