


export default function SearchBar({ onSearch }) {
  return (
    <div className="relative group max-w-3xl mx-auto w-full">
      
      <div className="absolute -inset-1 bg-linear-to-r from-teal-400 to-cyan-400 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
      
      <div className="relative flex items-center bg-white rounded-2xl px-6 py-5 shadow-sm border border-slate-100">
        <span className="text-teal-500 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search for medicine (e.g. Panadol,...)"
          className="w-full outline-none text-slate-700 text-lg placeholder:text-slate-400"
          onChange={(e) => onSearch(e.target.value)}
        />
        
             <button className=" sm:w-auto px-16 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all active:scale-95">
                  Search 
                </button>
        
      </div>
    </div>
  );
}