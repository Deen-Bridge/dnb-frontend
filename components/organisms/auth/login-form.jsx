'use client';

import { login } from "@/hooks/useAuth";
import Button from '@/components/atoms/form/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Modal from "@/components/molecules/Modal";
import ForgetPassword from "./forget-password";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgetPassword = (e) => {
    e.preventDefault()
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      await login(formData.email, formData.password);
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000);
    } catch (error) {
      console.log("Error during login:", error.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <>
      {/* login form */}
      <form className={cn("flex flex-col gap-6", className)}  onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold font-stretch-125%">Welcome back</h1>
          <p className="text-sm  text-muted-foreground">
            Enter your email and password to login.
          </p>
        </div>
        <div className="grid gap-4">
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
            <div className="flex  items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                onClick={handleForgetPassword}
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
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

          <Button
            className="bg-accent hover:bg-highlight animate-in-out duration-300"
            wide
            loading={isLoading}
            loaderColor="white"
            loaderSize={24}
            type="submit"
            disabled={isLoading}
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


      {/* Reset password modal form */}

      <Modal isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Forget password">

        {/* resrt passwoerd form */}
        <ForgetPassword onSuccess />
      </Modal>
    </>
  );
}

export default LoginForm;
