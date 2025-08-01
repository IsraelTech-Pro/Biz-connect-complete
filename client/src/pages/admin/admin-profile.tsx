import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Phone, MapPin, Save } from "lucide-react";
import { Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  bio?: string;
  created_at: string;
}

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    bio: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin profile
  const { data: adminUser, isLoading } = useQuery<AdminUser>({
    queryKey: ['/api/admin/profile'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin profile');
      }
      
      return response.json();
    }
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    }
  });

  // Initialize form data when admin user loads
  useEffect(() => {
    if (adminUser) {
      setFormData({
        username: adminUser.username || '',
        email: adminUser.email || '',
        full_name: adminUser.full_name || '',
        phone: adminUser.phone || '',
        bio: adminUser.bio || ''
      });
    }
  }, [adminUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (adminUser) {
      setFormData({
        username: adminUser.username || '',
        email: adminUser.email || '',
        full_name: adminUser.full_name || '',
        phone: adminUser.phone || '',
        bio: adminUser.bio || ''
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                <p className="text-sm text-gray-500">Manage your administrator account settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>{adminUser?.full_name || adminUser?.username}</CardTitle>
                <CardDescription>Administrator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{adminUser?.email}</span>
                  </div>
                  {adminUser?.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{adminUser.phone}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Admin since: {adminUser?.created_at ? new Date(adminUser.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account details and preferences</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}