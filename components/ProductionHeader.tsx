
import React from 'react';
import ProductionLogoIcon from './ProductionLogoIcon';
import UserMenu from './UserMenu';
import { UserInfo } from '../App';

interface ProductionHeaderProps {
  onLogout: () => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const ProductionHeader: React.FC<ProductionHeaderProps> = ({ onLogout, onChangePassword, currentUser }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 md:px-10 py-3 shadow-sm">
      <div className="flex items-center gap-3 text-slate-800">
        <div className="size-6 text-blue-600">
          <ProductionLogoIcon />
        </div>
        <h1 className="text-slate-900 text-xl font-semibold leading-tight tracking-tight">
          Seguimiento de Producción
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button aria-label="Notificaciones">
          <span className="material-icons cursor-pointer text-slate-500 hover:text-slate-700">
            notifications
          </span>
        </button>
        <UserMenu 
          onLogout={onLogout}
          onChangePassword={onChangePassword}
          currentUser={currentUser}
          userImage="https://lh3.googleusercontent.com/aida-public/AB6AXuCzsxD1YinjkCzNvhI6Dih9yBjNj2Zl3UBqRmclCXdVjbhcmtbtiS0xBkAShDtBqf7tlpfvBh-gHZTLDN0CkkrAg96_7eDoKPinEb077ekyW7CRjSjyV9fvd4e9dU_mmS7g-MtsE11mIwxi-TOAv8nS852-jsz_3pj6EGRASrYqYB3uRlg31Dgr-BPYxJ5NgjG2pqKTupRF3aZ7M3msdwvP1ZBqi7bKGfsoIOjBsrJVML1gnybFK27Eu1S-Kl5kjZF8-JA4AgZNzRGT"
        />
      </div>
    </header>
  );
};

export default ProductionHeader;