// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Link, useNavigate } from 'react-router-dom';

// // Schema بتاع الـ validation
// const loginSchema = z.object({
//   email: z
//     .string()
//     .email('Please enter a valid email address'),
//   password: z
//     .string()
//     .min(8, 'Password must be at least 8 characters long')
//     .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//     .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
//     .regex(/[0-9]/, 'Password must contain at least one digit')
//     .regex(
//       /[^A-Za-z0-9]/,
//       'Password must contain at least one special character (e.g. ! @ # $ %)'
//     ),
//   role: z.enum(['patient', 'pharmacist', 'admin'], {
//     required_error: 'Please select a role',
//   }),
// });

// export default function Login() {
//   const navigate = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: '',
//       password: '',
     
//     },
//   });

//   const onSubmit = (data) => {
//     // لحد ما الباك ييجي: validation + mock login
//     console.log('Login data:', data);

//      const savedUserString = localStorage.getItem('user');
//   if (!savedUserString) {
//     // مفيش حد مسجل قبل كده
//     alert('No registered user found. Please register first.');
//     return;
//   }
//   const savedUser = JSON.parse(savedUserString);
//   // مقارنة الإيميل والباسورد
//   if (data.email !== savedUser.email || data.password !== savedUser.password) {
//     alert('Invalid email or password');
//     return;
//   }
//   // لو تمام: نحفظ role الحالي (للسيشن) ونعمل navigate حسبه
//   localStorage.setItem('role', savedUser.role);
//   if (savedUser.role === 'patient') {
//     navigate('/find-medicine');
//   } else if (savedUser.role === 'pharmacist') {
//     navigate('/pharmacist');
//   } else if (savedUser.role === 'admin') {
//     navigate('/admin');
//   }
//   };

//   const handleGuest = () => {
  
//   localStorage.removeItem('role');
  
//   navigate('/');
// };
//   return (
//     <>
//       <div className="bg-gray-50 min-h-screen py-24">
//         <div className="bg-white w-3/4 md:w-1/2 mx-auto p-8 rounded-2xl">
//           <h2 className="font-bold text-xl mb-3 animate-pulse">Sign in</h2>
//           <p className="text-gray-400">Access Your Account</p>

//           <form
//             className="flex flex-col items-center p-10"
//             onSubmit={handleSubmit(onSubmit)}
//           >
//             {/* Email */}
//             <div className="p-2 w-full flex flex-col items-start max-w-md">
//               <label className="block" htmlFor="email">
//                 Email:
//               </label>
//               <input
//                 type="email"
//                 placeholder="your@email.com"
//                 {...register('email')}
//                 id="email"
//                 className="bg-gray-100 p-2 rounded-lg w-96"
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             {/* Password */}
//             <div className="p-2 w-full flex flex-col items-start max-w-md">
//               <label className="block" htmlFor="password">
//                 Password:
//               </label>
//               <input
//                 type="password"
//                 placeholder="Your password"
//                 {...register('password')}
//                 id="password"
//                 className="bg-gray-100 p-2 rounded-lg w-96"
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>


//             <button
//               className="bg-cyan-900 text-white rounded-xl mt-3 mx-auto p-2 w-96 cursor-pointer hover:opacity-90"
//               type="submit"
//             >
//               Login
//             </button>

//             <button
//               className="border-1 text-cyan-800 rounded-xl mt-3 mx-auto p-2 w-96 cursor-pointer hover:bg-gray-50"
//               type="button"
//               onClick={handleGuest}

//             >
//               Continue As Guest
//             </button>
//           </form>

//           <p className="text-center text-gray-500">
//             Don't have any Account?{' '}
//             <span className="text-cyan-600">
//               <Link to="/register">Register Now</Link>
//             </span>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }



// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate, Link } from 'react-router-dom';
// import axios from 'axios'; 
// import { useAuth } from '../../Context/AuthContext';
// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const { register, handleSubmit, formState: { errors } } = useForm();

//   const onSubmit = async (data) => {
//     try {
//       let response;
      
//       // 1. إذا كان المختار هو أدمن، نستخدم الرابط الخاص به من الـ Documentation
//       if (data.role === 'admin') {
//         response = await axios.post('https://pais-production.up.railway.app/api/admin/login', {
//           email: data.email,
//           password: data.password
//         });
        
//         // الأدمن في الـ Documentation لا يرجع Body، لكن غالباً الـ Token يكون في الـ Headers
//         // أو إذا كان هناك Token سنحفظه
//         const token = response.headers['authorization']; 
//         localStorage.setItem('token', token);
//         localStorage.setItem('role', 'admin');
//         navigate('/admin'); // يذهب للوحة تحكم الأدمن
//       } 
      
//       // 2. إذا كان صيدلي أو مريض (بافتراض وجود روابط لهم)
//       else {
//         // هنا تضع رابط لوجن المستخدمين العاديين (سأضعه كمثال)
//         // response = await axios.post('https://.../api/users/login', data);
        
