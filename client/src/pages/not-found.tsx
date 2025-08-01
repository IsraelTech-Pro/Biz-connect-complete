
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-2">
            The page <code className="bg-gray-100 px-2 py-1 rounded text-xs">{location}</code> could not be found.
          </p>
          
          <p className="text-sm text-gray-600 mb-6">
            This might happen if the URL was typed incorrectly or the page has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
