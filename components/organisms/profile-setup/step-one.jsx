"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const StepOne = ({ onNext, data, setData, className }) => {
    const [avatarUrl, setAvatarUrl] = useState(data.profilePicture || "")

    const handleChange = (e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleAvatarChange = (e) => {
        const url = e.target.value
        setAvatarUrl(url)
        setData((prev) => ({ ...prev, profilePicture: url }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onNext() // go to step two
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("space-y-6 max-w-md mx-auto", className)}
        >
            <div className="text-center">
                <h1 className="text-2xl font-bold">Profile Setup</h1>
                <p className="text-sm text-muted-foreground">
                    Let’s start with your basic information
                </p>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        value={data.fullName || ""}
                        onChange={handleChange}
                        placeholder="e.g. Aisha Yusuf"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        value={data.username || ""}
                        onChange={handleChange}
                        placeholder="e.g. deen_bridge_123"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="profilePicture">Profile Picture URL</Label>
                    <Input
                        id="profilePicture"
                        name="profilePicture"
                        value={avatarUrl}
                        onChange={handleAvatarChange}
                        placeholder="https://example.com/avatar.png"
                    />
                    <Avatar className="w-16 h-16 mt-2">
                        <AvatarImage src={avatarUrl} alt="@profile" />
                        <AvatarFallback>DB</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <Button type="submit" className="w-full">
                Continue
            </Button>
        </form>
    )
}

export default StepOne
