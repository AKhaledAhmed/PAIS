import { Card } from '@heroui/react'
import { Info, XCircle } from 'lucide-react'
import React from 'react'

export default function RequestedMedicine({ medicineName, activeIngredient }) {
  return (
    <>
    <Card className="border-red-200 bg-red-50 container mx-auto rounded-lg">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="size-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="size-6 text-red-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {medicineName}
              </h2>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Out of Stock
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">
              Active Ingredient: <span className="font-medium">{activeIngredient}</span>
            </p>
            
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                This medicine is currently unavailable at nearby pharmacies. 
                We've found alternatives with the same active ingredient below.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
    
    </>
  )
}
