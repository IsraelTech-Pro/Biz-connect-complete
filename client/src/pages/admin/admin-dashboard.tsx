import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Settings,
  BookOpen,
  UserCheck,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Shield,
  Activity,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  MessageCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Removed useAuth import - admin has separate authentication
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activePrograms: number;
  totalMentors: number;
  totalResources: number;
  publishedResources: number;
}

interface Business {
  id: string;
  business_name: string;
  full_name: string;
  email: string;
  is_approved: boolean;
  created_at: string;
  total_products: number;
  total_sales: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('businesses');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'business' | 'user'>('business');
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [resetAdminOpen, setResetAdminOpen] = useState<{ open: boolean; id?: string }>(() => ({ open: false }));
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminFullName, setNewAdminFullName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const queryClient = useQueryClient();

  // Get admin token once at component level
  const adminToken = localStorage.getItem('admin_token');

  // Check for admin authentication on component mount
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUserData = localStorage.getItem('admin_user');
    
    if (!adminToken || !adminUserData) {
      setLocation('/admin/login');
      return;
    }
    
    // Verify token is still valid
    try {
      const userData = JSON.parse(adminUserData);
      if (!userData.username) {
        throw new Error('Invalid admin session');
      }
      setAdminUser(userData);
    } catch (error) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setLocation('/admin/login');
    }
  }, [setLocation]);

  const handleBusinessApproval = async (businessId: string, approved: boolean) => {
    const adminToken = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ approved })
      });

      if (!response.ok) throw new Error('Failed to update business status');

      // Optimistically update cache so buttons hide immediately
      queryClient.setQueryData<Business[] | undefined>(['/api/admin/businesses'], (old) => {
        if (!old) return old;
        return old.map(b => b.id === businessId ? { ...b, is_approved: approved } : b);
      });

      toast({
        title: "Business Updated",
        description: `Business ${approved ? 'approved' : 'rejected'} successfully.`,
      });
      
      // Force re-fetch to ensure we pick updated DB values
      queryClient.invalidateQueries({ queryKey: ['/api/admin/businesses'] });
      refetchBusinesses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserEdit = async (userId: string, updates: Partial<User>) => {
    const adminToken = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update user');

      // Optimistically update users cache
      queryClient.setQueryData<User[] | undefined>(['/api/admin/users'], (old) => {
        if (!old) return old;
        return old.map(u => u.id === userId ? { ...u, ...updates } as User : u);
      });

      toast({
        title: "User Updated",
        description: "User information updated successfully.",
      });
      
      // Ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      refetchUsers();
      // If vendor approval status changes, businesses list may need refresh
      if (typeof updates.is_approved !== 'undefined') {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/businesses'] });
        if (typeof refetchBusinesses === 'function') refetchBusinesses();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserStatusToggle = async (userId: string, isApproved: boolean) => {
    await handleUserEdit(userId, { is_approved: !isApproved });
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    await handleUserEdit(userId, { role: newRole });
  };

  const handleBusinessView = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setSelectedItem(business);
      setModalType('business');
      setViewModalOpen(true);
    }
  };

  const handleUserView = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedItem(user);
      setModalType('user');
      setViewModalOpen(true);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const adminToken = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
      
      refetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }

    const adminToken = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete business');

      toast({
        title: "Business Deleted",
        description: "Business has been deleted successfully.",
      });
      
      refetchBusinesses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete business. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json();
    },
    enabled: !!adminToken
  });

  const { data: businesses = [], isLoading: businessesLoading, refetch: refetchBusinesses } = useQuery<Business[]>({
    queryKey: ['/api/admin/businesses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/businesses', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch businesses');
      return response.json();
    },
    enabled: !!adminToken
  });

  const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!adminToken
  });

  // Admin users list and actions
  interface AdminUserRow { id: string; username: string; full_name: string; email: string; is_active: boolean; created_at: string; }
  const { data: adminUsers = [], isLoading: adminUsersLoading, refetch: refetchAdminUsers } = useQuery<AdminUserRow[]>({
    queryKey: ['/api/admin/admin-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/admin-users', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch admin users');
      return response.json();
    },
    enabled: !!adminToken
  });

  const createAdmin = async () => {
    if (!newAdminUsername.trim() || !newAdminPassword || !newAdminFullName.trim() || !newAdminEmail.trim()) {
      toast({ title: 'Missing fields', description: 'Username, full name, email and password are required.', variant: 'destructive' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail.trim())) {
      toast({ title: 'Invalid email', description: 'Enter a valid email address.', variant: 'destructive' });
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      toast({ title: 'Password mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch('/api/admin/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ username: newAdminUsername.trim(), password: newAdminPassword, full_name: newAdminFullName.trim(), email: newAdminEmail.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Failed to create admin');
      queryClient.setQueryData<AdminUserRow[] | undefined>(['/api/admin/admin-users'], (old) => {
        if (!old) return [data];
        return [data, ...old];
      });
      toast({ title: 'Admin Created', description: `Admin ${newAdminUsername} created.` });
      setCreateAdminOpen(false);
      setNewAdminUsername('');
      setNewAdminPassword('');
      setNewAdminFullName('');
      setNewAdminEmail('');
      setConfirmAdminPassword('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admin-users'] });
      refetchAdminUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create admin', variant: 'destructive' });
    }
  };

  const toggleAdminActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/admin-users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ is_active: !isActive })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Failed to update admin');
      queryClient.setQueryData<AdminUserRow[] | undefined>(['/api/admin/admin-users'], (old) => {
        if (!old) return old;
        return old.map(a => a.id === id ? { ...a, is_active: !isActive } : a);
      });
      toast({ title: 'Updated', description: 'Admin status updated.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admin-users'] });
      refetchAdminUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update admin', variant: 'destructive' });
    }
  };

  const resetAdminPassword = async () => {
    if (!resetAdminOpen.id) return;
    if (!resetPasswordValue) {
      toast({ title: 'Missing password', description: 'Enter a new password.', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch(`/api/admin/admin-users/${resetAdminOpen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ password: resetPasswordValue })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Failed to reset password');
      toast({ title: 'Password Reset', description: 'Admin password updated.' });
      setResetAdminOpen({ open: false });
      setResetPasswordValue('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reset password', variant: 'destructive' });
    }
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (adminUser?.username === username) {
      toast({ title: 'Not allowed', description: 'You cannot delete the admin you are logged in as.', variant: 'destructive' });
      return;
    }
    if (!confirm('Are you sure you want to deactivate this admin account?')) return;
    try {
      const resp = await fetch(`/api/admin/admin-users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.message || 'Failed to delete admin');
      queryClient.setQueryData<AdminUserRow[] | undefined>(['/api/admin/admin-users'], (old) => {
        if (!old) return old;
        return old.map(a => a.id === id ? { ...a, is_active: false } : a);
      });
      toast({ title: 'Admin Deactivated', description: 'Admin account has been deactivated.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admin-users'] });
      refetchAdminUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete admin', variant: 'destructive' });
    }
  };

  // If no admin session, render loading or redirect (useEffect will handle redirect)
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Admin authentication is already handled by the useEffect and early return above

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      description: "from last month"
    },
    {
      title: "Active Businesses",
      value: stats?.totalVendors || 0,
      icon: Store,
      color: "text-ktu-orange",
      bgColor: "bg-orange-50",
      change: "+8%",
      description: "from last month"
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+25%",
      description: "from last month"
    },
    {
      title: "Platform Revenue",
      value: `₵${stats?.totalRevenue || 0}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+18%",
      description: "from last month"
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals || 0,
      icon: UserCheck,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      urgent: true
    },
    {
      title: "Active Programs",
      value: stats?.activePrograms || 0,
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Total Mentors",
      value: stats?.totalMentors || 0,
      icon: BookOpen,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      title: "Published Resources",
      value: stats?.publishedResources || 0,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },

  ];

  const quickActions = [
    {
      title: "Mentorship Hub",
      description: "Manage mentors and programs comprehensively",
      icon: BookOpen,
      color: "bg-ktu-orange",
      action: "/admin/mentorship"
    },
    {
      title: "Manage Quick Sales",
      description: "Create, finalize and remove auctions",
      icon: Target,
      color: "bg-red-500",
      action: "/admin/quick-sales"
    },
    {
      title: "Community Discussions",
      description: "Manage and moderate forum discussions",
      icon: MessageCircle,
      color: "bg-blue-600",
      action: "/admin/community/discussions"
    },
    {
      title: "Manage Resources",
      description: "Add and organize business resources",
      icon: FileText,
      color: "bg-purple-600",
      action: "/admin/resources"
    },

  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-ktu-grey py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ktu-grey py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ktu-deep-blue mb-2">
                KTU BizConnect Admin Dashboard
              </h1>
              <p className="text-ktu-dark-grey">
                Complete system oversight and management for the KTU entrepreneurship platform
              </p>
            </div>
            <div className="flex space-x-4">
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Card className={`relative overflow-hidden ${card.urgent ? 'ring-2 ring-yellow-400' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                    {card.title}
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </span>
                    {card.change && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          {card.change}
                        </span>
                        {card.description && (
                          <span className="text-xs text-gray-500">
                            {card.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-ktu-deep-blue">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={action.title} to={action.action}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-ktu-orange cursor-pointer transition-colors"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-ktu-deep-blue mb-1">{action.title}</h3>
                      <p className="text-sm text-ktu-dark-grey">{action.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Management Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="businesses">Manage Businesses</TabsTrigger>
              <TabsTrigger value="users">Manage Users</TabsTrigger>
              <TabsTrigger value="admins">Manage Admins</TabsTrigger>
            </TabsList>

            

            <TabsContent value="businesses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-ktu-deep-blue">Student Businesses Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businesses.map((business) => (
                      <div key={business.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{business.business_name}</h3>
                          <p className="text-sm text-gray-500">{business.full_name} • {business.email}</p>
                          <p className="text-xs text-gray-400">
                            {business.total_products} products • ₵{business.total_sales} sales
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={business.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {business.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                          {!business.is_approved && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleBusinessApproval(business.id, true)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleBusinessApproval(business.id, false)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBusinessView(business.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteBusiness(business.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-ktu-deep-blue">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {user.role}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant={user.is_approved ? "destructive" : "default"}
                            onClick={() => handleUserStatusToggle(user.id, user.is_approved)}
                          >
                            {user.is_approved ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUserView(user.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-ktu-deep-blue">Admin Management</CardTitle>
                  <Button onClick={() => setCreateAdminOpen(true)} className="bg-ktu-orange hover:bg-orange-600 text-white" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Admin
                  </Button>
                </CardHeader>
                <CardContent>
                  {adminUsersLoading ? (
                    <p className="text-sm text-gray-500">Loading admins...</p>
                  ) : (
                    <div className="space-y-4">
                      {adminUsers.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{a.full_name} <span className="text-xs text-gray-500">(@{a.username})</span></h3>
                            <p className="text-sm text-gray-600">{a.email}</p>
                            <p className="text-xs text-gray-500">Joined {new Date(a.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={a.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {a.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              size="sm"
                              variant={a.is_active ? 'destructive' : 'default'}
                              onClick={() => toggleAdminActive(a.id, a.is_active)}
                            >
                              {a.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setResetAdminOpen({ open: true, id: a.id })}
                            >
                              Reset Password
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={adminUser?.username === a.username}
                              title={adminUser?.username === a.username ? 'Cannot delete the currently logged-in admin' : 'Deactivate admin account'}
                              onClick={() => handleDeleteAdmin(a.id, a.username)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {adminUsers.length === 0 && (
                        <p className="text-sm text-gray-500">No admin accounts yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create Admin Modal */}
              <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-ktu-deep-blue">Create Admin</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Username</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Full Name</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={newAdminFullName} onChange={(e) => setNewAdminFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <input type="email" className="mt-1 w-full border rounded px-3 py-2" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Password</label>
                      <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Confirm Password</label>
                      <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={confirmAdminPassword} onChange={(e) => setConfirmAdminPassword(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setCreateAdminOpen(false)}>Cancel</Button>
                      <Button className="bg-ktu-orange hover:bg-orange-600 text-white" onClick={createAdmin}>Create</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Reset Admin Password Modal */}
              <Dialog open={resetAdminOpen.open} onOpenChange={(o) => setResetAdminOpen({ open: o })}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-ktu-deep-blue">Reset Admin Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">New Password</label>
                      <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={resetPasswordValue} onChange={(e) => setResetPasswordValue(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setResetAdminOpen({ open: false })}>Cancel</Button>
                      <Button className="bg-ktu-orange hover:bg-orange-600 text-white" onClick={resetAdminPassword}>Update</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* View Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-ktu-deep-blue">
              {modalType === 'business' ? 'Business Details' : modalType === 'user' ? 'User Details' : 'Admin Details'}
              {modalType === 'business' ? 'Business Details' : 'User Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && modalType === 'business' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedItem.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Owner</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedItem.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedItem.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={selectedItem.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedItem.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Products</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedItem.total_products}</p>
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-gray-900">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {selectedItem && modalType === 'user' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedItem.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedItem.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <Badge className={
                    selectedItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                    selectedItem.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedItem.role}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={selectedItem.is_approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedItem.is_approved ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-gray-900">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}