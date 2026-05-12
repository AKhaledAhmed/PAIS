import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { useAuth, getDashboardPathForRole } from '../../Context/AuthContext';
import AuthFormLogo from '../../Components/AuthFormLogo/AuthFormLogo';

export default function Login() {
  const location =useLocation();
  const from = location.state?.from?.pathname;
  const { login } = useAuth(); 
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      role: 'client' 
    }
  });

 
const onSubmit = async (data) => {
  setServerError("");
  try {
    let endpoint = '';
    
    if (data.role === 'admin') {
      endpoint = 'https://pais-production.up.railway.app/api/admin/login';
    } else if (data.role === 'pharmacy') {
      endpoint = 'https://pais-production.up.railway.app/api/pharmacy/login';
    } else {
      endpoint = 'https://pais-production.up.railway.app/api/client/login';
    }

    const payload =
      data.role === 'pharmacy'
        ? { pharmacyEmail: data.email, password: data.password }
        : { email: data.email, password: data.password };

    const response = await axios.post(endpoint, payload);

    if (response.data.success) {
      const authData = response.data.data;
         

      login(authData, data.role);

      const home = getDashboardPathForRole(data.role);
      if (home) navigate(from && from !== '/' ? from : home, { replace: true });
    }
   

  } catch (error) {
   

const msg =
      error.response?.data?.errors?.[0]?.msg ||
      error.response?.data?.message ||
      "Invalid email or password.";
    setServerError(msg);

  }
};
  return (
    <div className="bg-gray-50 min-h-screen py-24 flex items-center px-4">
      <div className="bg-white w-full max-w-md mx-auto p-8 rounded-3xl shadow-xl border border-gray-100">
        <AuthFormLogo />
        <h2 className="font-bold text-3xl text-cyan-900 mb-2 text-center">Sign in</h2>
        <p className="text-gray-400 mb-8 text-center">Access your PAIS account</p>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Identify yourself as:</label>
            <select 
              {...register('role', { required: true })}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-600 outline-none transition-all"
            >
              <option value="client">Patient / Client</option>
              <option value="pharmacy">Pharmacist</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

      
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              {...register('email', { 
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
              })}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-600 outline-none transition-all"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              {...register('password', { required: "Password is required" })}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-600 outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-cyan-900 text-white py-3.5 rounded-xl font-bold hover:bg-cyan-950 transition-all shadow-lg shadow-cyan-100 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="w-full border-2 border-cyan-900 text-cyan-900 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-all"
          >
            Continue as Guest
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500">
          Don't have an account? <Link to="/register" className="text-cyan-700 font-extrabold hover:underline">Sign up now</Link>
        </p>
      </div>
    </div>
  );
}