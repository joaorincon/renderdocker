import React, { useState, useEffect, useRef } from 'react';
import { UserInfo } from '../App';

interface UserMenuProps {
    onLogout: () => void;
    onChangePassword: () => void;
    currentUser: UserInfo | null;
    userImage: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout, onChangePassword, currentUser, userImage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ backgroundImage: `url("${userImage}")` }}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                aria-label="Menú de usuario"
            />
            {isMenuOpen && (
                <div
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        <div className="px-4 py-3 border-b border-slate-100">
                           <p className="text-sm font-semibold text-slate-800 truncate" role="none">
                                {currentUser?.codigo_operario}
                            </p>
                            <p className="text-xs text-slate-500 truncate" role="none">
                                Rol: <span className="capitalize">{currentUser?.role.replace(/_/g, ' ')}</span>
                            </p>
                        </div>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onChangePassword();
                                setIsMenuOpen(false);
                            }}
                            className="text-slate-700 block px-4 py-3 text-sm hover:bg-slate-100 flex items-center gap-3"
                            role="menuitem"
                        >
                            <span className="material-icons text-lg text-slate-600">password</span>
                            <span>Cambiar Contraseña</span>
                        </a>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onLogout();
                            }}
                            className="text-slate-700 block px-4 py-3 text-sm hover:bg-slate-100 flex items-center gap-3"
                            role="menuitem"
                        >
                            <span className="material-icons text-lg text-slate-600">logout</span>
                            <span>Cerrar Sesión</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
