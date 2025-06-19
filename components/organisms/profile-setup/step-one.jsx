"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Button from "@/components/atoms/form/Button"
import { cn } from "@/lib/utils"
import ImageUpload from "@/components/atoms/form/ImageInput"

const StepOne = ({ onNext, data, setData, className }) => {
    const [avatar, setAvatar] = useState(null)
    const [error, setError] = useState("")

    const handleChange = (e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // When avatar is selected, store it in shared form data
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
        setData((prev) => ({ ...prev, avatar: file }));
    };

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
                    <Label htmlFor="age" className="text-md">Age</Label>
                    <Input
                        id="age"
                        name="age"
                        type="number"
                        min={5}
                        max={120}
                        value={data.age || ""}
                        onChange={handleChange}
                        placeholder="e.g. 25"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="country" className="text-md">Country</Label>
                    <Input
                        id="country"
                        name="country"
                        value={data.country || ""}
                        onChange={handleChange}
                        placeholder="e.g. Nigeria"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="language" className="text-md" >Language</Label>
                    <Input
                        id="language"
                        name="language"
                        value={data.language || ""}
                        onChange={handleChange}
                        placeholder="e.g. English"
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="profilePicture" className="text-md">Profile Picture</Label>
                    <ImageUpload
                        id="profilePicture"
                        onChange={handleAvatarChange}
                        image={avatar}
                    />
                    {error && <div className="text-xs text-red-500">{error}</div>}
                    {avatar && (
                        <img src={URL.createObjectURL(avatar)} alt="Avatar preview" className="w-16 h-16 rounded-full mt-2" />
                    )}
                </div>
            </div>

            <Button wide round type="submit" className="bg-accent hover:bg-highlight text-sm">
              Next
            </Button>
        </form>
    )
}

export default StepOne
