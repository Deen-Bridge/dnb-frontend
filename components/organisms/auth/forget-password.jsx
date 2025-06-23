"use client"
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/atoms/form/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
const ForgetPassword = ({ className, ...props }) => {
    const [formData, setFormData] = useState({ email: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call for password reset
            console.log('Sending password reset email to:', formData.email);
            // Add your API call logic here
            alert('Password reset link sent to your email!');
        } catch (error) {
            console.log('Error sending password reset email:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email address to receive a password reset link.
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

                <Button
                    className="bg-accent"
                    wide
                    loading={isLoading}
                    loaderColor="white"
                    loaderSize={24}
                    type="submit"
                    disabled={isLoading}
                >
                    Send Reset Link
                </Button>

                <div className="text-center text-sm">
                    Remembered your password?{" "}
                    <Link href="/login" className="underline underline-offset-4">
                        Login
                    </Link>
                </div>
            </div>
        </form>
    );
};

export default ForgetPassword;