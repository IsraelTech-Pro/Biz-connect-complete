import { Store, TrendingUp, Shield, Users, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

const benefits = [
  {
    icon: Store,
    title: "Your Own Store",
    description: "Create your personalized online store with custom branding, product showcase, and customer management."
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Reach thousands of customers across Ghana and scale your business with our marketing tools."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Accept payments through Paystack with MTN Mobile Money, Visa, Mastercard, and more."
  },
  {
    icon: Users,
    title: "Customer Support",
    description: "Get dedicated support to help you succeed on our platform with 24/7 assistance."
  }
];

const features = [
  "Easy product listing and inventory management",
  "Real-time sales analytics and reporting",
  "Automated order processing and notifications",
  "Mobile-friendly vendor dashboard",
  "Marketing tools to promote your products",
  "Customer review and rating system",
  "Bulk product upload capabilities",
  "Order fulfillment tracking"
];

const faqData = [
  {
    question: "How much does it cost to sell on VendorHub?",
    answer: "It's free to create your store! We only charge a small commission (5%) on successful sales to help maintain the platform and provide support."
  },
  {
    question: "How do I get paid?",
    answer: "Payments are processed automatically through Paystack and sent directly to your MTN Mobile Money account. You'll receive payments within 24-48 hours of order completion."
  },
  {
    question: "What products can I sell?",
    answer: "You can sell almost anything legal - electronics, fashion, home goods, crafts, and more. We have guidelines to ensure quality and safety for all customers."
  },
  {
    question: "How long does approval take?",
    answer: "Most vendor applications are reviewed within 24-48 hours. We'll notify you via email once your store is approved and ready to go live."
  },
  {
    question: "Do I need technical skills?",
    answer: "Not at all! Our platform is designed to be user-friendly. You can set up your store, add products, and start selling within minutes."
  }
];

const steps = [
  {
    number: 1,
    title: "Sign Up",
    description: "Create your vendor account with basic business information"
  },
  {
    number: 2,
    title: "Get Approved",
    description: "Our team reviews your application (usually within 24-48 hours)"
  },
  {
    number: 3,
    title: "Set Up Store",
    description: "Customize your store and add your first products"
  },
  {
    number: 4,
    title: "Start Selling",
    description: "Go live and start receiving orders from customers"
  }
];

export default function SellOnVendorHub() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              Start Selling on <span className="text-gradient">VendorHub</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join thousands of successful vendors and grow your business with Ghana's leading online marketplace. 
              Set up your store today and start reaching customers nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link href="/auth/register">
                <Button className="gradient-bg text-white px-8 py-3 text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  Start Selling Now
                </Button>
              </Link>
              <Button variant="outline" className="border-orange-500 text-orange-500 px-8 py-3 text-lg hover:bg-orange-50">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-black mb-4">Why Choose VendorHub?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide everything you need to succeed online, from store setup to customer support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in 4 simple steps and start selling within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-black mb-6">Powerful Features</h2>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-scale-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment & Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Mobile Money Payments</div>
                      <div className="text-sm text-gray-600">Direct payouts to MTN, Vodafone, AirtelTigo</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-medium">Secure Transactions</div>
                      <div className="text-sm text-gray-600">Powered by Paystack for secure payments</div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">5%</div>
                    <div className="text-sm text-gray-600">Commission on successful sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about selling on VendorHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqData.map((faq, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 py-12 bg-gray-50 rounded-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-black mb-4">Ready to Start Selling?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of successful vendors already growing their businesses on VendorHub. 
            It's free to get started and you can be selling within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="gradient-bg text-white px-8 py-3 text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Create Your Store
              </Button>
            </Link>
            <Link href="/vendor-guidelines">
              <Button variant="outline" className="border-orange-500 text-orange-500 px-8 py-3 text-lg hover:bg-orange-50">
                View Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}