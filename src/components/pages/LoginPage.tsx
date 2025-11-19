import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import type { User } from '../utils/Users';
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Mock users for authentication (in production, this would be replaced with API calls)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    role: 'ra',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e0f97f?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Brian Thompson',
    email: 'brian.thompson@university.edu',
    role: 'full_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@university.edu',
    role: 'scheduling_admin',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email (in production, this would be a secure API call)
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && password === 'password') { // In production, password would be properly hashed and verified
      toast.success(`Welcome back, ${user.name}!`);
      onLogin(user);
    } else {
      toast.error('Invalid email or password');
    }

    setIsLoading(false);
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">CORAL</h1>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ttrojan@usc.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Demo: Use any email from the system with password "password"
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div>• brian.thompson@university.edu (Full Admin)</div>
            <div>• maria.rodriguez@university.edu (Scheduling Admin)</div>
            <div>• sarah.chen@university.edu (Research Assistant)</div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}