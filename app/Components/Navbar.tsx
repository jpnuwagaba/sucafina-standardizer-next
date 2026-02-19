import React from 'react'
import Image from 'next/image'

const Navbar = () => {
  return (
    <div className="p-2 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image src="/assets/logo.svg" alt="Logo" width={50} height={50} />
        </div>
        <div className="">          
        </div>
      </div>
    </div>
  )
}

export default Navbar