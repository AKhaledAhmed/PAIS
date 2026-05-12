
import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
        
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Pill size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight">PAIS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Pharmacy Availability Information System. Making healthcare accessible by connecting patients with real-time medicine data.
            </p>
          </div>

          
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/find-medicine" className="hover:text-teal-400 transition-colors">Search Medicine</Link></li>
              <li><Link to="/register" className="hover:text-teal-400 transition-colors">Join as Pharmacy</Link></li>
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Health Heatmap</Link></li>
            </ul>
          </div>

         
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Help Center</Link></li>
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

       
          <div>
            <h4 className="text-white font-semibold mb-6">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

        </div>

      
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wider uppercase">
          <p>© 2026 PAIS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span>Built for Graduation Project</span>
            <span className="text-teal-500">Live Status: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
