import React, { useState, useEffect } from 'react';
import { UserRole, UserInfo } from '../App';

export interface UserDataToUpdate {
    rol: string;
    is_active: boolean;
    pin?: string;
}

interface User {
    id: number;
    nombre_completo: string;
    codigo_operario: string;
    nombre_rol: string;
    is_active: boolean;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: number, userData: UserDataToUpdate) => Promise<any>;
    user: User | null;
    currentUserRole: UserRole | null;
    currentUser: UserInfo | null;
}

const FormInputDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-slate-100 px-3 py-2.5 text-slate-600 sm:text-sm">
            {value}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; }> = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`${checked ? 'bg-blue-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
    >
        <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);


const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user, currentUserRole, currentUser }) => {
    const [rol, setRol] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rolesList, setRolesList] = useState<string[]>([]);
    const [isRolesLoading, setIsRolesLoading] = useState<boolean>(true);
    const [rolesError, setRolesError] = useState<string | null>(null);

    const canChangePassword = currentUserRole === 'root' || currentUserRole === 'admin_planta';
    
    const isEditingSelf = user?.codigo_operario === currentUser?.codigo_operario;
    const isSelfRoleChangeForbidden = isEditingSelf && (currentUser?.role === 'root' || currentUser?.role === 'admin_planta');

    const fetchRoles = async () => {
        setIsRolesLoading(true);
        setRolesError(null);
        try {
            const response = await fetch('http://localhost:3001/api/roles');
            if (!response.ok) throw new Error('No se pudieron cargar los roles.');
            const data: string[] = await response.json();
            const filteredRoles = data.filter(roleName => roleName.toLowerCase() !== 'root');
            setRolesList(filteredRoles);
        } catch (err) {
            setRolesError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsRolesLoading(false);
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setIsLoading(false);
            setPin('');
            setShowPin(false);
            setShowChangePassword(false);
            if (user) {
                setRol(user.nombre_rol);
                setIsActive(user.is_active);
            }
            fetchRoles();
        }
    }, [isOpen, user]);
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return;
        setError(null);
        
        if (showChangePassword && pin && pin.length < 3) {
            setError('La nueva contraseña debe tener al menos 3 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            const dataToUpdate: UserDataToUpdate = { rol, is_active: isActive };
            if (showChangePassword && pin) {
                dataToUpdate.pin = pin;
            }
            await onSave(user.id, dataToUpdate);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al guardar.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen || !user) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-900">Editar Usuario</h2>
                    <button onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <FormInputDisplay label="Nombre Completo" value={user.nombre_completo} />
                        <FormInputDisplay label="Código de Operario" value={user.codigo_operario} />
                        <div>
                             <label htmlFor="rol-edit" className="block text-sm font-medium text-slate-700 mb-1.5">Rol</label>
                             <select
                                id="rol-edit"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                className="form-select block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                                required
                                disabled={isLoading || isRolesLoading || !!rolesError || isSelfRoleChangeForbidden}
                            >
                                {isRolesLoading ? (
                                    <option>Cargando roles...</option>
                                ) : rolesError ? (
                                    <option>Error al cargar roles</option>
                                ) : (
                                    rolesList.map(roleName => (
                                        <option key={roleName} value={roleName}>{roleName}</option>
                                    ))
                                )}
                             </select>
                             {rolesError && <p className="text-xs text-red-600 mt-1">{rolesError}</p>}
                             {isSelfRoleChangeForbidden && <p className="text-xs text-slate-500 mt-1">Los usuarios Root y Admin Planta no pueden cambiar su propio rol.</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado Activo</label>
                            <ToggleSwitch checked={isActive} onChange={setIsActive} disabled={isLoading} />
                         </div>
                         {canChangePassword && (
                            <div className="pt-2">
                                {!showChangePassword ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowChangePassword(true)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Cambiar Contraseña...
                                    </button>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <label htmlFor="pin-edit" className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Nueva Contraseña / PIN
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="pin-edit"
                                                type={showPin ? 'text' : 'password'}
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-50"
                                                placeholder="Dejar en blanco para no cambiar"
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPin(!showPin)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                                                disabled={isLoading}
                                            >
                                                <span className="material-icons cursor-pointer select-none text-xl text-slate-500 hover:text-slate-700">
                                                    {showPin ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 mt-2">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading || isRolesLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;