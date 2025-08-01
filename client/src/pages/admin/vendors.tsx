import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, CheckCircle, X, Store, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import type { User } from '@shared/schema';

export default function AdminVendors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<User | null>(null);
  
  // Get admin token from localStorage
  const adminToken = localStorage.getItem('admin_token');

  const { data: vendors = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/businesses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/businesses', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    },
    enabled: !!adminToken
  });

  const { data: pendingVendors = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/vendors/pending'],
    queryFn: async () => {
      const response = await fetch('/api/admin/vendors/pending', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch pending vendors');
      return response.json();
    },
    enabled: !!adminToken
  });

  const approveVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const response = await fetch(`/api/admin/businesses/${vendorId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to approve vendor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/businesses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendors/pending'] });
      toast({
        title: "Vendor Approved",
        description: "The vendor has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve vendor. Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredVendors = vendors.filter(vendor =>
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPendingVendors = pendingVendors.filter(vendor =>
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (vendorId: string) => {
    approveVendorMutation.mutate(vendorId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/admin/dashboard">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 text-ktu-deep-blue hover:text-ktu-orange hover:border-ktu-orange"
                data-testid="button-back-admin"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black">Vendor Management</h1>
              <p className="text-gray-600 mt-2">Manage vendor applications and accounts</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Pending Approvals</span>
              </span>
              <Badge variant="secondary">{filteredPendingVendors.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPendingVendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p>No pending vendor approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPendingVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 btn-orange-primary rounded-full flex items-center justify-center">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">{vendor.store_name || 'Unnamed Store'}</p>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                        <p className="text-xs text-gray-500">
                          Applied: {formatDate(vendor.created_at || '')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Vendor Details</DialogTitle>
                          </DialogHeader>
                          {selectedVendor && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-black mb-2">Store Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {selectedVendor.store_name || 'Not provided'}</p>
                                    <p><strong>Email:</strong> {selectedVendor.email}</p>
                                    <p><strong>Applied:</strong> {formatDate(selectedVendor.created_at || '')}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-black mb-2">Mobile Money</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Number:</strong> {selectedVendor.momo_number || 'Not provided'}</p>
                                    <p><strong>Verified:</strong> 
                                      <Badge className={`ml-2 ${selectedVendor.momo_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedVendor.momo_verified ? 'Yes' : 'No'}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-black mb-2">Store Description</h4>
                                <p className="text-sm text-gray-600">
                                  {selectedVendor.store_description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleApprove(vendor.id)}
                        disabled={approveVendorMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Vendors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>All Vendors</span>
              </span>
              <Badge variant="secondary">{filteredVendors.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p>No vendors found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">{vendor.store_name || 'Unnamed Store'}</p>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Joined: {formatDate(vendor.created_at || '')}</span>
                          <span>MoMo: {vendor.momo_verified ? 'Verified' : 'Not Verified'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={vendor.vendor_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {vendor.vendor_approved ? 'Approved' : 'Pending'}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Vendor Details</DialogTitle>
                          </DialogHeader>
                          {selectedVendor && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-black mb-2">Store Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {selectedVendor.store_name || 'Not provided'}</p>
                                    <p><strong>Email:</strong> {selectedVendor.email}</p>
                                    <p><strong>Status:</strong> 
                                      <Badge className={`ml-2 ${selectedVendor.vendor_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {selectedVendor.vendor_approved ? 'Approved' : 'Pending'}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-black mb-2">Mobile Money</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Number:</strong> {selectedVendor.momo_number || 'Not provided'}</p>
                                    <p><strong>Verified:</strong> 
                                      <Badge className={`ml-2 ${selectedVendor.momo_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedVendor.momo_verified ? 'Yes' : 'No'}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-black mb-2">Store Description</h4>
                                <p className="text-sm text-gray-600">
                                  {selectedVendor.store_description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
