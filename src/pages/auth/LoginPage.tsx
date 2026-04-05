import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/axios';
import useAuthStore from '@/store/auth.store';
import type { LoginResponse } from '@/types/auth.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').pipe(z.email('Invalid email address')),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters long'),
})

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { setUser, setToken, email } = useAuthStore();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            console.log('la data recibida: ', data)
            const res = await api.post<LoginResponse>('/auth/login', data );
            setUser(res.data.user);
            setToken(res.data.access_token);
            navigate('/dashboard');
        } catch{
            setError('Login failed. Please check your credentials and try again.');
        }
    }

    return (
        <div className="w-[420px] bg-navy-800 rounded-2xl p-8 border border-navy-700">
    {/* Logo */}
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Welcome back</h1>
      <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
    </div>

    {/* Error message */}
    {error && (
      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )}

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-300">Email</Label>
        <Input
          id="email"
          type="email"
          defaultValue={email || ''}
          className="bg-navy-900 border-navy-700 text-white placeholder:text-slate-500"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-300">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="bg-navy-900 border-navy-700 text-white placeholder:text-slate-500"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-400 text-xs">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-violet-500 hover:bg-violet-600 text-white mt-2"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>

    {/* Register link */}
    <p className="text-center text-slate-400 text-sm mt-6">
      Don't have an account?{' '}
      <Link to="/register" className="text-violet-400 hover:text-violet-300">
        Create one
      </Link>
    </p>
  </div>
    )
}

export default LoginPage;