import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Settings, DollarSign, Calendar, Percent, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import type { PlatformSettings } from '@shared/schema';

export default function AdminSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    },
    enabled: !!token
  });

  const [formData, setFormData] = useState({
    commission_percentage: '',
    minimum_payout: '',
    auto_payout_threshold: '',
    payout_schedule: ''
  });

  // Update form data when settings are loaded
  useState(() => {
    if (settings) {
      setFormData({
        commission_percentage: settings.commission_percentage || '',
        minimum_payout: settings.minimum_payout || '',
        auto_payout_threshold: settings.auto_payout_threshold || '',
        payout_schedule: settings.payout_schedule || 'daily'
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<PlatformSettings>) => {
      return apiRequest('PUT', '/api/admin/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSettings = {
      commission_percentage: parseFloat(formData.commission_percentage),
      minimum_payout: parseFloat(formData.minimum_payout),
      auto_payout_threshold: parseFloat(formData.auto_payout_threshold),
      payout_schedule: formData.payout_schedule
    };

    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-bold text-black">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform-wide settings and policies</p>
        </div>

        <div className="space-y-6">
          {/* Commission & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Percent className="h-5 w-5" />
                <span>Commission & Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="commission_percentage">Platform Commission (%)</Label>
                  <Input
                    id="commission_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_percentage}
                    onChange={(e) => handleInputChange('commission_percentage', e.target.value)}
                    placeholder="5.00"
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Percentage of each transaction that goes to the platform
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minimum_payout">Minimum Payout Amount (₵)</Label>
                    <Input
                      id="minimum_payout"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minimum_payout}
                      onChange={(e) => handleInputChange('minimum_payout', e.target.value)}
                      placeholder="50.00"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Minimum amount required for vendor payout
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="auto_payout_threshold">Auto-payout Threshold (₵)</Label>
                    <Input
                      id="auto_payout_threshold"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.auto_payout_threshold}
                      onChange={(e) => handleInputChange('auto_payout_threshold', e.target.value)}
                      placeholder="500.00"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Automatic payout when vendor balance reaches this amount
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-orange-primary "
                  disabled={updateSettingsMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payout Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Payout Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payout_schedule">Payout Frequency</Label>
                  <Select
                    value={formData.payout_schedule}
                    onValueChange={(value) => handleInputChange('payout_schedule', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    How often automatic payouts are processed
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Payout Schedule Information</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Daily:</strong> Payouts processed every day at midnight</p>
                    <p><strong>Weekly:</strong> Payouts processed every Monday at midnight</p>
                    <p><strong>Monthly:</strong> Payouts processed on the 1st of each month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Platform Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Current Settings</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Commission:</strong> {settings?.commission_percentage || 0}%</p>
                    <p><strong>Min Payout:</strong> ₵{settings?.minimum_payout || 0}</p>
                    <p><strong>Auto Threshold:</strong> ₵{settings?.auto_payout_threshold || 0}</p>
                    <p><strong>Schedule:</strong> {settings?.payout_schedule || 'daily'}</p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Revenue Impact</h4>
                  <div className="text-sm text-orange-800 space-y-1">
                    <p>Commission changes will affect future transactions</p>
                    <p>Current pending payouts are not affected</p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Payout Impact</h4>
                  <div className="text-sm text-purple-800 space-y-1">
                    <p>Changes take effect immediately</p>
                    <p>Vendors will be notified of changes</p>
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
