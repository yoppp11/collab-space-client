"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { LoginCredentials } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, { access: data.access, refresh: data.refresh });
      toast.success(t("login.success"));
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      console.error("Login mutation error:", error);
      const err = error as {
        response?: { data?: { message?: string; detail?: string } };
      };
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        t("login.error");
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    console.info("onSubmit");
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
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
          {t("login.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {t("login.subtitle")}
        </motion.p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("login.email_placeholder")}
            {...register("email")}
            className="mt-1.5"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label htmlFor="password">{t("login.password")}</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("login.password_placeholder")}
              {...register("password")}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between"
        >
          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t("login.remember_me")}
                </Label>
              </div>
            )}
          />
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            {t("login.forgot_password")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {t("login.submit")}
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
            {t("login.no_account")}{" "}
          </span>
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            {t("login.sign_up")}
          </Link>
        </motion.div>
      </form>
    </motion.div>
  );
}
