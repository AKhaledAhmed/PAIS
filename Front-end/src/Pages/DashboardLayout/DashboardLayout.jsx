import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { LayoutDashboard, Package, Upload, LogOut, User, Bell, User2 } from 'lucide-react';
import NotificationBell from '../../Components/NotificationBell/NotificationBell';

export default function DashboardLayout() {
  const {logout,role}= useAuth();
  const navigate = useNavigate()

    function handleLogout(){
      logout();
      navigate('/login')
    }

    const pharmacyLinks = [
    { to: '/pharmacist', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { to: '/pharmacist/inventory', label: 'Inventory', icon: <Package size={18}/> },
    { to: '/pharmacist/bulk-upload', label: 'Bulk Upload', icon: <Upload size={18}/> },
    { to: '/pharmacist/profile', label: 'Profile', icon: <User  size={18}/> },
     { to: '/pharmacist/notifications', label: 'Notifications', icon: <Bell size={18}/> },
   
  ];
  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { to: '/admin/pharmacies', label: 'Pharmacies', icon: <Package size={18}/> },
    { to: '/admin/drugs', label: 'Drug Catalog', icon: <Package size={18}/> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell size={18}/> },
     { to: '/admin/profile', label: 'Profile', icon: <User2 size={18}/> },
  ];

const links = role === 'admin' ? adminLinks : pharmacyLinks;

  return (
    <>
     <div className="min-h-screen flex">
      <aside className="w-64 bg-cyan-900 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-8 bg-cyan-700 p-3 rounded-xl text-center">
            PAIS Dashboard  
          </h2>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-cyan-700 transition"
              >
                {link.icon}
                {link.label}
              </Link>

              
            ))}
      
            <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 bg-red-600 rounded-xl hover:bg-red-700 transition w-full"
        >
          <LogOut size={18}/> Logout
        </button>
          </nav>
        </div>
        
      </aside>
      <main className="flex-1 bg-slate-50 p-6">
        <Outlet />
      </main>
    </div>
    </>
  )
}
