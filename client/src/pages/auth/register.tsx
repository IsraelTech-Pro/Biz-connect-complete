import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'vendor',
    full_name: '',
    store_name: '',
    store_description: '',
    momo_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // KTU Student Email validation
    const ktuEmailRegex = /^[^\s@]+@ktu\.edu\.gh$/;
    if (!ktuEmailRegex.test(formData.email)) {
      toast({
        title: "Invalid KTU Student Email",
        description: "Only KTU students can register. Please use your official KTU email ending with @ktu.edu.gh",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        full_name: formData.full_name,
        ...(formData.role === 'vendor' && {
          business_name: formData.store_name,
          business_description: formData.store_description,
          momo_number: formData.momo_number
        })
      };

      await register(userData);
      toast({
        title: "Account Created!",
        description: "Welcome to KTU BizConnect!",
      });
      setLocation('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      
      // Check if it's an approval message (success but needs approval)
      if (errorMessage.includes('pending admin approval')) {
        toast({
          title: "Account Created Successfully!",
          description: errorMessage,
        });
        // Redirect to login page so they can try logging in later
        setLocation('/auth/login');
      } else {
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/bizconnect-logo.png" 
              alt="BizConnect Logo" 
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-ktu-deep-blue">Become a Seller</CardTitle>
          <p className="text-gray-600">Register as a seller - For KTU students only</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">KTU Student Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@ktu.edu.gh"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must be your official KTU email ending with @ktu.edu.gh</p>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                placeholder="Enter your store name"
                value={formData.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="store_description">Store Description</Label>
              <Textarea
                id="store_description"
                placeholder="Describe your store and products"
                value={formData.store_description}
                onChange={(e) => handleChange('store_description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="momo_number">MTN Mobile Money Number</Label>
              <Input
                id="momo_number"
                placeholder="024XXXXXXX"
                value={formData.momo_number}
                onChange={(e) => handleChange('momo_number', e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full btn-orange-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
