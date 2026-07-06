import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, RegisterInput } from '../types/auth';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth.api';
import { UserPlus, Mail, Lock, User as UserIcon, Loader2, AlertCircle, Layers, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      setAuth(response.user, response.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full animate-float" />

      <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-3xl tracking-tight">Pulse</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Create an account</h1>
          <p className="text-muted-foreground mt-2">Join Pulse and start collaborating today</p>
        </div>

        <div className="bg-card/40 backdrop-blur-2xl border border-border rounded-[2rem] p-10 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent transition-all outline-none"
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1 ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent transition-all outline-none"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent transition-all outline-none"
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative flex items-center justify-center rounded-2xl text-base font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-14 px-8 w-full shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <>
                  Create Account
                  <UserPlus className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

