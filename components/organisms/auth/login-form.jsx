'use client'
import axios from "axios"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

export function LoginForm({ className, ...props }) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleChange = (e) => {
    if (e.target.name === "email") setFormData((prev) => ({ ...prev, email: e.target.value }));
    if (e.target.name === "password") setFormData((prev) => ({ ...prev, password: e.target.value }));
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      res = await axios.post("/api/auth/login", {
        formData
      });
      console.log("Login successful", res.data);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to sign in.
        </p>
      </div>
      <div className='grid gap-4'>
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
          <Button wide loading={isLoading} loaderColor="white" loaderSize={24} round type="submit" disabled={isLoading}>
            Sign Up
          </Button>
        </div>

        <div className="text-center text-sm">
          Don't have an account??{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  )
}

export default LoginForm;
