"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const islamicInterestsList = [
    "Qur'an Recitation",
    "Hadith Studies",
    "Fiqh",
    "Tafsir",
    "Arabic Language",
    "Islamic History",
]

export default function StepTwo({ data, setData, onNext, onPrev, className }) {
    const [localData, setLocalData] = useState({
        username: "",
        gender: "",
        interests: [],
    })

    useEffect(() => {
        setLocalData({
            username: data.username || "",
            gender: data.gender || "",
            interests: data.interests || [],
        })
    }, [data])

    const handleInputChange = (e) => {
        setLocalData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleGenderChange = (value) => {
        setLocalData((prev) => ({
            ...prev,
            gender: value,
        }))
    }

    const handleCheckboxChange = (item) => {
        setLocalData((prev) => {
            const alreadySelected = prev.interests.includes(item)
            return {
                ...prev,
                interests: alreadySelected
                    ? prev.interests.filter((i) => i !== item)
                    : [...prev.interests, item],
            }
        })
    }

    const handleNext = () => {
        setData({ ...data, ...localData })
        onNext()
    }

    const handleBack = () => {
        setData({ ...data, ...localData })
        onPrev()
    }

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-xl font-semibold">More about you</h2>
                <p className="text-sm text-muted-foreground">
                    This helps us personalize your experience.
                </p>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        placeholder="e.g. deenbro123"
                        value={localData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Gender</Label>
                    <RadioGroup
                        value={localData.gender}
                        onValueChange={handleGenderChange}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">Female</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="grid gap-2">
                    <Label>Islamic Interests</Label>
                    <div className="grid gap-2">
                        {islamicInterestsList.map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <Checkbox
                                    id={item}
                                    checked={localData.interests.includes(item)}
                                    onCheckedChange={() => handleCheckboxChange(item)}
                                />
                                <Label htmlFor={item}>{item}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={handleBack}>
                        Back
                    </Button>
                    <Button onClick={handleNext}>Next</Button>
                </div>
            </div>
        </div>
    )
}
