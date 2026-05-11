import { Card } from '@heroui/react'
import { MapPin } from 'lucide-react'
import React from 'react'

export default function MapPlaceholder() {
  return (
   <>
    <Card className="w-full">
      
        <div className="bg-white rounded-lg h-80 flex items-center justify-center m-2">
          <div className="text-center">
            <div className="size-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <MapPin className="size-8 text-cyan-600" />
            </div>
            <p className="text-gray-600 font-medium">Map View</p>
            <p className="text-sm text-gray-500 mt-1">Pharmacies will be displayed here</p>
          </div>
        </div>
     
    </Card>
   
   </>
  )
}
