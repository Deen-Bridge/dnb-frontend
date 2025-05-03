'use client';

import axios from "axios";
import Button from '@/components/atoms/form/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const [formData, setFormData] = useState({
    email: "", 
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Update formData dynamically
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Send formData directly
      const res = await axios.post(
        "/api/auth/login",
        formData
      );
      console.log("Login successful", res.data.message);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
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

        <Button
          className="bg-accent"
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
  );
}

export default LoginForm;
