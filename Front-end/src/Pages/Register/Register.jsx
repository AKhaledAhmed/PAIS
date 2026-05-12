// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Link, useNavigate } from 'react-router-dom';

// // schema validation 
// const registerSchema = z
//   .object({
//     name: z
//       .string()
//       .min(3, 'Full name must be at least 3 characters')
    
//       .regex(/^[A-Z].*$/, 'Full name must start with a capital letter'),
//     email: z
//       .string()
//       .email().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Email must include @ and a valid domain'),
//     password: z
//       .string()
//       .min(8, 'Password must be at least 8 characters long')
//       .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//       .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
//       .regex(/[0-9]/, 'Password must contain at least one digit')
//       .regex(
//         /[^A-Za-z0-9]/,
//         'Password must contain at least one special character (e.g. ! @ # $ %)'
//       ),
//     rePassword: z.string(),
//     role: z.enum(['patient', 'pharmacist', 'admin'], {
//       required_error: 'Please select a role',
//     }),
//   })
//   .refine((data) => data.password === data.rePassword, {
//     message: 'Passwords do not match',
//     path: ['rePassword'],
//   });

// export default function Register() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//       password: '',
//       rePassword: '',
//       role: '',
//     },
//   });
// const navigate = useNavigate();
//   const onSubmit = (data) => {
//     // **********************validation until backend end ***************************
//     console.log('Register data:', data);

//       const userToSave = {
//     name: data.name,
//     email: data.email,
//     password: data.password,
//     role: data.role,
//   };
//   localStorage.setItem('user', JSON.stringify(userToSave));
//   // بعد ال register نودّي على ال login
//   navigate('/login');
//   };

//   return (
//     <>
//       <div className="bg-gray-50 min-h-screen py-24">
//         <div className="bg-white w-3/4 md:w-1/2 mx-auto p-8 rounded-2xl">
//           <h2 className="font-bold text-xl mb-3 animate-pulse">Create Account</h2>
//           <p className="text-gray-400">Register to access PAIS</p>

//           <form
//             className="flex flex-col items-center p-10"
//             onSubmit={handleSubmit(onSubmit)}
//           >
//             {/* Full Name */}
//             <div className="p-2 w-full flex flex-col items-start max-w-md">
//               <label className="block" htmlFor="name">
//                 Full Name:
//               </label>
//               <input
//                 type="text"
//                 placeholder="Your Full Name"
//                 {...register('name')}
//                 id="name"
//                 className="bg-gray-100 p-2 rounded-lg w-96"
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.name.message}
//                 </p>
//               )}
//             </div>

//             {/* Email */}
//             <div className="p-2 w-full flex flex-col items-start max-w-md">
//               <label className="block" htmlFor="email">
//                 Email:
//               </label>
//               <input
//                 type="email"
//                 placeholder="you@email.com"
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
//                 placeholder="Create a password"
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

//             {/* Confirm Password */}
//             <div className="p-2 w-full flex flex-col items-start max-w-md">
//               <label className="block" htmlFor="rePassword">
//                 Confirm Password:
//               </label>
//               <input
//                 type="password"
//                 placeholder="Confirm your password"
//                 {...register('rePassword')}
//                 id="rePassword"
//                 className="bg-gray-100 p-2 rounded-lg w-96"
//               />
//               {errors.rePassword && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.rePassword.message}
//                 </p>
//               )}
//             </div>

//             {/* Role */}
//             <div className="p-2 w-full flex flex-col items-start max-w-md">
//               <label className="block" htmlFor="role">
//                 Role:
//               </label>
//               <select
//                 {...register('role')}
//                 id="role"
//                 className="bg-gray-100 p-2 rounded-lg w-96"
//               >
//                 <option value="">Select role</option>
//                 <option value="patient">Patient</option>
//                 <option value="pharmacist">Pharmacist</option>
//                 <option value="admin">Administrator</option>
//               </select>
//               {errors.role && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.role.message}
//                 </p>
//               )}
//             </div>

