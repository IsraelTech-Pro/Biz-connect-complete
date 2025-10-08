import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  User,
  Menu,
  X,
  Store,
  Bell,
  MapPin,
  Phone,
  BarChart3,
  Package,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { User as UserType, Product } from "@shared/schema";

const categories = [
  { name: "Tech & Innovation", icon: "💻", color: "bg-ktu-deep-blue" },
  { name: "Fashion & Design", icon: "👔", color: "bg-ktu-orange" },
  { name: "Food & Catering", icon: "🍽️", color: "bg-green-500" },
  { name: "Education & Tutoring", icon: "📚", color: "bg-indigo-500" },
  { name: "Arts & Crafts", icon: "🎨", color: "bg-purple-500" },
  { name: "Digital Marketing", icon: "📱", color: "bg-blue-500" },
  { name: "Services", icon: "🔧", color: "bg-gray-500" },
  { name: "Health & Wellness", icon: "💊", color: "bg-teal-500" },
];

export const Header = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { user, logout } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Real-time search data
  const { data: searchResults } = useQuery<{
    products: Product[];
    vendors: UserType[];
  }>({
    queryKey: [`/api/search?q=${debouncedQuery}`],
    enabled: debouncedQuery.length > 2,
  });

  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      setIsSearchFocused(false);
      window.location.href = `/products-listing?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleMobileSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      setIsSearchFocused(false);
      window.location.href = `/products-listing?search=${encodeURIComponent(searchQuery)}`;
    } else {
      setIsSearchFocused(!isSearchFocused);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 2);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.length > 2) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-ktu-deep-blue text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center space-x-2 font-bold hover:text-ktu-orange transition-colors"
              >
                <img 
                  src="/bizconnect-logo.png" 
                  alt="BizConnect Logo" 
                  className="w-6 h-6"
                />
                <span>KTU BIZCONNECT</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-bold">Need Help?</span>
              <Link
                to="/customer-support"
                className="text-ktu-orange font-bold hover:text-white transition-colors cursor-pointer"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 lg:h-16">
            {/* Mobile Menu + Logo */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="w-4 h-4 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-gray-600"></span>
                  <span className="w-full h-0.5 bg-gray-600"></span>
                  <span className="w-full h-0.5 bg-gray-600"></span>
                </div>
              </Button>
              <Link to="/" className="flex items-center space-x-2 group">
                <img 
                  src="/bizconnect-logo.png" 
                  alt="BizConnect Logo" 
                  className="h-8 w-8 lg:h-10 lg:w-10"
                />
                <span className="text-xl lg:text-2xl font-bold text-ktu-deep-blue">
                  KTU <span className="text-ktu-orange">BizConnect</span>
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8 hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search products, brands and categories..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="w-full pl-4 pr-4 py-2 lg:py-3 border border-gray-300 rounded-l-md focus:border-orange-500 focus:ring-0 text-sm"
                  />
                  <Button
                    type="submit"
                    className="btn-orange-primary px-4 lg:px-6 py-2 lg:py-3 rounded-r-md border-none h-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showSearchResults && searchResults && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto"
                    >
                      {/* Products */}
                      {searchResults.products && searchResults.products.length > 0 && (
                        <div className="p-2">
                          <h3 className="text-sm font-medium text-gray-500 px-3 py-2">Products</h3>
                          {searchResults.products.slice(0, 4).map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
                              onClick={() => setShowSearchResults(false)}
                            >
                              <Package className="w-4 h-4 text-orange-600 mr-3" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                <div className="text-xs text-gray-500">GH₵{product.price}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Vendors */}
                      {searchResults.vendors && searchResults.vendors.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                          <h3 className="text-sm font-medium text-gray-500 px-3 py-2">Businesses</h3>
                          {searchResults.vendors.slice(0, 3).map((vendor) => (
                            <Link
                              key={vendor.id}
                              to={`/business/${vendor.id}`}
                              className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
                              onClick={() => setShowSearchResults(false)}
                            >
                              <Building2 className="w-4 h-4 text-blue-600 mr-3" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {vendor.business_name || `${vendor.full_name}'s Store`}
                                </div>
                                <div className="text-xs text-gray-500">Business</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* No Results */}
                      {(!searchResults.products || searchResults.products.length === 0) &&
                       (!searchResults.vendors || searchResults.vendors.length === 0) && (
                        <div className="p-4 text-center text-gray-500">
                          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <div className="text-sm">No results found for "{searchQuery}"</div>
                          <div className="text-xs mt-1">Try a different search term</div>
                        </div>
                      )}

                      {/* View All Results */}
                      {searchQuery.trim() && (
                        <div className="border-t border-gray-100 p-2">
                          <Link
                            to={`/products-listing?search=${encodeURIComponent(searchQuery)}`}
                            className="block w-full text-center py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                            onClick={() => setShowSearchResults(false)}
                          >
                            View all results for "{searchQuery}"
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={handleMobileSearch}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Account */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1 hover:bg-orange-50 px-2 py-2"
                >
                  <User className="h-4 w-4" />
                  <div className="text-left hidden lg:block">
                    <div className="text-xs text-gray-500">Account</div>
                    <div className="text-sm font-medium">
                      {user ? user.email.split("@")[0] : "Sign in"}
                    </div>
                  </div>
                </Button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {user ? (
                    <>
                      {(user.role === "vendor" || user.role === "admin") && (
                        <Link
                          to={user.role === "vendor" ? "/vendor/dashboard" : "/admin/dashboard"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {user.role === "vendor" ? "Dashboard" : "Admin Panel"}
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/auth/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/auth/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Become a Seller
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Dashboard */}
              {user && (user.role === "vendor" || user.role === "admin") && (
                <Link
                  to={
                    user.role === "vendor"
                      ? "/vendor/dashboard"
                      : "/admin/dashboard"
                  }
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 hover:bg-orange-50 px-2 py-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <div className="text-left hidden lg:block">
                      <div className="text-xs text-gray-500">Dashboard</div>
                      <div className="text-sm font-medium">
                        {user.role === "vendor"
                          ? "Business"
                          : "Admin"}
                      </div>
                    </div>
                  </Button>
                </Link>
              )}


            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="bg-ktu-section-gradient border-b border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center justify-center space-x-8 flex-1">
                <Link
                  to="/student-businesses"
                  className="text-ktu-deep-blue hover:text-ktu-orange transition-colors font-medium"
                >
                  Student Businesses
                </Link>
                <Link
                  to="/products-listing"
                  className="text-ktu-deep-blue hover:text-ktu-orange transition-colors font-medium"
                >
                  Products
                </Link>
                <Link
                  to="/mentorship"
                  className="text-ktu-deep-blue hover:text-ktu-orange transition-colors font-medium"
                >
                  Mentorship
                </Link>
                <Link
                  to="/resources"
                  className="text-ktu-deep-blue hover:text-ktu-orange transition-colors font-medium"
                >
                  Resources
                </Link>
                <Link
                  to="/community"
                  className="text-ktu-deep-blue hover:text-ktu-orange transition-colors font-medium"
                >
                  Community
                </Link>
              </div>
              {(!user || (user.role !== "vendor" && user.role !== "admin")) && (
                <Link
                  to={user ? "/vendor/register" : "/sell-on-vendorhub"}
                  className="bg-ktu-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium text-sm"
                  data-testid="link-become-seller"
                >
                  Become a Seller
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200 px-4 py-3"
            >
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search products, brands and categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-l-md focus:border-orange-500 focus:ring-0 text-sm"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="btn-orange-primary px-4 py-2 rounded-r-md border-none h-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {user && (user.role === "vendor" || user.role === "admin") && (
                <Link
                  to={
                    user.role === "vendor"
                      ? "/vendor/dashboard"
                      : "/admin/dashboard"
                  }
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ktu-deep-blue hover:text-ktu-orange"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-medium">
                    {user.role === "vendor"
                      ? "Business Dashboard"
                      : "Admin Dashboard"}
                  </span>
                </Link>
              )}
              {(!user || (user.role !== "vendor" && user.role !== "admin")) && (
                <Link
                  to={user ? "/vendor/register" : "/sell-on-vendorhub"}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-ktu-orange text-white hover:bg-orange-600"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="link-become-seller-mobile"
                >
                  <Store className="h-5 w-5" />
                  <span className="text-sm font-medium">Become a Seller</span>
                </Link>
              )}
              <Link
                to="/student-businesses"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ktu-deep-blue hover:text-ktu-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">🏢</span>
                <span className="text-sm font-medium">Student Businesses</span>
              </Link>
              <Link
                to="/products-listing"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ktu-deep-blue hover:text-ktu-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">📦</span>
                <span className="text-sm font-medium">Products</span>
              </Link>
              <Link
                to="/mentorship"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ktu-deep-blue hover:text-ktu-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">👨‍🏫</span>
                <span className="text-sm font-medium">Mentorship</span>
              </Link>
              <Link
                to="/resources"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ktu-deep-blue hover:text-ktu-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">📚</span>
                <span className="text-sm font-medium">Resources</span>
              </Link>
              <Link
                to="/community"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-ktu-deep-blue hover:text-ktu-orange"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium">Community</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
