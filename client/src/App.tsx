import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProtectedRoute } from "@/components/protected-route";

import AdminApp from "./admin-app";
// Core pages
import NotFound from "@/pages/not-found";
import KTUHome from "@/pages/ktu-home";
import ProductDetail from "@/pages/product-detail";
import Vendors from "@/pages/vendors";

import VendorDetail from "@/pages/vendor-detail";

// KTU specific pages
import ProductsListing from "@/pages/products-listing";
import BusinessResources from "./pages/business-resources";
import ResourceDetail from "./pages/resource-detail";
import CommunityForum from "./pages/community-forum";
import MentorshipHub from "./pages/mentorship-hub";

// Commerce pages
import Cart from "@/pages/cart";
import Orders from "@/pages/orders";
import CartDashboard from './pages/cart-dashboard';

// Authentication pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VendorRegister from "@/pages/vendor/vendor-register";

// Dashboard pages
import VendorDashboard from "@/pages/vendor/vendor-dashboard";
import VendorProducts from "@/pages/vendor/products";
import VendorProductsGrid from "@/pages/vendor/products-grid";
//import VendorOrders from "@/pages/vendor/orders";
//import VendorAnalytics from "@/pages/vendor/analytics";
import VendorSettings from "@/pages/vendor/settings";

// Admin pages
import AdminLogin from "./pages/admin/admin-login";
import AdminDashboard from "./pages/admin/admin-dashboard";
import AdminMentorship from "./pages/admin/admin-mentorship";
import AddMentor from "./pages/admin/mentors/add";
import AddProgram from "./pages/admin/programs/add";
import AddResource from "./pages/admin/resources/add";
import AddResourceNew from "./pages/admin/resources/add-new";
import EditResource from "./pages/admin/resources/edit";
import ViewResource from "./pages/admin/resources/view";
import MentorsList from "./pages/admin/mentors/list";
import ProgramsList from "./pages/admin/programs/list";
import ResourcesList from "./pages/admin/resources/list";
import AdminVendors from "@/pages/admin/vendors";
import AdminSettings from "@/pages/admin/settings";
import AdminDiscussions from "./pages/admin/community/discussions";

// Buyer pages
import BrowseProducts from './pages/buyers/browse-products';
import VendorStores from './pages/buyers/vendor-stores';
import TrackOrder from './pages/buyers/track-order';
import ReturnPolicy from './pages/buyers/return-policy';
import CustomerSupport from './pages/buyers/customer-support';

// Vendor pages
import SellOnVendorHub from './pages/vendors/sell-on-vendorhub';
import VendorGuidelines from './pages/vendors/vendor-guidelines';
import VendorSupport from './pages/vendors/vendor-support';

// Policy pages

// Contact page
import ContactVendor from './pages/contact-vendor';

// Quick Sale pages
import QuickSaleListing from './pages/quick-sale/listing';
import QuickSaleDetail from './pages/quick-sale/detail';
import CreateQuickSale from './pages/quick-sale/create';

function Router() {
  return (
    <Switch>
      {/* Public authentication routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      {/* Public browsing routes - no authentication required */}
      <Route path="/" component={KTUHome} />
      <Route path="/mentorship" component={MentorshipHub} />
      <Route path="/programs" component={MentorshipHub} />
      <Route path="/resources" component={BusinessResources} />
      <Route path="/resources/:id" component={ResourceDetail} />
      <Route path="/community" component={CommunityForum} />
      <Route path="/products" component={ProductsListing} />
      <Route path="/products-listing" component={ProductsListing} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/vendors" component={Vendors} />
      
      {/* Quick Sale / Auction routes - no authentication required */}
      <Route path="/quick-sale" component={QuickSaleListing} />
      <Route path="/quick-sale/create" component={CreateQuickSale} />
      <Route path="/quick-sale/:id" component={QuickSaleDetail} />
      
      {/* Protected commerce routes - require authentication */}
      <Route path="/cart">
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      </Route>
      
      <Route path="/cart-dashboard">
        <ProtectedRoute>
          <CartDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Removed checkout and payment-result routes */}
      
      <Route path="/orders">
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      </Route>
      
      {/* Protected vendor routes - require authentication to become/manage as seller */}
      <Route path="/vendor/register">
        <ProtectedRoute>
          <VendorRegister />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/dashboard">
        <ProtectedRoute>
          <VendorDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/products/grid">
        <ProtectedRoute>
          <VendorProductsGrid />
        </ProtectedRoute>
      </Route>

      <Route path="/vendor/products">
        <ProtectedRoute>
          <VendorProducts />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/settings">
        <ProtectedRoute>
          <VendorSettings />
        </ProtectedRoute>
      </Route>

      {/* Public browsing pages - no authentication required */}
      <Route path="/student-businesses" component={VendorStores} />
      <Route path="/business/:id" component={VendorDetail} />
      <Route path="/browse-products" component={BrowseProducts} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/return-policy" component={ReturnPolicy} />
      <Route path="/customer-support" component={CustomerSupport} />
      
      {/* Public vendor information pages */}
      <Route path="/sell-on-vendorhub" component={SellOnVendorHub} />
      <Route path="/vendor-guidelines" component={VendorGuidelines} />
      {/* Removed payout information route */}
      <Route path="/vendor-support" component={VendorSupport} />
      
      {/* Public policy pages */}
      {/* Removed payment policy routes */}
      
      {/* Public contact page */}
      <Route path="/contact-vendor" component={ContactVendor} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if we're in admin area - use separate admin app
  if (location.startsWith('/admin')) {
    return <AdminApp />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            {/* Removed payment callback and success notice */}
            <div className="min-h-screen bg-white">
              <Header />
              <main>
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