//             <button
//               className="bg-cyan-900 text-white rounded-xl mt-3 mx-auto p-2 w-96"
//               type="submit"
//             >
//               Register
//             </button>
//           </form>

//           <p className="text-center text-gray-500">
//             You Already Have an Account?{' '}
//             <span className="text-cyan-600">
//               <Link to="/login">Sign in</Link>
//             </span>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }


// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// export default function Register() {
//   const navigate = useNavigate();
//   const { register, handleSubmit, watch, formState: { errors } } = useForm({
//     defaultValues: { role: 'patient' }
//   });

//   const selectedRole = watch('role');

//   const onSubmit = async (data) => {
//     try {
//       // بناءً على المتطلب: الصيدلي يرسل بيانات البزنس، المريض ايميل وباسورد فقط
//       let endpoint = '';
//       let payload = {};

//       if (data.role === 'pharmacist') {
//         endpoint = 'https://pais-production.up.railway.app/api/pharmacies/register';
//         payload = {
//           name: data.name,
//           licenseNumber: data.licenseNumber,
//           location: data.location,
//           ownerName: data.ownerName,
//           email: data.email,
//           password: data.password
//         };
//       } else {
//         endpoint = 'https://pais-production.up.railway.app/api/clients/register';
//         payload = {
//           email: data.email,
//           password: data.password
//         };
//       }

//       await axios.post(endpoint, payload);
//       alert("Registration Successful!");
//       navigate('/login');
//     } catch (error) {
//       alert("Registration failed: " + error.response?.data?.message);
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-12 flex items-center">
//       <div className="bg-white w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-lg">
//         <h2 className="font-bold text-2xl text-cyan-900 text-center mb-6">Create Account</h2>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
//           {/* Role Selection */}
//           <div className="md:col-span-2">
//             <label className="block mb-1 font-medium">Register as:</label>
//             <select {...register('role')} className="w-full p-2 bg-gray-100 rounded-lg">
//               <option value="patient">Patient (Search for medicine)</option>
//               <option value="pharmacist">Pharmacy (Manage Inventory)</option>
//             </select>
//           </div>

//           {/* Email & Password (للجميع) */}
//           <div className="flex flex-col">
//             <label className="text-sm font-medium">Email</label>
//             <input type="email" {...register('email', {required: true})} className="p-2 bg-gray-100 rounded-lg" />
//           </div>

//           <div className="flex flex-col">
//             <label className="text-sm font-medium">Password</label>
//             <input type="password" {...register('password', {required: true})} className="p-2 bg-gray-100 rounded-lg" />
//           </div>

//           {/* حقول الصيدلية فقط (Requirement 01) */}
//           {selectedRole === 'pharmacist' && (
//             <>
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium">Pharmacy Name</label>
//                 <input {...register('name', {required: true})} className="p-2 bg-gray-100 rounded-lg" />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium">License Number</label>
//                 <input {...register('licenseNumber', {required: true})} className="p-2 bg-gray-100 rounded-lg" />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium">Owner Name</label>
//                 <input {...register('ownerName', {required: true})} className="p-2 bg-gray-100 rounded-lg" />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm font-medium">Location</label>
//                 <input {...register('location', {required: true})} className="p-2 bg-gray-100 rounded-lg" placeholder="City, Street" />
//               </div>
//             </>
//           )}

//           <button type="submit" className="md:col-span-2 bg-cyan-900 text-white py-3 rounded-xl font-bold mt-4 hover:bg-cyan-800 transition">
//             Register Now
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }



import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthFormLogo from '../../Components/AuthFormLogo/AuthFormLogo';


