import { Button, Card } from '@heroui/react';
import { Navigation, Phone,ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MedicineCard({
  name,
  image,
  category,
  description,
  activeIngredient,
  id,
  onGetAlternatives, alternatives = [], isLoadingAlternatives
}) {
 const [showAlternatives, setShowAlternatives] = useState(false);

    function handleToggleAlternatives() {
    if (!showAlternatives && alternatives.length === 0) {
      onGetAlternatives(); 
      return;
    }
    setShowAlternatives(!showAlternatives);
  }

  useEffect(() => {
  if (alternatives.length > 0 && !isLoadingAlternatives) {
    setShowAlternatives(true);
  }
}, [alternatives, isLoadingAlternatives]);
  return (
    <>
      <Card className="hover:shadow-md transition-shadow bg-white rounded-xl">
        <div className="p-5">
        
          <div className="flex items-start gap-4 mb-4">
       
            <img
              src={image}
              alt={name}
              className="w-16 h-16 object-cover rounded-lg "
            />

           
            <div className="flex-1">
               <Link to={`/medicine/${id}`}>
              <h3 className="font-semibold text-lg mb-1 hover:underline">
                {name}
              </h3>
            </Link>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Active ingredient: </span>
                {activeIngredient}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <span className="font-medium">Category: </span>
                {category}
              </p>
              <p className="text-sm text-gray-600 mt-2">{description}</p>
              
                  <button
              onClick={handleToggleAlternatives}
              className="mt-3 flex items-center gap-1 text-sm text-cyan-700 font-medium hover:underline"
            >
              {isLoadingAlternatives ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : showAlternatives ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showAlternatives ? 'Hide Alternatives' : 'Show Alternatives'}
            </button>
            </div>
          </div>

              {/* قائمة الـ Alternatives */}
        {showAlternatives && (
          <div className="mt-3 border-t pt-3">
            {isLoadingAlternatives ? (
              <p className="text-sm text-gray-400 text-center py-2">Loading alternatives...</p>
            ) : alternatives.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">No alternatives found</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">AI Alternatives</p>
                {alternatives.map((alt) => (
                  <Link
                    to={`/medicine/${alt._id}`}
                    key={alt._id}
                    className="flex items-center justify-between p-2 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alt.name}</p>
                      <p className="text-xs text-gray-500">{alt.category}</p>
                    </div>
                    <span className="text-xs font-bold text-cyan-700 bg-cyan-100 px-2 py-1 rounded-full">
                      {alt.score}% match
                    </span>
                  </Link>




                ))}
              </div>
            )}
          </div>
        )}  
          
        </div>
      </Card>
    </>
  );
}