//         // للتجربة حالياً سنعتمد على اللوجيك القديم أو رابط افتراضي
//         localStorage.setItem('role', data.role);
//         if (data.role === 'patient') navigate('/find-medicine');
//         else navigate('/pharmacist');
//       }

//     } catch (error) {
//       console.error("Login Error:", error);
//       alert("Login Failed: Check your email/password or Role");
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-24 flex items-center">
//       <div className="bg-white w-full max-w-md mx-auto p-8 rounded-2xl shadow-lg">
//         <h2 className="font-bold text-2xl text-cyan-900 mb-2">Sign in</h2>
//         <p className="text-gray-400 mb-6">Access your PAIS account</p>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* اختيار الدور مهم جداً هنا عشان نعرف نبعت لمين */}
//           <div>
//             <label className="block mb-1 text-sm font-medium">Identify yourself as:</label>
//             <select 
//               {...register('role', { required: true })}
//               className="w-full p-2.5 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-cyan-600"
//             >
//               <option value="patient">Patient / Guest</option>
//               <option value="pharmacist">Pharmacist</option>
//               <option value="admin">Administrator</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1 text-sm font-medium">Email</label>
//             <input 
//               type="email" 
//               {...register('email', { required: "Email is required" })}
//               className="w-full p-2.5 bg-gray-100 rounded-lg border-none"
//               placeholder="admin@pais.com"
//             />
//           </div>

//           <div>
//             <label className="block mb-1 text-sm font-medium">Password</label>
//             <input 
//               type="password" 
//               {...register('password', { required: "Password is required" })}
//               className="w-full p-2.5 bg-gray-100 rounded-lg border-none"
//               placeholder="••••••••"
//             />
//           </div>

//           <button type="submit" className="w-full bg-cyan-900 text-white py-3 rounded-xl font-bold hover:bg-cyan-800 transition">
//             Login
//           </button>
          
//           <button 
//             type="button" 
//             onClick={() => navigate('/')} 
//             className="w-full border border-cyan-900 text-cyan-900 py-3 rounded-xl font-bold hover:bg-gray-50"
//           >
//             Continue as Guest
//           </button>
//         </form>
//         <p className="text-center mt-6 text-gray-500">
//                   you don't have any account? <Link to="/register" className="text-cyan-700 font-bold">Sign up</Link>
//                 </p>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { useAuth } from '../../Context/AuthContext';

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

  // const onSubmit = async (data) => {
  //   setServerError("");
  //   try {
  //     let endpoint = '';
      
      
  //     if (data.role === 'admin') {
  //       endpoint = 'https://pais-production.up.railway.app/api/admin/login';
  //     } else if (data.role === 'pharmacy') {
  //       endpoint = 'https://pais-production.up.railway.app/api/pharmacies/login';
  //     } else {
  //       endpoint = 'https://pais-production.up.railway.app/api/clients/login';
  //     }

  //     // 2. إرسال الطلب للسيرفر
  //     const response = await axios.post(endpoint, {
  //       email: data.email,
  //       password: data.password
  //     });

  //     // 3. هندلة النجاح
  //     if (response.data.success || data.role === 'admin') {
  //       // الأدمن قد لا يرجع success: true في الـ body حسب الـ docs، لذا نتأكد
  //       const authData = response.data.data || {};
        
  //       // إذا كان أدمن والـ body فارغ، نأخذ التوكن من الهيدر (كما ذكرتِ سابقاً)
  //       if (data.role === 'admin' && !authData.accessToken) {
  //         authData.accessToken = response.headers['authorization']?.split(' ')[1];
  //       }

  //       // حفظ البيانات في الـ Context (التوكنز + بيانات المستخدم)
  //       login(authData, data.role);

  //       // 4. التوجيه حسب الدور
  //       if (data.role === 'admin') navigate('/admin');
  //       else if (data.role === 'pharmacy') navigate('/pharmacist');
  //       else navigate('/find-medicine');
  //     }

  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     const msg = error.response?.data?.message || "Invalid email or password. Please try again.";
  //     setServerError(msg);
  //   }
  // };

  // Login.jsx

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
         

      login(authData, data.role); // ✅ بنبعت authData كامل للـ context

      if (data.role === 'admin') navigate(from || '/admin');
      else if (data.role === 'pharmacy') navigate(from ||'/pharmacist');
      else navigate(from || '/find-medicine');


    }
   

  } catch (error) {
    // console.error("Login Error:", error);
    // const validationErrors = error.response?.data?.errors;
    // const firstValidationMessage =
    //   Array.isArray(validationErrors) && validationErrors.length > 0
    //     ? validationErrors[0]?.msg || validationErrors[0]?.message
    //     : null;
    // const msg =
    //   firstValidationMessage ||
    //   error.response?.data?.message ||
    //   "Invalid email or password.";
    // setServerError(msg);

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