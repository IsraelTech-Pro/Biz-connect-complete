import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Phone, Mail, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
import type { InsertSupportRequest } from '@shared/schema';

const supportSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type SupportForm = z.infer<typeof supportSchema>;

const faqData = [
  {
    question: "How do I start my business on KTU BizConnect?",
    answer: "As a KTU student, you can register your business by creating an account and setting up your store profile. Upload your products and start selling to the KTU community."
  },
  {
    question: "What payment methods are available?",
    answer: "We support Mobile Money (MTN, Vodafone, AirtelTigo) for convenient transactions within the university community."
  },
  {
    question: "How do I contact a student entrepreneur?",
    answer: "You can reach out to student businesses through their store pages or contact them directly using the information provided on their business profiles."
  },
  {
    question: "Is this platform only for KTU students?",
    answer: "KTU BizConnect is primarily designed for KTU students and the university community, but we welcome all users who want to support student entrepreneurship."
  },
  {
    question: "How can I get mentorship for my business?",
    answer: "Visit our Mentorship Hub to connect with experienced mentors who can guide your entrepreneurial journey at KTU."
  }
];

export default function CustomerSupport() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
  });

  const supportMutation = useMutation({
    mutationFn: async (data: InsertSupportRequest) => {
      return await apiRequest('/api/support-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Support request sent!",
        description: "We'll get back to you within 4-6 hours.",
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

  const onSubmit = (data: SupportForm) => {
    supportMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              KTU BizConnect <span className="text-gradient">Support</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Need help with your student business or have questions about our platform? We're here to support the KTU entrepreneurial community.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Contact */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Quick Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone Support</h4>
                    <p className="text-sm text-gray-600 mb-1">+233 XX XXX XXXX</p>
                    <Badge variant="secondary" className="text-xs">
                      Mon-Fri: 8:00 AM - 6:00 PM
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-1">support@ktubizconnect.com</p>
                    <Badge variant="secondary" className="text-xs">
                      Response: 24-48 hours
                    </Badge>
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory('business')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === 'business' 
                        ? 'bg-orange-50 border-l-4 border-orange-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Business Setup</div>
                    <div className="text-sm text-gray-600">Store creation, product listings</div>
                  </button>

                  <button
                    onClick={() => setSelectedCategory('payment')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === 'payment' 
                        ? 'bg-orange-50 border-l-4 border-orange-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Payment & Mobile Money</div>
                    <div className="text-sm text-gray-600">Transaction issues, payouts</div>
                  </button>

                  <button
                    onClick={() => setSelectedCategory('mentorship')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === 'mentorship' 
                        ? 'bg-orange-50 border-l-4 border-orange-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Mentorship & Resources</div>
                    <div className="text-sm text-gray-600">Business guidance, learning materials</div>
                  </button>

                  <button
                    onClick={() => setSelectedCategory('general')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === 'general' 
                        ? 'bg-orange-50 border-l-4 border-orange-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">General Questions</div>
                    <div className="text-sm text-gray-600">Account, platform, other</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            

            {/* FAQ Section */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
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

            {/* Platform Status */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Platform Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Student Businesses</div>
                      <div className="text-sm text-gray-600">All stores operational</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Mentorship Hub</div>
                      <div className="text-sm text-gray-600">Mentors available</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-sm text-gray-600">All networks available</div>
                    </div>
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