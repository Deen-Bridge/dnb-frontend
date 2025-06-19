"use client"
import React from 'react'

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Button from '@/components/atoms/form/Button';
const About = () => {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 sm:h-96">
            {/* Left Section - Text */}
            <div className="w-full flex flex-col justify-center items-start  my-4 sm:my-0 px-3 sm:mx-10 text-accent space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold  leading-tight font-stretch-125% ">
                    Where Deen Meets <br />
                    <span className="">Excellence</span>
                </h2>
                <p className="text-lg leading-relaxed text-black mt-4 w-full sm:max-w-lg">
                    We are dedicated to connecting Muslims worldwide through meaningful conversations, authentic knowledge, and a supportive community. DeenBridge empowers users to learn, share, and grow in their faith by providing access to trusted resources, inspiring books, and opportunities to engage with others on their journey of Islamic excellence.
                </p>

                {/* CTA Button */}
                <div className='w-full sm:max-w-lg'>
                    <Button wide round className="text-white  transition-all duration-300">
                        Explore
                    </Button>
                </div>
            </div>

            {/* Right Section - Wider Image */}

            <div className="w-full sm:min-h-fit ">
                <Image
                    src="/images/mosque.png"
                    alt="mosque"
                    width={1000} // Increased width
                    height={300}
                    className="w-full object-contain"
                />
            </div>
        </section>
    )
}

export default About
