
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { UserRole, type LoginUserPayload, type RegisterStudentPayload } from '@/types'; // Removed ActionType as dispatch is now handled by context async functions
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from '@/lib/constants';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { state, handleLoginUser, handleRegisterStudent } = useAppContext(); // Use async handlers
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [confirmPassword, setConfirmPassword] = useState(''); // For registration
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Use formError from global state if needed, or keep local if preferred for immediate feedback
  // const [formError, setFormError] = useState<string | null>(null); 
  // For this example, global error (state.error) will be shown via Toasts

  const onLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // setFormError(null); // Clear local error if using local state for form errors
    if (!email || !password) {
      // setFormError("Email and password are required."); // Example of local error
      // Or dispatch a general error for toast if preferred
      // dispatch({ type: ActionType.SET_ERROR, payload: "Email and password are required." });
      alert("Email and password are required."); // Simple alert for now
      return;
    }
    const payload: LoginUserPayload = { email, password };
    await handleLoginUser(payload);
  };

  const onRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // setFormError(null);
    if (!name || !email || !password || !confirmPassword) {
      alert("All fields are required for registration.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }
    const payload: RegisterStudentPayload = { name, email, password };
    await handleRegisterStudent(payload);
  };
  
  useEffect(() => {
    // currentUser can be User, null, or undefined (initial loading)
    if (state.currentUser) { // User object exists, meaning logged in
      let targetPath = redirect;
      // Avoid redirect loop or staying on auth, and ensure role-based redirection
      if (targetPath === '/auth' || targetPath === '/' || targetPath === '/app') { 
          switch (state.currentUser.role) {
              case UserRole.SUPER_ADMIN: targetPath = '/admin/dashboard'; break;
              case UserRole.TEACHER: targetPath = '/teacher/dashboard'; break;
              case UserRole.STUDENT: targetPath = '/student/dashboard'; break;
              default: targetPath = '/student/dashboard'; // Fallback
          }
      }
      router.replace(targetPath);
    }
    // No explicit redirect if state.currentUser is null (logged out) or undefined (loading)
    // The page will render the auth form in those cases.
  }, [state.currentUser, redirect, router, state.isLoading]);


  // Show loading or auth form based on currentUser and isLoading state
  if (state.currentUser === undefined || (state.isLoading && state.currentUser === undefined)) {
    // Auth state is still being determined, show a loading indicator or minimal UI
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline text-primary">{APP_NAME}</CardTitle>
                <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-10 bg-muted rounded animate-pulse w-full mb-4"></div>
                    <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  // If currentUser exists, useEffect above will redirect. If null, show auth form.
  // This check prevents rendering auth form briefly if already logged in and redirecting.
  if (state.currentUser) { 
      return null; // Or a more specific loading/redirecting message
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
                {/* Global errors are now shown via toasts */}
                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  {state.isLoading ? 'Logging in...' : 'Login'}
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
                {/* Global errors are now shown via toasts */}
                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  {state.isLoading ? 'Registering...' : 'Register as Student'}
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
