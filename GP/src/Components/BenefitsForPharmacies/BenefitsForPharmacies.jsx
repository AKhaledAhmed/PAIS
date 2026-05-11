import React from 'react'
import {
  Users,
  TrendingUp,
  Database,
  ShieldCheck,
} from "lucide-react";

const data = [
  {
    icon: Users,
    title: "Reach More Customers",
    desc: "Connect with patients actively searching for medicines you have in stock.",
  },
  {
    icon: TrendingUp,
    title: "Increase Sales",
    desc: "Turn online searches into in-store visits with real-time inventory visibility.",
  },
  {
    icon: Database,
    title: "Easy Inventory Management",
    desc: "Simple dashboard to update your stock levels and medicine availability.",
  },
  {
    icon: ShieldCheck,
    title: "Build Trust",
    desc: "Show transparency and reliability by keeping patients informed about availability.",
  },
];

export default function BenefitsForPharmacies() {
  return (
    <>
     <section className="w-full bg-white py-20 px-4">

      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          Benefits for Pharmacies
        </h2>

        <p className="text-slate-500">
          Grow your business and serve your community better
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

        {data.map((item, index) => {
          const Icon = item.icon;

          return (
          
<div
  key={index}
  className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left"
>
  <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-slate-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
     <item.icon className="w-7 h-7" />
  </div>
  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
    {item.title}
  </h3>
  <p className="text-slate-500 text-sm leading-relaxed">
    {item.desc}
  </p>
</div>

          );
        })}

      </div>
    </section>
    
    </>
  )
}
