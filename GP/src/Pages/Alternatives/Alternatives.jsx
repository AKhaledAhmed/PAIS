import React from 'react'
import RequestedMedicine from '../RequestedMedicine/RequestedMedicine';
import AlternativeCard from '../../Components/AlternativeCard/AlternativeCard';

export default function Alternatives({
  requestedMedicine,
  activeIngredient,
  onBack,
  onViewPharmacies,
  onLoginClick
}) {
 const alternatives = [
  {
    id: "1",
    medicineName: "Paracetamol Plus",
    activeIngredient: "Paracetamol 500mg",
    pharmacyCount: 8,
    manufacturer: "PharmaCorp Ltd."
  },
  {
    id: "2",
    medicineName: "ParaRelief",
    activeIngredient: "Paracetamol 500mg",
    pharmacyCount: 5,
    manufacturer: "HealthGen Pharmaceuticals"
  },
  {
    id: "3",
    medicineName: "Acetamol",
    activeIngredient: "Paracetamol 500mg",
    pharmacyCount: 3,
    manufacturer: "MediCare Labs"
  },
  {
    id: "4",
    medicineName: "FeverEase",
    activeIngredient: "Paracetamol 500mg",
    pharmacyCount: 6,
    manufacturer: "WellnessRx"
  }
];

 
    return (
    <>
      <div className="mb-6 py-5 ml-2 ">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Medicine Alternatives
          </h1>
          <p className="text-gray-600">
            Alternative medicines with the same active ingredient
          </p>
        </div>

        {/* Requested Medicine Section */}
        <div className="mb-8 ">
          <RequestedMedicine 
            medicineName={requestedMedicine}
            activeIngredient={activeIngredient}
          />
        </div>

        {/* Alternatives Section */}
        <div className="mb-4 ml-2 ">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Available Alternatives
          </h2>
          <p className="text-gray-600 text-sm">
            These medicines contain the same active ingredient and may be suitable substitutes.
            Always consult your doctor before switching medications.
          </p>
        </div>

        <div className="space-y-4 ">
          {alternatives?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                No alternatives found at this time.
              </p>
            </div>
          ) : (
            alternatives.map((alternative) => (
              <AlternativeCard
                key={alternative.id}
                medicineName={alternative.medicineName}
                activeIngredient={alternative.activeIngredient}
                pharmacyCount={alternative.pharmacyCount}
                manufacturer={alternative.manufacturer}
                onViewPharmacies={() => {
                  console.log("Viewing pharmacies for:", alternative.medicineName);
                  if (onViewPharmacies) {
                    onViewPharmacies(alternative);
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 mb-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Medical Notice:</span> The alternatives shown contain the same active ingredient 
            but may have different formulations, dosages, or inactive ingredients. Please consult with your healthcare 
            provider or pharmacist before switching medications.
          </p>
        </div>
    

    </>
  )
}
