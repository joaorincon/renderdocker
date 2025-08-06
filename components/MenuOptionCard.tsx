
import React from 'react';

const MenuOptionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out border border-slate-200"
  >
    <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
      <span className="material-icons text-4xl">{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-500">{description}</p>
  </button>
);

export default MenuOptionCard;
