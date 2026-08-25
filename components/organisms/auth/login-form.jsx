"use client";

import { login } from "@/hooks/useAuth";
import { useStellarAuth } from "@/hooks/useStellarAuth";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import Modal from "@/components/molecules/Modal";
import ForgetPassword from "./forget-password";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wallet } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({ className, ...props }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const {
    loginWithStellar,
    isPending: isStellarPending,
    stellarAuthAvailable,
    kitInitialized,
  } = useStellarAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const stellarDisabled =
    isStellarPending ||
    form.formState.isSubmitting ||
    !kitInitialized ||
    stellarAuthAvailable === false;

  const handleForgetPassword = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      await login(data.email, data.password);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch {
      // login() already shows toast on failure
    }
  };

  const handleStellarLogin = async () => {
    try {
      const result = await loginWithStellar();
      if (result && !result.unregistered) {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch {
      // loginWithStellar already toasts failures
    }
  };

  const stellarButton = (
    <Button
      type="button"
      wide
      outlined
      loading={isStellarPending}
      loaderColor="black"
      loaderSize={24}
      disabled={stellarDisabled}
      onClick={handleStellarLogin}
      className="gap-2 border-accent text-foreground hover:bg-accent/10"
      childrenClassName="gap-2"
    >
      <Wallet className="h-4 w-4" aria-hidden />
      Sign in with Stellar
    </Button>
  );

  return (
    <>
      <Form {...form}>
        <form
          className={cn("flex flex-col gap-6", className)}
          onSubmit={form.handleSubmit(handleSubmit)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl sm:text-4xl font-bold font-stretch-125%">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to login.
            </p>
          </div>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
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
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgetPassword}
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="bg-accent hover:bg-highlight animate-in-out duration-300"
              wide
              loading={form.formState.isSubmitting}
              loaderColor="white"
              loaderSize={24}
              type="submit"
              disabled={form.formState.isSubmitting || isStellarPending}
            >
              Login
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {stellarAuthAvailable === false ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full inline-flex">{stellarButton}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-center">
                  Sign in with Stellar is not available yet — the SEP-10
                  challenge endpoint is not deployed on this API.
                </TooltipContent>
              </Tooltip>
            ) : (
              stellarButton
            )}

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Sign Up
              </Link>
            </div>
          </div>
        </form>
      </Form>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Forget password"
      >
        <ForgetPassword onSuccess />
      </Modal>
    </>
  );
}

export default LoginForm;
