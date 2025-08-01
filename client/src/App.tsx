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

import { PaymentCallbackHandler } from "@/components/payment-callback-handler";
import { PaymentSuccessNotice } from "@/components/payment-success-notice";
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
import Checkout from "@/pages/checkout";
import PaymentResult from "@/pages/payment-result";
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
import VendorOrders from "@/pages/vendor/orders";
import VendorAnalytics from "@/pages/vendor/analytics";
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
import PayoutInformation from './pages/vendors/payout-information';
import VendorSupport from './pages/vendors/vendor-support';

// Policy pages
import PaymentOptions from './pages/policies/payment-options';
import MobileMoney from './pages/policies/mobile-money';

// Contact page
import ContactVendor from './pages/contact-vendor';

function Router() {
  return (
    <Switch>
      {/* Public authentication routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      {/* All other routes require authentication */}
      <Route path="/">
        <ProtectedRoute>
          <KTUHome />
        </ProtectedRoute>
      </Route>
      
      <Route path="/mentorship">
        <ProtectedRoute>
          <MentorshipHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/resources">
        <ProtectedRoute>
          <BusinessResources />
        </ProtectedRoute>
      </Route>
      
      <Route path="/resources/:id">
        <ProtectedRoute>
          <ResourceDetail />
        </ProtectedRoute>
      </Route>
      
      <Route path="/community">
        <ProtectedRoute>
          <CommunityForum />
        </ProtectedRoute>
      </Route>
      
      <Route path="/products">
        <ProtectedRoute>
          <ProductsListing />
        </ProtectedRoute>
      </Route>
      
      <Route path="/products-listing">
        <ProtectedRoute>
          <ProductsListing />
        </ProtectedRoute>
      </Route>
      
      <Route path="/products/:id">
        <ProtectedRoute>
          <ProductDetail />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendors">
        <ProtectedRoute>
          <Vendors />
        </ProtectedRoute>
      </Route>
      
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
      
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payment-result">
        <ProtectedRoute>
          <PaymentResult />
        </ProtectedRoute>
      </Route>
      
      <Route path="/orders">
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      </Route>
      
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
      

      
      <Route path="/vendor/products">
        <ProtectedRoute>
          <VendorProducts />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/products/grid">
        <ProtectedRoute>
          <VendorProductsGrid />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/orders">
        <ProtectedRoute>
          <VendorOrders />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/analytics">
        <ProtectedRoute>
          <VendorAnalytics />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor/settings">
        <ProtectedRoute>
          <VendorSettings />
        </ProtectedRoute>
      </Route>

      {/* Student Business pages */}
      <Route path="/student-businesses">
        <ProtectedRoute>
          <VendorStores />
        </ProtectedRoute>
      </Route>
      
      <Route path="/business/:id">
        <ProtectedRoute>
          <VendorDetail />
        </ProtectedRoute>
      </Route>
      
      {/* Browse Products */}
      <Route path="/browse-products">
        <ProtectedRoute>
          <BrowseProducts />
        </ProtectedRoute>
      </Route>
      
      <Route path="/track-order">
        <ProtectedRoute>
          <TrackOrder />
        </ProtectedRoute>
      </Route>
      
      <Route path="/return-policy">
        <ProtectedRoute>
          <ReturnPolicy />
        </ProtectedRoute>
      </Route>
      
      <Route path="/customer-support">
        <ProtectedRoute>
          <CustomerSupport />
        </ProtectedRoute>
      </Route>
      
      {/* Vendor pages */}
      <Route path="/sell-on-vendorhub">
        <ProtectedRoute>
          <SellOnVendorHub />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor-guidelines">
        <ProtectedRoute>
          <VendorGuidelines />
        </ProtectedRoute>
      </Route>
      
      <Route path="/payout-information">
        <ProtectedRoute>
          <PayoutInformation />
        </ProtectedRoute>
      </Route>
      
      <Route path="/vendor-support">
        <ProtectedRoute>
          <VendorSupport />
        </ProtectedRoute>
      </Route>
      
      {/* Policy pages */}
      <Route path="/payment-options">
        <ProtectedRoute>
          <PaymentOptions />
        </ProtectedRoute>
      </Route>
      
      <Route path="/mobile-money">
        <ProtectedRoute>
          <MobileMoney />
        </ProtectedRoute>
      </Route>
      
      {/* Contact page */}
      <Route path="/contact-vendor">
        <ProtectedRoute>
          <ContactVendor />
        </ProtectedRoute>
      </Route>
      
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
            <PaymentCallbackHandler />
            <PaymentSuccessNotice />
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
