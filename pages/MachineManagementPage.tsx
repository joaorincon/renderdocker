

import React, { useState, useEffect } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import { UserInfo, UserRole } from '../App';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// --- TYPES ---
interface Machine {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    is_active: boolean;
}

interface MachineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (machine: Omit<Machine, 'id'> & { id?: number }) => Promise<any>;
    machineToEdit?: Machine | null;
}


// --- MAIN PAGE COMPONENT ---
const MachineManagementPage: React.FC<{
    onBack: () => void;
    onLogout: () => void;
    currentUser: UserInfo | null;
    onChangePassword: () => void;
    userRole: UserRole | null;
}> = ({ onBack, onLogout, currentUser, onChangePassword, userRole }) => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [machineToEdit, setMachineToEdit] = useState<Machine | null>(null);
    const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canManageMachines = userRole === 'root' || userRole === 'admin_planta';

    const fetchMachines = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/machines');
            if (!response.ok) throw new Error('Failed to fetch machines.');
            const data: Machine[] = await response.json();
            setMachines(data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
    }, []);

    const handleOpenModal = (machine?: Machine) => {
        setMachineToEdit(machine || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setMachineToEdit(null);
        setIsModalOpen(false);
    };

    const handleSaveMachine = async (machineData: Omit<Machine, 'id'> & { id?: number }) => {
        const url = machineData.id ? `http://localhost:3001/api/machines/${machineData.id}` : 'http://localhost:3001/api/machines';
        const method = machineData.id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(machineData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Failed to ${method === 'POST' ? 'create' : 'update'} machine.`);
            }
            fetchMachines(); // Refresh data
            handleCloseModal();
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    };
    
     const handleConfirmDelete = async () => {
        if (!machineToDelete) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/machines/${machineToDelete.id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Error al eliminar la máquina.');
            }
            setMachineToDelete(null);
            fetchMachines(); // Refresh data
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsDeleting(false);
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className="text-center p-8 text-slate-600">Cargando máquinas...</div>;
        if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>;
        if (machines.length === 0) return <div className="text-center p-8 text-slate-500">No hay máquinas registradas.</div>;
        
        return (
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Código</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Descripción</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            {canManageMachines && <th scope="col" className="px-6 py-3 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {machines.map(machine => (
                            <tr key={machine.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-slate-700">{machine.codigo}</td>
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900">{machine.nombre}</th>
                                <td className="px-6 py-4 text-slate-600">{machine.descripcion || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${machine.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {machine.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                {canManageMachines && (
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleOpenModal(machine)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                        <button onClick={() => setMachineToDelete(machine)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-full min-h-screen flex-col bg-slate-100">
                <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Gestionar Máquinas" onChangePassword={onChangePassword} currentUser={currentUser} />
                <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Lista de Máquinas y Equipos</h2>
                                {canManageMachines && (
                                    <button 
                                        onClick={() => handleOpenModal()}
                                        className="flex items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                                        <span className="material-icons text-lg">add</span>
                                        Añadir Máquina
                                    </button>
                                )}
                            </div>
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
            <MachineModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveMachine}
                machineToEdit={machineToEdit}
            />
            <DeleteConfirmationModal
                isOpen={!!machineToDelete}
                onClose={() => { setMachineToDelete(null); setDeleteError(null); }}
                onConfirm={handleConfirmDelete}
                userName={machineToDelete?.nombre || ''}
                isLoading={isDeleting}
                error={deleteError}
            />
        </>
    );
};


// --- MODAL & FORM COMPONENTS ---

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

const MachineModal: React.FC<MachineModalProps> = ({ isOpen, onClose, onSave, machineToEdit }) => {
    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!machineToEdit;

    useEffect(() => {
        if (isOpen) {
            setCodigo(machineToEdit?.codigo || '');
            setNombre(machineToEdit?.nombre || '');
            setDescripcion(machineToEdit?.descripcion || '');
            setIsActive(machineToEdit?.is_active ?? true);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, machineToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const machineData: Omit<Machine, 'id'> & { id?: number } = {
                codigo,
                nombre,
                descripcion,
                is_active: isActive
            };
            if (isEditMode) {
                machineData.id = machineToEdit.id;
            }
            await onSave(machineData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-start justify-between p-6 border-b border-slate-200">
                        <h2 id="modal-title" className="text-xl font-bold text-slate-900">{isEditMode ? 'Editar Máquina' : 'Añadir Nueva Máquina'}</h2>
                        <button type="button" onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" disabled={isLoading}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <FormInput id="codigo" label="Código" value={codigo} onChange={e => setCodigo(e.target.value)} required disabled={isLoading} placeholder="Ej: L1-ENS" />
                        <FormInput id="nombre" label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required disabled={isLoading} placeholder="Ej: Línea de Ensamblaje 1" />
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1.5">Descripción (Opcional)</label>
                            <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} disabled={isLoading} className="form-textarea min-h-24 block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-50"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado Activo</label>
                            <ToggleSwitch checked={isActive} onChange={setIsActive} disabled={isLoading} />
                        </div>
                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">{isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir Máquina')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MachineManagementPage;