"use client"

import StepOne from '@/components/organisms/profile-setup/step-one'
import StepTwo from '@/components/organisms/profile-setup/step-two'
// import StepThree from '@/components/organisms/profile-setup/step-three' // you can add more steps later
import { GalleryVerticalEnd } from 'lucide-react'
import React, { useState } from 'react'
import Image from "next/image"
import Link from 'next/link'

const ProfileSetupPage = () => {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({})

    const nextStep = () => setStep((prev) => prev + 1)
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

    const steps = {
        1: <StepOne data={formData} setData={setFormData} onNext={nextStep} />,
        2: <StepTwo data={formData} setData={setFormData} onNext={nextStep} onPrev={prevStep} />
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Deen Bridge
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs sm:max-w-lg">
                        {steps[step]}
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <Image
                    src="/images/profile-setup-img.jpeg"
                    alt="Image"
                    width={550}
                    height={50}
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}

export default ProfileSetupPage
