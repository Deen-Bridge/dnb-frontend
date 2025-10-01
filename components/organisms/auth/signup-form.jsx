"use client";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/atoms/form/Error";
import usePasswordMatch from "@/hooks/passwordChecker";
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

export function SignupForm({ className, ...props }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const correctOtpRef = useRef(null);

  const { checkPasswords } = usePasswordMatch();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault()
    if (checkPasswords(formData.password, formData.confirmPassword)){
      alert("hi")
    }
    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      toast.success("Signup successful!");
      setModalOpen(false);
      router.push("/dashboard");
    } catch (err) {
      setError(err?.message || "Signup failed. Please try again.");
      toast.error(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify OTP when input is full
  useEffect(() => {
    if (otp.length === 6 && correctOtpRef.current) {
      handleVerifyOtpAndSignup();
    }
  }, [otp]);

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setError("");
    try {
      const res = await sendOtp(formData.email);
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
      <form
        onSubmit={handleSignup}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl sm:text-4xl text-nowrap font-bold font-stretch-125%">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information below to sign up.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Salem Alharthi"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <ErrorMessage message={error} />}
          <Button
            className="bg-accent hover:bg-highlight animate-in-out duration-300"
            wide
            loading={otpLoading}
            loaderColor="white"
            loaderSize={24}
            type="submit"
            disabled={otpLoading}
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

      {/* <Modal
        title="Verify Your Email"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-md w-full"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Please enter the 6-digit code sent to {formData.email}
          </p>

          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <InputOTPSlot key={idx} index={idx} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <div className="flex flex-col gap-2">
            <Button
              wide
              loading={loading}
              onClick={handleVerifyOtpAndSignup}
              disabled={loading || otp.length !== 6}
            >
              Verify OTP & Complete Signup
            </Button>

            <Button
              variant="outline"
              wide
              loading={otpLoading}
              onClick={handleResendOtp}
              disabled={otpLoading}
            >
              Resend OTP
            </Button>
          </div>

          {error && <ErrorMessage message={error} />}
        </div>
      </Modal> */}
    </>
  );
}
