
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill } from 'lucide-react'; 
import { useAuth } from '../../Context/AuthContext';
import NotificationBell from '../NotificationBell/NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        
       
        <Link to={'/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-linear-to-br from-teal-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200 group-hover:rotate-12 transition-transform duration-300">
            <Pill size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            PAIS<span className="text-teal-600">.</span>
          </span>
        </Link>


        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <Link to="/find-medicine" className="hover:text-teal-600 transition-colors">Find Medicine</Link>
          <Link to="/profile" className="hover:text-teal-600 transition-colors">Profile</Link>
       
        </div>

       
        <div className="flex items-center gap-4">
           {!isAuthenticated ? (
            <>
              <Link 
                to={"/login"} 
                className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors"
              >
                Login
              </Link>
              
              <Link to={"/select-role"}>
                <button className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 shadow-md hover:shadow-teal-100 transition-all active:scale-95">
                  Get Started
                </button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
    <NotificationBell /> {/* ✅ */}
    <button
      onClick={handleLogout}
      className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all active:scale-95"
    >
      Logout
    </button>
  </div>
          )}
        </div>
      </div>
    </nav>
  );
}
