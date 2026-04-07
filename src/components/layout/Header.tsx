import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Medal, Users, Monitor, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Medal className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-slate-900">
                Aprovados - Auditor - Cuiabá
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </Link>

            <Link
              to="/direito"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/direito') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Direito</span>
            </Link>

            <Link
              to="/gestao"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/gestao') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gestão</span>
            </Link>

            <Link
              to="/tecnologia"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tecnologia') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Tecnologia</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              aria-label="Abrir menu"
              aria-expanded={isMobileMenuOpen}
              className="text-slate-600 hover:text-slate-900 p-2"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </Link>
            <Link
              to="/direito"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/direito' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Direito</span>
            </Link>
            <Link
              to="/gestao"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/gestao' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gestão</span>
            </Link>
            <Link
              to="/tecnologia"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/tecnologia' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Tecnologia</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};