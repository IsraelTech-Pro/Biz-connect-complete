import { Smartphone, CheckCircle, AlertCircle, RefreshCw, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mobileMoneySteps = [
  {
    step: 1,
    title: "Select Mobile Money",
    description: "Choose your mobile money provider at checkout",
    icon: Smartphone
  },
  {
    step: 2,
    title: "Enter Phone Number",
    description: "Provide your registered mobile money phone number",
    icon: Smartphone
  },
  {
    step: 3,
    title: "Authorize Payment",
    description: "You'll receive a USSD prompt to authorize the payment",
    icon: CheckCircle
  },
  {
    step: 4,
    title: "Enter PIN",
    description: "Enter your mobile money PIN to complete the transaction",
    icon: Shield
  },
  {
    step: 5,
    title: "Payment Confirmed",
    description: "Receive instant confirmation and order details",
    icon: CheckCircle
  }
];

const providers = [
  {
    name: "MTN Mobile Money",
    shortCode: "*170#",
    color: "bg-yellow-100 text-yellow-800",
    description: "Ghana's leading mobile money service",
    requirements: [
      "Active MTN SIM card",
      "Registered MTN MoMo account",
      "Sufficient wallet balance",
      "Valid PIN number"
    ],
    tips: [
      "Ensure your phone has network coverage",
      "Check your wallet balance before payment",
      "Keep your PIN confidential",
      "Respond to USSD prompts quickly"
    ]
  },
  {
    name: "Vodafone Cash",
    shortCode: "*110#",
    color: "bg-red-100 text-red-800",
    description: "Fast and secure mobile payments",
    requirements: [
      "Active Vodafone SIM card",
      "Registered Vodafone Cash account",
      "Sufficient wallet balance",
      "Valid PIN number"
    ],
    tips: [
      "Ensure good network connection",
      "Verify your account is active",
      "Keep your PIN secure",
      "Complete payment within time limit"
    ]
  },
  {
    name: "AirtelTigo Money",
    shortCode: "*110#",
    color: "bg-blue-100 text-blue-800",
    description: "Convenient mobile money solution",
    requirements: [
      "Active AirtelTigo SIM card",
      "Registered AirtelTigo Money account",
      "Sufficient wallet balance",
      "Valid PIN number"
    ],
    tips: [
      "Check your wallet balance first",
      "Ensure strong network signal",
      "Protect your PIN",
      "Follow USSD prompts carefully"
    ]
  }
];

const troubleshooting = [
  {
    issue: "Payment Failed",
    icon: AlertCircle,
    color: "text-red-500",
    causes: [
      "Insufficient wallet balance",
      "Incorrect PIN entered",
      "Network connectivity issues",
      "USSD session timeout"
    ],
    solutions: [
      "Check and top up your wallet balance",
      "Verify your PIN and try again",
      "Move to an area with better network coverage",
      "Try the payment again immediately"
    ]
  },
  {
    issue: "Payment Pending",
    icon: Clock,
    color: "text-yellow-500",
    causes: [
      "Network processing delay",
      "High transaction volume",
      "Provider system maintenance",
      "Authorization in progress"
    ],
    solutions: [
      "Wait 5-10 minutes for processing",
      "Check your mobile money statement",
      "Contact your provider if delay persists",
      "Don't attempt payment again immediately"
    ]
  },
  {
    issue: "Double Charge",
    icon: RefreshCw,
    color: "text-blue-500",
    causes: [
      "Multiple payment attempts",
      "System processing error",
      "Network timeout retry",
      "Provider duplicate transaction"
    ],
    solutions: [
      "Check your mobile money statement",
      "Contact VendorHub support immediately",
      "Keep transaction reference numbers",
      "Refund will be processed within 24 hours"
    ]
  }
];

const faqData = [
  {
    question: "Is mobile money payment safe?",
    answer: "Yes, mobile money payments are very safe. All transactions are encrypted and processed through Paystack's secure system. Your PIN is never shared with VendorHub or any merchant."
  },
  {
    question: "How long does mobile money payment take?",
    answer: "Mobile money payments are processed instantly. You'll receive confirmation within seconds of completing the transaction."
  },
  {
    question: "What happens if I enter the wrong PIN?",
    answer: "If you enter the wrong PIN, the payment will fail. You can try again immediately. After 3 failed attempts, your account may be temporarily blocked by your provider."
  },
  {
    question: "Can I pay with a different provider?",
    answer: "Currently, we support MTN Mobile Money, Vodafone Cash, and AirtelTigo Money. We're working to add more providers soon."
  },
  {
    question: "Why didn't I receive a USSD prompt?",
    answer: "This could be due to network issues, SIM card problems, or your phone settings. Try restarting your phone and ensure you have network coverage."
  },
  {
    question: "Can I cancel a mobile money payment?",
    answer: "Once a mobile money payment is completed, it cannot be cancelled. However, you can return items according to our return policy for a refund."
  }
];

export default function MobileMoney() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-black mb-4">
              Mobile <span className="text-gradient">Money</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Pay securely and conveniently with your mobile money account. We support all major mobile money providers in Ghana for fast, secure payments.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* How it Works */}
        <div className="mb-16">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-black mb-4">How Mobile Money Payment Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to pay with your mobile money account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {mobileMoneySteps.map((step, index) => (
              <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="btn-orange-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-3">
                  <step.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Providers */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Supported Mobile Money Providers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We support all major mobile money services in Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {providers.map((provider, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      {provider.name}
                    </div>
                    <Badge className={provider.color}>{provider.shortCode}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{provider.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {provider.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm">Tips:</h4>
                    <ul className="space-y-1">
                      {provider.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-blue-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Troubleshooting</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Common issues and solutions for mobile money payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {troubleshooting.map((trouble, index) => (
              <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <trouble.icon className={`w-5 h-5 ${trouble.color}`} />
                    {trouble.issue}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Common Causes:</h4>
                      <ul className="space-y-1">
                        {trouble.causes.map((cause, causeIndex) => (
                          <li key={causeIndex} className="text-sm text-gray-600">• {cause}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Solutions:</h4>
                      <ul className="space-y-1">
                        {trouble.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="text-sm text-green-600">• {solution}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about mobile money payments.
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

        {/* Security Note */}
        <div className="bg-green-50 rounded-lg p-8 animate-fade-in">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">Your Security is Our Priority</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              All mobile money transactions are processed through secure, encrypted channels. We never store your PIN or payment details. 
              Your mobile money provider handles all authentication and security measures.
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">100%</div>
                <div className="text-sm text-gray-600">Secure</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">Instant</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}