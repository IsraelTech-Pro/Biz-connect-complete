import { Smartphone, CreditCard, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

const payoutMethods = [
  {
    name: "MTN Mobile Money",
    icon: Smartphone,
    color: "bg-yellow-100 text-yellow-800",
    description: "Direct payouts to your MTN MoMo account",
    processingTime: "1-2 hours",
    minimumAmount: "GHS 10",
    supported: true
  },
  {
    name: "Vodafone Cash",
    icon: Smartphone,
    color: "bg-red-100 text-red-800",
    description: "Direct payouts to your Vodafone Cash account",
    processingTime: "1-2 hours",
    minimumAmount: "GHS 10",
    supported: true
  },
  {
    name: "AirtelTigo Money",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-800",
    description: "Direct payouts to your AirtelTigo Money account",
    processingTime: "1-2 hours",
    minimumAmount: "GHS 10",
    supported: true
  },
  {
    name: "Bank Transfer",
    icon: CreditCard,
    color: "bg-green-100 text-green-800",
    description: "Direct bank transfers to your account",
    processingTime: "1-3 business days",
    minimumAmount: "GHS 50",
    supported: false
  }
];

const payoutSchedule = [
  {
    day: "Monday",
    description: "Weekend sales processed",
    time: "9:00 AM - 12:00 PM"
  },
  {
    day: "Tuesday",
    description: "Monday sales processed",
    time: "9:00 AM - 12:00 PM"
  },
  {
    day: "Wednesday",
    description: "Tuesday sales processed",
    time: "9:00 AM - 12:00 PM"
  },
  {
    day: "Thursday",
    description: "Wednesday sales processed",
    time: "9:00 AM - 12:00 PM"
  },
  {
    day: "Friday",
    description: "Thursday sales processed",
    time: "9:00 AM - 12:00 PM"
  }
];

const faqData = [
  {
    question: "When do I get paid?",
    answer: "Payouts are processed automatically 24-48 hours after order completion. We process payouts Monday through Friday during business hours."
  },
  {
    question: "What's the minimum payout amount?",
    answer: "The minimum payout amount is GHS 10 for Mobile Money and GHS 50 for bank transfers. If your earnings are below this threshold, they'll be carried over to the next payout."
  },
  {
    question: "Are there any fees?",
    answer: "VendorHub charges a 5% commission on each sale. There are no additional payout fees for Mobile Money transactions. Standard network charges may apply."
  },
  {
    question: "What if my payout fails?",
    answer: "If a payout fails, we'll retry automatically. Common reasons include incorrect phone numbers or inactive accounts. Check your payout settings and contact support if issues persist."
  },
  {
    question: "Can I change my payout method?",
    answer: "Yes, you can update your payout method anytime in your vendor dashboard. Changes take effect for the next payout cycle."
  },
  {
    question: "How can I track my earnings?",
    answer: "Your vendor dashboard shows real-time earnings, payout history, and upcoming payouts. You'll also receive SMS notifications for each payout."
  }
];

export default function PayoutInformation() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Payout <span className="text-gradient">Information</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Learn how vendor payouts work on VendorHub. Get paid quickly and securely through MTN Mobile Money and other supported methods.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payout Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center animate-scale-in">
            <CardContent className="p-6">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Payouts</h3>
              <p className="text-gray-600 text-sm mb-2">
                Get paid within 24-48 hours after order completion
              </p>
              <Badge className="bg-green-100 text-green-800">Automated</Badge>
            </CardContent>
          </Card>

          <Card className="text-center animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Low Fees</h3>
              <p className="text-gray-600 text-sm mb-2">
                Only 5% commission on successful sales
              </p>
              <Badge className="bg-blue-100 text-blue-800">Transparent</Badge>
            </CardContent>
          </Card>

          <Card className="text-center animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm mb-2">
                Monitor your earnings and payout history
              </p>
              <Badge className="bg-orange-100 text-orange-800">Dashboard</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Payout Methods */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Payout Methods</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose your preferred payout method. All methods are secure and processed through Paystack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payoutMethods.map((method, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <method.icon className="w-5 h-5" />
                      {method.name}
                    </div>
                    {method.supported ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Badge variant="secondary">Coming Soon</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing Time:</span>
                      <span className="font-medium">{method.processingTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Minimum Amount:</span>
                      <span className="font-medium">{method.minimumAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How Payouts Work */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">How Payouts Work</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Understanding the payout process helps you manage your cash flow effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Order Completed</h3>
              <p className="text-sm text-gray-600">
                Customer confirms delivery or 7 days pass since delivery
              </p>
            </div>

            <div className="text-center">
              <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Earnings Calculated</h3>
              <p className="text-sm text-gray-600">
                Sale amount minus 5% commission is added to your balance
              </p>
            </div>

            <div className="text-center">
              <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Payout Scheduled</h3>
              <p className="text-sm text-gray-600">
                Payout is queued for the next business day processing
              </p>
            </div>

            <div className="text-center">
              <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Money Sent</h3>
              <p className="text-sm text-gray-600">
                Funds are transferred to your Mobile Money account
              </p>
            </div>
          </div>
        </div>

        {/* Payout Schedule */}
        <div className="mb-16 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Payout Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Payouts are processed Monday through Friday during business hours. Weekend sales are processed on Monday.
              </p>
              <div className="space-y-3">
                {payoutSchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{schedule.day}</div>
                      <div className="text-sm text-gray-600">{schedule.description}</div>
                    </div>
                    <div className="text-sm text-gray-600">{schedule.time}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Important Notes</h4>
                    <p className="text-sm text-blue-700">
                      Payouts are not processed on weekends or public holidays. 
                      All times are in GMT (Ghana Mean Time).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure */}
        <div className="mb-16 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">How Commission Works</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">5% commission on all successful sales</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">No setup fees or monthly charges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">No additional payout fees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Commission only on completed orders</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Example Calculation</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Product Price:</span>
                        <span className="font-medium">GHS 100.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission (5%):</span>
                        <span className="font-medium text-red-600">- GHS 5.00</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Your Earnings:</span>
                        <span className="font-semibold text-green-600">GHS 95.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about vendor payouts.
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

        {/* Support */}
        <div className="text-center bg-gray-50 rounded-lg p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-black mb-4">Need Help with Payouts?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is available to help you with any payout-related questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor-support">
              <Button className="gradient-bg text-white px-6 py-2">
                Contact Support
              </Button>
            </Link>
            <Link href="/vendor/dashboard">
              <Button variant="outline" className="border-orange-500 text-orange-500 px-6 py-2">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}