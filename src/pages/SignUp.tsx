import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Github, Eye, EyeOff, Mail, Palette, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithOAuth, user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);

      if (error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        // User will be redirected to dashboard via useEffect when auth state changes
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);

      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Sign up form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button and Logo */}
          <div className="flex items-center justify-between w-full">
            <Link
              to="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" className="absolute">
                  <circle
                    cx="12"
                    cy="16"
                    r="8"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  <circle
                    cx="20"
                    cy="16"
                    r="8"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    opacity="0.4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">Colabs</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Get started</h1>
              <p className="text-muted-foreground mt-2">Create a new account</p>
            </div>

            {/* Social sign up buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('github')}
              >
                <Github className="w-4 h-4 mr-2" />
                Continue with GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthSignIn('google')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Gmail
              </Button>
              <Button variant="outline" className="w-full" type="button" disabled>
                <Palette className="w-4 h-4 mr-2" />
                Continue with Behance (Coming Soon)
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Have an account?{' '}
                <Link to="/sign-in" className="text-primary hover:underline font-medium">
                  Sign In Now
                </Link>
              </p>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-foreground">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              , and to receive periodic emails with updates.
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Testimonial */}
      <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-8">
        <div className="max-w-md">
          <blockquote className="text-lg leading-relaxed">
            "Working with Lovable has been one of the best dev experiences I've had lately.
            Incredibly easy to set up, great documentation, and so many fewer hoops to jump through
            than the competition. I definitely plan to use it on any and all future projects."
          </blockquote>
          <div className="flex items-center mt-6">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">D</span>
            </div>
            <div className="ml-3">
              <p className="font-medium">@developer_user</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
