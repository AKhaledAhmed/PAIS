import { LoaderPinwheel } from 'lucide-react'
import React from 'react'

export default function Loader() {
  return (
    <div>
        <div className="text-center flex justify-center items-center py-12 animate-spin text-teal-700"><LoaderPinwheel/></div>
    </div>
  )
}
