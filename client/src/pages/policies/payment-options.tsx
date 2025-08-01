import { Smartphone, CreditCard, Shield, CheckCircle, Users, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const paymentMethods = [
  {
    name: "MTN Mobile Money",
    icon: Smartphone,
    color: "bg-yellow-100 text-yellow-800",
    description: "Pay instantly with your MTN MoMo account",
    features: [
      "Instant payment processing",
      "No additional fees",
      "Available 24/7",
      "Secure PIN authentication"
    ],
    popularity: "Most Popular",
    instructions: "Select MTN MoMo at checkout, enter your phone number and PIN to complete payment."
  },
  {
    name: "Vodafone Cash",
    icon: Smartphone,
    color: "bg-red-100 text-red-800",
    description: "Quick and secure payments with Vodafone Cash",
    features: [
      "Fast payment processing",
      "PIN-based security",
      "Wide network coverage",
      "Real-time confirmations"
    ],
    popularity: "Popular",
    instructions: "Choose Vodafone Cash, enter your phone number and authorize the payment with your PIN."
  },
  {
    name: "AirtelTigo Money",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-800",
    description: "Pay easily with your AirtelTigo Money wallet",
    features: [
      "Convenient mobile payments",
      "Secure transactions",
      "Instant confirmations",
      "User-friendly interface"
    ],
    popularity: "Growing",
    instructions: "Select AirtelTigo Money, provide your phone number and complete payment with your PIN."
  },
  {
    name: "Visa/Mastercard",
    icon: CreditCard,
    color: "bg-purple-100 text-purple-800",
    description: "Pay with your debit or credit card",
    features: [
      "International card support",
      "3D Secure protection",
      "Instant payment processing",
      "Fraud protection"
    ],
    popularity: "Reliable",
    instructions: "Enter your card details at checkout. You may be asked to verify with your bank's 3D Secure system."
  }
];

const securityFeatures = [
  {
    icon: Shield,
    title: "PCI DSS Compliance",
    description: "All payments are processed through Paystack, which is PCI DSS compliant and meets the highest security standards."
  },
  {
    icon: Users,
    title: "Trusted by Thousands",
    description: "Over 10,000 customers trust VendorHub for their online shopping needs across Ghana."
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Our payment systems are monitored around the clock to ensure secure and reliable transactions."
  },
  {
    icon: Star,
    title: "5-Star Security",
    description: "Bank-level encryption and security measures protect your payment information at all times."
  }
];

const paymentProcess = [
  {
    step: 1,
    title: "Add to Cart",
    description: "Browse products and add your favorites to the shopping cart"
  },
  {
    step: 2,
    title: "Checkout",
    description: "Review your order and enter delivery information"
  },
  {
    step: 3,
    title: "Choose Payment",
    description: "Select your preferred payment method from the options"
  },
  {
    step: 4,
    title: "Complete Payment",
    description: "Follow the prompts to securely complete your payment"
  },
  {
    step: 5,
    title: "Order Confirmed",
    description: "Receive instant confirmation and track your order"
  }
];

export default function PaymentOptions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Payment <span className="text-gradient">Options</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We offer multiple secure payment methods to make your shopping experience convenient and safe. 
              All payments are processed through Paystack for maximum security.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Methods */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-black mb-4">Accepted Payment Methods</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the payment method that works best for you. All options are secure and processed instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {paymentMethods.map((method, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <method.icon className="w-6 h-6" />
                      {method.name}
                    </CardTitle>
                    <Badge className={method.color}>{method.popularity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {method.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold mb-1 text-sm">How to use:</h4>
                    <p className="text-sm text-gray-600">{method.instructions}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Process */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">How Payment Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our streamlined payment process makes checkout quick and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {paymentProcess.map((process, index) => (
              <div key={index} className="text-center">
                <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="font-semibold mb-2">{process.title}</h3>
                <p className="text-sm text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Payment Security</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your payment security is our top priority. We use industry-leading protection measures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment FAQ */}
        <div className="mb-16 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Payment FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Is my payment information secure?</h4>
                    <p className="text-sm text-gray-600">
                      Yes, all payments are processed through Paystack, which uses bank-level encryption 
                      and is PCI DSS compliant. We never store your payment information.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Are there any additional fees?</h4>
                    <p className="text-sm text-gray-600">
                      No, we don't charge any additional fees for payments. You only pay the product price and delivery fee.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What if my payment fails?</h4>
                    <p className="text-sm text-gray-600">
                      If your payment fails, you can try again or use a different payment method. 
                      Common reasons include insufficient funds or network issues.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How long does payment processing take?</h4>
                    <p className="text-sm text-gray-600">
                      Mobile Money payments are processed instantly. Card payments may take 1-2 minutes 
                      for verification, especially with 3D Secure authentication.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I get a refund?</h4>
                    <p className="text-sm text-gray-600">
                      Yes, refunds are processed to your original payment method. Mobile Money refunds 
                      are instant, while card refunds take 5-7 business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Do you accept international cards?</h4>
                    <p className="text-sm text-gray-600">
                      Yes, we accept international Visa and Mastercard. However, some banks may block 
                      international transactions, so check with your bank if payment fails.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Paystack Partnership */}
        <div className="bg-gray-50 rounded-lg p-8 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-black mb-4">Powered by Paystack</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We partner with Paystack, Africa's leading payment processor, to ensure your payments are 
            secure, fast, and reliable. Paystack is trusted by thousands of businesses across Africa.
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">256-bit</div>
              <div className="text-sm text-gray-600">SSL Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">PCI DSS</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}