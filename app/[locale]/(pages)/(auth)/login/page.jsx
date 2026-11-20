import LoginForm from '@/components/organisms/auth/login-form'
import ForgetPassword from '@/components/organisms/auth/forget-password'
import { GalleryVerticalEnd } from 'lucide-react'
import React, { Suspense } from 'react'
import Image from "next/image"
import Link from 'next/link'
import { siteUrl, siteName } from "@/lib/config/site.config"
import SessionEndedNotice from "@/components/auth/SessionEndedNotice"

export const metadata = {
  title: { absolute: "Sign in | Deen Bridge" },
  description:
    "Sign in to your Deen Bridge account to access your courses, books, community spaces, and AI assistant.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Sign in | Deen Bridge",
    description:
      "Sign in to your Deen Bridge account to access your courses, books, community spaces, and AI assistant.",
    url: `${siteUrl}/login`,
    siteName,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Deen Bridge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign in | Deen Bridge",
    description:
      "Sign in to your Deen Bridge account to access your courses, books, community spaces, and AI assistant.",
    images: ["/og.png"],
  },
}
const page = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium font-stretch-125%">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Deen Bridge
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={null}>
              <SessionEndedNotice />
            </Suspense>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/mosque.png"
          alt=""
          width={250}
          height={250}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default page
