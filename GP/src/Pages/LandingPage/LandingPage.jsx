// import React from 'react'
// import HowItWork from '../../Components/HowItWork/HowItWork'
// import BenifitsOfPatients from '../../Components/BenifitsOfPatients/BenifitsOfPatients'
// import BenefitsForPharmacies from '../../Components/BenefitsForPharmacies/BenefitsForPharmacies'
// import { Link } from 'react-router-dom'
// import SearchBar from '../../Components/SearchBar/SearchBar'


// export default function LandingPage() {
  
//   return (
//     <>
    
//      <div className="min-h-screen w-full bg-[url(./assets/bg.avif)] bg-no-repeat bg-cover  ">
       
//         <div className="max-w-6xl mx-auto px-6">
//           <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center text-center px-6 md:px-12">
//             <div className="w-full">
//               <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
//                 Find Your Medicine,
//                 <br />
//                 <span className="text-cyan-700">When You Need It Most</span>
//               </h1>

//               <p className="mt-6 text-gray-600 text-lg md:text-xl">
//                 Stop wasting time calling pharmacies. PAIS connects you to
//                 real-time medicine availability across nearby pharmacies
//                 instantly.
//               </p>

//               <div className="mt-10 w-full flex justify-center">
//                 <SearchBar/>
//               </div>

//               <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
//                 <Link to={'/find-medicine'}>
//                 <button 
//                  className="px-8 py-4 bg-cyan-800 text-white rounded-xl font-semibold hover:opacity-90 transition">
//                   Search Medicine
//                 </button>
//                 </Link>

//                 <button className="px-8 py-4 border border-cyan-800 text-cyan-800 rounded-xl font-semibold hover:bg-gray-50 transition">
//                  <Link to={'/register'}> Register Your Pharmacy</Link>
//                 </button>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//     <HowItWork/>
//     <BenifitsOfPatients/>
//     <BenefitsForPharmacies/>
//     </>
//   )
// }



import React from 'react';
import HowItWork from '../../Components/HowItWork/HowItWork';
import BenifitsOfPatients from '../../Components/BenifitsOfPatients/BenifitsOfPatients';
import BenefitsForPharmacies from '../../Components/BenefitsForPharmacies/BenefitsForPharmacies';
import { Link } from 'react-router-dom';
import SearchBar from '../../Components/SearchBar/SearchBar';

export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        {/* Background Pattern - subtle dots or mesh */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <section className="min-h-[90vh] flex flex-col justify-center items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-sm font-medium">Real-time inventory tracking enabled</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Find Your Medicine, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500">
                When You Need It Most
              </span>
            </h1>

            <p className="mt-8 text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              PAIS leverages AI and geospatial data to connect you with 
              pharmacies having real-time availability. No more phone calls, just solutions.
            </p>
{/* 
            <div className="mt-12 w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-300">
              <SearchBar />
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">
              <Link to={'/find-medicine'}>
                <button className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all active:scale-95">
                  Search Medicine
                </button>
              </Link>

              <Link to={'/register'}>
                <button className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-teal-500 hover:text-teal-600 transition-all">
                  Register Pharmacy
                </button>
              </Link>
            </div> */}
          </section>
        </div>
      </div>

      <HowItWork />
      <BenifitsOfPatients />
      <div className="bg-slate-50">
        <BenefitsForPharmacies />
      </div>
    </div>
  );
}