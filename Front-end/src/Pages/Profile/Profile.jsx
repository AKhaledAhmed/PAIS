import React from 'react';
import { useAuth, normalizeRole } from '../../Context/AuthContext';
import Loader from '../../Components/Loader/Loader';
import {
  MapPin,
  Phone,
  Mail,
  User,
  IdCard,
  Building,
  Shield,
  Calendar,
  Hash,
} from 'lucide-react';

function ProfileField({ icon: Icon, label, value, iconClassName = 'text-cyan-700' }) {
  const display = value === undefined || value === null || value === '' ? '—' : value;
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <Icon className={`w-5 h-5 shrink-0 ${iconClassName}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-gray-800 wrap-break-word">{display}</p>
      </div>
    </div>
  );
}

function formatGender(gender) {
  if (gender === true || gender === 'male' || gender === 'Male') return 'Male';
  if (gender === false || gender === 'female' || gender === 'Female') return 'Female';
  return '—';
}

function formatStatus(status) {
  if (!status || typeof status !== 'string') return '—';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

export default function Profile() {
  const { user, role, loading } = useAuth();
  const r = normalizeRole(role);

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        No profile data found. Try signing in again.
      </div>
    );
  }

  if (r === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-red-700" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Administrator
                </span>
              </div>
            </div>
            <ProfileField
              icon={Mail}
              label="Email"
              value={user.email}
              iconClassName="text-red-700"
            />
          </div>
        </div>
      </div>
    );
  }

  if (r === 'pharmacy') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center shrink-0">
                <Building className="w-8 h-8 text-cyan-700" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 wrap-break-word">{user.pharmacyName}</h1>
                <span
                  className={`inline-block mt-1 text-xs font-bold px-2 py-1 rounded-full ${
                    user.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {formatStatus(user.status)}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-gray-600">
              <ProfileField icon={User} label="Owner name" value={user.ownerName} />
              <ProfileField icon={Mail} label="Email" value={user.pharmacyEmail} />
              <ProfileField icon={Phone} label="Phone" value={user.pharmacyPhone} />
              <ProfileField icon={MapPin} label="Address" value={user.address} />
              <ProfileField icon={IdCard} label="License ID" value={user.licenseId} />
              <ProfileField icon={Hash} label="Application ID" value={user.applicationId} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (r === 'client') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-cyan-700" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-500">Patient account</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProfileField icon={Mail} label="Email" value={user.email} />
              <ProfileField icon={Phone} label="Phone" value={user.phone} />
              <ProfileField icon={User} label="Gender" value={formatGender(user.gender)} />
              {user.dateOfBirth && (
                <ProfileField
                  icon={Calendar}
                  label="Date of birth"
                  value={new Date(user.dateOfBirth).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 text-center text-gray-600">
        <p className="font-medium text-gray-900 mb-1">Profile unavailable</p>
        <p className="text-sm">
          Unknown role: <span className="font-mono">{String(role)}</span>
        </p>
      </div>
    </div>
  );
}