const registerSchema = z.object({
  role: z.enum(['client', 'pharmacy']),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "You must accept terms" }) }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.any().optional(),

 
  pharmacyName: z.string().optional(),
  ownerName: z.string().optional(),
  location: z.string().optional(),
  licenseId: z.string().optional(),
  pharmacyEmail: z.string().email("Invalid email").optional(),
  pharmacyPhone: z.string().optional(),
  
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
     resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client', gender: "true" }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      let endpoint = '';
      let payload = {};

      if (data.role === 'client') {
        endpoint = 'https://pais-production.up.railway.app/api/client/register';
        payload = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender === "true",
          password: data.password,
          confirmPassword: data.confirmPassword,
          acceptedTerms: data.acceptedTerms
        };
      } else {
        endpoint = 'https://pais-production.up.railway.app/api/pharmacy/register';
        payload = {
          pharmacyName: data.pharmacyName,
          ownerName: data.ownerName,
          location: data.location,
          licenseId: data.licenseId,
          pharmacyEmail: data.pharmacyEmail,
          pharmacyPhone: data.pharmacyPhone,
          password: data.password,
          confirmPassword: data.confirmPassword,
          acceptedTerms: data.acceptedTerms,
           address: data.location 
        };
      }

      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
       toast.success("Registration Successful!");
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 flex justify-center items-center">
      <div className="bg-white w-full max-w-4xl p-8 rounded-3xl shadow-lg border border-gray-100">
        <AuthFormLogo className="sm:mb-8" />
        <h2 className="text-3xl font-bold text-cyan-900 text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-500 mb-8">Join the PAIS Pharmaceutical Network</p>

       
<div className="flex p-1 bg-gray-100 rounded-2xl mb-8 w-64 mx-auto">
  
  <label 
    className={`flex-1 text-center py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
      selectedRole === 'client' ? 'bg-cyan-900 text-white shadow' : 'text-gray-500'
    }`}
  >
    <input 
      type="radio" 
      {...register('role')} 
      value="client" 
      className="hidden" 
    />
    Client
  </label>

 
  <label 
    className={`flex-1 text-center py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
      selectedRole === 'pharmacy' ? 'bg-cyan-900 text-white shadow' : 'text-gray-500'
    }`}
  >
    <input 
      type="radio" 
      {...register('role')} 
      value="pharmacy" 
      className="hidden" 
    />
    Pharmacy
  </label>
</div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            
            {selectedRole === 'client' && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">First Name</label>
                  <input {...register('firstName')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="Ahmed" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                  <input {...register('lastName')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="Hassan" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Personal Email</label>
                  <input type="email" {...register('email')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="ahmed@mail.com" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Phone</label>
                  <input {...register('phone')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="+201..." />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Date of Birth</label>
                  <input type="date" {...register('dateOfBirth')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Gender</label>
                  <select {...register('gender')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600">
                    <option value="true">Male</option>
                    <option value="false">Female</option>
                  </select>
                </div>
              </>
            )}

           
            {selectedRole === 'pharmacy' && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Pharmacy Name</label>
                  <input {...register('pharmacyName')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="Al-Shifa Pharmacy" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Owner Name</label>
                  <input {...register('ownerName')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="Mohamed Ali" />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Location Address</label>
                  <input {...register('location')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="12 Tahrir Square, Cairo" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">License ID</label>
                  <input {...register('licenseId')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="LIC-2024-XXXX" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Pharmacy Email</label>
                  <input type="email" {...register('pharmacyEmail')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="info@pharmacy.com" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">Pharmacy Phone</label>
                  <input {...register('pharmacyPhone')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="+202..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-600">Latitude</label>
                      <input {...register('lat')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="30.04" />
                   </div>
                   <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-600">Longitude</label>
                      <input {...register('lng')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" placeholder="31.23" />
                   </div>
                </div>
              </>
            )}

            
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-1">Password</label>
              <input type="password" {...register('password')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-1">Confirm Password</label>
              <input type="password" {...register('confirmPassword')} className="p-3 bg-gray-50 border rounded-xl outline-cyan-600" />
              {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('acceptedTerms')} className="w-4 h-4 accent-cyan-900" />
            <label className="text-sm text-gray-600">I agree to the terms and conditions</label>
          </div>
          {errors.acceptedTerms && <p className="text-red-500 text-xs">{errors.acceptedTerms.message}</p>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-cyan-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-cyan-950 transition-all shadow-lg disabled:bg-gray-300"
          >
            {isSubmitting ? 'Processing...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          Already have an account? <Link to="/login" className="text-cyan-700 font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}