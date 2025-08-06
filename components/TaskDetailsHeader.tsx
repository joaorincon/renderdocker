
import React from 'react';
import ManufacturingAppIcon from './ManufacturingAppIcon';
import UserMenu from './UserMenu';
import { UserInfo } from '../App';

interface TaskDetailsHeaderProps {
    onBack: () => void;
    onLogout: () => void;
    onChangePassword: () => void;
    currentUser: UserInfo | null;
}

const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({ onBack, onLogout, onChangePassword, currentUser }) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 py-4 shadow-sm sm:px-10">
      <div className="flex items-center gap-4 text-slate-900">
        <button onClick={onBack} aria-label="Volver a las tareas" className="flex items-center justify-center rounded-full h-10 w-10 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            <span className="material-icons">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
            <div className="size-6 text-blue-600">
                <ManufacturingAppIcon />
            </div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-slate-900">Aplicación de Fabricación</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <nav className="hidden items-center gap-2 md:flex">
          <a className="rounded-md px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:text-blue-600" href="#">Panel</a>
          <a className="rounded-md px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:text-blue-600" href="#">Órdenes</a>
          <a className="rounded-md px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:text-blue-600" href="#">Inventario</a>
          <a className="rounded-md px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:text-blue-600" href="#">Calidad</a>
          <a className="rounded-md px-3 py-2 text-sm font-medium leading-normal text-slate-700 transition-colors hover:text-blue-600" href="#">Mantenimiento</a>
        </nav>
        <UserMenu 
          onLogout={onLogout}
          onChangePassword={onChangePassword}
          currentUser={currentUser}
          userImage="https://lh3.googleusercontent.com/aida-public/AB6AXuChMorLjsFkU698ZjFeAZg5PoISpSAi1mmYUSUnf9OHAzvI9k-v4JWHLYsvWp6myqGwrXDHx0XOyo3CmgkHHtZdlcNwAmrghp5LRUGiFbM5HquvQ90EVLMBBSj1VftB9fblZoDebxmFHx0AK0NoDMVycrkXidt_0zyetPtUEB5mIhpyDxCZZwRNjGgRbzFwKOCoeji2gJD6rm90fB0aNw4LUd1SHFoxpJoNga9iAZggpUl1FEDepJEpt3LwqDjuuaFUCZ5gcRAYLS7q"
        />
        <button aria-label="Menú" className="text-slate-700 hover:text-blue-600 md:hidden">
          <span className="material-icons">menu</span>
        </button>
      </div>
    </header>
  );
};

export default TaskDetailsHeader;