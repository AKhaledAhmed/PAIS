import { Button, Card } from '@heroui/react'
import { CheckCircle, Store } from 'lucide-react'
import React from 'react'

export default function AlternativeCard({
  medicineName,
  activeIngredient,
  pharmacyCount,
  manufacturer
}) {
  return (
    <>
    <Card className="hover:shadow-md transition-shadow border-1 rounded-xl container mx-auto">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-5 text-cyan-600 shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">
                {medicineName}
              </h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Active Ingredient:</span> {activeIngredient}
              </p>
              {manufacturer && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Manufacturer:</span> {manufacturer}
                </p>
              )}
            </div>
          </div>
          
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1.5 text-cyan-600 mb-1">
              <Store className="size-4" />
              <span className="text-2xl font-semibold">{pharmacyCount}</span>
            </div>
            <p className="text-xs text-gray-500">
              {pharmacyCount === 1 ? 'pharmacy' : 'pharmacies'}
            </p>
          </div>
        </div>

        <Button 
          className="w-full bg-black text-white rounded-2xl"
         
        >
          View Pharmacies
        </Button>
      </div>
    </Card>
    
    </>
  )
}
