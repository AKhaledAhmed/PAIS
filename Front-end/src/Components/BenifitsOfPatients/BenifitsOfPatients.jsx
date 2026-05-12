import { Bell, CheckCircle, Clock, Map } from 'lucide-react';
import React from 'react'

export default function BenifitsOfPatients() {

      const data = [
    {
      icon: Clock,
      title: "Save Time",
      desc: "No more calling multiple pharmacies. Find what you need in seconds.",
    },
    {
      icon: Map,
      title: "Nearby Locations",
      desc: "Automatically see pharmacies near you with distance and directions.",
    },
    {
      icon: CheckCircle,
      title: "Real-Time Availability",
      desc: "Get accurate, up-to-date stock information before you visit.",
    },
    {
      icon: Bell,
      title: "Stock Alerts",
      desc: "Get notified when out-of-stock medicines become available.",
    },
  ];
  return (
    <>
     <section className="w-full bg-gray-100 py-20 ">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Benefits for Patients
        </h2>

        <p className="text-gray-500 mb-14">
          Access to medicine information at your fingertips
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map((item, index) => (
          
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
          ))}
        </div>
      </div>
    </section>
    
    </>
  )
}
