
import React from 'react';
import LogoIcon from './LogoIcon';

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    className="text-slate-600 hover:text-blue-600 text-sm font-medium leading-normal px-3 py-2 rounded-md transition-colors"
  >
    {children}
  </a>
);

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3 text-slate-800">
        <div className="size-8 text-blue-600">
          <LogoIcon />
        </div>
        <h1 className="text-slate-800 text-xl font-semibold leading-tight">
          Programa diario del operario
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="#">Panel</NavLink>
          <NavLink href="#">Producción</NavLink>
          <NavLink href="#">Control de Calidad</NavLink>
          <NavLink href="#">Mantenimiento</NavLink>
          <NavLink href="#">Inventario</NavLink>
        </nav>
        <button
          aria-label="Notificaciones"
          className="flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <span className="material-icons text-xl">notifications</span>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDlibIVxL61DSO62sKkc7A_9wHUZ4QT4ino4mT3G8nHlsQ6pxFbrVM0sRgZJmTjVx20uqlNtC_-S67SwcyQduVq36LvCJts5oDJDIhluQhsrzC3ypSXPtKPZQKQdv1zHAanKmJiFUm3IqdGyiLc8nif5G21kdmMdY4HqRheVpHgddURNwQ503pLwOchvF2jpXjkj5wEpti0ZbRqsNmqLwIIFfAMP90o3DhMlr-Ud7KVjBvHTi8RYSmDNd8MK6EwdVglLXa_86-_p0M")`,
          }}
        ></div>
        <button
          aria-label="Menú"
          className="md:hidden flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <span className="material-icons text-2xl">menu</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
