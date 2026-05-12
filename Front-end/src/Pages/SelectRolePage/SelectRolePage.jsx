
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Store, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SelectRole() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'patient',
      title: 'Patient / Guest',
      description: 'Search for medicines, find nearby pharmacies, and get availability alerts.',
      icon: User,
      color: 'teal',
      path: '/register'
    },
    {
      id: 'pharmacist',
      title: 'Pharmacist',
      description: 'Manage your pharmacy inventory, update stock levels, and reach more customers.',
      icon: Store,
      color: 'cyan',
      path: '/register'
    },
    {
      id: 'admin',
      title: 'System Admin',
      description: 'Access system-wide logs, approve pharmacy registrations, and manage master lists.',
      icon: ShieldCheck,
      color: 'indigo',
      path: '/login' 
    }
  ];

  return (
    <div className="min-h-[90vh] bg-slate-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-5xl w-full text-center">
        
      
        <div className="mb-16 animate-fade-in">
          <h2 className="text-sm font-bold tracking-widest text-teal-600 uppercase mb-3">Get Started</h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Choose Your <span className="text-teal-600">Account Type</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Select the role that best describes how you will use PAIS. Each role has specialized tools just for you.
          </p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => navigate(role.path)}
                className="group relative bg-white rounded-4xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-100 hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left overflow-hidden"
              >
               
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-[4] transition-transform duration-700 z-0"></div>

                <div className="relative z-10">
                 
                  <div className={`w-16 h-16 mb-8 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300`}>
                    <Icon size={32} />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-teal-700 transition-colors">
                    {role.title}
                  </h3>

                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    {role.description}
                  </p>

                  <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                    Select Role 
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

       
        <p className="mt-16 text-slate-400 text-sm">
          Already have an account? 
          <button onClick={() => navigate('/login')} className="ml-2 text-teal-600 font-bold hover:underline">
            Log in here
          </button>
        </p>

      </div>
    </div>
  );
}