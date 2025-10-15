import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showReset, setShowReset] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, token } = useAuth();
  const { toast } = useToast();

  // Redirect to homepage when user becomes authenticated
  useEffect(() => {
    if (user && token) {
      setLocation('/');
    }
  }, [user, token, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., user@example.com)",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      // Redirect will happen automatically via useEffect when auth state updates
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requestPasswordReset = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'Invalid Email', description: 'Enter a valid email to receive the OTP.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const resp = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.message || 'Failed to send reset code');
      setResetOtpSent(true);
      toast({ title: 'Reset Code Sent', description: 'Check your email for the OTP. If not found, check Junk/Spam.' });
      if (data.debugOtp) {
        console.log('DEV ONLY reset OTP:', data.debugOtp);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send reset code', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPasswordResetOtp = async () => {
    if (!resetOtpCode.trim()) {
      toast({ title: 'Enter OTP', description: 'Please enter the 6-digit code.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const resp = await fetch('/api/auth/password-reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), otp: resetOtpCode.trim() })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.message || 'Failed to verify code');
      setResetOtpVerified(true);
      toast({ title: 'OTP Verified', description: 'You can now set a new password.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to verify code', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const completePasswordReset = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Weak Password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Mismatch', description: 'New password and confirmation do not match.', variant: 'destructive' });
      return;
    }
    if (!resetOtpVerified) {
      toast({ title: 'Verify OTP', description: 'Please verify the OTP before resetting.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const resp = await fetch('/api/auth/password-reset/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), new_password: newPassword })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.message || 'Failed to reset password');
      toast({ title: 'Password Reset', description: 'Your password has been reset. You can now sign in.' });
      // Reset UI back to login
      setShowReset(false);
      setResetOtpSent(false);
      setResetOtpCode('');
      setResetOtpVerified(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reset password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/bizconnect-logo.png" 
              alt="BizConnect Logo" 
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-ktu-deep-blue">Welcome Back</CardTitle>
          <p className="text-gray-600">Sign in to your KTU BizConnect account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email row; when resetting, show Send/Resend OTP beside email */}
            {!showReset ? (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your student email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Button type="button" onClick={requestPasswordReset} disabled={isLoading || resetOtpVerified} className="w-full">
                    {resetOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                </div>
              </div>
            )}

            {/* Normal password is hidden during reset mode */}
            {!showReset && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
              </div>
            )}

            {!showReset && (
              <div className="text-right -mt-2">
                <button type="button" className="text-sm text-orange-600 hover:text-orange-700" onClick={() => setShowReset(true)}>
                  Forgot password?
                </button>
              </div>
            )}

            {showReset && (
              <div className="space-y-3 p-3 border rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2">
                    <Label htmlFor="reset-otp">Email OTP</Label>
                    <Input
                      id="reset-otp"
                      placeholder="Enter 6-digit code"
                      value={resetOtpCode}
                      onChange={(e) => setResetOtpCode(e.target.value)}
                      disabled={!resetOtpSent || resetOtpVerified}
                    />
                  </div>
                  <div>
                    <Button type="button" onClick={verifyPasswordResetOtp} disabled={!resetOtpSent || isLoading || resetOtpVerified} className="w-full">
                      {resetOtpVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 -mt-2">Didn’t receive the code? Check your Junk/Spam folder.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Label htmlFor="newpass">New Password</Label>
                    <Input
                      id="newpass"
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!resetOtpVerified}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[36px] text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPass(v => !v)}
                      aria-label={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  <div className="relative">
                    <Label htmlFor="confirmpass">Confirm Password</Label>
                    <Input
                      id="confirmpass"
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={!resetOtpVerified}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[36px] text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPass(v => !v)}
                      aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
                <Button type="button" className="w-full btn-orange-primary" onClick={completePasswordReset} disabled={isLoading || !resetOtpVerified}>
                  Reset Password
                </Button>
                <div className="text-right">
                  <button type="button" className="text-sm text-gray-600 hover:text-gray-700" onClick={() => setShowReset(false)}>Back to sign in</button>
                </div>
              </div>
            )}

            {!showReset && (
              <Button 
                type="submit" 
                className="w-full btn-orange-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
