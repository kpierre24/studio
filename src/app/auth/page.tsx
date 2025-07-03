
"use client";

import { useState, type FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { UserRole, type LoginUserPayload, type RegisterStudentPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from '@/lib/constants';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function AuthPageContent() {
  const { state, handleLoginUser, handleRegisterStudent } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [confirmPassword, setConfirmPassword] = useState(''); // For registration
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const onLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Email and password are required." });
      return;
    }
    const payload: LoginUserPayload = { email, password };
    await handleLoginUser(payload);
  };

  const onRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast({ variant: "destructive", title: "Missing Fields", description: "All fields are required for registration." });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Password Mismatch", description: "The passwords you entered do not match." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." });
        return;
    }
    const payload: RegisterStudentPayload = { name, email, password };
    await handleRegisterStudent(payload);
  };
  
  useEffect(() => {
    if (state.currentUser) {
      let targetPath = redirect;
      if (targetPath === '/auth' || targetPath === '/' || targetPath === '/app') { 
          switch (state.currentUser.role) {
              case UserRole.SUPER_ADMIN: targetPath = '/admin/dashboard'; break;
              case UserRole.TEACHER: targetPath = '/teacher/dashboard'; break;
              case UserRole.STUDENT: targetPath = '/student/dashboard'; break;
              default: targetPath = '/student/dashboard';
          }
      }
      router.replace(targetPath);
    }
  }, [state.currentUser, redirect, router, state.isLoading]);

  if (state.currentUser === undefined || (state.isLoading && state.currentUser === undefined)) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
                <CardDescription>Verifying credentials...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-10 bg-muted rounded animate-pulse w-full mb-4"></div>
                    <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (state.currentUser) { 
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
                    <CardDescription>Redirecting...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
          <CardDescription>Welcome! Please sign in or create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register (Student)</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={onLoginSubmit} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={state.isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={state.isLoading}
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)} disabled={state.isLoading}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  {state.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={onRegisterSubmit} className="space-y-4 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={state.isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={state.isLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-password">Password</Label>
                   <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={state.isLoading}
                    />
                     <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)} disabled={state.isLoading}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                   <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={state.isLoading}
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={state.isLoading}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  {state.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : 'Register as Student'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  // This fallback will be shown while useSearchParams (inside AuthPageContent)
  // is resolving on the client after initial server render or during client-side navigation.
  const fallbackContent = (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
          <CardDescription>Loading Page...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
      </Card>
    </div>
  );

  return (
    <Suspense fallback={fallbackContent}>
      <AuthPageContent />
    </Suspense>
  );
}
