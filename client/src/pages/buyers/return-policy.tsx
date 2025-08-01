import { RefreshCw, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Return <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. Learn about our return process and policies.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Overview */}
        <Card className="mb-8 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Return Policy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">7-Day Return Window</h3>
                <p className="text-sm text-gray-600">
                  Return items within 7 days of delivery
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Easy Process</h3>
                <p className="text-sm text-gray-600">
                  Simple online return request system
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Full Refund</h3>
                <p className="text-sm text-gray-600">
                  Get your money back within 5-7 business days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Window */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Return Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-orange-100 text-orange-800">7 Days</Badge>
                <div>
                  <h4 className="font-semibold mb-2">Standard Return Period</h4>
                  <p className="text-gray-600">
                    You have 7 days from the date of delivery to initiate a return. The return window starts 
                    from the day your order is marked as "Delivered" in our system.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Important Note</h4>
                    <p className="text-sm text-yellow-700">
                      Returns must be initiated within the 7-day window. After this period, we cannot 
                      accept returns unless the item is defective or damaged.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions for Return */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Return Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">✓ Items We Accept for Return</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    Items in original, unused condition
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    Items with all original packaging and tags
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    Electronics with all accessories and manuals
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    Clothing items that haven't been worn or washed
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-red-600">✗ Items We Cannot Accept</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    Personal hygiene items (underwear, swimwear, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    Perishable goods (food, flowers, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    Customized or personalized items
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    Items damaged due to misuse or normal wear
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Request a Return */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>How to Request a Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="btn-orange-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Contact Customer Support</h4>
                  <p className="text-sm text-gray-600">
                    Reach out to our support team via email or phone with your order number and reason for return.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="btn-orange-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Get Return Authorization</h4>
                  <p className="text-sm text-gray-600">
                    We'll review your request and provide a return authorization number and instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="btn-orange-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Package the Item</h4>
                  <p className="text-sm text-gray-600">
                    Pack the item securely in its original packaging with all accessories and documentation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="btn-orange-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Ship the Item</h4>
                  <p className="text-sm text-gray-600">
                    Send the item to the address provided by our support team. You're responsible for return shipping costs.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Timeline */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle>Refund Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">1-2 Business Days</h4>
                  <p className="text-sm text-gray-600">Processing time after we receive your return</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">5-7 Business Days</h4>
                  <p className="text-sm text-gray-600">Refund appears in your original payment method</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Refund Methods</h4>
                <p className="text-sm text-gray-700">
                  Refunds are processed to your original payment method. For MTN Mobile Money payments, 
                  refunds are sent directly to your Mobile Money account. For card payments, refunds 
                  appear on your card statement within 5-7 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Need Help with Returns?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Email us at support@vendorhub.com
                  </p>
                  <p className="text-xs text-gray-500">
                    Response time: 4-6 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone Support</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Call us at +233 XX XXX XXXX
                  </p>
                  <p className="text-xs text-gray-500">
                    Mon-Fri: 8:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/customer-support">
                  <Button className="gradient-bg text-white">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/track-order">
                  <Button variant="outline">
                    Track Your Order
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}