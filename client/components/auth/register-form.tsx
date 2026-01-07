'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { RegisterData } from '@/lib/types';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.user, { access: data.access, refresh: data.refresh });
      toast.success(t('register.success'));
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('Register mutation error:', error);
      const err = error as { response?: { data?: { message?: string; detail?: string; email?: string[]; username?: string[] } } };
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        t('register.error');
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          {t('register.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {t('register.subtitle')}
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="username">{t('register.username')}</Label>
          <Input
            id="username"
            placeholder={t('register.username_placeholder')}
            {...register('username')}
            className="mt-1.5"
          />
          {errors.username && (
            <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Label htmlFor="email">{t('register.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('register.email_placeholder')}
            {...register('email')}
            className="mt-1.5"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="first_name">{t('register.first_name')}</Label>
            <Input
              id="first_name"
              placeholder={t('register.first_name_placeholder')}
              {...register('first_name')}
              className="mt-1.5"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Label htmlFor="last_name">{t('register.last_name')}</Label>
            <Input
              id="last_name"
              placeholder={t('register.last_name_placeholder')}
              {...register('last_name')}
              className="mt-1.5"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Label htmlFor="password">{t('register.password')}</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('register.password_placeholder')}
              {...register('password')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Label htmlFor="password_confirm">{t('register.password_confirm')}</Label>
          <div className="relative mt-1.5">
            <Input
              id="password_confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('register.password_confirm_placeholder')}
              {...register('password_confirm')}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password_confirm && (
            <p className="text-sm text-destructive mt-1">
              {errors.password_confirm.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-start space-x-2"
        >
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1"
              />
            )}
          />
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
            {t('register.terms')}
          </Label>
        </motion.div>
        {errors.terms && (
          <p className="text-sm text-destructive">{errors.terms.message}</p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('register.submit')}
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm"
        >
          <span className="text-muted-foreground">
            {t('register.already_have_account')}{' '}
          </span>
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t('register.sign_in')}
          </Link>
        </motion.div>
      </form>
    </motion.div>
  );
}
