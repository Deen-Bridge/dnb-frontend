"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import axios from "axios"
import Button from "@/components/atoms/form/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import Error from "@/components/atoms/form/Error"
import usePasswordMatch from "@/hooks/passwordChecker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SignupForm({ className, ...props }) {

    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const { passwordError, checkPasswords } = usePasswordMatch();


    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if passwords match
        if (!checkPasswords(formData.password, formData.confirmPassword)) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);

        try {
            await axios.post("/api/auth/signup", formData)
            toast.success("Account created successfully")
            toast("Redirecting to login page...", {
                duration: 2000,
                onDismiss: () => {
                    router.push("/dashboard");
                },
            })
        } catch
        (err) {
            toast.error(err.response?.data?.message || "Signup failed")
        }
        finally {
            setLoading(false)
        }

    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
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
                        placeholder="e.g. Abdul Hazeem"
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
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {error && <Error errMsg={error} />}

                <Button className="bg-accent" wide loading={loading} loaderColor="white" loaderSize={24} type="submit" disabled={loading}>
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
    )
}
