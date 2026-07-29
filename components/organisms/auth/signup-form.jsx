"use client";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/atoms/form/Error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signup } from "@/hooks/useAuth";
import { sendOtp } from "@/lib/services/emails/emailVerification";
import Modal from "@/components/molecules/Modal";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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

const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.string().min(1, "Please select a role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignupForm({ className, ...props }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const correctOtpRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "" },
  });

  const handleSignup = async (data) => {
    setError("");

    try {
      await signup(data.name, data.email, data.password, data.role);
      toast.success("Signup successful! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Signup failed. Please try again.");
      toast.error(err?.message || "Signup failed. Please try again.");
    }
  };

  useEffect(() => {
    if (otp.length === 6 && correctOtpRef.current) {
      handleVerifyOtpAndSignup();
    }
  }, [otp]);

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setError("");
    const email = form.getValues("email");
    try {
      const res = await sendOtp(email);
      if (res && res.otp) {
        correctOtpRef.current = res.otp;
        toast.success("New OTP sent to your email!");
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err) {
      setError(err?.message || "Failed to send OTP. Please try again.");
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

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
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
