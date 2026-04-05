import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from "@/lib/axios";
import useAuthStore from '@/store/auth.store';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from 'zod';


const registerForm = z.object({
    email: z.string().min(1, 'Email is required').pipe(z.email('Invalid email address')),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    profile: z.object({
        name: z.string().min(1, 'Name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        bio: z.string().optional(),
    })
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});


type RegisterFormData = z.infer<typeof registerForm>;
const RegistrerPage = () => {
    const [error, setError] = useState<string | null>(null)
    const { setEmail } = useAuthStore();
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerForm)
    });


    const onSubmit = async (data: RegisterFormData) => {
        try {
            const { confirmPassword, ...registerData } = data
            console.log('la data passwordconfirm: ', confirmPassword);
            const response = await api.post('/users', registerData);
            setEmail(response.data.email);
            navigate('/login');
        } catch {
            setError('Registration failed. Please check your data and try again.');
        }
    }
    return (
        <div className="w-[420px] bg-navy-800 rounded-2xl p-8 border border-navy-700">
    {/* Logo */}
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Welcome!</h1>
      <p className="text-slate-400 text-sm mt-1">Sign up for your account</p>
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
          placeholder="you@example.com"
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
      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="bg-navy-900 border-navy-700 text-white placeholder:text-slate-500"
          {...register("confirmPassword")} 
        />
        {errors.confirmPassword && (
            <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
        )}
        </div>      
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-300">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John"
          className="bg-navy-900 border-navy-700 text-white placeholder:text-slate-500"
          {...register('profile.name')}
        />
        {errors.profile?.name && (
          <p className="text-red-400 text-xs">{errors.profile.name.message}</p>
        )}
      </div>
      {/* LastName */}
      <div className="space-y-2">
        <Label htmlFor="lastName" className="text-slate-300">LastName</Label>
        <Input
          id="lastName"
          type="text"
          placeholder="Doe"
          className="bg-navy-900 border-navy-700 text-white placeholder:text-slate-500"
          {...register('profile.lastName')}
        />
        {errors.profile?.lastName && (
          <p className="text-red-400 text-xs">{errors.profile.lastName.message}</p>
        )}
      </div>
      {/* bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-slate-300">Bio</Label>
        <Input
          id="bio"
          type="text"
          placeholder="Tell us about yourself"
          className="bg-navy-900 border-navy-700 text-white placeholder:text-slate-500"
          {...register('profile.bio')}
        />
        {errors.profile?.bio && (
          <p className="text-red-400 text-xs">{errors.profile.bio.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-violet-500 hover:bg-violet-600 text-white mt-2"
      >
        {isSubmitting ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>

    {/* Register link */}
    <p className="text-center text-slate-400 text-sm mt-6">
      Do you have an account?{' '}
      <Link to="/login" className="text-violet-400 hover:text-violet-300">
        Log in
      </Link>
    </p>
  </div>
    )
}

export default RegistrerPage;