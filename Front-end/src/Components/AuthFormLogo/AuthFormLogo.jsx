import React from 'react';
import Logo from '../../assets/GPLogo.jpeg';
const logoModules = import.meta.glob('../../assets/GPlogo.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  import: 'default',
});

const logoSrc = Object.values(logoModules)[0] ?? null;


export default function AuthFormLogo({ className = '' }) {
  if (!logoSrc) {
    return (
      <div
        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-700 to-teal-800 text-lg font-black text-white shadow-lg shadow-cyan-900/20 ${className}`}
        aria-hidden
      >
       <img src={Logo} alt="" />
      </div>
    );
  }

  return (
    <div className={`mx-auto mb-6 flex justify-center ${className}`}>
      <div className="relative rounded-2xl bg-white p-2 shadow-md shadow-slate-200/80 ring-1 ring-slate-100">
        <img
          src={logoSrc}
          alt="PAIS"
          className="h-16 w-auto max-w-50 object-contain sm:h-18"
          decoding="async"
        />
      </div>
    </div>
  );
}
