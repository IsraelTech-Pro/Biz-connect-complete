import { useState } from 'react';
import { X, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentReturnGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PaymentReturnGuide = ({ isVisible, onClose }: PaymentReturnGuideProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-center text-lg font-semibold">
            Complete Your Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You're being redirected to pay</h3>
            <p className="text-gray-600 text-sm">
              After completing your mobile money payment, please return to this page to complete your order.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">What to do after payment:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
              <li>Complete your mobile money payment</li>
              <li>Use the back button to return to this page</li>
              <li>Your order will be automatically processed</li>
            </ol>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Use your browser's back button to return after payment</span>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            I Understand
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};