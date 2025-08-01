import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Store, CheckCircle, Phone, MapPin, CreditCard } from 'lucide-react';

const vendorSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_description: z.string().min(20, 'Business description must be at least 20 characters'),
  momo_number: z.string().min(10, 'Mobile Money number must be at least 10 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VendorForm = z.infer<typeof vendorSchema>;

export default function VendorRegister() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm<VendorForm>({
    resolver: zodResolver(vendorSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: VendorForm) => {
      const { confirmPassword, ...vendorData } = data;
      return await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          ...vendorData,
          role: 'vendor',
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Your vendor application has been submitted for review. We'll notify you via email once approved.",
      });
      navigate('/auth/login');
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorForm) => {
    registerMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['full_name', 'email', 'password', 'confirmPassword'] as const;
      case 2:
        return ['phone', 'address', 'momo_number'] as const;
      case 3:
        return ['business_name', 'business_description'] as const;
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Account Information</h3>
              <p className="text-gray-600">Create your vendor account credentials</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email address"
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Create a strong password"
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm your password"
                  className="mt-1"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Contact & Payment</h3>
              <p className="text-gray-600">Provide your contact details and payment information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+233 24 123 4567"
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Enter your business address"
                  className="mt-1"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="momo_number">Mobile Money Number</Label>
                <Input
                  id="momo_number"
                  {...register('momo_number')}
                  placeholder="0241234567"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This number will be used for payment transfers
                </p>
                {errors.momo_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.momo_number.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Business Information</h3>
              <p className="text-gray-600">Tell us about your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  {...register('business_name')}
                  placeholder="Enter your business name"
                  className="mt-1"
                />
                {errors.business_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="business_description">Business Description</Label>
                <Textarea
                  id="business_description"
                  {...register('business_description')}
                  placeholder="Describe your business, what you sell, and what makes you unique..."
                  className="mt-1"
                  rows={4}
                />
                {errors.business_description && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_description.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black">
            Become a <span className="text-gradient">Vendor</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Join our marketplace and start selling your products
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 mr-2"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 ml-2 bg-orange-600 hover:bg-orange-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 ml-2 bg-orange-600 hover:bg-orange-700"
                  >
                    {registerMutation.isPending ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}