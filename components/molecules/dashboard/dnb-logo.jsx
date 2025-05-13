import React from 'react'
import Link from 'next/link';
import { GalleryVerticalEnd } from 'lucide-react';
const DnbLogo = () => {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <Link href="/" className="flex items-center gap-2 font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Deen Bridge
      </Link>
    </div>
  )
}

export default DnbLogo;
