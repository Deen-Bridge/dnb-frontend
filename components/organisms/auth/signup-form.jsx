"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ErrorMessage from "@/components/atoms/form/Error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signup } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
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

import PasswordStrength from "@/components/atoms/form/PasswordStrength";
import { PASSWORD_MAX, refinePassword } from "@/lib/validation/password";

const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    // Length is bounded here so the field errors before refinePassword runs;
    // the strength rules themselves live in lib/validation/password.js.
    password: z.string().min(1, "Password is required").max(PASSWORD_MAX),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.string().min(1, "Please select a role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signupSchemaWithPolicy = refinePassword(signupSchema);

export function SignupForm({ className, ...props }) {
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm({
    resolver: zodResolver(signupSchemaWithPolicy),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "" },
    mode: "onChange",
  });

  // The meter's "doesn't contain your name or email" check needs the live
  // values of those fields, not the submitted ones.
  const watchedName = form.watch("name");
  const watchedEmail = form.watch("email");

  const handleSignup = async (data) => {
    setError("");

    try {
      await signup(data.name, data.email, data.password, data.role);
      setRegisteredEmail(data.email);
      setRegistered(true);
    } catch (err) {
      setError(err?.message || "Signup failed. Please try again.");
      toast.error(err?.message || "Signup failed. Please try again.");
    }
  };

  if (registered) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          We sent a verification link to <strong>{registeredEmail}</strong>.
          Click the link to activate your account.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn't receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl sm:text-4xl text-nowrap font-bold font-stretch-125%">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your information below to sign up.
            </p>
          </div>

          <div className="grid gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="e.g. Salem Alharthi" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                <FormMessage />
                <PasswordStrength
                  password={field.value}
                  name={watchedName}
                  email={watchedEmail}
                />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Controller control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {error && <ErrorMessage errMsg={error} />}
            <Button
              className="bg-accent hover:bg-highlight animate-in-out duration-300"
              wide
              loading={form.formState.isSubmitting}
              loaderColor="white"
              loaderSize={24}
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Sign Up
            </Button>
          </div>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
}

export default SignupForm;
