"use client"

import { useEffect, useState } from "react"
import { Textarea } from '@/components/ui/textarea';
import { Label } from "@/components/ui/label"
import Button from "@/components/atoms/form/Button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { updateUser } from "@/lib/actions/updateUser"
import { toast } from "sonner"
import useAuth from "@/hooks/useAuth"
import { ArrowBigLeft } from "lucide-react"
const islamicInterestsList = [
    "Qur'an Recitation",
    "Hadith Studies",
    "Fiqh",
    "Tafsir",
    "Arabic Language",
    "Islamic History",
]

const countryList = [
    "Nigeria", "United States", "United Kingdom", "Canada", "Egypt", "Turkey", "Pakistan", "Indonesia", "Malaysia", "Saudi Arabia", "South Africa", "India", "Bangladesh", "Morocco", "Algeria", "France", "Germany", "UAE", "Jordan", "Other"
];
const languageList = [
    "English", "Arabic", "French", "Hausa", "Yoruba", "Igbo", "Swahili", "Urdu", "Malay", "Turkish", "Bengali", "Farsi", "Somali", "Other"
];

export default function StepTwo({ data, setData, onNext, onPrev, className }) {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [localData, setLocalData] = useState({
        gender: "",
        interests: [],
        country: "",
        language: "",
        bio: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        setLocalData({
            gender: data.gender || "",
            interests: data.interests || [],
            country: data.country || "",
            language: data.language || "",
            bio: data.bio || "",
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

    const handleSubmit = async () => {
        setLoading(true)
        setError("")
        try {
            // Merge all data (step one + step two)
            const mergedData = { ...data, ...localData };
            // Use FormData for file upload
            const formData = new FormData();
            Object.entries(mergedData).forEach(([key, value]) => {
                if (key === "avatar" && value instanceof File) {
                    formData.append("avatar", value);
                } else if (Array.isArray(value)) {
                    value.forEach((v) => formData.append(key, v));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });
            const response = await updateUser(user._id, formData);
            if (response && response.success) {
                setData(mergedData);
                // Refresh user data after update
                await refreshUser(user._id);
                toast.success("Profile updated successfully!");
                router.push("/dashboard");
            } else if (response && response.message) {
                throw new Error(response.message);
            } else {
                throw new Error("Failed to update profile (no response from server)");
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
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
                    <Label className="text-md">Gender</Label>
                    <RadioGroup
                        value={localData.gender}
                        onValueChange={handleGenderChange}
                        className="flex gap-4 h-10 w-10"
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
                    <Label className="text-md">Islamic Interests</Label>
                    <div className="grid gap-2">
                        {islamicInterestsList.map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <Checkbox
                                    id={item}
                                    checked={localData.interests.includes(item)}
                                    onCheckedChange={() => handleCheckboxChange(item)}
                                    className="h-5 w-5"
                                />
                                <Label htmlFor={item}>{item}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Country Dropdown */}
                <div className="grid gap-2">
                    <Label className="text-md">Country</Label>
                    <Select
                        value={localData.country}
                        onValueChange={val => setLocalData(prev => ({ ...prev, country: val }))}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countryList.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Language Dropdown */}
                <div className="grid gap-2">
                    <Label className="text-md">Language</Label>
                    <Select
                        value={localData.language}
                        onValueChange={val => setLocalData(prev => ({ ...prev, language: val }))}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languageList.map((l) => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-md">Bio</Label>
                    <Textarea
                        name="bio"
                        id="bio"
                        value={localData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us a bit about yourself..."
                        required
                        className="w-full h-24 resize-none overflow-y-auto"
                        maxLength={500}
                    />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div className="flex justify-between mt-4 gap-4">
                    <Button wide round onClick={handleBack} disabled={loading} className="bg-accent hover:bg-highlight transition-colors text-sm">
                        <ArrowBigLeft className="mr-2" size={20} />    Back
                    </Button>
                    <Button wide loading={loading} round onClick={handleSubmit} disabled={loading} className="bg-accent hover:bg-highlight transition-colors text-sm">
                        Complete Setup
                    </Button>
                </div>
            </div>
        </div>
    )
}
