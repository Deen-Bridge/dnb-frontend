import React from 'react'
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { poppins_500 } from '@/lib/config/font.config';
const DnbLogo = () => {
  return (
    <div className='flex justify-start items-center gap-3 text-left text-sm leading-tight'>
          <Image alt="dnb-logo" src="/images/dnb.png" width={30} height={30} />
      <span className={cn(poppins_500.className, "truncate font-semibold text-accent")}>Deen Bridge</span>
    </div>
  )
}

export default DnbLogo;
