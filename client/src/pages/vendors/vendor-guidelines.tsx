import { Shield, Clock, Star, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

const guidelines = [
  {
    category: "Product Quality",
    icon: Star,
    color: "bg-green-100 text-green-800",
    rules: [
      "All products must be authentic and as described",
      "Product images must be clear and accurate",
      "Provide detailed and honest product descriptions",
      "Ensure products are in good working condition",
      "No counterfeit or prohibited items"
    ]
  },
  {
    category: "Delivery Standards",
    icon: Clock,
    color: "bg-blue-100 text-blue-800",
    rules: [
      "Process orders within 24 hours of payment",
      "Ship items within 2 business days",
      "Provide accurate delivery timeframes",
      "Use reliable shipping methods",
      "Update order status promptly"
    ]
  },
  {
    category: "Customer Service",
    icon: Shield,
    color: "bg-purple-100 text-purple-800",
    rules: [
      "Respond to customer inquiries within 24 hours",
      "Maintain professional communication",
      "Handle returns and exchanges fairly",
      "Provide clear return policies",
      "Resolve disputes amicably"
    ]
  }
];

const prohibitedItems = [
  "Counterfeit or replica products",
  "Illegal drugs or substances",
  "Weapons and ammunition",
  "Stolen goods",
  "Adult content or services",
  "Hazardous materials",
  "Live animals",
  "Medical prescriptions",
  "Copyrighted materials without permission",
  "Gambling or lottery items"
];

const bestPractices = [
  {
    title: "Product Photography",
    description: "Use high-quality images with good lighting. Show products from multiple angles.",
    icon: "📸"
  },
  {
    title: "Accurate Descriptions",
    description: "Include dimensions, materials, care instructions, and any important details.",
    icon: "📝"
  },
  {
    title: "Competitive Pricing",
    description: "Research market prices and offer competitive rates for your products.",
    icon: "💰"
  },
  {
    title: "Fast Shipping",
    description: "Process and ship orders quickly to maintain high customer satisfaction.",
    icon: "🚚"
  },
  {
    title: "Customer Communication",
    description: "Keep customers informed about their orders and respond promptly to questions.",
    icon: "💬"
  },
  {
    title: "Inventory Management",
    description: "Keep your inventory updated to avoid overselling or stockouts.",
    icon: "📦"
  }
];

const violations = [
  {
    level: "Minor Violations",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertTriangle,
    examples: [
      "Late order processing (24-48 hours)",
      "Minor product description inaccuracies",
      "Slow customer service response (24-48 hours)"
    ],
    consequences: [
      "Warning notification",
      "Required corrective action",
      "Temporary store visibility reduction"
    ]
  },
  {
    level: "Major Violations",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    examples: [
      "Selling prohibited items",
      "Consistently poor product quality",
      "Failure to ship orders (48+ hours)",
      "Fraudulent activity"
    ],
    consequences: [
      "Account suspension (7-30 days)",
      "Removal of violating products",
      "Customer refund requirements"
    ]
  }
];

export default function VendorGuidelines() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Vendor <span className="text-gradient">Guidelines</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These guidelines help maintain quality and trust on VendorHub. Please review them carefully to ensure your success on our platform.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Core Guidelines */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-black mb-4">Core Guidelines</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these essential rules to maintain your vendor account in good standing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guidelines.map((guideline, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <guideline.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    {guideline.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guideline.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prohibited Items */}
        <div className="mb-16 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Prohibited Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The following items are strictly prohibited on VendorHub:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prohibitedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Important:</strong> Selling prohibited items will result in immediate account suspension and may lead to permanent account closure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best Practices */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Best Practices</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these recommendations to maximize your success and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestPractices.map((practice, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="text-2xl mb-3">{practice.icon}</div>
                  <h3 className="font-semibold mb-2">{practice.title}</h3>
                  <p className="text-sm text-gray-600">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Violation Consequences */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Violation Consequences</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Understanding the consequences helps you avoid violations and maintain your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {violations.map((violation, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <violation.icon className="w-5 h-5 text-red-500" />
                    {violation.level}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      <ul className="space-y-1">
                        {violation.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Consequences:</h4>
                      <ul className="space-y-1">
                        {violation.consequences.map((consequence, consequenceIndex) => (
                          <li key={consequenceIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            {consequence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="mb-16 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Dispute Resolution Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Direct Resolution</h4>
                    <p className="text-sm text-gray-600">
                      Try to resolve disputes directly with customers through communication and compromise.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Platform Mediation</h4>
                    <p className="text-sm text-gray-600">
                      If direct resolution fails, our support team will mediate to find a fair solution.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Final Decision</h4>
                    <p className="text-sm text-gray-600">
                      VendorHub makes final decisions on unresolved disputes based on evidence and guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gray-50 rounded-lg p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-black mb-4">Questions About Guidelines?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you understand and follow these guidelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor-support">
              <Button className="gradient-bg text-white px-6 py-2">
                Contact Support
              </Button>
            </Link>
            <Link href="/sell-on-vendorhub">
              <Button variant="outline" className="border-orange-500 text-orange-500 px-6 py-2">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}