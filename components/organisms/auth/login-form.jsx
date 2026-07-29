"use client";

import { login } from "@/hooks/useAuth";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
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

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

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
    } catch (error) {
      // login() already shows toast on failure
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className={cn("flex flex-col gap-6", className)}
          onSubmit={form.handleSubmit(handleSubmit)}
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
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <a
                    href="#"
                    onClick={handleForgetPassword}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button
              className="bg-accent hover:bg-highlight animate-in-out duration-300"
              wide
              loading={form.formState.isSubmitting}
              loaderColor="white"
              loaderSize={24}
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Login
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
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
