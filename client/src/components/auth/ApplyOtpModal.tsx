import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface ApplyOtpModalProps {
  open: boolean;
  onClose: () => void;
  defaultFullName?: string;
  defaultEmail?: string;
  programId?: string;
  programTitle?: string;
}

export default function ApplyOtpModal({ open, onClose, defaultFullName = '', defaultEmail = '', programId, programTitle }: ApplyOtpModalProps) {
  const [step, setStep] = useState<'collect' | 'verify' | 'success'>('collect');
  const [fullName, setFullName] = useState(defaultFullName);
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');

  // KTU email requirement
  const ktuEmailRegex = /^[^\s@]+@ktu\.edu\.gh$/i;

  React.useEffect(() => {
    if (!open) {
      setStep('collect');
      setFullName(defaultFullName);
      setEmail(defaultEmail);
      setOtp('');
      setError(null);
      setResendIn(0);
      setLoading(false);
      setMessage('');
      setPhone('');
    }
  }, [open, defaultFullName, defaultEmail]);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const canRequest = useMemo(() => fullName.trim().length > 1 && ktuEmailRegex.test(email), [fullName, email]);
  const canVerify = useMemo(() => otp && otp.length === 6, [otp]);

  const requestOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!ktuEmailRegex.test(email.trim())) {
        throw new Error('Only KTU emails are allowed. Please use your @ktu.edu.gh email.');
      }
      const res = await fetch('/api/auth/register-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to send OTP');
      setStep('verify');
      setResendIn(60);
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/register-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to verify OTP');
      // After verifying, submit the application for the selected program
      if (!programId) {
        setStep('success');
        return;
      }
      const applyRes = await fetch(`/api/programs/${programId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim(), message: message.trim() || null, phone: phone.trim() || null })
      });
      const applyData = await applyRes.json();
      if (!applyRes.ok) throw new Error(applyData?.message || 'Failed to submit application');
      setStep('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendIn > 0) return;
    await requestOtp();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 'collect' ? `Apply to${programTitle ? `: ${programTitle}` : ' Program'}` : step === 'verify' ? 'Verify your email' : 'Application submitted'}</DialogTitle>
          <DialogDescription>
            {step === 'collect' && `Enter your details to apply${programTitle ? ` for "${programTitle}"` : ''}. We will send a 6‑digit OTP to verify your email.`}
            {step === 'verify' && `We sent a 6‑digit code to ${email}. Enter it below to complete your registration.`}
            {step === 'success' && (programTitle ? `Your application for "${programTitle}" has been received. We'll contact you by email.` : 'Your application has been received. We will contact you by email.')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-red-600 text-sm mb-2">{error}</div>
        )}

        {step === 'collect' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ktu.edu.gh" />
              <div className="text-xs text-muted-foreground">Use your official KTU email (must end with @ktu.edu.gh)</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="054xxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <textarea id="message" className="w-full border rounded-md p-2 min-h-[96px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us briefly why you want to join..." />
            </div>
            <Button className="w-full bg-ktu-orange hover:bg-ktu-orange-light" disabled={!canRequest || loading} onClick={requestOtp}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {resendIn > 0 ? `Resend available in ${resendIn}s` : 'Didn\'t get the code?'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled={resendIn > 0 || loading} onClick={resendOtp}>Resend</Button>
              <Button className="flex-1 bg-ktu-orange hover:bg-ktu-orange-light" disabled={!canVerify || loading} onClick={verifyOtp}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-sm">Thanks! We\'ve created your account or linked your email if it already existed. A welcome email has been sent.</div>
            <Button className="w-full" onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
