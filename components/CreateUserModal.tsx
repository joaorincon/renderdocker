import React, { useState, useEffect } from 'react';

export interface NewUserData {
    nombre_completo: string;
    codigo_operario: string;
    rol: string;
    pin: string;
}

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateUser: (userData: NewUserData) => Promise<any>;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, id, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input 
            id={id}
            {...props}
            className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-50"
        />
    </div>
);

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onCreateUser }) => {
    const [nombre, setNombre] = useState('');
    const [codigo, setCodigo] = useState('');
    const [rol, setRol] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rolesList, setRolesList] = useState<string[]>([]);
    const [isRolesLoading, setIsRolesLoading] = useState<boolean>(true);
    const [rolesError, setRolesError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            setIsRolesLoading(true);
            setRolesError(null);
            try {
                const response = await fetch('http://localhost:3001/api/roles');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los roles.');
                }
                const data: string[] = await response.json();
                const filteredRoles = data.filter(roleName => roleName.toLowerCase() !== 'root');
                setRolesList(filteredRoles);
                if (filteredRoles.length > 0) {
                    setRol(filteredRoles[0]);
                }
            } catch (err) {
                if (err instanceof Error) {
                    setRolesError(err.message);
                } else {
                    setRolesError('Ocurrió un error inesperado.');
                }
            } finally {
                setIsRolesLoading(false);
            }
        };

        if (isOpen) {
            // Reset form when modal opens
            setNombre('');
            setCodigo('');
            setPin('');
            setShowPin(false);
            setError(null);
            setIsLoading(false);
            fetchRoles();
        }
    }, [isOpen]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (pin.length < 3) {
            setError('La contraseña / PIN debe tener al menos 3 caracteres.');
            return;
        }
        setIsLoading(true);
        try {
            await onCreateUser({
                nombre_completo: nombre,
                codigo_operario: codigo,
                rol,
                pin,
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error inesperado al crear el usuario.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-900">Crear Nuevo Usuario</h2>
                    <button onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <FormInput
                            label="Nombre Completo"
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            required
                            disabled={isLoading}
                        />
                        <FormInput
                            label="Código de Operario"
                            id="codigo"
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="Ej: JP1234"
                            required
                            disabled={isLoading}
                        />
                        <div>
                             <label htmlFor="rol" className="block text-sm font-medium text-slate-700 mb-1.5">Rol</label>
                             <select
                                id="rol"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                className="form-select block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                required
                                disabled={isLoading || isRolesLoading || !!rolesError}
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
                        </div>
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña / PIN</label>
                            <div className="relative">
                                <input
                                    id="pin"
                                    type={showPin ? 'text' : 'password'}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-50"
                                    placeholder="Ingrese un PIN seguro"
                                    required
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
                        {error && (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading || isRolesLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;