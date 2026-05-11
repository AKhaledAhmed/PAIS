// import axios from 'axios';
// import React, { useEffect, useState } from 'react'
// import Loader from '../../Components/Loader/Loader';
// import { Activity, BadgeCheck, Calendar, Mail, Phone, User } from 'lucide-react';

// const InfoBox = ({ icon, label, value }) => (
//   <div className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-50/50 transition-all duration-300">
//     <div className="flex items-center gap-4">
//       <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-cyan-50 transition-colors duration-300">
//         {icon}
//       </div>
//       <div>
//         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mb-0.5">{label}</p>
//         <p className="text-slate-700 font-semibold">{value || "---"}</p>
//       </div>
//     </div>
//   </div>
// );

// export default function Profile() {
//    const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(()=>{
//     async function clientProfile() {
//       try{
//         setLoading(true);
//         const token= localStorage.getItem('accessToken');
//          const response = await axios.get('https://pais-production.up.railway.app/api/client/me',{
//           headers:{
//             Authorization: `Bearer ${token}`
//           }
//          });
//          if(response.data.success){
//           setProfile(response.data.data);
//          }
        
//       }
//        catch(err){
//            setError(err.response?.data?.message || err.message);
//         }
//            finally{
//             setLoading(false);
//            }
//     }
//     clientProfile(); 
//   },[]);

//    if (loading) return <Loader/>

//   if (error) return <div className="text-center mt-20 text-red-500 font-medium">{error}</div>;
//   if (!profile) return null;
//   return (
//    <>
//    <div className="min-h-screen bg-slate-50 py-12 px-4">
//       <div className="max-w-4xl mx-auto">
        
//         {/* Main Card */}
//         <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          
//           {/* Top Banner (Medical Gradient) */}
//           <div className="h-40 bg-linear-to-r from-cyan-500 to-teal-500 flex items-center justify-center relative">
//              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
//              <Activity className="text-white/20 absolute right-10" size={120} />
//           </div>

//           <div className="px-8 pb-10">
//             {/* Profile Header */}
//             <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6 mb-10">
//               <div className="w-36 h-36 bg-white rounded-2xl p-1.5 shadow-lg shadow-slate-200">
//                 <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-cyan-600 text-4xl font-bold border border-slate-50 uppercase">
//                   {profile.firstName?.[0]}{profile.lastName?.[0]}
//                 </div>
//               </div>
              
//               <div className="flex-1 text-center md:text-left mb-2">
//                 <div className="flex items-center justify-center md:justify-start gap-2">
//                   <h1 className="text-3xl font-bold text-slate-800">
//                     {profile.firstName} {profile.lastName}
//                   </h1>
//                   {profile.acceptedTerms && <BadgeCheck className="text-cyan-500" size={24} />}
//                 </div>
//                 <p className="text-slate-500 font-medium">Patient</p>
//               </div>

//               <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-cyan-100 active:scale-95">
//                Edit profile
//               </button>
//             </div>

//             {/* Information Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
//               <InfoBox 
//                 icon={<Mail className="text-cyan-600" size={22}/>} 
//                 label="email" 
//                 value={profile.email} 
//               />
              
//               <InfoBox 
//                 icon={<Phone className="text-teal-600" size={22}/>} 
//                 label="phone number" 
//                 value={profile.phone} 
//               />

//               <InfoBox 
//                 icon={<Calendar className="text-cyan-600" size={22}/>} 
//                 label="date of birth" 
//                 value={
//                   profile.dateOfBirth
//                     ? new Date(profile.dateOfBirth).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
//                     : "---"
//                 } 
//               />

//               <InfoBox 
//                 icon={<User className="text-teal-600" size={22}/>} 
//                 label="gender" 
//                 value={profile.gender === false ? "female" : "male"} 
//               />

//               {/* Status Section */}
//               <div className="md:col-span-2 mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
//                 <div>
//                   <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1"> Join date</p>
//                   <p className="text-slate-700 font-medium italic">
//                     Member since : {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "---"}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
//                      Active Account
//                    </span>
//                 </div>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
   
//    </>
//   )
// }

import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { MapPin, Phone, Mail, User, IdCard, Building } from 'lucide-react';

export default function Profile() {
  const { user, role } = useAuth();

  if (!user) return <div className="text-center py-20 text-gray-500">No profile data found.</div>;

  // Pharmacy Profile
  if (role === 'pharmacy') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center">
                <Building className="w-8 h-8 text-cyan-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.pharmacyName}</h1>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  user.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Owner Name</p>
                  <p className="font-medium text-gray-800">{user.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium text-gray-800">{user.pharmacyEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800">{user.pharmacyPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="font-medium text-gray-800">{user.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <IdCard className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">License ID</p>
                  <p className="font-medium text-gray-800">{user.licenseId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <IdCard className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Application ID</p>
                  <p className="font-medium text-gray-800">{user.applicationId}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Client Profile
  if (role === 'client') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-cyan-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-500">Client Account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-cyan-700 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Gender</p>
                  <p className="font-medium text-gray-800">{user.gender ? 'Male' : 'Female'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}