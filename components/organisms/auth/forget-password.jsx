"use client"
import { captureClientError } from "@/lib/sentry/captureClientError";
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Button from '@/components/atoms/form/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { forgetPassword } from '@/lib/services/emails/forgetPassword';
import { authRecoveryMessage } from '@/lib/auth/lifecycle';

const ForgetPassword = ({ className, onSuccess, ...props }) => {
    const [formData, setFormData] = useState({ email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await forgetPassword(formData.email)
            if (!result?.success) {
                throw new Error(result?.message || 'The reset request was not accepted.');
            }
            setStatus({ type: 'success', message: 'If an account exists for that email, a reset code has been sent.' });
            toast.success('Reset instructions sent.');
        } catch (error) {
            setStatus({ type: 'error', message: authRecoveryMessage(error, 'We could not start the reset flow. Check the address and try again.') });
            captureClientError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm text-center text-muted-foreground">
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

                {status && (
                    <p role={status.type === 'error' ? 'alert' : 'status'} className={status.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-muted-foreground'}>
                        {status.message}
                    </p>
                )}

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
            </div>
        </form>
    );
};

export default ForgetPassword;
