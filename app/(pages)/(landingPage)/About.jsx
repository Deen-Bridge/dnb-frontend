"use client"
import React from 'react'

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Button from '@/components/atoms/form/Button';
const About = () => {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 ">
            {/* Left Section - Text */}
            <div className="w-full flex flex-col justify-center items-start  my-4 sm:my-0 px-3 sm:x-10 text-accent space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold  leading-tight font-stretch-125% ">
                    Where Deen Meets <br />
                    <span className="">Excellence</span>
                </h2>
                <p className="text-lg font-light text-black mt-4">
                    We believe in providing quality education at an affordable cost. Our fee structure is
                    clear, well-structured, and designed to ensure every child gets the best learning experience
                    without financial strain.
                </p>

                {/* CTA Button */}
                <div className='w-full'>


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
                    height={600}
                    className="w-full"
                />
            </div>
        </section>
    )
}

export default About
