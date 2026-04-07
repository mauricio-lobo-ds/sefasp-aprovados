import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">

          <p className="text-slate-500 text-xs mt-2">
            Desenvolvido por{' '}
            <a
              href={(import.meta as any).env?.VITE_INSTAGRAM_URL || 'https://www.linkedin.com/in/mauricio-lobo-ds/'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Mauricio Miranda Lobo Leite
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};