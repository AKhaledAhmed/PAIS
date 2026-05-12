import React, { useEffect } from 'react';
import HowItWork from '../../Components/HowItWork/HowItWork';
import BenifitsOfPatients from '../../Components/BenifitsOfPatients/BenifitsOfPatients';
import BenefitsForPharmacies from '../../Components/BenefitsForPharmacies/BenefitsForPharmacies';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../Components/SearchBar/SearchBar';
import { useAuth, getDashboardPathForRole } from '../../Context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !role) return;
    const path = getDashboardPathForRole(role);
    if (path) navigate(path, { replace: true });
  }, [loading, isAuthenticated, role, navigate]);

  return (
    <div className="bg-slate-50 min-h-screen">
     
      <div className="relative overflow-hidden bg-white">
        
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