import { Button, Card } from '@heroui/react'
import { MapPin, Navigation, Phone } from 'lucide-react'
import React from 'react'

export default function PharmacyCard({distance,name,address}) {
  return (
    <>
     <Card className="hover:shadow-md transition-shadow bg-white rounded-xl">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin className="size-4" />
                <p>{distance}</p>
                
            </div>
            <p className='text-gray-500 text-sm'>{address}</p>
          </div>
                
    </div>

        <div className="flex justify-center gap-10">
          <Button 
            className="flex gap-2 border rounded-lg px-16 py-6 overflow-hidden"    >
            <Phone className="size-4" />
            Call Pharmacy
          </Button>
          <Button 
            className="flex bg-black text-white rounded-lg px-16 py-6 overflow-hidden"
          >
            <Navigation className="size-4" />
            Get Directions
          </Button>
        </div>
      </div>
    </Card>
    </>
  )
}
