
import React from 'react';
import ProductionLogoIcon from './ProductionLogoIcon';
import UserMenu from './UserMenu';
import { UserInfo } from '../App';

interface SupervisorSubPageHeaderProps {
  onBack: () => void;
  onLogout: () => void;
  title: string;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const SupervisorSubPageHeader: React.FC<SupervisorSubPageHeaderProps> = ({ onBack, onLogout, title, onChangePassword, currentUser }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 md:px-10 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onBack} aria-label="Volver" className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800">
            <span className="material-icons">arrow_back</span>
        </button>
        <div className="flex items-center gap-3 text-slate-800">
          <div className="size-6 text-blue-600">
            <ProductionLogoIcon />
          </div>
          <h1 className="text-slate-900 text-xl font-semibold leading-tight tracking-tight">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserMenu
            onLogout={onLogout}
            onChangePassword={onChangePassword}
            currentUser={currentUser}
            userImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDFLTVFNCil-Gz9AIBeqa-v0c3YUbbf6VxZVWH7mU2rzwXYbzUpzQUy0EwO5GakEslphSKzKcEiFX1mkXcmEUV8thDqqv8b0SpxVM2aux-bBLYbNRwKV7MilKgqRhEX0MSaKShSFIpkZI9GhVpqyom83-sg_6na4CIDOVvo7_9FGMJ0iLf1ILYkQI_eTWZHzYNbSuO_Q67nOF6LkBtEf7FKiPkJUkwy-1FZqT40TVyFLgvCWlQwG53_U6tDBSLBLwlu0AfA8yMlEwRI"
        />
      </div>
    </header>
  );
};

export default SupervisorSubPageHeader;