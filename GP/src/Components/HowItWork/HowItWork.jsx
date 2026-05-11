// import React from 'react'
// import { Contact, MapPin, PhoneCall, Search, SearchIcon } from "lucide-react";
// export default function HowItWork() {
//   return (
//    <>
//     <section className="w-screen bg-gray-100 py-20 ">

//       <div className="max-w-6xl mx-auto px-6">

//         <div className="text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//             How PAIS Works
//           </h2>

//           <p className="mt-4 text-gray-600 text-lg">
//             Finding your medicine is as simple as three steps
//           </p>
//         </div>

//         <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

//           <div>
//             <div className="relative w-24 h-24 mx-auto bg-cyan-50 rounded-full flex items-center justify-center">
//               <span className="absolute -top-2 bg-cyan-600 text-white text-sm px-2 py-1 rounded-md">
//                 1
//               </span>
//               {/* <i className="fa-solid fa-magnifying-glass text-3xl text-blue-600"></i> */}
//               <SearchIcon className='text-cyan-600 ' size={30}/>
//             </div>

//             <h3 className="mt-6 text-xl font-semibold text-gray-900">
//               Search Your Medicine
//             </h3>

//             <p className="mt-3 text-gray-600">
//               Enter the medicine name or active ingredient you're looking for
//             </p>
//           </div>

//           <div>
//             <div className="relative w-24 h-24 mx-auto bg-cyan-50 rounded-full flex items-center justify-center">
//               <span className="absolute -top-2 bg-cyan-600 text-white text-sm px-2 py-1 rounded-md">
//                 2
//               </span>
//               {/* <i className="fa-solid fa-location-dot text-3xl text-blue-600"></i> */}
//               <MapPin className='text-cyan-600 ' size={30}/>
//             </div>

//             <h3 className="mt-6 text-xl font-semibold text-gray-900">
//               View Availability
//             </h3>

//             <p className="mt-3 text-gray-600">
//               See which nearby pharmacies have it in stock with real-time updates
//             </p>
//           </div>

//           <div>
//             <div className="relative w-24 h-24 mx-auto bg-cyan-50 rounded-full flex items-center justify-center">
//               <span className="absolute -top-2 bg-cyan-600 text-white text-sm px-2 py-1 rounded-md">
//                 3
//               </span>
//               {/* <i className="fa-solid fa-phone text-3xl text-blue-600"></i> */}
//               <PhoneCall className='text-cyan-600 ' size={30}/>
//             </div>

//             <h3 className="mt-6 text-xl font-semibold text-gray-900">
//               Contact & Get Directions
//             </h3>

//             <p className="mt-3 text-gray-600">
//               Call the pharmacy directly or get directions to pick up your medicine
//             </p>
//           </div>

//         </div>
//       </div>
//     </section>
   
//    </>
//   )
// }





import { MapPin, PhoneCall, SearchIcon } from "lucide-react";

export default function HowItWork() {
  const steps = [
    {
      icon: SearchIcon,
      title: "Search Your Medicine",
      desc: "Enter the name or active ingredient. Our AI suggests alternatives if it's out of stock.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: MapPin,
      title: "View Availability",
      desc: "See real-time stock levels ranked by your current GPS distance.",
      color: "bg-teal-50 text-teal-600"
    },
    {
      icon: PhoneCall,
      title: "Contact & Get Directions",
      desc: "Instant access to pharmacy details, map pins, and direct contact.",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          How PAIS Empowers You
        </h2>
        <div className="mt-2 w-20 h-1.5 bg-teal-500 mx-auto rounded-full"></div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-slate-200 -z-0"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 group">
              <div className={`w-20 h-20 mx-auto ${step.color} rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <step.icon size={32} />
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">
                  {idx + 1}
                </span>
              </div>
              <h3 className="mt-8 text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-4 text-slate-500 leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}