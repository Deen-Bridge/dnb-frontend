import React from 'react'
import Image from 'next/image';
const Loader = () => {
  return (
      <Image src="/images/dnd-nobg.png" alt="dnb-logo" className='animate-pulse' width={50} height={50}/>
  )
}

export default Loader;
