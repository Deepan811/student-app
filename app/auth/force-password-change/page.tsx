'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ForcePasswordChangePage() {
  const [formData, setFormData] = useState({
    temporaryPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);

  const router = useRouter();
  const { user, token } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (regex.test(password)) {
      setPasswordStrength('Strong');
    } else {
      setPasswordStrength('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    try {
      if (!token) {
        setMessage({ type: 'error', text: 'You are not authorized to perform this action.' });
        setIsLoading(false);
        return;
      }
      const response = await authApi.forceChangePassword({
        temporaryPassword: formData.temporaryPassword,
        newPassword: formData.newPassword,
      }, token);

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully! Redirecting...' });
        setTimeout(() => {
          if (user?.role === 'branch') {
            router.push('/branch/dashboard');
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Change Your Password</CardTitle>
            <CardDescription className="text-slate-300">Please change your temporary password to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert
                className={message.type === 'success' ? 'border-green-200/20 bg-green-500/10' : 'border-red-200/20 bg-red-500/10'}
              >
                <AlertDescription className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="temporaryPassword" className="text-slate-300">Temporary Password</Label>
                <Input
                  id="temporaryPassword"
                  name="temporaryPassword"
                  type="password"
                  placeholder="Enter your temporary password"
                  className="bg-white/5 border-white/20 focus:bg-white/10 placeholder:font-bold"
                  value={formData.temporaryPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  className="bg-white/5 border-white/20 focus:bg-white/10 placeholder:font-bold"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
                {passwordStrength && <p className={`text-sm ${passwordStrength === 'Strong' ? 'text-green-400' : 'text-red-400'}`}>{passwordStrength}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="text-slate-300">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  className="bg-white/5 border-white/20 focus:bg-white/10 placeholder:font-bold"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
