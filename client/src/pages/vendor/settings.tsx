import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Save, Smartphone, Store, User, ArrowLeft, Upload, X, Image, Phone, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

export default function VendorSettings() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch fresh user data whenever this page loads
  const { data: freshUser } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Use fresh user data if available, otherwise fallback to context user
  const currentUser: any = freshUser || user;
  
  // Helper functions for phone number formatting
  const formatPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    // Remove any existing country code and spaces/dashes
    let cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Remove existing +233 if present
    if (cleaned.startsWith('233')) {
      cleaned = cleaned.substring(3);
    }
    
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Add +233 prefix
    return `+233${cleaned}`;
  };

  const displayPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    // If number starts with +233, display with leading 0
    if (phoneNumber.startsWith('+233')) {
      return '0' + phoneNumber.substring(4);
    }
    
    return phoneNumber;
  };

  const [formData, setFormData] = useState({
    business_name: currentUser?.business_name || '',
    business_description: currentUser?.business_description || '',
    momo_number: displayPhoneNumber(currentUser?.momo_number || ''),
    email: currentUser?.email || '',
    phone: displayPhoneNumber(currentUser?.phone || ''),
    whatsapp: displayPhoneNumber(currentUser?.whatsapp || ''),
    profile_picture: currentUser?.profile_picture || null,
    banner_url: currentUser?.banner_url || null
  });

  // Update form data when user data changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        business_name: currentUser.business_name || '',
        business_description: currentUser.business_description || '',
        momo_number: displayPhoneNumber(currentUser.momo_number || ''),
        email: currentUser.email || '',
        phone: displayPhoneNumber(currentUser.phone || ''),
        whatsapp: displayPhoneNumber(currentUser.whatsapp || ''),
        profile_picture: currentUser.profile_picture || null,
        banner_url: currentUser.banner_url || null
      });
    }
  }, [currentUser]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  // Handle JSONB format for images
  const [logoPreview, setLogoPreview] = useState<string | null>(
    currentUser?.profile_picture && typeof currentUser.profile_picture === 'object' && 'url' in currentUser.profile_picture
      ? currentUser.profile_picture.url as string
      : null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    currentUser?.banner_url && typeof currentUser.banner_url === 'object' && 'url' in currentUser.banner_url
      ? currentUser.banner_url.url as string
      : null
  );

  // Update image previews when user data changes
  useEffect(() => {
    if (currentUser) {
      setLogoPreview(
        currentUser.profile_picture && typeof currentUser.profile_picture === 'object' && 'url' in currentUser.profile_picture
          ? currentUser.profile_picture.url as string
          : null
      );
      setBannerPreview(
        currentUser.banner_url && typeof currentUser.banner_url === 'object' && 'url' in currentUser.banner_url
          ? currentUser.banner_url.url as string
          : null
      );
    }
  }, [currentUser]);
  const [isUploading, setIsUploading] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending update request with data:', data);
      if (!currentUser?.id) {
        throw new Error('User ID not found');
      }
      const response = await apiRequest(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        body: data,
      });
      console.log('Update response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      // Force refresh of user data and update form state
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
      
      // Update form data with the latest response (display phone numbers without country code)
      setFormData({
        business_name: data.business_name || '',
        business_description: data.business_description || '',
        momo_number: displayPhoneNumber(data.momo_number || ''),
        email: data.email || '',
        phone: displayPhoneNumber(data.phone || ''),
        whatsapp: displayPhoneNumber(data.whatsapp || ''),
        profile_picture: data.profile_picture || null,
        banner_url: data.banner_url || null
      });
      
      setLogoFile(null);
      setBannerFile(null);
      toast({
        title: "Contact Information Updated",
        description: "Your contact information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update contact information. Please try again.",
        variant: "destructive"
      });
    }
  });

  const uploadImage = async (file: File, type: 'logo' | 'banner'): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file); // Changed from 'images' to 'image'

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.url; // Changed from result.urls[0] to result.url
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let updatedData = { ...formData };
      
      // Format phone numbers with +233 country code before saving
      if (updatedData.phone) {
        updatedData.phone = formatPhoneNumber(updatedData.phone);
      }
      if (updatedData.whatsapp) {
        updatedData.whatsapp = formatPhoneNumber(updatedData.whatsapp);
      }
      if (updatedData.momo_number) {
        updatedData.momo_number = formatPhoneNumber(updatedData.momo_number);
      }
      
      console.log('Submitting form data:', updatedData);
      console.log('Logo file:', logoFile);
      console.log('Banner file:', bannerFile);

      // Upload logo if a new file was selected
      if (logoFile) {
        console.log('Uploading logo...');
        const logoUrl = await uploadImage(logoFile, 'logo');
        console.log('Logo uploaded:', logoUrl);
        updatedData.profile_picture = {
          url: logoUrl,
          alt: 'Store logo',
          primary: true
        };
      } else if (currentUser?.profile_picture) {
        // Preserve existing logo if no new file was uploaded
        updatedData.profile_picture = currentUser.profile_picture;
      }

      // Upload banner if a new file was selected
      if (bannerFile) {
        console.log('Uploading banner...');
        const bannerUrl = await uploadImage(bannerFile, 'banner');
        console.log('Banner uploaded:', bannerUrl);
        updatedData.banner_url = {
          url: bannerUrl,
          alt: 'Store banner',
          primary: true
        };
      } else if (currentUser?.banner_url) {
        // Preserve existing banner if no new file was uploaded
        updatedData.banner_url = currentUser.banner_url;
      }

      console.log('Final updated data:', updatedData);
      updateProfileMutation.mutate(updatedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneInputChange = (field: string, value: string) => {
    // Store the display value (with 0 prefix for user input)
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // This will set the profile_picture to null in the next update
    if (currentUser?.id) {
      updateProfileMutation.mutate({
        ...formData,
        profile_picture: null
      });
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    // This will set the banner_url to null in the next update
    if (currentUser?.id) {
      updateProfileMutation.mutate({
        ...formData,
        banner_url: null
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-6">
            <Link href="/vendor/dashboard">
              <Button variant="outline" className="text-gray-600 hover:text-gray-900 border-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-black">Student Business Settings</h1>
          <p className="text-gray-600 mt-2">Manage your student business information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>Student Business Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Enter your student business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_description">Business Description</Label>
                  <Textarea
                    id="business_description"
                    value={formData.business_description}
                    onChange={(e) => handleInputChange('business_description', e.target.value)}
                    placeholder="Describe your student business and what you offer to fellow students"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Store Logo Upload */}
                  <div>
                    <Label htmlFor="store_logo">Business Logo</Label>
                    <div className="mt-2">
                      {logoPreview ? (
                        <div className="relative">
                          <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img 
                              src={logoPreview} 
                              alt="Business logo preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                            onClick={removeLogo}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="mt-2 text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('store_logo')?.click()}
                              className="text-xs"
                            >
                              Change Logo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <input
                            id="store_logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <label htmlFor="store_logo" className="cursor-pointer flex flex-col items-center">
                            <Image className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Upload Logo</span>
                          </label>
                        </div>
                      )}
                      <input
                        id="store_logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 200x200px, PNG or JPG
                      </p>
                    </div>
                  </div>

                  {/* Store Banner Upload */}
                  <div>
                    <Label htmlFor="store_banner">Business Banner</Label>
                    <div className="mt-2">
                      {bannerPreview ? (
                        <div className="relative">
                          <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img 
                              src={bannerPreview} 
                              alt="Business banner preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                            onClick={removeBanner}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="mt-2 text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('store_banner')?.click()}
                              className="text-xs"
                            >
                              Change Banner
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <input
                            id="store_banner"
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                          <label htmlFor="store_banner" className="cursor-pointer flex flex-col items-center">
                            <Image className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Upload Banner</span>
                          </label>
                        </div>
                      )}
                      <input
                        id="store_banner"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 1200x300px, PNG or JPG
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-orange-primary"
                  disabled={updateProfileMutation.isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : updateProfileMutation.isPending ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Your email address for business communication and account notifications
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={displayPhoneNumber(formData.phone)}
                    onChange={(e) => handlePhoneInputChange('phone', e.target.value)}
                    placeholder="024XXXXXXX"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Your primary contact number for student business communication (will be saved as +233XXXXXXX)
                  </p>
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span>WhatsApp Number</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    value={displayPhoneNumber(formData.whatsapp)}
                    onChange={(e) => handlePhoneInputChange('whatsapp', e.target.value)}
                    placeholder="024XXXXXXX"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    WhatsApp number for student customer support and inquiries (will be saved as +233XXXXXXX)
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Make sure this number is registered with WhatsApp. Fellow students will use this number to contact you directly through WhatsApp for support and inquiries about your business.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Contact Information</p>
                      <p className="text-sm text-green-800 mt-1">
                        Keep your contact information up to date so fellow students can reach you easily. Email is required for account notifications, while phone and WhatsApp numbers are optional but recommended for your student business.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-orange-primary w-full"
                  disabled={updateProfileMutation.isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading Images...
                    </>
                  ) : updateProfileMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating Contact Information...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Contact Information
                    </>
                  )}
                </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black">Student Business Status</p>
                    <p className="text-sm text-gray-600">
                      Your student business account approval status
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${currentUser?.is_approved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${currentUser?.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                      {currentUser?.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>

                {!currentUser?.is_approved && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Your student business account is pending approval. You'll be able to start selling to fellow students once an admin approves your account.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black">Account Type</p>
                    <p className="text-sm text-gray-600">Student Business Account</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-600">
                      {currentUser?.role?.charAt(0).toUpperCase() + currentUser?.role?.slice(1) || 'Student Business Owner'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
