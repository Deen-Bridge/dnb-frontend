"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Button from "@/components/atoms/form/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import Load from "@/components/atoms/form/Loader"
import usePasswordMatch from "@/hooks/passwordChecker"
export function SignupForm({ className, ...props }) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: "",
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
            return;
        }
        setLoading(true);

        try {
            router.push("/")
        } finally {
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
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        placeholder="e.g. Abdul Hazeem"
                        value={formData.fullName}
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

                {/* Role can be a select dropdown if needed */}
                {/* <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        </div> */}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button wide round type="submit" disabled={loading}>
                    {loading ? <Load /> : "Sign Up"}
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
