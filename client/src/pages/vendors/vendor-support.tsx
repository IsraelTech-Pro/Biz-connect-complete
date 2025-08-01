import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Phone, Mail, MessageCircle, Clock, Store, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import type { InsertVendorSupportRequest } from '@shared/schema';

const supportSchema = z.object({
  vendor_email: z.string().email('Please enter a valid email address'),
  store_name: z.string().min(2, 'Store name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type VendorSupportForm = z.infer<typeof supportSchema>;

const supportCategories = [
  { value: 'account', label: 'Account Issues' },
  { value: 'products', label: 'Product Management' },
  { value: 'orders', label: 'Order Management' },
  { value: 'payouts', label: 'Payouts & Payments' },
  { value: 'marketing', label: 'Marketing & Promotion' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'policies', label: 'Policies & Guidelines' },
  { value: 'other', label: 'Other' }
];

const quickHelp = [
  {
    icon: Store,
    title: "Store Setup",
    description: "Get help setting up your store, adding products, and customizing your profile.",
    category: "account"
  },
  {
    icon: TrendingUp,
    title: "Boost Sales",
    description: "Learn strategies to increase visibility and drive more sales to your store.",
    category: "marketing"
  },
  {
    icon: CreditCard,
    title: "Payout Issues",
    description: "Resolve payment delays, update payout methods, or track your earnings.",
    category: "payouts"
  },
  {
    icon: AlertCircle,
    title: "Account Status",
    description: "Questions about account suspension, violations, or policy compliance.",
    category: "policies"
  }
];

const faqData = [
  {
    question: "How do I add products to my store?",
    answer: "Go to your vendor dashboard and click 'Add Product'. Fill in the product details, upload images, and set your price. Products are live immediately after submission."
  },
  {
    question: "Why is my payout delayed?",
    answer: "Payouts are processed 24-48 hours after order completion. Check that your Mobile Money details are correct and your account is active. Contact support if delays persist."
  },
  {
    question: "How can I increase my sales?",
    answer: "Use high-quality product images, competitive pricing, accurate descriptions, and fast shipping. Respond quickly to customer inquiries and maintain good ratings."
  },
  {
    question: "What are the commission rates?",
    answer: "VendorHub charges 5% commission on successful sales. There are no setup fees, monthly charges, or additional payout fees for Mobile Money transfers."
  },
  {
    question: "How do I handle returns?",
    answer: "Follow our return policy guidelines. Communicate with customers to resolve issues. If you need mediation, contact support with order details and evidence."
  },
  {
    question: "Can I update my store information?",
    answer: "Yes, you can update your store name, description, contact details, and payout information anytime from your vendor dashboard settings."
  }
];

export default function VendorSupport() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<VendorSupportForm>({
    resolver: zodResolver(supportSchema),
  });

  const supportMutation = useMutation({
    mutationFn: async (data: InsertVendorSupportRequest) => {
      return await apiRequest('/api/vendor-support-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Support request sent!",
        description: "We'll get back to you within 4-6 hours via email.",
      });
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorSupportForm) => {
    supportMutation.mutate(data);
  };

  const handleQuickHelp = (category: string) => {
    setSelectedCategory(category);
    setValue('category', category);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Vendor <span className="text-gradient">Support</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Get dedicated support to help you succeed on VendorHub. Our team is here to assist with store management, sales growth, and technical issues.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Contact */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Vendor Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Priority Support</h4>
                    <p className="text-sm text-gray-600 mb-1">+233 XX XXX XXXX</p>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      Vendors Only
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-1">vendors@vendorhub.com</p>
                    <Badge variant="secondary" className="text-xs">
                      Response: 2-4 hours
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Business Hours</h4>
                    <p className="text-sm text-gray-600">
                      Monday - Friday: 8:00 AM - 8:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickHelp.map((help, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickHelp(help.category)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCategory === help.category
                          ? 'bg-orange-50 border-l-4 border-orange-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <help.icon className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{help.title}</div>
                          <div className="text-sm text-gray-600">{help.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Support Form */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Get Vendor Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Vendor Email *
                      </label>
                      <Input
                        {...register('vendor_email')}
                        type="email"
                        placeholder="Enter your registered email"
                        className={errors.vendor_email ? 'border-red-500' : ''}
                      />
                      {errors.vendor_email && (
                        <p className="text-red-500 text-sm mt-1">{errors.vendor_email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Store Name *
                      </label>
                      <Input
                        {...register('store_name')}
                        placeholder="Enter your store name"
                        className={errors.store_name ? 'border-red-500' : ''}
                      />
                      {errors.store_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.store_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Issue Category *
                    </label>
                    <select
                      {...register('category')}
                      className={`w-full p-2 border rounded-md bg-white ${
                        errors.category ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select a category</option>
                      {supportCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      {...register('message')}
                      placeholder="Describe your issue in detail. Include relevant order numbers, product IDs, or specific error messages..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Priority Support</h4>
                        <p className="text-sm text-blue-700">
                          As a vendor, you'll receive priority support with faster response times. 
                          We typically respond within 2-4 hours during business hours.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={supportMutation.isPending}
                    className="w-full gradient-bg text-white"
                  >
                    {supportMutation.isPending ? 'Sending...' : 'Send Support Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Vendor FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqData.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold mb-2">{faq.question}</h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Documentation</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <a href="/vendor-guidelines" className="text-orange-500 hover:text-orange-600">
                          Vendor Guidelines
                        </a>
                      </li>
                      <li>
                        <a href="/payout-information" className="text-orange-500 hover:text-orange-600">
                          Payout Information
                        </a>
                      </li>
                      <li>
                        <a href="/sell-on-vendorhub" className="text-orange-500 hover:text-orange-600">
                          Getting Started Guide
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Dashboard Links</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <a href="/vendor/dashboard" className="text-orange-500 hover:text-orange-600">
                          Vendor Dashboard
                        </a>
                      </li>
                      <li>
                        <a href="/vendor/products" className="text-orange-500 hover:text-orange-600">
                          Manage Products
                        </a>
                      </li>
                      <li>
                        <a href="/vendor/orders" className="text-orange-500 hover:text-orange-600">
                          View Orders
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}