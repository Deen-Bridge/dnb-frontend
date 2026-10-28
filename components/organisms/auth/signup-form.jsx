"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ErrorMessage from "@/components/atoms/form/Error";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { normalizeRole, ROLES } from "@/lib/auth/roles";
import { resolveSafeCallbackRedirect } from "@/lib/auth/safeRedirect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signup } from "@/hooks/useAuth";
import { toast } from "sonner";
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
  const [registeredRole, setRegisteredRole] = useState("");
  const {
    loginWithGoogle,
    isPending: isGooglePending,
    googleAuthAvailable,
  } = useGoogleAuth();

  const form = useForm({
    resolver: zodResolver(signupSchemaWithPolicy),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "" },
    mode: "onChange",
  });

  // The meter's "doesn't contain your name or email" check needs the live
  // values of those fields, not the submitted ones.
  const watchedName = form.watch("name");
  const watchedEmail = form.watch("email");
  const watchedRole = form.watch("role");

  const handleSignup = async (data) => {
    setError("");

    try {
      await signup(data.name, data.email, data.password, data.role);
      setRegisteredEmail(data.email);
      setRegisteredRole(data.role);
      setRegistered(true);
    } catch (err) {
      setError(err?.message || "Signup failed. Please try again.");
      toast.error(err?.message || "Signup failed. Please try again.");
    }
  };

  // Google already verifies the email, so unlike email/password signup there's
  // no "check your inbox" step — a successful sign-in logs the user straight in.
  const handleGoogleSignup = async (credentialResponse) => {
    // Re-check at call time (not just render time): an in-flight email signup,
    // or a role change between render and the popup resolving, shouldn't let a
    // stale Google credential through for a role it can't fulfill.
    if (form.formState.isSubmitting || form.getValues("role") === "mentor") {
      return;
    }
    const user = await loginWithGoogle(credentialResponse?.credential);
    if (user) {
      setTimeout(() => {
        const roleFallback = normalizeRole(user?.role) === ROLES.ADMIN ? "/admin" : "/dashboard";
        window.location.href = resolveSafeCallbackRedirect(window.location?.search, roleFallback);
      }, 500);
    }
  };

  if (registered) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          We sent a verification link to <strong>{registeredEmail}</strong>.
          Click the link to activate your account.
        </p>
        {registeredRole === "mentor" && (
          <p className="text-xs text-muted-foreground max-w-sm rounded-lg border border-border bg-muted/40 px-4 py-3">
            As an educator, you will be guided through a quick identity
            verification step after confirming your email. This is required
            before your application can be reviewed.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder.
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
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isGooglePending}
                  >
                    <SelectTrigger className="w-[180px]" aria-label="Role">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="mentor">Educator</SelectItem>
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
              disabled={form.formState.isSubmitting || isGooglePending}
            >
              Sign Up
            </Button>

            {googleAuthAvailable && (
              <>
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
                {watchedRole === "student" ? (
                  <div
                    // `inert` (not just pointer-events-none) so a keyboard user
                    // can't tab into or activate this while email signup is
                    // submitting — CSS alone leaves it focusable.
                    inert={form.formState.isSubmitting}
                    aria-disabled={form.formState.isSubmitting}
                    className={cn(
                      "w-full flex justify-center",
                      form.formState.isSubmitting && "opacity-50"
                    )}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={() =>
                        toast.error("Google sign-in failed. Please try again.")
                      }
                      text="signup_with"
                      width="320"
                    />
                  </div>
                ) : (
                  // Google signup always creates a "student" account (the backend
                  // has no way to receive this form's role selection), which would
                  // silently skip the educator identity-verification flow. Rather
                  // than mis-route educators — or guess for an undecided role —
                  // only offer it once "Student" is explicitly selected.
                  <p className="text-xs text-muted-foreground text-center">
                    {watchedRole === "mentor"
                      ? "Continue with Google is available for students. As an educator, please sign up with the form above so we can verify your application."
                      : "Select \"Student\" above to continue with Google."}
                  </p>
                )}
              </>
            )}
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
